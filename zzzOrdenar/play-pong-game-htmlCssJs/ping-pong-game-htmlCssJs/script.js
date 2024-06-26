var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 768;
canvas.height = 432;
document.body.appendChild(canvas);


Vector2 = function ( x, y ) {

    this.x = x || 0;
    this.y = y || 0;

};

Vector2.prototype = {

    constructor: Vector2,

    set: function ( x, y ) {

        this.x = x;
        this.y = y;

        return this;

    },

    copy: function ( v ) {

        this.x = v.x;
        this.y = v.y;

        return this;

    },

    clone: function () {

        return new Vector2( this.x, this.y );

    },


    add: function ( v1, v2 ) {

        this.x = v1.x + v2.x;
        this.y = v1.y + v2.y;

        return this;

    },

    addSelf: function ( v ) {

        this.x += v.x;
        this.y += v.y;

        return this;

    },

    sub: function ( v1, v2 ) {

        this.x = v1.x - v2.x;
        this.y = v1.y - v2.y;

        return this;

    },

    subSelf: function ( v ) {

        this.x -= v.x;
        this.y -= v.y;

        return this;

    },

    multiplyScalar: function ( s ) {

        this.x *= s;
        this.y *= s;

        return this;

    },

    divideScalar: function ( s ) {

        if ( s ) {

            this.x /= s;
            this.y /= s;

        } else {

            this.set( 0, 0 );

        }

        return this;

    },


    negate: function() {

        return this.multiplyScalar( -1 );

    },

    dot: function ( v ) {

        return this.x * v.x + this.y * v.y;

    },

    lengthSq: function () {

        return this.x * this.x + this.y * this.y;

    },

    length: function () {

        return Math.sqrt( this.lengthSq() );

    },

    normalize: function () {

        return this.divideScalar( this.length() );

    },

    distanceTo: function ( v ) {

        return Math.sqrt( this.distanceToSquared( v ) );

    },

    distanceToSquared: function ( v ) {

        var dx = this.x - v.x, dy = this.y - v.y;
        return dx * dx + dy * dy;

    },


    setLength: function ( l ) {

        return this.normalize().multiplyScalar( l );

    },

    equals: function( v ) {

        return ( ( v.x === this.x ) && ( v.y === this.y ) );

    },


    // Rotates the vector around the origin by the specified angle (in degrees).
    // Equivalent to multiplying by the 2×2 rotation matrix.
    rotate: function( angle ) {
        var x = this.x,
            y = this.y,
            to_radians = Math.PI / 180,
            rad = angle * to_radians,
            sin = Math.sin(rad),
            cos = Math.cos(rad),
            px = x * cos - y * sin;
            py = x * sin + y * cos;

        this.set( px, py );

        return this;

    },

    rotateAroundPivot: function( pivot, angle ) {

        return this.subSelf(pivot).rotate(angle).addSelf(pivot);

    },

    // Returns the angle that the vector points to.
    angle: function () {

        return Math.atan2( this.x, this.y );

    },

    flipLeft: function () {

        return this.set(this.x * -1, this.y);

    },

    flipRight: function () {

        return this.set(this.x, this.y * -1);

    },

};


//----------------------------------------

var canvasBgImage = new Image(),
    bgPattern;
canvasBgImage.onload = function () {
  this.loaded = true;
  bgPattern = ctx.createPattern(canvasBgImage, 'repeat');
};
canvasBgImage.src = "//simonewebdesign.it/games/pong/assets/sand.png";

var ballBgImage = new Image();
ballBgImage.loaded = false; // custom flag
ballBgImage.onload = function () {
  this.loaded = true;
};
ballBgImage.src = "//simonewebdesign.it/games/pong/assets/ball.png";


