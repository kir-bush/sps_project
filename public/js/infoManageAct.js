 var screen= window.screen.width;
        $("#nav-controls").css("min-width", screen *0.6 + "px");
        $("#maincontainer").css("min-width", screen *0.6 + "px");

        let darkwall = $("#dark-wall");
        let rowId="";

        function showDropList(event) {
            if(event.target.parentNode.querySelector('.dropdown-content').classList.contains('show')){
                event.target.parentNode.querySelector('.dropdown-content').classList.remove('show')
                event.target.blur()
            }
            else{
                let all = document.querySelectorAll('.dropdown-content');

                for(let a of all) {
                    if (a.classList.contains('show')) {
                            a.classList.remove('show');
                        }
                }

                event.target.parentNode.querySelector('.dropdown-content').classList.toggle("show");
            }
        }
        $(".dropdown-btn").on('click', showDropList);

        // Закройте выпадающее меню, если пользователь щелкает за его пределами
        window.onclick = function(event) {
            if (!event.target.matches('.dropdown-btn')) {
                var dropdowns = document.getElementsByClassName("dropdown-content");
                var i;
                for (i = 0; i < dropdowns.length; i++) {
                    var openDropdown = dropdowns[i];
                    if (openDropdown.classList.contains('show')) {
                        openDropdown.classList.remove('show');
                    }
                }
            }
        }

        function hideSetRow(event) {
            $("#dt1"+rowId).css({"display": `inline-block`})
            $("#dt2"+rowId).css({"display": `inline-block`})
            $("#"+rowId+"input").css({"display": `none`})
            $("#"+rowId+"select").css({"display": `none`})
            $("#add-btn").css({"display": `inline-block`})
            $("#cancel-btn").css({"display": `none`});
            $("#save-btn").css({"display": `none`})
            $("#cancel-btn").off('click',  hideSetRow);
            $("#save-btn").off('click',  saveChanges);
            $("#"+rowId+"input").css({"z-index": `0`})
            $("#"+rowId+"select").css({"z-index": `0`})
            darkwall.css({"display": `none`});
            rowId="";
        }

        function saveChanges() {
            let queryParams = {name: $("#"+rowId+"input").val(), category: $("#"+rowId+"select").val()}
            let sp = new URLSearchParams(queryParams);

            $.ajax({
                url: '/data/docs/' + rowId + "?" +sp.toString(),
                method: 'put',
                dataType: 'application/json',
                data: {},
                success: function(){
                    window.location.reload();
                },
                error: function (jqXHR, exception) {
                    if (jqXHR.status == 200) {
                        window.location.reload();
                    } 
                }
            });
        }

        function saveNew() {
            let queryParams = {name: $("#add-name").val(), category: $("#add-cat").val()}
            let sp = new URLSearchParams(queryParams);

            $.ajax({
                url: '/data/docs' +  "?" +sp.toString(),
                method: 'post',
                dataType: 'application/json',
                data: {},
                success: function(){
                    window.location.reload();
                },
                error: function (jqXHR, exception) {
                    if (jqXHR.status == 200) {
                        window.location.reload();
                    } 
                }
            });
        }


        function showSetRow(event){
            rowId = event.target.getAttribute("rowid");

            $("#dt1"+rowId).css({"display": `none`})
            $("#dt2"+rowId).css({"display": `none`})
            $("#"+rowId+"input").css({"display": `inline-block`})
            $("#"+rowId+"select").css({"display": `inline-block`})
            $("#add-btn").css({"display": `none`})
            $("#cancel-btn").css({"display": `inline-block`});
            $("#save-btn").css({"display": `inline-block`})
            $("#cancel-btn").on('click',  hideSetRow);
            $("#save-btn").on('click',  saveChanges);
            $("#"+rowId+"input").css({"z-index": `2`})
            $("#"+rowId+"select").css({"z-index": `2`})
            darkwall.css({"display": `block`});
            $("#"+rowId+"input").focus()
        }
        $(".edit-row-btn").on('click', showSetRow);


        function hideAddRow(event) {
            darkwall.css({"display": `none`});
            $("#hidden-row").css({"display": `none`})
            $("#cancel-btn").off('click',  hideAddRow);
            $("#save-btn").off('click',  saveNew);
            $("#add-btn").css({"display": `inline-block`})
            $("#save-btn").css({"display": `none`})
            $("#cancel-btn").css({"display": `none`})
        }

        function showAddRow(event) {
            darkwall.css({"display": `block`});
            $("#hidden-row").css({"display": `table-row`})
            $("#cancel-btn").on('click',  hideAddRow);
            $("#save-btn").on('click',  saveNew);
            $("#add-btn").css({"display": `none`})
            $("#save-btn").css({"display": `inline-block`})
            $("#cancel-btn").css({"display": `inline-block`})
            $("#add-name").focus()
        }
        $("#add-btn").on('click', showAddRow);

        function sendForm(event) {
            let id = event.target.getAttribute('docId')
            let form = $("#loadform"+id) 
            let formDublicate = document.getElementById("loadform"+id)
            form.on('submit', (e)=>{
                e.preventDefault();
                var $that = $(this),
                formData = new FormData(formDublicate); // создаем новый экземпляр объекта и передаем ему нашу форму (*)
                $.ajax({
                    url: "file/" + id, // путь к обработчику
                    type: 'POST', // метод передачи данных
                    contentType: false, // важно - убираем форматирование данных по умолчанию
                    processData: false, // важно - убираем преобразование строк по умолчанию
                    data: formData,
                    statusCode: {
                        404: ()=>{
                            alert( "page not found" );
                        },
                        200: ()=>{
                            alert( "Файл успешно загружен" );
                            window.location.reload();
                        },
                        400: ()=>{
                            alert( "Неверный формат" );
                            window.location.reload();
                        },
                        401: ()=>{
                            alert( "Ошибка чтения/конвертации файла" );
                            window.location.reload();
                        },
                        500: ()=>{
                            alert( "Возникла непредвиденная ошибка, попробуйте снова" );
                            window.location.reload();
                        }
                    }
                });
              });

            form.submit();
        }
        $(".file-btn").on('change', sendForm);

        function sendViewForm(event) {
            let id = event.target.getAttribute('docId')
            let form = document.getElementById("viewloadform"+id);

            form.submit();
        }
        $(".view-file-btn").on('change', sendViewForm);
        function sleep(millis) {
            var t = (new Date()).getTime();
            while (((new Date()).getTime() - t) < millis) {}
        } ;

    selector = 'body';   /* <--- селетор на элемент с основным скролом */
    $(selector).on('scroll', function(){
            sessionStorage['scrollTop'] = $(selector).scrollTop();
    });
    $(document).ready( function(){
            $(selector).scrollTop(sessionStorage['scrollTop']);
    });