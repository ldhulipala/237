var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var intervalId;
var timer_delay = 10;

var FULL_ROTATION = 2*Math.PI; // Number of radians in a circle.
var CANVAS_AREA = new Area(0, 0, canvas.width, canvas.height);

// Draws the background. Currently, it draws a black background.
function drawBackground() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Draws a circle at (cx, cy) with a given radius and color.
function drawCircle(ctx, cx, cy, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, FULL_ROTATION, true);
    ctx.fill();
}

// Area - an object that defines a rectangular area on the canvas.
//    The area has top-left corner at (x_min, y_min), and bottom-right
//    corner at (x_max, y_max).
function Area(x_min, y_min, x_max, y_max) {
    this.x_min = x_min; 
    this.y_min = y_min;
    this.x_max = x_max;
    this.y_max = y_max;
}

// Returns 'true' if the two given areas overlap, else returns 'false'.
// Note: ***NOT TESTED***.
function detectAreaOverlap(area0, area1) {
    if (area0.x_min < area1.x_max) && (area0.x_max > area1.x_min) &&
        (area0.y_min < area1.y_max) && (area0.y_max > area1.y_min) {
            return true;
        }
    return false;
}

// Abstract Spinner object. 'color' is either 'red', 'orange', 'yellow',
// 'green', 'blue', or 'purple'.
function Spinner(color, pos_x, pos_y, vel_x, vel_y, rps, 
                 inner_radius, orbit_radius) {
    this.pos_x = pos_x; // x-position.
    this.pos_y = pos_y; // y-position.
    this.vel_x = vel_x; // x-velocity in pixels per second.
    this.vel_y = vel_y; // y-velocity in pixels per second.
    this.rps = rps;     // Radians per second, i.e. rotation speed.
    this.color = color;
    this.angle = 0;     // Initial angle of rotation. 
    this.inner_radius = inner_radius; // Radius of the center circle.
    this.orbit_radius = orbit_radius;

    // area - the area the spinner occupies, relative to the original 
    // canvas layer.
    this.area = new Area(pos_x - inner_radius, pos_y - inner_radius, 
                         pos_x + inner_radius, pos_y + inner_radius);
}

// Spinner class functions. The empty functions will be redefined by 
// sub-classes of 'Spinner'.
Spinner.prototype.isActive = function() {
    return detectAreaOverlap(this.area, CANVAS_AREA);
}

Spinner.prototype.draw = function(ctx) {}
// detectCollision - may replace 'area' argument with 'mouse_object'.
Spinner.prototype.detectCollision = function(area) {} 
Spinner.prototype.update = function(elapsed_ms) {}


// Define the 6 different types of Spinners. All of them inherit from the
// 'Spinner' object.

/*********************************/
/* Define the Red Spinner object */
/*********************************/
function RedSpinner(pos_x, pos_y, vel_x, vel_y, rps, 
                    inner_radius, orbit_radius) {
    // Red Spinners are defined to have 4 orbiting circles, all of which
    // have radius 5.
    var num_orbiting_circles = 4;
    var outer_circle_radius = 5;

    // Area bounds for the spinner.
    var x_min = pos_x - orbit_radius - outer_circle_radius;
    var y_min = pos_y - orbit_radius - outer_circle_radius;
    var x_max = pos_x + orbit_radius + outer_circle_radius;
    var y_max = pos_y + orbit_radius + outer_circle_radius; 

    // Call the parent constructor.
    Spinner.call(this, red, pos_x, pos_y, vel_x, vel_y, rps, 
                 inner_radius, orbit_radius)
    
    // Red Spinners are defined to have 4 orbiting circles, all of which
    // have radius 5.
    this.num_orbiting_circles = num_orbiting_circles;
    this.outer_circle_radius = outer_circle_radius;
    
    // Define the spinner's area.
    this.area = new Area(x_min, y_min, x_max, y_max);
}

// Set up inheritance, correct the constructor.
RedSpinner.prototype = new Spinner();
RedSpinner.prototype.constructor = RedSpinner;

// Redefine methods of the parent.
RedSpinner.prototype.draw = function(ctx) {}
RedSpinner.prototype.detectCollision = function(area) {} 
RedSpinner.prototype.update = function(elapsed_ms) {}


/************************************/
/* Define the Orange Spinner object */
/************************************/
// OrangeSpinner - 6 outer circles, orbit_radius increases/decreases as a
//    function of time.
function OrangeSpinner(pos_x, pos_y, vel_x, vel_y, rps, 
                       inner_radius, orbit_radius) {
    // Call the parent constructor.
    Spinner.call(this, orange, pos_x, pos_y, vel_x, vel_y, rps, 
                 inner_radius, orbit_radius)
}

// Set up inheritance, correct the constructor.
OrangeSpinner.prototype = new Spinner();
OrangeSpinner.prototype.constructor = OrangeSpinner;

// Redefine methods of the parent.
OrangeSpinner.prototype.draw = function(ctx) {}
OrangeSpinner.prototype.detectCollision = function(area) {} 
OrangeSpinner.prototype.update = function(elapsed_ms) {}


/************************************/
/* Define the Yellow Spinner object */
/************************************/
function YellowSpinner(pos_x, pos_y, vel_x, vel_y, rps, 
                       inner_radius, orbit_radius) {
    // Call the parent constructor.
    Spinner.call(this, yellow, pos_x, pos_y, vel_x, vel_y, rps, 
                 inner_radius, orbit_radius)
}

// Set up inheritance, correct the constructor.
YellowSpinner.prototype = new Spinner();
YellowSpinner.prototype.constructor = YellowSpinner;

// Redefine methods of the parent.
YellowSpinner.prototype.draw = function(ctx) {}
YellowSpinner.prototype.detectCollision = function(area) {} 
YellowSpinner.prototype.update = function(elapsed_ms) {}


// ... And so on for green, blue, and purple spinners. 

function redrawAll() {

}

function onTimer() {
    redrawAll();
}

function run() {
    canvas.setAttribute('tabindex','0');
    canvas.focus();
    intervalId = setInterval(onTimer, timer_delay);
}

//run();
