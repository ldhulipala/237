var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var intervalId;
var intervalId;
var timer_delay = 10;
var current_spinner;

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
function Spinner(px, py, vx, vy, rps, color) {
    this.px = px;
    this.py = py;
    this.vx = vx; // Pixels per second
    this.vy = vy; // Pixels per second
    this.rps = rps; //Radians per second
    this.color = color;
    this.angle = 0;
}

Spinner.prototype.inner_radius = 10; // Radius of inner circle
Spinner.prototype.outer_radius = 5;  // Radius of orbitting circles
Spinner.prototype.orbit_radius = 80; // Orbit radius
Spinner.prototype.num_circles = 7;

// Draws a Spinner at the current origin (assumed to be translated)
Spinner.prototype.draw = function(ctx) {
    var start_radian = 0; // Angle of first outer circle
    // Distance between each outer circle
    var radians_per_circle = TOTAL_CIRCLE_RADIANS/this.num_circles;
    var i;

    ctx.save();
    ctx.translate(this.px, this.py);
    ctx.rotate(this.angle);

    // Draw the inner circle
    drawCircle(ctx, 0, 0, this.inner_radius, this.color);

    for (i = 0; i < this.num_circles; i++) {
        var x_coordinate = this.orbit_radius*Math.cos(start_radian);
        var y_coordinate = this.orbit_radius*Math.sin(start_radian);
        drawCircle(ctx, x_coordinate, y_coordinate, this.outer_radius, this.color);

        start_radian += radians_per_circle;

    }
    // Draw the orbitting circles
    // drawCircle(ctx, this.orbit_radius, 0, this.outer_radius, this.color);
    // drawCircle(ctx, 0, this.orbit_radius, this.outer_radius, this.color);
    // drawCircle(ctx, -this.orbit_radius, 0, this.outer_radius, this.color);
    // drawCircle(ctx, 0, -this.orbit_radius, this.outer_radius, this.color);

    ctx.restore();
}


Spinner.prototype.update = function(elapsed_ms) {
    var elapsed_secs = elapsed_ms / 1000; // Ellapsed time in seconds
    this.px += this.vx * elapsed_secs;
    this.py += this.vy * elapsed_secs;
    this.angle += (this.rps * elapsed_secs);
    this.angle = this.angle % (2 * Math.PI);   
}

function redrawAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 400, 400);

    current_spinner.draw(ctx);

    current_spinner.update(timer_delay);
}

function onTimer() {
    redrawAll();
}

function run() {
    current_spinner = new Spinner(400, 400, -150, -150, Math.PI, "#00FF00");
    canvas.setAttribute('tabindex','0');
    canvas.focus();
    intervalId = setInterval(onTimer, timer_delay);
}

run();
