var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var intervalId;
var timerDelay = 100;
var rectLeft = 0;
var quit = false;

function redrawAll() {
	    // erase everything -- not efficient, but simple!
	    ctx.clearRect(0, 0, 400, 400);
		    ctx.fillRect(rectLeft, 180, 40, 40);
			    ctx.font = "20px Arial";
				    ctx.fillText("Press 'q' to quit.", 20, 40);
}

function onTimer() {
	    if (quit) return;
		    rectLeft = (rectLeft + 10) % 400;
			    redrawAll();
}

function onKeyDown(event) {
	    if (quit) return;
		    var qCode = 81;
			    if (event.keyCode === qCode) {
					        clearInterval(intervalId);
							        // ctx.clearRect(0, 0, 400, 400);
							        ctx.fillStyle =
										"rgba(128,128,128,0.75)";
									        ctx.fillRect(0, 0, 400, 400);
											        quit = true;
													    }
}

function run() {
	    canvas.addEventListener('keydown', onKeyDown, false);
		    // make canvas focusable, then give it focus!
		    canvas.setAttribute('tabindex','0');
			    canvas.focus();
				    intervalId = setInterval(onTimer, timerDelay);
}

run();
