const { Router } = require('express')
const router = Router()
const express = require('express')
const path = require('path');
const multer  = require("multer");
const upload = multer({dest:"FileBase/uploads"});
const libre = require('libreoffice-convert');
const fs = require('fs');
const fsp = require('fs').promises;
const { Buffer } = require('buffer');
const n = require('os').EOL;

const { promisify } = require('util');                //подключаем cmd
const exec = promisify(require('child_process').exec)
const converterPath = path.join(__dirname, '../scripts/word2pdf.vbs')

const simpleFS = require('../tools/simpleFS');   

const dbServ = require('../models/mySqlModel');   //подключаем базу
const docs = dbServ.docs;
const cats = dbServ.cats;
const users = dbServ.users;
const dch = dbServ.democharts

//-----------------Страницы--------------------------------------------------------------------------------

router.get('/info', (req, res) => {         //info

  cats.findAll({attributes: ['id', 'name'], order: [['catorder', 'ASC']]}).then(data => {
      if (data) {
        let d = new Array();
        data.forEach(cat => {
          d.push({name: cat.name, id: cat.id})
        });
        res.render('info', {
          authenticated: req.session.role != undefined,
          title: 'Доска информации',
          isInfo: true,
          categorys: d
        })
      }else{
        res.sendStatus(statusCode)(404);
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message
      });
    });
});

router.get('/auth', (req, res) => {                       //авторизация
  if(req.session.role != undefined)
    res.redirect('/')
  else
    res.render('auth', {
      authenticated: req.session.role != undefined,
      title: 'Авторизация'
  })
});

router.post('/auth', async function(req, res) {                       //вход                                                        
    if(req.session.role != undefined)
      res.redirect('/')
    await users.findAll({
        where: req.body
      }).then(data => {
        if (data) {
          req.session.role = data[0].role;
          res.redirect('/');
        } else {
          res.redirect('/auth');
        }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message
      });
    });
});

router.get('/logout', (req, res) => {                       // вход
  req.session.destroy();
  res.redirect('/')
});


router.get('/', (req, res) => {                           //default
  res.redirect('/info')
});

router.get('/info/manage', (req, res) => {                       //info - Manage
  if(req.session.role == undefined)
      res.redirect('/auth')

  let access = ["admin", "manager"];
  if(access.includes(req.session.role)/*true*/)
      docs.findAll().then(data => {
      if (data) {
        let docsArray = new Array();
        let catsArray = new Array();
        cats.findAll({attributes: ['id', 'name'], order: [['catorder', 'ASC']]}).then(catData => {
          if (catData) {
            
            catData.forEach(cat => {
              catsArray.push({cname: cat.name, cid: cat.id})

            });
          }
        })

        data.forEach(doc => {
              var d = new Date(doc.loaded);
              docsArray.push({id: doc.id, 
                            name: doc.name, 
                            category: doc.category, 
                            loaded: (doc.loaded==null? '- ? -' : d.toLocaleDateString('ru-RU')), 
                            filename: (doc.filename!=""&&doc.filename!=null)? doc.filename : " не загружен" })
            });
        res.render('infoManage', {
          // authenticated: req.session.role != undefined,
          authenticated: true,
          title: 'Управление',
          isInfoManage: true,
          docs : docsArray,
          cats: catsArray
        })
      }else{
        res.sendStatus(statusCode)(404);
      }
    })
});

router.get('/info/:id', async (req, res) => {                       //просмотр документа
  let id = req.params.id;

  docs.findByPk(id).then(data => {
      if (data) {
        let catsArray = new Array();
        cats.findAll({attributes: ['id', 'name'], order: [['catorder', 'ASC']]}).then(catData => {
          if (catData) {
            
            catData.forEach(cat => {
              catsArray.push({name: cat.name, id: cat.id})
            });
          }
        })

        data.uri = '/info/view/'+id
        var d = new Date(data.loaded);
        res.render('infoViewDoc', {
          authenticated: req.session.role != undefined,
          title: data.name,
          isInfo: true,
          isDoc: data.type=="doc",
          dataId: data.id,
          dataCategory : data.category,
          dataLoaded : d.toLocaleDateString('ru-RU'),
          dataUri: data.uri,
          categorys: catsArray
        })
      }else{
        res.sendStatus(statusCode)(404);
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message
      });
    });
});

//------------------Манипуляция файлами------------------------------------------------------------------

//noPromise Version

 const writeLog = (logMessage) => {
    fs.appendFile('log.txt',  n +new Date(Date.now()).toISOString() + ' - ' + logMessage, error => {
       if(error) console.log(error); // ошибка чтения файла, если есть
       console.log('Log record done');
    });
  }

