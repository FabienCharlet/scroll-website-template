
function addEvent(elem, event, fn) {
    if (elem.addEventListener) {
        elem.addEventListener(event, fn, false);
    } else {
        elem.attachEvent("on" + event, function() {
            return(fn.call(elem, window.event));   
        });
    }
}

var eventSet = false;
var loaded = false;

(function(funcName, baseObj) {

    funcName = funcName || "docReady";
    baseObj = baseObj || window;
    var readyList = [];
    var readyFired = false;
    var readyEventHandlersInstalled = false;

    function ready() {
        if (!readyFired) {
            readyFired = true;
            for (var i = 0; i < readyList.length; i++) {
                readyList[i].fn.call(window, readyList[i].ctx);
            }

            readyList = [];
        }
    }

    function readyStateChange() {
        if ( document.readyState === "complete" ) {
            ready();
        }
    }

    baseObj[funcName] = function(callback, context) {
        if (typeof callback !== "function") {
            throw new TypeError("callback for docReady(fn) must be a function");
        }

        if (readyFired) {
            setTimeout(function() {callback(context);}, 1);
            return;
        } else {
            readyList.push({fn: callback, ctx: context});
        }
        if (document.readyState === "complete") {
            setTimeout(ready, 1);
        } else if (!readyEventHandlersInstalled) {
            if (document.addEventListener) {
                document.addEventListener("DOMContentLoaded", ready, false);
                window.addEventListener("load", ready, false);
            } else {
                document.attachEvent("onreadystatechange", readyStateChange);
                window.attachEvent("onload", ready);
            }
            readyEventHandlersInstalled = true;
        }
    }
})("docReady", window);


var currentSlide = 0;
var mainDiv;
var navDiv;
var downScrollerDiv;
var nbSlides;
var currentScrollPosition = 0;
var scrollingAskedTime = 0;
var scrollingEndTime = 0;
var currentSlideScrolling = false;
var heights = [0];
var debugConsole = false;

docReady(function() {
	
	init();
	downScrollerDiv.innerHTML = '<a href="#" onclick="launchScroll(true);"><img src="images/downscroll-dark.png" width="50" height="50"></a>';
});

function log(text) {
	
	if (debugConsole) {
		
		console.log(text);
	}
}

function init() {
	
	downScrollerDiv = document.getElementById("downscroller");
	mainDiv = document.getElementById("main");
	navDiv = document.getElementById("navDiv");
	
	let slidesDiv = document.getElementsByClassName("slide");
	nbSlides = slidesDiv.length;
	
	computeDivHeights();
	registerScrollEvent();
	registerSwipeEvent();
	registerWindowResizedEvent();
}

function computeDivHeights() {

	let slidesDiv = document.getElementsByClassName("slide");
	heights = [0];
	
	for (var i = 0; i < slidesDiv.length; i++) {

		heights.push(heights[i] + slidesDiv[i].clientHeight);
	}
}

function registerWindowResizedEvent() {
	
	let eventHandle;
	window.onresize = function(){
	  clearTimeout(eventHandle);
	  eventHandle = setTimeout(handleWindowResized, 100);
	};
}

function handleWindowResized() {
	
	computeDivHeights();
	scrollToSlide(currentSlide);
}

function registerScrollEvent() {

	document.body.onwheel = handleScroll;
}

function registerSwipeEvent() {
	
	let minSwipeYDelta = 50;  //min y swipe for vertical swipe
	let startSwipeY = 0;
	let currentSwipeY = 0;

	let down = true;
	
	document.body.addEventListener('touchstart',function(e){

		startSwipeY = e.touches[0].screenY;
		currentSwipeY = startSwipeY;
		
		log('Start Swipe = ' + startSwipeY);
	  },false);

	document.body.addEventListener('touchmove',function(e){

		currentSwipeY = e.touches[0].screenY;
		
		log('Keep Swipe = ' + currentSwipeY);
	  },false);
	
	document.body.addEventListener('touchend',function(e){

		log('End Swipe = ' + currentSwipeY);
		
		if ( (currentSwipeY - minSwipeYDelta > startSwipeY) || (currentSwipeY + minSwipeYDelta < startSwipeY) ) {

			down = currentSwipeY < startSwipeY;
			log('Swipe validated ' + (down ? 'down' : 'up'));

			launchScroll(down);
		}

	  },false);
}


function scrollToSlide(nextSlide) {

	log('Current heights length ' + heights.length);

	mainDiv.style.transform = "translateY(-" + heights[nextSlide] + 'px)';
	navDiv.style.top = "" + heights[nextSlide] + "px";
	
	currentSlide = nextSlide;
	log('Slide changed');

	currentSlideScrolling = false;
	
	if (currentSlide == nbSlides-1) {
		
		downScrollerDiv.style.visibility = 'hidden';
	}
	else {

		downScrollerDiv.style.visibility = 'visible';
	}
	
}

function changeSlide(down) {
	
	log('Change slide requested ' + (down ? 'down' : 'up'));
	
	let nextSlide = down ? currentSlide + 1 : currentSlide - 1;
	
	if (nextSlide >= nbSlides || nextSlide < 0) {
		
		return;
	}
	
	scrollToSlide(nextSlide);
}

function handleScroll(event) {
	
	log('New scroll requested');

    if ( !currentSlideScrolling && (Date.now() - scrollingAskedTime > 1200)) {

    	currentSlideScrolling = true;

    	scrollingAskedTime = Date.now();

		log('scroll');
    	
    	launchScroll(event.deltaY > 0);
	}
    else {

    	log('Scroll ignored');
    }
}

function launchScroll(down) {
	
	log('Launch scroll');
	
	window.requestAnimationFrame(function() {
  
		changeSlide(down);
		
    	log('Scrolled synchronously');
    });
}
