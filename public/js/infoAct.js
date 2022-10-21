var screen= window.screen.width;

        let darkwall = $("#dark-wall");
        let doclist = $("#doc-scroll-list");
        let catlist = $("#cat-flex-list");
        let lastCat = false;

        function toDocSelection(event){
            event.preventDefault()

            $('.cat-button').css({"color": `#ffffff`});
            $('.cat-button').css({"background": `#E4506D`});
            $('.cat-button').css({"border": `2px solid black`});

            if(lastCat){
                lastCat.off('click', toCatSelection)
                lastCat.on('click', toDocSelection)
            }
            $(this).off('click',  toDocSelection);
            $(this).on('click',  toCatSelection);
            lastCat = $(this);

            darkwall.css({"z-index": `1`}); //затемнение
            darkwall.css({"display": `block`});
            $(this).css({"z-index": `2`});
            doclist.css({"display": `block`});
            
            $(this).css({"color": `#E4506D`}); //меняем текущую кнопку
            $(this).css({"background": `white`});
            $(this).css({"border": `2px solid #93102A`});

            loadDocs($(this).attr('catid'));
        }
        $(".cat-button").on('click', toDocSelection);

        function toCatSelection(event){
            lastCat.off('click',  toCatSelection); //меняем кликер кнопки на исходный
            lastCat.on('click',  toDocSelection);

            darkwall.css({"z-index": `-1`}); //включаем свет на карте
            darkwall.css({"display": `none`});
            lastCat.css({"z-index": `1`});
            doclist.css({"display": `none`});

            lastCat.css({"color": `#ffffff`}); //возвращаем текущую кнопку к исходному виду
            lastCat.css({"background": `#E4506D`});
            lastCat.css({"border": `2px solid black`});
            lastCat = false;
        }
        darkwall.on('click', toCatSelection);

        function loadDocs(categoryId){
            
            let queryParams = {category: categoryId}
            let sp = new URLSearchParams(queryParams);

            let request = new XMLHttpRequest()                     //создаём и конфигурируем асинхронный запрос
            request.open('get', '/data/docs' 
                + "?" +sp.toString()
                , true);
            request.p
            request.setRequestHeader(
                'Content-Type',
                'application/json'
              )        

            request.addEventListener('load', function () { 
                let arrData = JSON.parse(request.response);   //добавляем обработчик ответа от сервера
                document.getElementById('doc-scroll-list').innerHTML="";
                arrData.forEach((item) =>{
                    let id = addDocToList(item);
                });
            });
            request.send()
            // request.send(jsonAskToServer)                      //выполняем запрос
        }

function addDocToList(data)
        {
            var d = new Date(data.loaded);
            document.getElementById('doc-scroll-list').innerHTML+=
            "<li>" +
                `<a class=\"doc-button\" href='/info/${data.id}'>`   +
                    `<div class="doc-date">${d.toLocaleDateString('ru-RU')}</div>`   +
                    `<div class="doc-name">${data.name}</div></a>`   +
            "</li>";     
            return data.id;
        };