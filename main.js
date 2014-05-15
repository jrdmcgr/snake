//
// Map
//

var Map = function (height, width) {
	this.height = height;
	this.width = width;
	var i, j, map = [];
	for (i = 0; i < height; i++) {
		map[i] = [];
		for (j = 0; j < width; j++) {
			map[i][j] = 0;
		}
	}
	this._map = map;
};

Map.prototype.plot = function (coords) {
	var i, x, y;
	for (i = 0; i < coords.length; i++) {
		x = coords[i][0];
		y = coords[i][1];
		if (this._map[x]) {
			this._map[x][y] = 1;
		}
	}
	return map;
};

Map.prototype.each = function (fn) {
	var i, j;
	for (i = 0; i < this._map.length; i++) {
		for (j = 0; j < this._map[i].length; j++) {
			fn(this._map, i, j);
		}
	}
};

Map.prototype.clear = function () {
	this.each(function (map, x, y) {
		map[x][y] = 0;
	});
};

Map.prototype.getMap = function () {
	return this._map;
};

//
// Snake
//

var Snake = function () {
	this.speed = 1;
	this.direction = 'S';
	this.length = 3;
	this.coords = [[0, 0]];
	var i, x, y;
	for (i = 0; i < this.length; i++) {
		x = this.coords[0][0];
		y = this.coords[0][1];
		this.coords.push([x + i + 1, y]);
	}
};

Snake.prototype.nextCoords = function () {
	var x = this.coords[0][0],
		y = this.coords[0][1],
		move = {
			N: function () { y--; },
			S: function () { y++; },
			E: function () { x++; },
			W: function () { x--; },
		};
	move[this.direction]();
	return [x, y];
};

Snake.prototype.advance = function () {
	// Remove the tail.
	this.coords.pop();
	// Add a new head.
	this.coords.unshift(this.nextCoords());
};

//
// Food
//

var Food = function (xmax, ymax) {
	this.xmax = xmax || 50;
	this.ymax = ymax || 50;
	this.coords = null;
	this.generate();
};

Food.prototype.generate = function () {
	var x, y;
	x = Math.floor(Math.random() * this.xmax);
	y = Math.floor(Math.random() * this.ymax);
	this.coords = [x, y];
	return this;
};

//
// Keys
//

var changeDirections = function (event) {
	// LEFT = 37
	// UP = 38
	// RIGHT = 39
	// DOWN = 40
	// P = 80

	var keys = {
		37: function () {
			if (snake.direction !== 'E') {
				snake.direction = 'W';
			}
		},
		38: function () {
			if (snake.direction !== 'S') {
				snake.direction = 'N';
			}
		},
		39: function () {
			if (snake.direction !== 'W') {
				snake.direction = 'E';
			}
		},
		40: function () {
			if (snake.direction !== 'N') {
				snake.direction = 'S';
			}
		},
		80: function () { // P
			paused = !paused;
		},
	};
	var key = event.keyCode;
	if (key in keys) {
		keys[key]();
	}
};

document.onkeydown = changeDirections;

//
// Init Game
//
var canvas = document.createElement('canvas'),
	ctx = canvas.getContext('2d'),
	paused = false,
	gridSize = 10,
	ticks = 0;

clear = function () {
	this.ctx.clearRect(0, 0, canvas.width, canvas.height);
};

var draw = function (map) {
	var i, j;
	for (i = 0; i < map.length; i++) {
		for (j = 0; j < map[i].length; j++) {
			if (! map[i][j]) {
				continue;
			}
			gs = gridSize;
			x = gs * i;
			y = gs * j;
			ctx.fillRect(x, y, gs, gs);
		}
	}
};

var handleCollisions = function () {
	var snakeCoords = snake.coords[0],
		snakeBody = snake.coords.slice(1),
		x = snakeCoords[0],
		y = snakeCoords[1];

	// Detect collision with snake.
	for (i = 0; i < snakeBody.length; i++) {
		bx = snakeBody[i][0];
		by = snakeBody[i][1];
		if (x === bx && y === by) {
			die();
		}
	}

	// Detect food collision.
	if (food.coords[0] === snakeCoords[0] &&
			food.coords[1] === snakeCoords[1]) {
		snake.coords.unshift(snake.nextCoords());
		food.generate();
	}

	// Detect map edge collision and teleport.
	if (x >= map.width) {
		snake.coords[0][0] = 0;
	}

	if (y >= map.height) {
		snake.coords[0][1] = 0;
	}

	if (x < 0) {
		snake.coords[0][0] = map.width;
	}

	if (y < 0) {
		snake.coords[0][1] = map.height;
	}
};


var die = function () {
	paused = true;
	clear();
	ctx.font = '20px "Press Start 2P"';
	ctx.textAlign = 'center';
	ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
};

var map = new Map(25, 25);
var snake = new Snake();
var food = new Food(25, 25);


var loop = function () {
	ticks ++;
	if (ticks % 10 === 0 && !paused) {
		var m = map.getMap();
		clear()
		map.clear();
		map.plot(snake.coords);
		map.plot([food.coords]);
		snake.advance();
		handleCollisions();
		draw(m);
	}
	requestAnimationFrame(loop);
};
loop();

canvas.height = map.height * gridSize;
canvas.width = map.width * gridSize;
document.body.appendChild(canvas);