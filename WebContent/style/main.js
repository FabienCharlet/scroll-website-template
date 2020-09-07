
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
var downScrollerDiv;
var slidesDiv;
var nbSlides;
var currentScrollPosition = 0;
var scrollingAskedTime = 0;
var currentSlideScrolling = false;
var heights = [0];

docReady(function() {
	
	init();
	downScrollerDiv.innerHTML = '<span onclick="launchScroll(true);">V</span>';
});

function log(text) {
	
	console.log(text 
			+ ' [currentSlide=' + currentSlide 
			+ ', currentScrollPosition='+currentScrollPosition
			+ ', scrollingAskedTime='+scrollingAskedTime
			+ ', currentSlideScrolling='+currentSlideScrolling
	);
}

function init() {
	
	downScrollerDiv = document.getElementById("downscroller");
	mainDiv = document.getElementById("main");
	slidesDiv = document.getElementsByClassName("slide");
	nbSlides = slidesDiv.length;
	
	
	document.body.onwheel = handleScroll;
}


function changeSlide(down) {
	
	log('Change slide requested ' + (down ? 'down' : 'up'));
	let nextSlide = currentSlide;
	
	if (down) {
		
		if (currentSlide == nbSlides-1) {
			return;
		}

		nextSlide = currentSlide + 1;
	}
	else {
	
		if (currentSlide==0) {
			
			return;
		}

		nextSlide = currentSlide - 1;
	}
	currentSlideScrolling = true;

	log('Current heights length ' + heights.length);
	
	if (nextSlide > heights.length-1) {

		log('Compute scroll position for slide ' + nextSlide);
		
		heights.push(heights[currentSlide] + slidesDiv[currentSlide].clientHeight);
	}
	
	mainDiv.style.transform = "translateY(-" + heights[nextSlide] + 'px)';
	
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

function handleScroll(event) {
	
	log('New scroll requested');
	
    if ((Date.now() - scrollingAskedTime > 1500) && !currentSlideScrolling) {

    	if (event.deltaY > 0) {

    		log('Down scroll');
        	
        	launchScroll(true);
    	} 
    	else {

    		log('Up scroll');
        	
        	launchScroll(false);
    	}
	}
    else {

    	log('Scroll ignored');
    }
}

function launchScroll(down) {

	scrollingAskedTime = Date.now();
	
	log('Launch scroll');
	
	window.requestAnimationFrame(function() {
  
		changeSlide(down);
		
    	log('Scrolled synchronously');
    });
}