var Ball = function () {
  this.size = 48,
  this.speed = 600,

  this.deflect = function (N) {
    var dot = this.velocity.dot(N);
    var v1 = N.multiplyScalar(2 * dot);
    this.velocity = v1.subSelf(this.velocity);
  }

  // Define property x
  Object.defineProperty(this, 'x', {
    get: function () {
      return this.pos.x;
    },
    set: function (value) {
      this.pos.x = value;
    }
  });

  // Define property y
  Object.defineProperty(this, 'y', {
    get: function () {
      return this.pos.y;
    },
    set: function (value) {
      this.pos.y = value;
    }
  });

  return this;
}

var Paddle = function () {
  this.score = 0,
  this.speed = 600,
  this.width = 24,
  this.height = 96,

  this.points = [],

  this.pos = new Vector2,
  this.pivot = new Vector2,
  this.direction = new Vector2,
  this.bgImage = new Image,

  this.angle = -1,

  // Define property x
  Object.defineProperty(this, 'x', {
    get: function () {
      return this.pos.x;
    },
    set: function (value) {
      this.pos.x = value;
    }
  });

  // Define property y
  Object.defineProperty(this, 'y', {
    get: function () {
      return this.pos.y;
    },
    set: function (value) {
      this.pos.y = value;
    }
  });

  this.updatePivot = function () {
    this.pivot.set(this.width / 2, this.height / 2).addSelf(this.pos);
  },

  this.updatePoints = function (movementYaxis) {
    for (var i = 0; i < this.points.length; i++) {
      this.points[i].y += movementYaxis;
    }
  },

  this.rotatePoints = function (angle) {
    for (var i = 0; i < this.points.length; i++) {
      this.points[i].rotateAroundPivot(this.pivot, angle);
    }
  },

  this.realignPoints = function () {
    var topRight = new Vector2(this.width, 0),
        bottomRight = new Vector2(this.width, this.height),
        bottomLeft = new Vector2(0, this.height);

    this.points = [
      this.pos.clone(),
      this.pos.clone().addSelf(topRight),
      this.pos.clone().addSelf(bottomRight),
      this.pos.clone().addSelf(bottomLeft)
    ];
  },

  this.render = function () {
    if (this.angle == 0) { // paddle doesn't need to be rotated

      if (this.bgImage.loaded) {
        ctx.drawImage(this.bgImage, this.x, this.y);
      }

    } else { // rotation

      // saving current context
      ctx.save();

      // translating to the pivot point
      ctx.translate( this.pivot.x, this.pivot.y );

      // rotating
      ctx.rotate( (Math.PI / 180) * this.angle );

      // translating back to the origin
      ctx.translate( -1 * this.pivot.x, -1 * this.pivot.y );

      // rendering
      ctx.drawImage(this.bgImage, this.x, this.y);

      // restoring the original context
      ctx.restore();
    }
  }

  return this;
}

// Game objects
var p1 = new Paddle(),
    p2 = new Paddle(),
    ball = new Ball();

// Positions of paddles
var xPositionP1 = 20,
    yPositionP1 = canvas.height / 2 - p1.height / 2,
    xPositionP2 = canvas.width - p2.width - 20,
    yPositionP2 = canvas.height / 2 - p2.height / 2;

// Reset points to their initial position.
// Points are set in this order: topLeft, topRight, bottomRight, bottomLeft
p1.resetPoints = function () {
  this.points = [
    new Vector2(xPositionP1, yPositionP1),
    new Vector2(xPositionP1 + p1.width, yPositionP1),
    new Vector2(xPositionP1 + p1.width, yPositionP1 + p1.height),
    new Vector2(xPositionP1, yPositionP1 + p1.height)
  ];
};

p2.resetPoints = function () {
  this.points = [
    new Vector2(xPositionP2, yPositionP2),
    new Vector2(xPositionP2 + p2.width, yPositionP2),
    new Vector2(xPositionP2 + p2.width, yPositionP2 + p2.height),
    new Vector2(xPositionP2, yPositionP2 + p2.height)
  ];
};

p1.bgImage.loaded = false; // custom flag
p1.bgImage.onload = function () {
  this.loaded = true;
}
p1.bgImage.src = "//simonewebdesign.it/games/pong/assets/paddleBlue.png";

