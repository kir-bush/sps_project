"use strict";
var myState = {
        pdf:null,
        currentPage: 1,
        minZoom: null,
        zoom: 1,
        numPages: 100
    }

if (!pdfjsLib.getDocument || !pdfjsViewer.PDFSinglePageViewer) {
  // eslint-disable-next-line no-alert
  alert("Please build the pdfjs-dist library using\n  `gulp dist-install`");
}

// The workerSrc property shall be specified.
//
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "../../node_modules/pdfjs-dist/build/pdf.worker.js";

// Some PDFs need external cmaps.
//
const CMAP_URL = "../../node_modules/pdfjs-dist/cmaps/";
const CMAP_PACKED = true;

const DEFAULT_URL = $('#dataUri').attr('value');

const ENABLE_XFA = true;
const SEARCH_FOR = ""; // try "Mozilla";

const SANDBOX_BUNDLE_SRC = "../../node_modules/pdfjs-dist/build/pdf.sandbox.js";

const container = document.getElementById("viewerContainer");

const eventBus = new pdfjsViewer.EventBus();

// (Optionally) enable hyperlinks within PDF files.
const pdfLinkService = new pdfjsViewer.PDFLinkService({
  eventBus,
});

// (Optionally) enable find controller.
const pdfFindController = new pdfjsViewer.PDFFindController({
  eventBus,
  linkService: pdfLinkService,
});

// (Optionally) enable scripting support.
const pdfScriptingManager = new pdfjsViewer.PDFScriptingManager({
  eventBus,
  sandboxBundleSrc: SANDBOX_BUNDLE_SRC,
});

const pdfSinglePageViewer = new pdfjsViewer.PDFSinglePageViewer({
  container,
  eventBus,
  linkService: pdfLinkService,
  findController: pdfFindController,
  scriptingManager: pdfScriptingManager,
  enableScripting: true, // Only necessary in PDF.js version 2.10.377 and below.
});
pdfLinkService.setViewer(pdfSinglePageViewer);
pdfScriptingManager.setViewer(pdfSinglePageViewer);

eventBus.on("pagesinit", function () {
  // We can use pdfSinglePageViewer now, e.g. let's change default scale.
  pdfSinglePageViewer.currentScaleValue = "page-width";

  // We can try searching for things.
  if (SEARCH_FOR) {
    eventBus.dispatch("find", { type: "", query: SEARCH_FOR });
  }
});

document.addEventListener('DOMContentLoaded', function(){
    myState.zoom = myState.minZoom;
    setTimeout(()=>{
        normalizePage()
        myState.zoom = myState.minZoom;
    }, 1000);
})

    $(document).on('click', '.internalLink', (e)=>{
        myState.currentPage = $(document).find('div.page').attr('data-page-number')
        document.getElementById("current_page").value = myState.currentPage;
    });

      // нужно доработать зум
    document.getElementById('zoom_out')
        .addEventListener('click', (e) => {
            if(myState.minZoom == null){
              myState.minZoom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue ("--zoom-factor"));
              myState.zoom = myState.minZoom;
            }

            if(myState.pdf == null || myState.zoom == myState.minZoom) return;
            myState.zoom -= 0.4;
            if(myState.zoom<myState.minZoom)
              myState.zoom = myState.minZoom;
            pdfSinglePageViewer._setScale(myState.zoom);
        });
    document.getElementById('zoom_in')
        .addEventListener('click', (e) => {
            if(myState.minZoom == null){
              myState.minZoom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue ("--zoom-factor"));
              myState.zoom = myState.minZoom;
            }
            if(myState.pdf == null || myState.zoom > 4) return;
            myState.zoom += 0.4;
            pdfSinglePageViewer._setScale(myState.zoom);
            
        });
    document.getElementById('go_previous')
        .addEventListener('click', (e) => {
            if(myState.pdf == null
               || myState.currentPage == 1) return;

            myState.currentPage -= 1;
            document.getElementById("current_page")
                    .value = myState.currentPage;
            pdfSinglePageViewer.previousPage(); 
            myState.zoom = myState.minZoom;
            normalizePage()
        });
    document.getElementById('go_next')
        .addEventListener('click', (e) => {
            if(myState.pdf == null
               || myState.currentPage > myState.numPages) 
               return;
            if(myState.currentPage < myState.numPages){
                myState.currentPage += 1;
                document.getElementById("current_page")
                         .value = myState.currentPage;
                pdfSinglePageViewer.nextPage();
            }
            myState.zoom = myState.minZoom;

            normalizePage()
        });
    document.getElementById('current_page')
        .addEventListener('keypress', (e) => {
            if(myState.pdf == null) return;
         
            // Get key code
            var code = (e.keyCode ? e.keyCode : e.which);
         
            // // If key code matches that of the Enter key
            if(code == 13) {
                var desiredPage = 
                        document.getElementById('current_page')
                                .valueAsNumber;
                                 
              if(desiredPage >= 1 && desiredPage <= myState.numPages) {
                  myState.currentPage = desiredPage;
                  document.getElementById("current_page").value = desiredPage;
                  pdfLinkService.goToPage(desiredPage);
              } else if(desiredPage < 1 ){
                  myState.currentPage = 1;
                  document.getElementById("current_page").value = 1;
                  pdfLinkService.goToPage(1);
              }else{
                  myState.currentPage = myState.numPages;
                  document.getElementById("current_page").value = myState.numPages;
                  pdfLinkService.goToPage(myState.numPages);
              }
                myState.zoom = myState.minZoom;
             }
        });
       

