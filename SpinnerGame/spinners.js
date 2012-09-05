var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var intervalId;
var spawnIntervalId;
var timer_delay = 10;

var spinners_on_board;
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
function Spinner(color, pos_x, pos_y, vel_x, vel_y, rps, inner_radius, orbit_radius, num_orbiting_circles, outer_circle_radius,
                    inner_num_ridges, outer_num_ridges) {
    var delta_radians;
    var radian_angle = 0;
    var inner_delta_radians = (2*Math.PI)/(2*inner_num_ridges);
    var outer_delta_radians = (2*Math.PI)/(2*outer_num_ridges);
    var i;
    var j;

    var x_min = pos_x - orbit_radius - outer_circle_radius;
    var y_min = pos_y - orbit_radius - outer_circle_radius;
    var x_max = pos_x + orbit_radius + outer_circle_radius;
    var y_max = pos_y + orbit_radius + outer_circle_radius;

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
    this.inner_delta_radians = inner_delta_radians;
    this.outer_delta_radians = outer_delta_radians;
    this.inner_num_ridges = inner_num_ridges;
    this.outer_num_ridges = outer_num_ridges;

    // area - the area the spinner occupies, relative to the original 
    // canvas layer.
    this.area = new Area(x_min, y_min, x_max, y_max);

    delta_radians = 2*Math.PI/num_orbiting_circles;

    this.inner_ridge_angles = new Array(inner_num_ridges);
    this.outer_ridge_angles = new Array(num_orbiting_circles);

    for (i = 0; i < inner_num_ridges; i++) {
        this.inner_ridge_angles[i] = radian_angle;
        radian_angle += 2*inner_delta_radians;
    }

    // outer_circle_angles - the angles of the orbiting circles relative to
    //    the center of the spinner.
    for (i = 0; i < num_orbiting_circles; i++) {
        this.outer_circle_angles[i] = radian_angle;
        radian_angle += delta_radians;
        this.outer_ridge_angles[i] = new Array(outer_num_ridges);
        for (j = 0; j < outer_num_ridges; j++) {
            this.outer_ridge_angles[i][j] = radian_angle + i*outer_delta_radians;
            radian_angle += 2*outer_delta_radians;
        }
    }
}


// Spinner class functions. The empty functions will be redefined by 
// sub-classes of 'Spinner'.
Spinner.prototype.isActive = function() {
    return detectAreaOverlap(this.area, CANVAS_AREA);
}

