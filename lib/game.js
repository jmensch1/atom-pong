'use babel';

function Pong(rootElement, listenForKeyDown) {

  //////////////////// CONSTANTS ////////////////////

  // canvas
  var WIDTH = 800;
  var HEIGHT = 460;

  // ball
  var BALL_RADIUS = 7.5;
  var BALL_SPEED = 5;
  var BALL_COLOR = "#ffffff";

  // paddle
  var PADDLE_WIDTH = 11;
  var PADDLE_HEIGHT = 62;
  var PADDLE_SPEED = 4;
  var PADDLE_COLOR = "#f6eb16";

  // changes during game
  var BALL_SPEED_INCREASE = 1.2;
  var USER_HEIGHT_INCREASE = 1.1;
  var USER_SPEED_INCREASE = 1.2;
  var BALL_ANGLE_INCREASE = 1.4;
  var BALL_ANGLE_DECREASE = 0.6;

  /////////////// GLOBAL VARIABLES ///////////////////

  var user;       // the user's paddle
  var comp;       // the computer's paddle
  var ball;       // the ball object

  var canvas;     // canvas element
  var ctx;        // canvas context
  var RAF;        // a handle for the current requestAnimationFrame

  ////////// PADDLE CONSTRUCTOR / FUNCTIONS //////////

  function Paddle() {}

  Paddle.prototype.reset = function(x, y) {
    this.x = x;
    this.y = y;
    this.dx = 0;
    this.dy = 0;
    this.speed = PADDLE_SPEED;
    this.height = PADDLE_HEIGHT;
    this.width = PADDLE_WIDTH;
  }

  Paddle.prototype.draw = function() {
    ctx.fillStyle = PADDLE_COLOR;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  Paddle.prototype.within = function(x, y) {
    return y > this.y &&
           y < this.y + this.height &&
           x > this.x &&
           x < this.x + this.width;
  }

  /////////// USER PADDLE FUNCTIONS ///////////

  user = new Paddle();

  user.update = function() {
    var next_x = this.x + this.dx * this.speed;
    var next_y = this.y + this.dy * this.speed;

    if (next_y > HEIGHT - this.height) {
      this.dy = 0;
      this.y = HEIGHT - this.height;
    } else if (next_y < 0) {
      this.dy = 0;
      this.y = 0;
    } else {
      this.x = next_x;
      this.y = next_y;
    }
  }

  ////////// COMPUTER PADDLE FUNCTIONS ////////

  comp = new Paddle();

  comp.update = function() {

    // if the ball is moving towards comp, move comp to the predicted point
    if (ball.dx < 0) {
      if (this.prediction > this.y + (this.height / 2) + 3) {
        this.dy = 1;
      } else if (this.prediction < this.y + (this.height / 2) - 3) {
        this.dy = -1;
      } else {
        this.dy = 0;
      }
    // otherwise, move comp to the center
    } else {
      if (this.y + (this.height / 2) < (HEIGHT / 2) - 3)
        this.dy = 1;
      else if (this.y + (this.height / 2) > HEIGHT / 2 + 3)
        this.dy = -1;
      else
        this.dy = 0;
    }

    var next_x = this.x + this.dx * this.speed;
    var next_y = this.y + this.dy * this.speed;

    // if movement takes the computer outside the canvas, put it back
    if (next_y > HEIGHT - this.height) {
      this.dy = 0;
      this.y = HEIGHT - this.height;
    } else if (next_y < 0) {
      this.dy = 0;
      this.y = 0;
    } else {
      this.x = next_x;
      this.y = next_y;
    }
  }

  comp.predict = function() {

    function mod(y) {
      var frames = 0;
      if (y < 0) {
        while (y < 0) {
          y += HEIGHT;
          frames += 1;
        }
        if (frames % 2 == 1)
          y = HEIGHT - y;
      } else if (y > HEIGHT) {
        while (y > HEIGHT) {
          y -= HEIGHT;
          frames += 1;
        }
        if (frames % 2 == 1)
          y = HEIGHT - y;
      }

      return y;
    }

    this.prediction = mod(ball.y + -1 * (ball.x - this.x) * ball.dy / ball.dx);
  }

  //////////// BALL CONTRUCTOR / FUNCTIONS ///////////

  function Ball() {
    this.x;
    this.y;
    this.dx;
    this.dy;
    this.speed;
  }

  Ball.prototype.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, BALL_RADIUS, 0, 2 * Math.PI, false);
    ctx.fillStyle = BALL_COLOR;
    ctx.fill();
    ctx.stroke();
  }

  function intersect(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) {
    var s1_x, s1_y, s2_x, s2_y;
    s1_x = p1_x - p0_x;
    s1_y = p1_y - p0_y;
    s2_x = p3_x - p2_x;
    s2_y = p3_y - p2_y;

    var s, t;
    s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
    t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

    return (s >= 0 && s <= 1 && t >= 0 && t <= 1);
  }

  Ball.prototype.update = function() {
    var next_x = this.x + this.dx * this.speed;
    var next_y = this.y + this.dy * this.speed;

    // handle top/bottom collisions
    if (next_y > HEIGHT - BALL_RADIUS) {
      ball.dy *= -1;
    } else if (next_y < BALL_RADIUS) {
      ball.dy *= -1;
    }

    // handle user-paddle collisions
    if (intersect(this.x, this.y,
                  next_x, next_y,
                  user.x, user.y,
                  user.x, user.y + user.height)) {

      this.dx *= -1 * BALL_SPEED_INCREASE;

      if (user.height < HEIGHT) {
        user.y -= user.height * (USER_HEIGHT_INCREASE - 1) / 2;
        user.height *= USER_HEIGHT_INCREASE;
        user.speed *= USER_SPEED_INCREASE;
      }

      if (user.dy != 0) {
        if (user.dy < 0 && this.dy < 0 || user.dy > 0 && this.dy > 0) {
          this.dy *= BALL_ANGLE_INCREASE;
        } else {
          this.dy *= BALL_ANGLE_DECREASE;
        }
      }

      next_x = this.x + this.dx * this.speed;
      next_y = this.y + this.dy * this.speed;

      comp.predict();
    }

    // handle comp-paddle collisions
    if (intersect(this.x, this.y,
                  next_x, next_y,
                  comp.x + PADDLE_WIDTH, comp.y,
                  comp.x + comp.width, comp.y + comp.height)) {
      this.dx *= -1;
      next_x = this.x + this.dx * this.speed;
    }

    this.x = next_x;
    this.y = next_y;
  }

  ball = new Ball();

  //////////////// FUNCTIONS //////////////////

  function createCanvas() {
    console.log('creating canvas');
    canvas = document.createElement("canvas");
    ctx = canvas.getContext('2d');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    rootElement.appendChild(canvas);
  }

  var requestAnimationFrame =
    window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame;

  function startGame() {
    RAF = requestAnimationFrame(loop);
  }

  function stopGame() {}

  function clearCanvas() {
    ctx.clearRect(0, 0 , WIDTH, HEIGHT);

    // draw midline
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, 0);
    ctx.lineTo(WIDTH / 2, HEIGHT);
    ctx.strokeStyle = "#2AAAE2";
    ctx.stroke();
  }

  function resetElements() {

    user.reset(WIDTH - 10 - PADDLE_WIDTH, (HEIGHT / 2) - (PADDLE_HEIGHT / 2));
    comp.reset(10, (HEIGHT / 2) - (PADDLE_HEIGHT / 2));

    ball.x = WIDTH / 2;
    ball.y = HEIGHT / 2;
    ball.speed = BALL_SPEED;

    ball.dx = Math.floor(Math.random() * 2) == 1 ? 1 : -1;
    ball.dy = Math.floor(Math.random() * 2) == 1 ? 1 : -1;
    if (ball.dx == -1)
      comp.predict();
  }

  function loop() {

    clearCanvas();

    user.update();
    user.draw();

    comp.update();
    comp.draw();

    ball.update();
    ball.draw();

   // ctx.fillStyle = "red";
   // ctx.fillRect(10, (comp.prediction || 0) - 5, 12, 12);

    // detect points
    if (ball.x > WIDTH + BALL_RADIUS * 2) {
      stopGame(); // computer point
    } else if (ball.x < -2 * BALL_RADIUS) {
      stopGame(); // user point
    } else {
      RAF = requestAnimationFrame(loop);
    }

  };

  //////////////// EVENT HANDLERS ////////////////

  var key_detector = (function() {
    var map = [];

    listenForKeyDown(e => {
      map[e.keyCode] = (e.type == 'keydown');
      updateDirection();
    });

    function updateDirection() {
      if (map[32]) {
        startGame()
      } else  if (map[38]) {
        user.dy = -1;
      } else if (map[40]) {
        user.dy = 1;
      } else {
        user.dy = 0;
      }

      // if (map[37]) {
      //   user.dx = -1;
      // } else if (map[39]) {
      //   user.dx = 1;
      // } else {
      //   user.dx = 0;
      // }
    }

  })();

  //////////////// MAIN ///////////////////

  createCanvas();
  resetElements();
  clearCanvas();
  user.draw();
  comp.draw();

  canvas.onclick = startGame;
}

export default Pong