var screenW = window.screen.width;
var normalizePage = ()=>{
    console.log(screenW);
    let pageWidth = $(document).find('div.page').css('width').replace(/px/, '')
    var pageHeight = $(document).find('div.page').css('height').replace(/px/, '')
    var viewDiv = $('#viewBox');
    var avalaibleWidth = screenW * 0.75; 
    var tg = pageWidth/pageHeight;
    var kfc = 0;
    if (tg < 0.7) 
        kfc = 1
    else if (tg > 1.4) 
        kfc = 1.4;
    else 
        kfc = 1 + (tg - 0.7)/0.7
    var possibleWidth = kfc*840;
    var realWidth= avalaibleWidth>=possibleWidth?possibleWidth:avalaibleWidth;
    kfc = realWidth/pageWidth;
    myState.minZoom = 0.98*kfc*parseFloat(getComputedStyle(document.documentElement).getPropertyValue ("--zoom-factor"));
    pdfSinglePageViewer._setScale(myState.minZoom);
    console.log(avalaibleWidth)
    console.log(possibleWidth)
    console.log(realWidth)

  $('#viewBox').css('width', realWidth+50 + "px")
  $('#viewBox').css('max-width', avalaibleWidth + "px");
  $('#viewBox').css('height', realWidth/tg + "px");
  $('#viewBox').css('min-height', realWidth/tg + "px");
  $('#viewer').css('height', realWidth/tg + "px");
  $('#viewer').css('min-height', realWidth/tg + "px");

}

// Loading document.
const loadingTask = pdfjsLib.getDocument({
  url: DEFAULT_URL,
  cMapUrl: CMAP_URL,
  cMapPacked: CMAP_PACKED,
  enableXfa: ENABLE_XFA,
});
loadingTask.promise.then(function (pdfDocument) {
  pdfSinglePageViewer.setDocument(pdfDocument);

  myState.pdf = pdfDocument;
  myState.numPages = pdfDocument.numPages;
  document.getElementById('current_page').min = 1
  document.getElementById('current_page').max = myState.numPages
  pdfLinkService.setDocument(pdfDocument, null);

  $('#viewBox').on('change', (e)=>{console.log('cmooooooooooooon')})
  $('#viewBox').css('width', 873 + "px")
  $('#viewBox').css('max-height', (window.screen.width>=1584?1235:(window.screen.width*0.75)) + "px");
  $('#viewBox').css('max-width', 1235 + "px");
  // $('#viewerContainer').css('width', window.screen.width * 0.55 + "px")
  // $('#viewerContainer').css('max-height',window.screen.width * 0.55 *1.42 + "px");
  $('main').css('width', window.screen.width * 0.55 + "px") 
});
//w 794 px h 1123