p2.bgImage.loaded = false; // custom flag
p2.bgImage.onload = function () {
  this.loaded = true;
}
p2.bgImage.src = "//simonewebdesign.it/games/pong/assets/paddleRed.png";


// Handle keyboard controls
var keysDown = {};
var ROTATION_ANGLE = 5;

addEventListener("keydown", function (e) {

  if (e.keyCode == 87) { // P1 pressed up (key: w)
    if (!keysDown[87]) { // execute only the first time
      p1.angle = ROTATION_ANGLE;
      p1.rotatePoints(p1.angle);
    }
  }

  if (e.keyCode == 83) { // P1 pressed down (key: s)
    if (!keysDown[83]) { // execute only the first time
      p1.angle = -ROTATION_ANGLE;
      p1.rotatePoints(p1.angle);
    }
  }

  if (e.keyCode == 38) { // P2 pressed up (key: arrow up)
    if (!keysDown[38]) { // execute only the first time
      p2.angle = ROTATION_ANGLE;
      p2.rotatePoints(p2.angle);
    }
  }

  if (e.keyCode == 40) { // P2 pressed down (key: arrow down)
    if (!keysDown[40]) { // execute only the first time
      p2.angle = -ROTATION_ANGLE;
      p2.rotatePoints(p2.angle);
    }
  }

  keysDown[e.keyCode] = true;

}, false);

addEventListener("keyup", function (e) {

  if (e.keyCode == 87) { // P1 released up (key: w)
    p1.angle = 0;
    p1.realignPoints();
  }

  if (e.keyCode == 83) { // P1 released down (key: s)
    p1.angle = 0;
    p1.realignPoints();
  }

  if (e.keyCode == 38) { // P2 released up (key: arrow up)
    p2.angle = 0;
    p2.realignPoints();
  }

  if (e.keyCode == 40) { // P2 released down (key: arrow down)
    p2.angle = 0;
    p2.realignPoints();
  }

  delete keysDown[e.keyCode];

}, false);


// Reset the game
var reset = function () {

  isGameStarted = false;

  var xPosition = (canvas.width - ball.size) / 2,
      yPosition = (canvas.height - ball.size) / 2,
      xVelocity = Math.random() > 0.5 ? ball.speed : -ball.speed, // randomly start from left or right
      yVelocity = Math.random() > 0.5 ? ball.speed : -ball.speed; // randomly start from top or bottom

  ball.pos = new Vector2(xPosition, yPosition);
  ball.velocity = new Vector2(xVelocity, yVelocity);

  p1.pos.set(xPositionP1, yPositionP1);
  p2.pos.set(xPositionP2, yPositionP2);

  p1.resetPoints();
  p2.resetPoints();
  p1.updatePivot();
  p2.updatePivot();

  p1.direction.set(0, 1);
  p2.direction.set(-0, 1);
}


