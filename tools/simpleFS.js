const path = require('path');
const fs = require('fs');
const fsp = require('fs').promises;

const simpleFS = {
    countDirById: function(rootDir, id) {
        let arr = [];
        let numTail =id; //хвост
        while (numTail != 0) {
            arr.unshift(numTail%10);  //добавить
            numTail = parseInt(numTail/10); //округлить
        } 
        while (arr.length < 6) {
            arr.unshift(0);  // добавляем в массив недостающие нули
        } 
        let tail = "FileBase";
        arr.forEach((el) =>{ tail += "/" + el;}) ; //превращаем массив в ../FileBase/0/0/0/0/0/1
        let filePath = path.join(rootDir, tail); //приделываем нос к хвосту
        return filePath;
    },
};

module.exports = simpleFS;