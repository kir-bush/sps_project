const path = require('path');
var http = require('http');
const express = require('express'); //импортируем нужные пакеты и модули 
const exphbs = require('express-handlebars');
var session = require('express-session');
var cookieParser = require('cookie-parser')
const routes = require('./routes/router');
const bodyParser = require('body-parser');
const multer  = require("multer");

const PORT = process.env.PORT || 3000

const app = express()
const hbs = exphbs.create({ //конфигурация для шаблонизатора
  defaultLayout: 'default',
  extname: 'html',
  helpers: require('./config/handlebars-helpers') 
})

app.use(cookieParser()); //включаем в приложение механизм управления сессиями
app.use(session({        //конфигурация модуля управления сессиями
  resave: false,
  saveUninitialized: false,
  secret: 'SpS Is ThE bEsT', //ключ шифрования
  cookie: {
    maxAge: 24*60*60*1000 // время жизни сеанса
  }
}));       

app.use(bodyParser.json()); //подключаем автоматический JSON-парсер

app.engine('html', hbs.engine) //регистрируем шаблонизатор
app.set('view engine', 'html') //переключаем шаблонизатор на нужный
app.set('views', 'views') //регистрируем папку с шаблонами


app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
//регистрируем публичную папку с ресурсами

app.use(routes) //подключаем модуль маршрутизации

var httpServer = http.createServer(app);
//запускаем сервер с использованием http
async function start() {
  try {
    httpServer.listen(PORT, () => {
      console.log('Сервер запущен --> 10.10.6.130:' + PORT)
    })
  } catch (e) {
    console.log(e)
  }
}

start()


const { promisify } = require('util');                //автоперезапуск Anydesk
const exec = promisify(require('child_process').exec)
async function task(){
  exec('\"C:\\Program Files (x86)\\AnyDesk\\AnyDesk.exe\"')
  setTimeout(()=>{
    task()
  }, 1000*30)
} 
//task()