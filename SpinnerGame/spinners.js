var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var intervalId;
var timer_delay = 10;

var current_spinner;

var FULL_ROTATION = 2*Math.PI; // Number of radians in a circle.
var CANVAS_AREA = new Area(0, 0, canvas.width, canvas.height);
var MOUSE_RADIUS = 5;
var MOUSE_X;
var MOUSE_Y;

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

Area.prototype.update = function(x_min, y_min, x_max, y_max) {
    this.x_min = x_min; 
    this.y_min = y_min;
    this.x_max = x_max;
    this.y_max = y_max;
}

// Returns 'true' if the two given areas overlap, else returns 'false'.
function detectAreaOverlap(area0, area1) {
    if ((area0.x_min < area1.x_max) && (area0.x_max > area1.x_min)) {
        if ((area0.y_min < area1.y_max) && (area0.y_max > area1.y_min)) {
            return true;
        }
    }
    return false;
}

// Abstract Spinner object. 'color' is either 'red', 'orange', 'yellow',
// 'green', 'blue', or 'purple'.
function Spinner(color, pos_x, pos_y, vel_x, vel_y, rps, inner_radius, orbit_radius, num_orbiting_circles, outer_circle_radius) {
    var i;
    var delta_radians;
    var radian_angle = 0;

    this.pos_x = pos_x; // x-position.
    this.pos_y = pos_y; // y-position.
    this.vel_x = vel_x; // x-velocity in pixels per second.
    this.vel_y = vel_y; // y-velocity in pixels per second.
    this.rps = rps;     // Radians per second, i.e. rotation speed.
    this.color = color;
    this.angle = 0;     // Initial angle of rotation. 
    this.inner_radius = inner_radius; // Radius of the center circle.
    this.orbit_radius = orbit_radius;
    this.num_orbiting_circles = num_orbiting_circles;
    this.outer_circle_radius = outer_circle_radius;
    this.outer_circle_angles = new Array(num_orbiting_circles);

    // area - the area the spinner occupies, relative to the original 
    // canvas layer.
    this.area = new Area(pos_x - inner_radius, pos_y - inner_radius, 
                         pos_x + inner_radius, pos_y + inner_radius);

    delta_radians = 2*Math.PI/num_orbiting_circles;
    // outer_circle_angles - the angles of the orbiting circles relative to
    //    the center of the spinner.
    for (i = 0; i < num_orbiting_circles; i++) {
        this.outer_circle_angles[i] = radian_angle;
        radian_angle += delta_radians;
    }
}

// Spinner class functions. The empty functions will be redefined by 
// sub-classes of 'Spinner'.
Spinner.prototype.isActive = function() {
    return detectAreaOverlap(this.area, CANVAS_AREA);
}

Spinner.prototype.draw = function(ctx) {}
// detectCollision - may replace 'area' argument with 'mouse_object'.
Spinner.prototype.detectCollision = function() {} 
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

    var num_ridges = 5;
    var delta_radians = (2*Math.PI)/(2*num_ridges);
    var radian_angle = 0;

    // Area bounds for the spinner.
    var x_min = pos_x - orbit_radius - outer_circle_radius;
    var y_min = pos_y - orbit_radius - outer_circle_radius;
    var x_max = pos_x + orbit_radius + outer_circle_radius;
    var y_max = pos_y + orbit_radius + outer_circle_radius; 

    var i;

    // Call the parent constructor.
    Spinner.call(this, "red", pos_x, pos_y, vel_x, vel_y, rps, 
                 inner_radius, orbit_radius, num_orbiting_circles, outer_circle_radius);
    
    // Red Spinners are defined to have 4 orbiting circles, all of which
    // have radius 5.
    this.num_orbiting_circles = num_orbiting_circles;
    this.outer_circle_radius = outer_circle_radius;
    this.delta_radians = delta_radians;
    
    // Define the spinner's area.
    this.area = new Area(x_min, y_min, x_max, y_max);
    this.num_ridges = num_ridges;
    this.ridge_angles = new Array(num_ridges);

    for (i = 0; i < num_ridges; i++) {
        this.ridge_angles[i] = radian_angle;
        radian_angle += 2*delta_radians;
    }
}

// Set up inheritance, correct the constructor.
RedSpinner.prototype = new Spinner();
RedSpinner.prototype.constructor = RedSpinner;

// Redefine methods of the parent. Add class variables.