// Update game objects
var update = function (modifier) {

  if (32 in keysDown) { // Start the game with the spacebar
    isGameStarted = true;
  }

  if (!isGameStarted) {
    return false;
  }

  if (87 in keysDown) { // P1 holding up (key: w)
    if (p1.y > 0) {
      // Update position
      var movementYaxis = p1.speed * modifier;
      p1.y -= movementYaxis;

      p1.updatePivot();
      p1.updatePoints(movementYaxis * -1);

      // go back on track, just in case it went too out of boundaries
      if (p1.y <= 0) {
        p1.y = 0;
      }
    }
  }

  if (83 in keysDown) { // P1 holding down (key: s)
    if (p1.y + p1.height < canvas.height) {
      // Update position
      var movementYaxis = p1.speed * modifier;
      p1.y += movementYaxis;

      p1.updatePivot();
      p1.updatePoints(movementYaxis);

      // go back on track, just in case it went too out of boundaries
      if (p1.y + p1.height > canvas.height) {
        p1.y = canvas.height - p1.height;
      }
    }
  }

  if (38 in keysDown) { // P2 holding up
    if (p2.y > 0) {
      // Update position
      var movementYaxis = p2.speed * modifier;
      p2.y -= movementYaxis;

      p2.updatePivot();
      p2.updatePoints(movementYaxis * -1);

      // go back on track, just in case it went too out of boundaries
      if (p2.y <= 0) {
        p2.y = 0;
      }
    }
  }

  if (40 in keysDown) { // P2 holding down
    if (p2.y + p2.height < canvas.height) {
      // Update position
      var movementYaxis = p2.speed * modifier;
      p2.y += movementYaxis;

      p2.updatePivot();
      p2.updatePoints(movementYaxis);

      // go back on track, just in case it went too out of boundaries
      if (p2.y + p2.height > canvas.height) {
        p2.y = canvas.height - p2.height;
      }
    }
  }

  // Ball is out of the left boundary - player 2 wins!
  if (ball.x <= 0) {
    p2.score++;
    reset();
  }

  // Ball is out of the right boundary - player 1 wins!
  if (ball.x >= canvas.width - ball.size) {
    p1.score++;
    reset();
  }

  // Ball is colliding with P1
  if (
    ball.x <= (p1.x + p1.width)
    && p1.x <= (ball.x + ball.size)
    && ball.y <= (p1.y + p1.height)
    && p1.y <= (ball.y + ball.size)
  ) {
    // First of all, I need to calculate the wall normal properly.
    // I start by getting the A and B points:
    var a = p1.points[1].clone(),
        b = p1.points[2].clone();

    // Then I get the directing vector:
    p1.direction = b.subSelf(a).normalize();

    // Finally I reflect the ball
    ball.deflect(p1.direction);

    // go back on track, just in case it went too out of boundaries
    ball.x = p1.x + p1.width +1;
  }

  // Ball is colliding with P2
  if (
    ball.x <= (p2.x + p2.width)
    && p2.x <= (ball.x + ball.size)
    && ball.y <= (p2.y + p2.height)
    && p2.y <= (ball.y + ball.size)
  ) {
    // First of all, I need to calculate the wall normal properly.
    // I start by getting the A and B points:
    var a = p2.points[0].clone(),
        b = p2.points[3].clone();

    // Then I get the directing vector
    p2.direction = b.subSelf(a).normalize();

    // Finally I reflect the ball
    ball.deflect(p2.direction);

    // go back on track, just in case it went too out of boundaries
    ball.x = p2.x - ball.size -1;
  }

  // Ball is colliding with the top
  if (ball.y <= 0) {
    ball.deflect( new Vector2(1, 0) );

    // go back on track, just in case it went too out of boundaries
    ball.y = 0.1;
  }

  // Ball is colliding with the bottom
  if (ball.y + ball.size >= canvas.height) {
    ball.deflect( new Vector2(1, 0) );

    // go back on track, just in case it went too out of boundaries
    ball.y = canvas.height - ball.size -1;
  }

  // Ball movement
  ball.x += ball.velocity.x * modifier;
  ball.y += ball.velocity.y * modifier;
};


// Draw everything
var render = function () {

  // Draw the background image
  ctx.fillStyle = bgPattern;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // ball
  if (ballBgImage.loaded) {
    ctx.drawImage(ballBgImage, ball.x, ball.y);
  }

  p1.render();
  p2.render();

  // Text options
  ctx.fillStyle = "rgb(250, 250, 250)";
  ctx.font = "18px Helvetica";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  // P1 Score
  ctx.fillText(p1.score, 32, 32);

  // P2 Score
  ctx.fillText(p2.score, canvas.width - 32 - 10, 32);

  // Text options
  ctx.font = "36px Helvetica";

  // Initial text
  if (!isGameStarted) {
    ctx.fillText("Clique na tecla spacebar para começar", 60, canvas.height / 2);
  }
};


// The main game loop
var main = function () {
  var now = Date.now();
  var delta = now - then;

  update(delta / 1000);
  render();

  then = now; 

  // Request to do this again ASAP
  requestAnimationFrame(main);
};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
reset();
main();