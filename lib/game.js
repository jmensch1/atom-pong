'use babel';

export default function Pong(rootElement, listenForKeyDown) {

  //////////////////// CONSTANTS ////////////////////

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

  // DOM
  var WIDTH = rootElement.offsetWidth;
  var HEIGHT = rootElement.offsetHeight;
  var CANVAS = document.createElement('canvas');
  var CTX = CANVAS.getContext('2d');
  var USER_POINTS = document.createElement('div');
  var COMP_POINTS = document.createElement('div');

  ///////////////// ANIMATION ///////////////////////

  var requestAnimationFrame =
      window.requestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.msRequestAnimationFrame;

  ////////////// PADDLE FUNCTIONS  //////////////////

  function resetPaddle(paddle, x, y) {
    paddle.x = x;
    paddle.y = y;
    paddle.dx = 0;
    paddle.dy = 0;
    paddle.speed = PADDLE_SPEED;
    paddle.height = PADDLE_HEIGHT;
    paddle.width = PADDLE_WIDTH;
  }

  function drawPaddle(paddle) {
    CTX.fillStyle = PADDLE_COLOR;
    CTX.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  }

  /////////// USER PADDLE FUNCTIONS ///////////

  function updateUserPaddle(user) {
    var next_x = user.x + user.dx * user.speed;
    var next_y = user.y + user.dy * user.speed;

    if (next_y > HEIGHT - user.height) {
      user.dy = 0;
      user.y = HEIGHT - user.height;
    } else if (next_y < 0) {
      user.dy = 0;
      user.y = 0;
    } else {
      user.x = next_x;
      user.y = next_y;
    }
  }

  ////////// COMPUTER PADDLE FUNCTIONS ////////

  function updateCompPaddle(comp, ball) {
    // if the ball is moving towards comp, move comp to the predicted point
    if (ball.dx < 0) {
      if (comp.prediction > comp.y + (comp.height / 2) + 3) {
        comp.dy = 1;
      } else if (comp.prediction < comp.y + (comp.height / 2) - 3) {
        comp.dy = -1;
      } else {
        comp.dy = 0;
      }
    // otherwise, move comp to the center
    } else {
      if (comp.y + (comp.height / 2) < (HEIGHT / 2) - 3)
        comp.dy = 1;
      else if (comp.y + (comp.height / 2) > HEIGHT / 2 + 3)
        comp.dy = -1;
      else
        comp.dy = 0;
    }

    var next_x = comp.x + comp.dx * comp.speed;
    var next_y = comp.y + comp.dy * comp.speed;

    // if movement takes the computer outside the canvas, put it back
    if (next_y > HEIGHT - comp.height) {
      comp.dy = 0;
      comp.y = HEIGHT - comp.height;
    } else if (next_y < 0) {
      comp.dy = 0;
      comp.y = 0;
    } else {
      comp.x = next_x;
      comp.y = next_y;
    }
  }

  function predictComp(comp, ball) {
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

    comp.prediction = mod(ball.y + -1 * (ball.x - comp.x) * ball.dy / ball.dx);
  }

  ////////////////// BALL FUNCTIONS  ///////////////

  function resetBall(ball) {
    ball.x = WIDTH / 2;
    ball.y = HEIGHT / 2;
    ball.dx = 0;
    ball.dy = 0;
    ball.speed = BALL_SPEED;
  }

  function drawBall(ball) {
    CTX.beginPath();
    CTX.arc(ball.x, ball.y, BALL_RADIUS, 0, 2 * Math.PI, false);
    CTX.fillStyle = BALL_COLOR;
    CTX.fill();
    CTX.stroke();
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

  function updateBall(ball, user, comp) {
    var next_x = ball.x + ball.dx * ball.speed;
    var next_y = ball.y + ball.dy * ball.speed;

    // handle top/bottom collisions
    if (next_y > HEIGHT - BALL_RADIUS) {
      ball.dy *= -1;
    } else if (next_y < BALL_RADIUS) {
      ball.dy *= -1;
    }

    // handle user-paddle collisions
    if (intersect(ball.x, ball.y,
                  next_x, next_y,
                  user.x, user.y,
                  user.x, user.y + user.height)) {

      ball.dx *= -1 * BALL_SPEED_INCREASE;

      if (user.height < HEIGHT) {
        user.y -= user.height * (USER_HEIGHT_INCREASE - 1) / 2;
        user.height *= USER_HEIGHT_INCREASE;
        user.speed *= USER_SPEED_INCREASE;
      }

      if (user.dy != 0) {
        if (user.dy < 0 && ball.dy < 0 || user.dy > 0 && ball.dy > 0) {
          ball.dy *= BALL_ANGLE_INCREASE;
        } else {
          ball.dy *= BALL_ANGLE_DECREASE;
        }
      }

      next_x = ball.x + ball.dx * ball.speed;
      next_y = ball.y + ball.dy * ball.speed;

      predictComp(comp, ball);
    }

    // handle comp-paddle collisions
    if (intersect(ball.x, ball.y,
                  next_x, next_y,
                  comp.x + PADDLE_WIDTH, comp.y,
                  comp.x + comp.width, comp.y + comp.height)) {
      ball.dx *= -1;
      next_x = ball.x + ball.dx * ball.speed;
    }

    ball.x = next_x;
    ball.y = next_y;
  }

  ////////////// GENERAL FUNCTIONS ///////////////////

  function initDOM() {
    CANVAS.width = WIDTH;
    CANVAS.height = HEIGHT;
    rootElement.appendChild(CANVAS);

    USER_POINTS.classList.add('points');
    USER_POINTS.classList.add('user');
    rootElement.appendChild(USER_POINTS);

    COMP_POINTS.classList.add('points');
    COMP_POINTS.classList.add('comp');
    rootElement.appendChild(COMP_POINTS);
  }

  function resetCanvas() {
    CTX.clearRect(0, 0 , WIDTH, HEIGHT);

    // draw midline
    CTX.beginPath();
    CTX.moveTo(WIDTH / 2, 0);
    CTX.lineTo(WIDTH / 2, HEIGHT);
    CTX.strokeStyle = "#2AAAE2";
    CTX.stroke();
  }

  function resetPoints(points) {
    points.user = 0;
    points.comp = 0;
  }

  function drawPoints(points) {
    USER_POINTS.textContent = points.user;
    COMP_POINTS.textContent = points.comp;
  }

  function resetElements(user, comp, ball) {
    resetPaddle(user, WIDTH - 10 - PADDLE_WIDTH, (HEIGHT / 2) - (PADDLE_HEIGHT / 2));
    resetPaddle(comp, 10, (HEIGHT / 2) - (PADDLE_HEIGHT / 2));
    resetBall(ball);
  }

  function throwBall(ball) {
    ball.dx = Math.floor(Math.random() * 2) == 1 ? 1 : -1;
    ball.dy = Math.floor(Math.random() * 2) == 1 ? 1 : -1;
    if (ball.dx == -1)
      predictComp(comp, ball);
  }

  function prepForPoint(user, comp, ball, status, points) {
    status.inPoint = false;
    resetElements(user, comp, ball);
    resetCanvas();
    drawPoints(points);
    drawPaddle(user);
    drawPaddle(comp);
    throwBall(ball);
  }

  function startPoint(user, comp, ball, status, points) {
    function loop() {
      resetCanvas();

      updateUserPaddle(user);
      drawPaddle(user);

      updateCompPaddle(comp, ball);
      drawPaddle(comp);

      updateBall(ball, user, comp);
      drawBall(ball);

      // detect points
      if (ball.x > WIDTH + BALL_RADIUS * 2) {
        points.comp++;
        prepForPoint(user, comp, ball, status, points);
      } else if (ball.x < -2 * BALL_RADIUS) {
        points.user++;
        prepForPoint(user, comp, ball, status, points);
      } else {
        requestAnimationFrame(loop);
      }
    }
    requestAnimationFrame(loop);
  }

  function detectKeys(user) {
    var map = [];

    listenForKeyDown(e => {
      map[e.keyCode] = (e.type == 'keydown');

      if (map[38]) {
        user.dy = -1;
      } else if (map[40]) {
        user.dy = 1;
      } else {
        user.dy = 0;
      }
    });
  }

  ////////////////// MAIN ////////////////////

  var user = {};
  var comp = {};
  var ball = {};
  var status = {};
  var points = {};

  initDOM();
  detectKeys(user);
  resetPoints(points);
  prepForPoint(user, comp, ball, status, points);

  CANVAS.onclick = () => {
    if (!status.inPoint) {
      status.inPoint = true;
      startPoint(user, comp, ball, status, points);
    }
  };

}