router.post("/info/file/:id", upload.single("spsdocument"), async (req, res) => { 
  async function fixFileName(filedata, fileDir){
    let fixedFileName;
    fixedFileName = Buffer.from(filedata.originalname, 'latin1');
    fixedFileName = fixedFileName.toString('utf-8');
    await fsp.rename(path.join(fileDir, filedata.filename), path.join(fileDir, fixedFileName)) 
    return fixedFileName;
  }

  let tempDirFiles = async (dirPath)=>{
    await fsp.mkdir(path.join(dirPath, 'temp'), {recursive: true})
    const dir = await fsp.opendir(dirPath);
    for await (const dirent of dir)
      if(dirent.name!='temp')
        await fsp.rename(path.join(dirPath, dirent.name), path.join(dirPath, 'temp/' + dirent.name)).catch(async err=>{
          await fsp.copyFile(path.join(dirPath, 'temp/' + dirent.name), path.join(dirPath, dirent.name))
        })
  }

  let clearDir = async (dirPath, [savedUnits])=>{
    let dir = await fsp.opendir(dirPath);
      for await (const dirent of dir)
        if(!savedUnits.includes(dirent.name))
          await fsp.rm(path.join(dirPath, dirent.name), {force: true, maxRetries: 5, recursive: true, retryDelay: 200})
  }

  let detempDirFiles= async (dirPath)=>{
    await clearDir(dirPath, ['temp']).catch((err)=>{})
      let tempDir = await fsp.opendir(path.join(dirPath, 'temp'))
      for await (const dirent of tempDir)
        await fsp.rename(path.join(dirPath, 'temp/' + dirent.name), path.join(dirPath, dirent.name)).catch(async err=>{
          await fsp.copyFile(path.join(dirPath, 'temp/' + dirent.name), path.join(dirPath, dirent.name))
        })
      await fsp.rm(path.join(dirPath, 'temp'), {force: true, maxRetries: 5, recursive: true, retryDelay: 200})
  }

  let successData = new Object();
  let operationState = new Object();
  let siteRoot = path.resolve(__dirname, '..');
  let formats = [".jpg", ".jpeg", '.png', '.doc', '.docx', '.pdf'];
  let docFormats = ['.doc', '.docx', '.pdf'];
  let logMessage = "";
  successData.hasview = 0;
  successData.id = req.params.id;
  successData.loaded = new Date(Date.now()).toISOString();  
  operationState.uploadDir =  path.join(siteRoot, '/FileBase/uploads/')
  operationState.targetDir = simpleFS.countDirById(siteRoot, req.params.id)
   try{
      let filedata = req.file;
      operationState.currentPath = path.join(operationState.uploadDir, filedata.filename)
  
      console.log('File uploading started...')

      successData.filename = await fixFileName(filedata, operationState.uploadDir)
      logMessage+='New file name fixed'
      operationState.currentPath = path.join(operationState.uploadDir, successData.filename)
      operationState.ext = path.extname(path.join(operationState.uploadDir, successData.filename));
      if (!formats.includes(operationState.ext))
        throw Error('Bad Extention')
      //файл подходит 
      //подготавливаем целевую директорию
      await fsp.mkdir(operationState.targetDir, {recursive: true}).catch(err=>{})
      //прячем её содержимое в temp
      let oldFilesTemped = await tempDirFiles(operationState.targetDir)
      logMessage+=', Old files temped'
      //перемещаем файл в целевую директорию 
      await fsp.rename(path.join(operationState.uploadDir, successData.filename), path.join(operationState.targetDir, successData.filename))
        .catch( async err=>{
          logMessage += ', Cant move/copy: ' + err
          await fsp.copyFile(path.join(operationState.uploadDir, successData.filename), path.join(operationState.targetDir, successData.filename))
        })
      logMessage+=', New file moved/copied'
      operationState.currentPath = path.join(operationState.targetDir, successData.filename)
      //определяем категорию файла
      successData.type = docFormats.includes(operationState.ext)?"doc":"img";
      //если файл word, то конвертируем
      operationState.isWord = (operationState.ext==".doc"||operationState.ext==".docx") ? true : false;
      if (operationState.isWord){
      logMessage+=', Converting...'
        const result = await exec('cscript \"' + converterPath + '\" \"' + operationState.currentPath + '\"')
        var message = result.stdout.trim().split(n).pop()
        if (message==="Successfull convertation"){
        //переименовываем конвертированный файл
          logMessage+=' Done'
          await fsp.rename(path.join(operationState.targetDir, successData.filename + '.pdf'), path.join(operationState.targetDir, 'view.pdf'))
            .then(()=>{logMessage+=', View renamed'})
          successData.hasview = true
        }
        else
          throw Error('Bad convert')
      }
      //операция выполнена - записываем данные в базу
      await docs.update(successData, {where: {id: successData.id}}).then(ress=>{
        if (ress) {logMessage+=', data saved  filename: '+ successData.filename}
        res.status(200).send()
      })

      // res.redirect('/info/manage');
      //удаляем старое содержимое (всю папку temp)
      await fsp.rm(path.join(operationState.targetDir, 'temp'), {force: true, maxRetries: 5, recursive: true, retryDelay: 400})
    } catch(err){
        console.log(err)
        switch(err.message) {
          case 'Bad convert':  // ошибка конвертации файла
            logMessage += " Failed: " + message
            await detempDirFiles(operationState.targetDir)
              .then(()=>{logMessage += ", Old files detemped, New file deleted"})
            res.status(500).send({
              message: err.message
            });
            break;
          case 'Bad Extention': // не соответствует расширение
            logMessage += ", Bad Extention"
            fsp.rm(operationState.currentPath, {force: true, maxRetries: 5, recursive: true, retryDelay: 400})
              .then(()=>{logMessage += ", File deleted"})
            res.status(400).send({
              message: err.message
            });
            break;
          case 'Cant temp': // непредвиденная ошибка
            logMessage += ", Cant temp"
            fsp.rm(operationState.currentPath, {force: true, maxRetries: 5, recursive: true, retryDelay: 400})
              .then(()=>{logMessage += ", File deleted"})
            res.status(401).send({
              message: err.message
            });
            break;  
          default:
            logMessage += err
            res.status(500).send();
            break;
        }
    }
    //пишем в лог
    writeLog(logMessage)
    // res.status(200).send();
})