function drawArc(ctx, center_x, center_y, start_angle, end_angle, radius, color) {
    var left_x = radius * Math.cos(start_angle);
    var left_y = radius * Math.sin(start_angle);
    var right_x = radius * Math.cos(end_angle);
    var right_y = radius * Math.sin(end_angle);
    
    ctx.fillStyle = color;
    ctx.beginPath();

    // Left line
    ctx.moveTo(center_x, center_y);
    ctx.lineTo(center_x + left_x, center_y + left_y);

    // Arc
    ctx.arc(center_x, center_y, radius, start_angle, end_angle, false);

    //Right line
    ctx.moveTo(center_x + right_x, center_y + right_y);
    ctx.lineTo(center_x, center_y);
    
    ctx.fill();
}

RedSpinner.prototype.draw = function(ctx) {
    var i;
    var x_coord; // x-position of the current outer circle to draw.
    var y_coord; // y-position of the current outer circle to draw.
    var radian_angle;
    var delta_radians = this.delta_radians;

    ctx.save();
    ctx.translate(this.pos_x, this.pos_y);

    // Draw the inner circle
    drawCircle(ctx, 0, 0, this.inner_radius, this.color);
    for (i = 0; i < this.num_ridges; i++) {
        radian_angle = this.ridge_angles[i];
        drawArc(ctx, 0, 0, radian_angle, radian_angle + delta_radians, this.inner_radius+2, this.color);
    }

    for (i = 0; i < this.num_orbiting_circles; i++) {
        x_coord = this.orbit_radius * Math.cos(this.outer_circle_angles[i]);
        y_coord = this.orbit_radius * Math.sin(this.outer_circle_angles[i]);
        drawCircle(ctx, x_coord, y_coord, this.outer_circle_radius, 
                   this.color);
    }
    ctx.restore();
}

RedSpinner.prototype.inShape = function(shape_x, shape_y, shape_radius) {
    return (Math.sqrt(Math.pow(MOUSE_X - shape_x,2) + Math.pow(MOUSE_Y- shape_y,2)) <= MOUSE_RADIUS + shape_radius);
}

RedSpinner.prototype.detectCollision = function() {
    var i;
    var displace_x;
    var displace_y;
    if (this.inShape(this.pos_x, this.pos_y, this.inner_radius)) {
        return true;
    }
    for (i = 0; i < this.num_orbiting_circles; i++) {
        displace_x = this.orbit_radius * Math.cos(this.outer_circle_angles[i]);
        displace_y = this.orbit_radius * Math.sin(this.outer_circle_angles[i]);
        if (this.inShape(this.pos_x + displace_x, this.pos_y + displace_y, this.outer_circle_radius)) {
            return true;
        }
    }
    return false;
} 

RedSpinner.prototype.update = function(elapsed_ms) {
    var orbit_radius = this.orbit_radius;
    var outer_circle_radius = this.outer_circle_radius;
    var x_min = this.pos_x - orbit_radius - outer_circle_radius;
    var y_min = this.pos_y - orbit_radius - outer_circle_radius;
    var x_max = this.pos_x + orbit_radius + outer_circle_radius;
    var y_max = this.pos_y + orbit_radius + outer_circle_radius;
    var i;

    var elapsed_secs = elapsed_ms / 1000; // Ellapsed time in seconds

    this.pos_x += this.vel_x * elapsed_secs;
    this.pos_y += this.vel_y * elapsed_secs;
    this.angle += (this.rps * elapsed_secs);
    this.angle = this.angle % FULL_ROTATION; 

    // Update the area of the spinner every time.
    this.area.update(x_min, y_min, x_max, y_max);

    for (i = 0; i < this.num_orbiting_circles; i++) {
        this.outer_circle_angles[i] += (this.rps * elapsed_secs);
        this.outer_circle_angles[i] = this.outer_circle_angles[i] % (2*Math.PI);
    }

    for (i = 0; i < this.num_ridges; i++) {
        this.ridge_angles[i] += (this.rps * elapsed_secs);
        this.ridge_angles[i] = this.ridge_angles[i] % (2*Math.PI);
    }
}


/************************************/
/* Define the Orange Spinner object */
/************************************/
// OrangeSpinner - 6 outer circles, orbit_radius increases/decreases as a
//    function of time.
function OrangeSpinner(pos_x, pos_y, vel_x, vel_y, rps, 
                       inner_radius, orbit_radius) {

    // Orange Spinners are defined to have 6 orbiting circles, all of which
    // fluctuate between radius 5 and 10.
    var num_orbiting_circles = 6;
    var outer_circle_radius = 5;

    // Area bounds for the spinner.
    var x_min = pos_x - orbit_radius - outer_circle_radius;
    var y_min = pos_y - orbit_radius - outer_circle_radius;
    var x_max = pos_x + orbit_radius + outer_circle_radius;
    var y_max = pos_y + orbit_radius + outer_circle_radius; 

    // Call the parent constructor.
    Spinner.call(this, "orange", pos_x, pos_y, vel_x, vel_y, rps, 
                 inner_radius, orbit_radius, num_orbiting_circles, outer_circle_radius);
    // Define the spinner's area.
    this.area = new Area(x_min, y_min, x_max, y_max);

    // Orange Spinners are defined to have 6 orbiting circles, all of which
    // fluctuate between radius 5 and 10.
    this.num_orbiting_circles = num_orbiting_circles;
    this.outer_circle_radius = outer_circle_radius;
}