Spinner.prototype.updateSpinners = function(elapsed_ms) {
    var orbit_radius;
    var outer_circle_radius;
    var x_min;
    var y_min;
    var x_max;
    var y_max;
    var i; 
    orbit_radius = this.orbit_radius;
    outer_circle_radius = this.outer_circle_radius;

    // Calculate new boundaries
    x_min = this.pos_x - orbit_radius - outer_circle_radius;
    y_min = this.pos_y - orbit_radius - outer_circle_radius;
    x_max = this.pos_x + orbit_radius + outer_circle_radius;
    y_max = this.pos_y + orbit_radius + outer_circle_radius;

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

Spinner.prototype.draw = function(ctx) {}
Spinner.prototype.draw_fn = function(ctx, center_x, center_y, start_angle, end_angle, radius, color) {}
// detectCollision - may replace 'area' argument with 'mouse_object'.
Spinner.prototype.detectCollision = function(inShape) {
    var i;
    var displace_x;
    var displace_y;
    if (inShape(this.pos_x, this.pos_y, this.inner_radius)) {
        return true;
    }
    for (i = 0; i < this.num_orbiting_circles; i++) {
        displace_x = this.orbit_radius * Math.cos(this.outer_circle_angles[i]);
        displace_y = this.orbit_radius * Math.sin(this.outer_circle_angles[i]);
        if (inShape(this.pos_x + displace_x, this.pos_y + displace_y, this.outer_circle_radius)) {
            return true;
        }
    }
    return false;
} 
Spinner.prototype.update = function(elapsed_ms) {}


// Define the 6 different types of Spinners. All of them inherit from the
// 'Spinner' object.

/*********************************/
/* Define the Red Spinner object */
/*********************************/
function RedSpinner(pos_x, pos_y, vel_x, vel_y, rps) {
    // Red Spinners are defined to have 4 orbiting circles, all of which
    // have radius 5. They're shaped like screws with 5 ridges on the inner
    // circle and 4 on the outer circle. 
    var num_orbiting_circles = 4;
    var outer_circle_radius = 8;

    var inner_num_ridges = 5;
    var outer_num_ridges = 4;

    var inner_radius = 15;
    var orbit_radius = 50;

    // Call the parent constructor.
    Spinner.call(this, "red", pos_x, pos_y, vel_x, vel_y, rps, 
                 inner_radius, orbit_radius, num_orbiting_circles, outer_circle_radius,
                 inner_num_ridges, outer_num_ridges);
}

// Set up inheritance, correct the constructor.
RedSpinner.prototype = new Spinner();
RedSpinner.prototype.constructor = RedSpinner;

// Redefine methods of the parent. Add class variables.

RedSpinner.prototype.draw_fn = function(ctx, center_x, center_y, start_angle, end_angle, radius, color) {
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

RedSpinner.prototype.draw = function(ctx, draw_fn) {
    var i;
    var j;
    var x_coord; // x-position of the current outer circle to draw.
    var y_coord; // y-position of the current outer circle to draw.
    var radian_angle;
    var inner_delta_radians = this.inner_delta_radians;
    var outer_ridge_angles;

    ctx.save();
    ctx.translate(this.pos_x, this.pos_y);

    // Draw the inner circle
    drawCircle(ctx, 0, 0, 0.5*this.inner_radius, this.color);
    // Draw ridges for inner circles
    for (i = 0; i < this.inner_num_ridges; i++) {
        radian_angle = this.inner_ridge_angles[i];
        this.draw_fn(ctx, 0, 0, radian_angle, radian_angle + inner_delta_radians, this.inner_radius, this.color);
    }

    // Draw the outer circle
    for (i = 0; i < this.num_orbiting_circles; i++) {
        x_coord = this.orbit_radius * Math.cos(this.outer_circle_angles[i]);
        y_coord = this.orbit_radius * Math.sin(this.outer_circle_angles[i]);
        drawCircle(ctx, x_coord, y_coord, 0.5*this.outer_circle_radius, 
                   this.color);

        outer_ridge_angles = this.outer_ridge_angles[i];
        // Draw ridges for outer circle
        for (j = 0; j < this.outer_num_ridges; j++) {
            radian_angle = outer_ridge_angles[j];
            this.draw_fn(ctx, x_coord, y_coord, radian_angle, radian_angle + this.outer_delta_radians, this.outer_circle_radius, this.color);
        }

    }

    ctx.restore();
}

function inShape(shape_x, shape_y, shape_radius) {
    return (Math.sqrt(Math.pow(MOUSE_X - shape_x,2) + Math.pow(MOUSE_Y- shape_y,2)) <= MOUSE_RADIUS + shape_radius);
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

    for (i = 0; i < this.inner_num_ridges; i++) {
        this.inner_ridge_angles[i] += (this.rps * elapsed_secs);
        this.inner_ridge_angles[i] = this.inner_ridge_angles[i] % (2*Math.PI);
    }
}


/************************************/
/* Define the Orange Spinner object */
/************************************/
// OrangeSpinner - 6 outer circles, orbit_radius increases/decreases as a
//    function of time.
function OrangeSpinner(pos_x, pos_y, vel_x, vel_y, rps) {
    // Orange Spinners are defined to have 6 orbiting circles, all of which
    // have fluctuating radiuses.
    var num_orbiting_circles = 6;
    var outer_circle_radius = 5; 

    // Orange spinners have sharp ridges around the main circle.
    var inner_num_ridges = 4;
    var outer_num_ridges = 3; 

    var inner_radius = 4;
    var orbit_radius = 100;

    // Call the parent constructor.
    Spinner.call(this, "orange", pos_x, pos_y, vel_x, vel_y, rps, 
                 inner_radius, orbit_radius, num_orbiting_circles, outer_circle_radius,
                 inner_num_ridges, outer_num_ridges);
    
}

// Set up inheritance, correct the constructor.
OrangeSpinner.prototype = new RedSpinner();
OrangeSpinner.prototype.constructor = OrangeSpinner;

var orange_delta_radius = 0.5;


OrangeSpinner.prototype.draw_fn = function(ctx, center_x, center_y, start_angle, end_angle, radius, color) {
    var angle = (start_angle + end_angle) / 2;
    var x = radius * Math.cos(angle);
    var y = radius * Math.sin(angle);
    var start_x = 0.5*radius * Math.cos(start_angle);
    var start_y = 0.5*radius * Math.sin(start_angle);
    var end_x = 0.5*radius * Math.cos(end_angle);
    var end_y = 0.5*radius * Math.sin(end_angle); 
    
    ctx.fillStyle = color;
    ctx.beginPath();

    // Left line
    ctx.moveTo(center_x + start_x, center_y + start_y);
    ctx.lineTo(center_x + x, center_y + y);
    //Right line
    ctx.lineTo(center_x + end_x, center_y + end_y);
    
    ctx.fill();
}

OrangeSpinner.prototype.update = function(elapsed_ms) {
    if (this.outer_circle_radius === 20) {
        orange_delta_radius = -0.5;
    }
    if (this.outer_circle_radius === 1) {
        orange_delta_radius = 0.5;
    }
    this.outer_circle_radius += orange_delta_radius;
    this.updateSpinners(elapsed_ms);
}

/************************************/
/* Define the Yellow Spinner object */
/************************************/
var YELLOW_INITIAL_ORBIT_RADIUS;
var yellow_delta_radius = 0.5;

function YellowSpinner(pos_x, pos_y, vel_x, vel_y, rps) {

    // Yellow Spinners are defined to have 6 orbiting circles. The
    // distance between the inner circle and orbit circle  
    // increases over time. 
    var num_orbiting_circles = 6;
    var outer_circle_radius = 5; 

    // Yellow spinners do not have anything unique about their shape.
    var inner_num_ridges = 0;
    var outer_num_ridges = 0; 

    var inner_radius = 10;
    var orbit_radius = 100;

    // We need to remember the initial radius, so we know the max and min
    // size of the orbitting radiuses.
    YELLOW_INITIAL_ORBIT_RADIUS = orbit_radius;

    // Call the parent constructor.
    Spinner.call(this, "yellow", pos_x, pos_y, vel_x, vel_y, rps, 
                 inner_radius, orbit_radius, num_orbiting_circles, outer_circle_radius,
                 inner_num_ridges, outer_num_ridges);
}

// Set up inheritance, correct the constructor.
YellowSpinner.prototype = new RedSpinner();
YellowSpinner.prototype.constructor = YellowSpinner;



YellowSpinner.prototype.update = function(elapsed_ms) {
    // Start decreasing orbit radius
    if (this.orbit_radius === 2*YELLOW_INITIAL_ORBIT_RADIUS) {
        yellow_delta_radius = -0.5;
    }
    // Start increasing orbit radius
    if (this.orbit_radius === YELLOW_INITIAL_ORBIT_RADIUS) {
        yellow_delta_radius = 0.5;
    }

    this.orbit_radius += yellow_delta_radius;
    this.updateSpinners(elapsed_ms);
}

var GREEN_INITIAL_POSITION_X;
var GREEN_INITIAL_POSITION_Y;
var GREEN_INITIAL_ORBIT_RADIUS;


/************************************/
/* Define the Green Spinner object */
/************************************/
function GreenSpinner(pos_x, pos_y, vel_x, vel_y, rps) {

    // Green Spinners are defined to have 12 orbiting circles, all of radius
    // 5.
    var num_orbiting_circles = 12;
    var outer_circle_radius = 5; 

     // Green spinners do not have any ridges.
    var inner_num_ridges = 0;
    var outer_num_ridges = 0; 

    var inner_radius = 10;
    var orbit_radius = 100;

    // Call the parent constructor.
    Spinner.call(this, "green", pos_x, pos_y, vel_x, vel_y, rps, 
                 inner_radius, orbit_radius, num_orbiting_circles, 
                 outer_circle_radius, inner_num_ridges, outer_num_ridges);

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

// A GreenSpinner is no longer active when its radius grows too large.
GreenSpinner.prototype.isActive = function() {
    if (this.orbit_radius > Math.max(canvas.width, canvas.height)) {
        return false;
    }
    return true;
}

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
        this.orbit_radius += (this.delta_radius * elapsed_secs);
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
    if (current_spinner.detectCollision(inShape) === true) {
        window.clearInterval(intervalId);
    }
}
canvas.addEventListener('mousemove', onMouseMove, false);

function redrawAll() {
    var spinner;
    var i;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    
    console.log('a ' + spinners_on_board);
    for (i = 0; i < spinners_on_board.length; i++) {
        spinner = spinners_on_board[i];
        console.log(typeof(spinner));
        spinner.draw(ctx);
        spinner.update(timer_delay);
    }
}

function onTimer() {
    redrawAll();
}

function spawn() {
    var rand = Math.random();
    // Create four values between 0 and 3
    var choice = Math.floor(rand/0.25); 
    var newSpinner;
    var constructor;
    console.log('HERE');
    if (choice === 0) {
        constructor = OrangeSpinner;
    }
    else if (choice === 1) {
        constructor = RedSpinner;
    }
    else if (choice === 2) {
        constructor = YellowSpinner;
    }
    else if (choice === 3) {
        constructor = GreenSpinner;
    }
    newSpinner = getRandomizedSpinner(constructor);
    console.log('THIS ' + newSpinner);
    spinners_on_board.push(newSpinner);
    return;
}

function getRandomizedSpinner(spinner_constructor) {
    var start_x;
    var start_y;
    var index;
    var spinner;
    var start_positions_x = [0, canvas.width];
    var start_positions_y = [0, canvas.height];
    // Velocity is in range [canvas.size/10, canvas.size/4]
    var velocity_x = (0.10 + 0.15*Math.random())*canvas.width;
    var velocity_y = (0.10 + 0.15*Math.random())*canvas.height;
    // RPS is in range [Pi/2, 3Pi/2]
    var rps = Math.PI/2 + Math.random()*Math.PI;

    index = Math.floor(Math.random() + 0.5);
    start_x = start_positions_x[index];
    index = Math.floor(Math.random() + 0.5);
    start_y = start_positions_y[index];

    if (start_x === canvas.width) {
        velocity_x = -1*velocity_x;
    } 
    if (start_y === canvas.height) {
        velocity_y = -1*velocity_y;
    }
    spinner = new spinner_constructor(start_x, start_y, velocity_x, velocity_y, rps)
    return spinner;
}


function run() {
    spinners_on_board = [];

    current_spinner = new GreenSpinner(canvas.width, canvas.height, 
                                     -canvas.width/10, -canvas.height/10, Math.PI);

    canvas.setAttribute('tabindex','0');
    canvas.focus();
    intervalId = setInterval(onTimer, timer_delay);
    spawnIntervalId = setInterval(spawn, 1000);
}

run();