//down view
router.get("/info/view/:id", async function(req, res) {             //скачивание view
  let id = req.params.id;
  docs.findByPk(id, {attributes: ['hasview']
  }).then(data => {
      if (data.hasview) {
        let filePath = getPath(id, "view.pdf");
        res.download(filePath);
      }else{
        res.redirect('/info/file/' + id)
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message
      });
    });
});

//down file
router.get("/info/file/:id", async function(req, res) {             //скачивание original
  let id = req.params.id;
  docs.findByPk(id, {attributes: ['filename']
  }).then(data => {
      if (data) {
        let filePath = getPath(id, data.filename);
        res.download(filePath);
      } else {
        res.status(404).send({
          message: `Cannot find anything`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message
      });
    });
});

//------------------Манипуляция данными------------------------------------------------------------------

router.post("/data/docs", async (req, res)=> {             //добавление строки в таблицу
  req.query.hasview = 0;
  await docs.create(req.query).then(async e => { 
    console.log(e)
    let idPath = simpleFS.countDirById(path.resolve(__dirname, '..'), e.dataValues.id)
    await fsp.mkdir(idPath, {recursive: true}).catch(err=>{})
    console.log('Папка успешно создана, id = ' + e.dataValues.id);
    res.status(200).send()
  })
});

router.post("/data/categories/", async function(req, res) {             //добавление категории
  //  
});

router.put("/data/docs/:id", async function(req, res) {             //редактирование строки
  let id = req.params.id
  let name = req.query.name
  let category = req.query.category
  await  docs.update(
          req.query, { where: req.params }
        ).then(e => { 
    res.status(200).send()
  })
});


router.get("/data/docs", async function(req, res) {             //запрос списка документов (мб с параметром)

  console.log(req.query);

  if(Object.keys(req.query).length == 0){
    let docsFromDB;                                                                //
    await docs.findAll().then(data => {
      docsFromDB = data
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find anything`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message
      });
    });
  }else{
    let docsFromDB;                                                                
    await docs.findAll({
        where: req.query,
      }).then(data => {
      docsFromDB = data

      let indexesToSplice = new Array();
      for (let i = docsFromDB.length-1; i >=0; i--) {
        if (docsFromDB[i].filename==null || docsFromDB[i].filename=="") {
          indexesToSplice.push(i)
        }
      } 
      for(let i of indexesToSplice){
        docsFromDB.splice(i, 1)
      }
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find anything`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message
      });
    });
  }
});

router.get("/data/categories", async function(req, res) {             //запрос списка категорий
  //  
});

//------------------Служебное-----------------------------------------------

function getPath(id, name){
  let arr = [];
  let numTail =id; //хвост
  while (numTail != 0) {
    arr.unshift(numTail%10);
    numTail = parseInt(numTail/10);
  } 
  while (arr.length < 6) {
    arr.unshift(0);
  } 

  let tail = "../FileBase/";
  arr.forEach((el) =>{ tail += el +"/";}) ;
  tail += name;
  let filePath = path.join(__dirname, tail);
  return filePath;
};

//------------------Тестирование----------------------------------------------------------------------------


function sleep(millis) {
    var t = (new Date()).getTime();
    while (((new Date()).getTime() - t) < millis) {}
} ;//балуемся с задержкой

router.post('/democharts', async function (req, res) {        //получить опр данные по опр месяцу !!
    let docsFromDB;
    await docs.findAll().then(data => {
      docsFromDB = data
      if (data) {
        console.log(data[0].dataValues.id); 
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find anything`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message
      });
    });
    console.log("All docs:", JSON.stringify(docsFromDB, null, 2));
})

module.exports = router //экспортируем наружу