// Set up inheritance, correct the constructor.
OrangeSpinner.prototype = new RedSpinner();
OrangeSpinner.prototype.constructor = OrangeSpinner;

var orange_delta_radius = 0.5;

OrangeSpinner.prototype.update = function(elapsed_ms) {
    var orbit_radius;
    var outer_circle_radius;
    var x_min;
    var y_min;
    var x_max;
    var y_max;
    var i;
    var elapsed_secs;

    if (this.outer_circle_radius === 20) {
        orange_delta_radius = -0.5;
    }
    if (this.outer_circle_radius === 1) {
        orange_delta_radius = 0.5;
    }
    this.outer_circle_radius += orange_delta_radius;
    orbit_radius = this.outer_circle_radius;
    outer_circle_radius = this.outer_circle_radius;
    x_min = this.pos_x - orbit_radius - outer_circle_radius;
    y_min = this.pos_y - orbit_radius - outer_circle_radius;
    x_max = this.pos_x + orbit_radius + outer_circle_radius;
    y_max = this.pos_y + orbit_radius + outer_circle_radius;

    elapsed_secs = elapsed_ms / 1000; // Ellapsed time in seconds

    this.pos_x += this.vel_x * elapsed_secs;
    this.pos_y += this.vel_y * elapsed_secs;
    this.angle += (this.rps * elapsed_secs);
    this.angle = this.angle % FULL_ROTATION; 

    // Update the area of the spinner every time.
    this.area.update(x_min, y_min, x_max, y_max);

    for (i = 0; i < this.num_orbiting_circles; i++) {
        this.outer_circle_angles[i] += (this.rps * elapsed_secs);
        this.outer_circle_angles[i] = this.outer_circle_angles[i] % (2*Math.PI);
    }
}

/************************************/
/* Define the Yellow Spinner object */
/************************************/
var YELLOW_INITIAL_ORBIT_RADIUS;
var yellow_delta_radius = 0.5;

function YellowSpinner(pos_x, pos_y, vel_x, vel_y, rps, 
                       inner_radius, orbit_radius) {

    // Orange Spinners are defined to have 6 orbiting circles, all of which
    // fluctuate between radius 5 and 10.
    var num_orbiting_circles = 6;
    var outer_circle_radius = 5; 

    // Area bounds for the spinner.
    var x_min = pos_x - orbit_radius - outer_circle_radius;
    var y_min = pos_y - orbit_radius - outer_circle_radius;
    var x_max = pos_x + orbit_radius + outer_circle_radius;
    var y_max = pos_y + orbit_radius + outer_circle_radius; 

    YELLOW_INITIAL_ORBIT_RADIUS = orbit_radius;

    // Call the parent constructor.
    Spinner.call(this, "yellow", pos_x, pos_y, vel_x, vel_y, rps, 
                 inner_radius, orbit_radius, num_orbiting_circles, outer_circle_radius);
    // Define the spinner's area.
    this.area = new Area(x_min, y_min, x_max, y_max);

    // Orange Spinners are defined to have 6 orbiting circles, all of which
    // fluctuate between radius 5 and 10.
    this.num_orbiting_circles = num_orbiting_circles;
    this.outer_circle_radius = outer_circle_radius;
}

// Set up inheritance, correct the constructor.
YellowSpinner.prototype = new RedSpinner();
YellowSpinner.prototype.constructor = YellowSpinner;

