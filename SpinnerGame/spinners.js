var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var intervalId;
var intervalId;
var timer_delay = 10;
var current_spinner;
var current_spinners = new Array;

var TOTAL_CIRCLE_RADIANS = 2*Math.PI;

// Draw black background
ctx.fillStyle = "#000000";
ctx.fillRect(0, 0, 400, 400);

function drawCircle(ctx, cx, cy, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2*Math.PI, true);
    ctx.fill();
}


// Spinner with 4 orbit circles
function Spinner(px, py, vx, vy, rps, color, num_circles) {
    var start_radian = 0; // Angle of first outer circle
    // Distance between each outer circle
    var radians_per_circle = TOTAL_CIRCLE_RADIANS/num_circles;
    var x_coord;
    var y_coord;

    this.px = px;
    this.py = py;
    this.vx = vx; // Pixels per second
    this.vy = vy; // Pixels per second
    this.rps = rps; //Radians per second
    this.color = color;
    this.angle = 0;
    this.num_circles = num_circles;
    this.circle_angles = new Array(num_circles);

    for (i = 0; i < this.num_circles; i++) {
        this.circle_angles[i] = start_radian;
        start_radian += radians_per_circle;
    }
}

Spinner.prototype.inner_radius = 10; // Radius of inner circle
Spinner.prototype.outer_radius = 5;  // Radius of orbitting circles
Spinner.prototype.orbit_radius = 80; // Orbit radius

// Draws a Spinner at the current origin (assumed to be translated)
Spinner.prototype.draw = function(ctx) {
    var i;
    var x_coord;
    var y_coord;

    ctx.save();
    ctx.translate(this.px, this.py);

    // Draw the inner circle
    drawCircle(ctx, 0, 0, this.inner_radius, this.color);

    for (i = 0; i < this.num_circles; i++) {
        x_coord = this.orbit_radius*Math.cos(this.circle_angles[i]);
        y_coord = this.orbit_radius*Math.sin(this.circle_angles[i]);
        drawCircle(ctx, x_coord, y_coord, this.outer_radius, this.color);
    }

    ctx.restore();
}

function inCircle(x_coord, y_coord, x_center, y_center, radius) {
    return (x_center - radius <= x_coord &&
            x_coord <= x_center + radius &&
            y_center - radius <= y_coord &&
            y_coord <= y_center + radius);
}

Spinner.prototype.isCollision = function(x, y) {
    var i;
    var angle;
    var x_coord;
    var y_coord;
    // Check middle circle
    if (inCircle(x, y, this.px, this.py, this.inner_radius)) {
        return true;
    }
    // Check orbital circles
    for (i = 0; i < this.num_circles; i++) {
        angle = this.circle_angles[i];
        x_coord = this.orbit_radius*Math.cos(angle);
        y_coord = this.orbit_radius*Math.sin(angle);
        if (inCircle(x, y, this.px + x_coord, this.py + y_coord, this.outer_radius)) {
            return true;
        }
    }
    return false;
}


function onMouseMove(event) {
    var x = event.pageX - canvas.offsetLeft;  // do not use event.x, it's not cross-browser!!!
    var y = event.pageY - canvas.offsetTop;
/*    if (current_spinner.isCollision(x,y)) {
        window.clearInterval(intervalId);
    } */
    current_spinners.forEach(function (the_spinner) {
        if (the_spinner.isCollision(x,y)) {
            window.clearInterval(intervalId);
        }
    });
}
canvas.addEventListener('mousemove', onMouseMove, false);




Spinner.prototype.update = function(elapsed_ms) {
    var i;
    var coords;
    var x_coord;
    var y_coord;
    var angle; // In radians
    var elapsed_secs = elapsed_ms / 1000; // Ellapsed time in seconds
    this.px += this.vx * elapsed_secs;
    this.py += this.vy * elapsed_secs;

    this.angle += (this.rps * elapsed_secs);
    this.angle = this.angle % (2 * Math.PI);

    for (i = 0; i < this.num_circles; i++) {
        this.circle_angles[i] += (this.rps * elapsed_secs);
        this.circle_angles[i] = this.circle_angles[i] % (2 * Math.PI);
    }
}


function redrawAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 400, 400);

 //   current_spinner.draw(ctx);

//    current_spinner.update(timer_delay);
    current_spinners.forEach(function (the_spinner) {
        the_spinner.draw(ctx);
        the_spinner.update(timer_delay);
    });
}

function onTimer() {
    redrawAll();
}

function run() {
//    current_spinner = new Spinner(400, 400, -50, -50, Math.PI/4, "#00FF00", 7);
    var spinner1 = new Spinner(400, 400, -50, -50, Math.PI/4, "#00FF00", 7);
    var spinner2 = new Spinner(200, 200, -50, -50, Math.PI/4, "#00FF00", 4);
    current_spinners.push(spinner1);
    current_spinners.push(spinner2);
    canvas.setAttribute('tabindex','0');
    canvas.focus();
    intervalId = setInterval(onTimer, timer_delay);
}

run();
