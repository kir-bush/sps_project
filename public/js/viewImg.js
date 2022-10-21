"use strict";
let currentZoom = 100;

(function ($) {
  function ReplaceWithPolyfill() {
    'use-strict'; // For safari, and IE > 10

    var parent = this.parentNode,
        i = arguments.length,
        currentNode;
    if (!parent) return;
    if (!i) // if there are no arguments
      parent.removeChild(this);

    while (i--) {
      // i-- decrements i and returns the value of i before the decrement
      currentNode = arguments[i];

      if (typeof currentNode !== 'object') {
        currentNode = this.ownerDocument.createTextNode(currentNode);
      } else if (currentNode.parentNode) {
        currentNode.parentNode.removeChild(currentNode);
      } // the value of "i" below is after the decrement


      if (!i) // if currentNode is the first argument (currentNode === arguments[0])
        parent.replaceChild(currentNode, this);else // if currentNode isn't the first
        parent.insertBefore(currentNode, this.previousSibling);
    }
  }

  if (!Element.prototype.replaceWith) {
    Element.prototype.replaceWith = ReplaceWithPolyfill;
  }

  if (!CharacterData.prototype.replaceWith) {
    CharacterData.prototype.replaceWith = ReplaceWithPolyfill;
  }

  if (!DocumentType.prototype.replaceWith) {
    DocumentType.prototype.replaceWith = ReplaceWithPolyfill;
  }

  const imageObj = {};
  let myZoom =100;

  function setZoom(){
    $("#hihihi").css({ "background-size": `${myZoom}%`});
  }

  $.fn.imageZoom = function (options) {
    // Default settings for the zoom level
    let settings = $.extend({
      zoom: myZoom
      }, options)
    // Main html template for the zoom in plugin

    imageObj.template = `
			<figure id="hihihi" class="containerZoom" style="background-image:url('${$(this).attr("src")}'); background-size: ${settings.zoom}%;">
				<img id="imageZoom" src="${$(this).attr("src")}" alt="${$(this).attr("alt")}" />
			</figure>
		`; 

    function zoomIn(e) {
      let zoomer = e.currentTarget;
      let x, y, offsetX, offsetY;
      e.offsetX ? offsetX = e.offsetX : offsetX = e.touches[0].pageX;  //x и y  курсора в пикселях от угла картинки
      e.offsetY ? offsetY = e.offsetY : offsetY = e.touches[0].pageX;
      x = offsetX / zoomer.offsetWidth * 100;  //высота и ширина блока с картинкой в пикселях
      y = offsetY / zoomer.offsetHeight * 100;
      $(zoomer).css({
        "background-position": `${x}% ${y}%`
      });

    } // Main function to attach all events after replacing the image tag with
    // the main template code

    function attachEvents(container) {
      container = $(container);

      function onClickDefault(e) {

        if ("zoom" in imageObj == false) {
          // zoom is not defined, let define it and set it to false
          imageObj.zoom = false;
        }

          $(this).addClass('active');
          if(myZoom==100)
            myZoom = 144;
          setZoom();
          imageObj.zoom = true;
          $(this).one('mousedown', onClickActive);
          container.on('mousemove', onMouseMove);
          $(this).css({"cursor": `crosshair`});
          zoomIn(e);
        
      };
      container.one('mousedown', onClickDefault);


      function onClickActive(e) {

        $(this).css({"cursor": `move`});
        $(this).one('mousedown', onClickDeactivated);
        container.off('mousemove', onMouseMove);
        
      };
      function onClickDeactivated(e) {
        
        $(this).css({"cursor": `crosshair`});
        $(this).one('mousedown', onClickActive);
        container.on('mousemove', onMouseMove);
        zoomIn(e);
      };
    
      if ('onwheel' in document) {                                    //добавляем wheel listener на контейнер
        container.on("wheel", onWheel);
      } else if ('onmousewheel' in document) {
        container.on("mousewheel", onWheel);
      } else {
        container.on("MozMousePixelScroll", onWheel);
      };

      function onWheel(e) {                                           //обработчик прокручивания
      let kfc = 1.2;
        e = e || window.event;

        $(this).addClass('active');

        var delta = e.originalEvent.deltaY || e.originalEvent.detail || e.originalEvent.wheelDelta;

        if (delta < 0) {
          if(myZoom <= 100){
            $(this).css({"cursor": `move`});
          }
          myZoom *= kfc;
          imageObj.zoom = true;
        } else {
          myZoom /=kfc;
        }

        if(myZoom < 100){
          myZoom = 100;
          imageObj.zoom = false;
          $(this).removeClass('active');
          container.on('mousedown', onClickDefault);
          container.off('mousemove', onMouseMove);
          container.css({"background-position": `50% 50%`});
          $(this).css({"cursor": `zoom-in`});
        }
        setZoom();

        e.preventDefault ? e.preventDefault() : (e.returnValue = false);
      }

      function onMouseMove(e) {    //смещение вызывает обработчик если зум active
        imageObj.zoom ? zoomIn(e) : null;
      }
      
    }

    let newElm;
    console.log(this[0].nodeName);

    if (this[0].nodeName === "IMG") {
      newElm = $(this).replaceWith(String(imageObj.template));
      attachEvents($('.containerZoom')[$('.containerZoom').length - 1]);
    } else {
      newElm = $(this);
    }


    return newElm;
  };

  $(document).ready(function(){ $('#imageZoom').imageZoom(); }); 
})(jQuery);