YellowSpinner.prototype.update = function(elapsed_ms) {
    var orbit_radius;
    var outer_circle_radius;
    var x_min;
    var y_min;
    var x_max;
    var y_max;
    var i;
    var elapsed_secs;

    // Start decreasing orbit radius
    if (this.orbit_radius === 2*YELLOW_INITIAL_ORBIT_RADIUS) {
        yellow_delta_radius = -0.5;
    }
    // Start increasing orbit radius
    if (this.orbit_radius === YELLOW_INITIAL_ORBIT_RADIUS) {
        yellow_delta_radius = 0.5;
    }

    this.orbit_radius += yellow_delta_radius;
    orbit_radius = this.orbit_radius;
    outer_circle_radius = this.outer_circle_radius;

    // Calculate new boundaries
    x_min = this.pos_x - orbit_radius - outer_circle_radius;
    y_min = this.pos_y - orbit_radius - outer_circle_radius;
    x_max = this.pos_x + orbit_radius + outer_circle_radius;
    y_max = this.pos_y + orbit_radius + outer_circle_radius;
    i;

    elapsed_secs = elapsed_ms / 1000; // Elapsed time in seconds

    // Calculate new center of middle circle and angle of orbiting circles.
    this.pos_x += this.vel_x * elapsed_secs;
    this.pos_y += this.vel_y * elapsed_secs;
    this.angle += (this.rps * elapsed_secs);
    this.angle = this.angle % FULL_ROTATION; 

    // Update the area of the spinner every time.
    this.area.update(x_min, y_min, x_max, y_max);

    for (i = 0; i < this.num_orbiting_circles; i++) {
        this.outer_circle_angles[i] += (this.rps * elapsed_secs);
        this.outer_circle_angles[i] = this.outer_circle_angles[i] % (2*Math.PI);
    }
}

var GREEN_INITIAL_POSITION_X;
var GREEN_INITIAL_POSITION_Y;
var GREEN_INITIAL_ORBIT_RADIUS;

/************************************/
/* Define the Green Spinner object */
/************************************/
function GreenSpinner(pos_x, pos_y, vel_x, vel_y, rps, 
                       inner_radius, orbit_radius) {

    // Green Spinners are defined to have 12 orbiting circles with radius 5.
    var num_orbiting_circles = 12;
    var outer_circle_radius = 5; 

    // Area bounds for the spinner.
    var x_min = pos_x - orbit_radius - outer_circle_radius;
    var y_min = pos_y - orbit_radius - outer_circle_radius;
    var x_max = pos_x + orbit_radius + outer_circle_radius;
    var y_max = pos_y + orbit_radius + outer_circle_radius; 

    GREEN_INITIAL_POSITION_X = pos_x;
    GREEN_INITIAL_POSITION_Y = pos_y;
    GREEN_INITIAL_ORBIT_RADIUS = orbit_radius;

    // Call the parent constructor.
    Spinner.call(this, "green", pos_x, pos_y, vel_x, vel_y, rps, 
                 inner_radius, orbit_radius, num_orbiting_circles, outer_circle_radius);
    // Define the spinner's area.
    this.area = new Area(x_min, y_min, x_max, y_max);

    // Green Spinners are defined to have 12 orbiting circles with radius 5.
    this.num_orbiting_circles = num_orbiting_circles;
    this.outer_circle_radius = outer_circle_radius;
}

// Set up inheritance, correct the constructor.
GreenSpinner.prototype = new RedSpinner();
GreenSpinner.prototype.constructor = GreenSpinner;

GreenSpinner.prototype.update = function(elapsed_ms) {
    var orbit_radius;
    var outer_circle_radius;
    var x_min;
    var y_min;
    var x_max;
    var y_max;
    var i;
    var elapsed_secs;
    var green_delta_radius = 0.5;

   if (Math.sqrt(Math.pow(GREEN_INITIAL_POSITION_X - this.pos_x, 2) +
        Math.pow(GREEN_INITIAL_POSITION_Y - this.pos_y,2)) >= canvas.width/2) {
        if (this.orbit_radius < GREEN_INITIAL_ORBIT_RADIUS) {
            this.orbit_radius += green_delta_radius; 
        }
        else {
            // Delete the circle
        }   
    }
    else {

    }

    this.orbit_radius += yellow_delta_radius;
    orbit_radius = this.orbit_radius;
    outer_circle_radius = this.outer_circle_radius;

    // Calculate new boundaries
    x_min = this.pos_x - orbit_radius - outer_circle_radius;
    y_min = this.pos_y - orbit_radius - outer_circle_radius;
    x_max = this.pos_x + orbit_radius + outer_circle_radius;
    y_max = this.pos_y + orbit_radius + outer_circle_radius;
    i;

    elapsed_secs = elapsed_ms / 1000; // Elapsed time in seconds

    // Calculate new center of middle circle and angle of orbiting circles.
    this.pos_x += this.vel_x * elapsed_secs;
    this.pos_y += this.vel_y * elapsed_secs;
    this.angle += (this.rps * elapsed_secs);
    this.angle = this.angle % FULL_ROTATION; 

    // Update the area of the spinner every time.
    this.area.update(x_min, y_min, x_max, y_max);

    for (i = 0; i < this.num_orbiting_circles; i++) {
        this.outer_circle_angles[i] += (this.rps * elapsed_secs);
        this.outer_circle_angles[i] = this.outer_circle_angles[i] % (2*Math.PI);
    }
}


/************************************/
/* Define the Green Spinner object */
/************************************/
function GreenSpinner(pos_x, pos_y, vel_x, vel_y, rps, 
                      inner_radius, orbit_radius) {

    // Green Spinners are defined to have 12 orbiting circles, all of radius
    // 5.
    var num_orbiting_circles = 12;
    var outer_circle_radius = 5; 

    // Area bounds for the spinner.
    var x_min = pos_x - orbit_radius - outer_circle_radius;
    var y_min = pos_y - orbit_radius - outer_circle_radius;
    var x_max = pos_x + orbit_radius + outer_circle_radius;
    var y_max = pos_y + orbit_radius + outer_circle_radius; 

    // Call the parent constructor.
    Spinner.call(this, "green", pos_x, pos_y, vel_x, vel_y, rps, 
                 inner_radius, orbit_radius, num_orbiting_circles, 
                 outer_circle_radius);

    // Define the spinner's area.
    this.area = new Area(x_min, y_min, x_max, y_max);

    this.num_orbiting_circles = num_orbiting_circles;
    this.outer_circle_radius = outer_circle_radius;

    // The amount that this.orbit_radius increases per second.
    this.delta_radius = orbit_radius;

    // Closure. Returns the amount of distance traveled from the starting
    // point (pos_x, pos_y).
    this.getDistTraveled = (function() {
        var x = pos_x;
        var y = pos_y;
        return function() {
            var dx = this.pos_x - x; // Change in x-position.
            var dy = this.pos_y - y; // Change in y-position.
            return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        }
    }());
}

// Set up inheritance, correct the constructor.
GreenSpinner.prototype = new RedSpinner();
GreenSpinner.prototype.constructor = GreenSpinner;

GreenSpinner.prototype.update = function(elapsed_ms) {
    var orbit_radius;
    var outer_circle_radius;
    var x_min;
    var y_min;
    var x_max;
    var y_max;
    var i;
    var elapsed_secs;

    elapsed_secs = elapsed_ms / 1000; // Elapsed time in seconds

    if (this.getDistTraveled() > (Math.min(canvas.width, canvas.height)/2)) {
        this.vel_x = 0;
        this.vel_y = 0;
        this.orbit_radius += (this.delta_radius / elapsed_secs);
    }

    orbit_radius = this.orbit_radius;
    outer_circle_radius = this.outer_circle_radius;

    // Calculate new boundaries
    x_min = this.pos_x - orbit_radius - outer_circle_radius;
    y_min = this.pos_y - orbit_radius - outer_circle_radius;
    x_max = this.pos_x + orbit_radius + outer_circle_radius;
    y_max = this.pos_y + orbit_radius + outer_circle_radius;
    i;

    // Calculate new center of middle circle and angle of orbiting circles.
    this.pos_x += this.vel_x * elapsed_secs;
    this.pos_y += this.vel_y * elapsed_secs;
    this.angle += (this.rps * elapsed_secs);
    this.angle = this.angle % FULL_ROTATION; 

    // Update the area of the spinner every time.
    this.area.update(x_min, y_min, x_max, y_max);

    for (i = 0; i < this.num_orbiting_circles; i++) {
        this.outer_circle_angles[i] += (this.rps * elapsed_secs);
        this.outer_circle_angles[i] = 
            this.outer_circle_angles[i] % (2*Math.PI);
    }
}

// ... And so on for blue, and purple spinners. 

function onMouseMove(event) {
    MOUSE_X = event.pageX - canvas.offsetLeft;  // do not use event.x, it's not cross-browser!!!
    MOUSE_Y = event.pageY - canvas.offsetTop;
    if (current_spinner.detectCollision() === true) {
        window.clearInterval(intervalId);
    }
}
canvas.addEventListener('mousemove', onMouseMove, false);

function redrawAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    
    current_spinner.draw(ctx);
    current_spinner.update(timer_delay);
    
    if (!current_spinner.isActive()) {
        current_spinner = new RedSpinner(canvas.width, canvas.height, 
                                         -canvas.width/10, -canvas.height/10,
                                         Math.PI, 10, 100, 4, 5); 
    }
}

function onTimer() {
    redrawAll();
}

function run() {
    current_spinner = new RedSpinner(canvas.width, canvas.height, 
                                     -canvas.width/10, -canvas.height/10,
                                     Math.PI, 10, 100, 4, 5);

    canvas.setAttribute('tabindex','0');
    canvas.focus();
    intervalId = setInterval(onTimer, timer_delay);
}

run();