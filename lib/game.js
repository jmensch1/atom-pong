'use babel';

import PongDOM from './dom'

export default function PongGame(rootElement, listenForKeys) {

  ///////////// CONSTANTS ///////////////

  // ball
  var BALL_RADIUS = 7.5;
  var BALL_SPEED = 8;

  // paddle
  var PADDLE_WIDTH = 11;
  var PADDLE_HEIGHT = 90;
  var PADDLE_SPEED = 8;

  // changes during game
  var BALL_SPEED_INCREASE = 1.15;
  var USER_HEIGHT_INCREASE = 1.0;
  var USER_SPEED_INCREASE = 1.1;
  var BALL_ANGLE_INCREASE = 1.4;
  var BALL_ANGLE_DECREASE = 0.6;

  // table
  var WIDTH = rootElement.offsetWidth;
  var HEIGHT = rootElement.offsetHeight;

  /////////// RESET FUNCTIONS //////////////

  function resetPaddle(paddle) {
    paddle.dx = 0;
    paddle.dy = 0;
    paddle.speed = PADDLE_SPEED;
    paddle.height = PADDLE_HEIGHT;
    paddle.width = PADDLE_WIDTH;
  }

  function resetUser(user) {
    resetPaddle(user);
    user.x = WIDTH - 10 - PADDLE_WIDTH;
    user.y = (HEIGHT / 2) - (PADDLE_HEIGHT / 2);
  }

  function resetComp(comp) {
    resetPaddle(comp);
    comp.x = 10;
    comp.y = (HEIGHT / 2) - (PADDLE_HEIGHT / 2);
  }

  function resetBall(ball) {
    let pos = (Math.floor(2 * Math.random()) === 0)
    let dy = (pos ? 1 : -1) * (Math.random() / 2 + 0.3);

    let player = Math.floor(2 * Math.random())
    switch(player) {
      case 0:
        ball.x = WIDTH / 4;
        ball.y = HEIGHT / 2;
        ball.dx = 1;
        ball.dy = dy;
        break;
      case 1:
        ball.x = 3 * WIDTH / 4;
        ball.y = HEIGHT / 2;
        ball.dx = -1;
        ball.dy = dy;
        break;
    }

    ball.speed = BALL_SPEED;
    ball.radius = BALL_RADIUS;
  }

  ///////////// USER UPDATE /////////////

  function updateUser(user, timeDelta) {
    var next_x = user.x + user.dx * user.speed * timeDelta;
    var next_y = user.y + user.dy * user.speed * timeDelta;

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

  ///////////// COMP UPDATE /////////////

  function updateComp(comp, ball, timeDelta) {
    let buffer = comp.speed / 2

    // if the ball is moving towards comp, move comp to the predicted point
    if (ball.dx < 0) {
      if (comp.prediction > comp.y + (comp.height / 2) + buffer) {
        comp.dy = 1;
      } else if (comp.prediction < comp.y + (comp.height / 2) - buffer) {
        comp.dy = -1;
      } else {
        comp.dy = 0;
      }
    // otherwise, move comp to the center
    } else {
      if (comp.y + (comp.height / 2) < (HEIGHT / 2) - buffer)
        comp.dy = 1;
      else if (comp.y + (comp.height / 2) > HEIGHT / 2 + buffer)
        comp.dy = -1;
      else
        comp.dy = 0;
    }

    var next_x = comp.x + comp.dx * comp.speed * timeDelta;
    var next_y = comp.y + comp.dy * comp.speed * timeDelta;

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
        if (frames % 2 === 1)
          y = HEIGHT - y;
      } else if (y > HEIGHT) {
        while (y > HEIGHT) {
          y -= HEIGHT;
          frames += 1;
        }
        if (frames % 2 === 1)
          y = HEIGHT - y;
      }
      return y;
    }
    comp.prediction = mod(ball.y + (comp.x - ball.x) * ball.dy / ball.dx);
  }

  ///////////// BALL UPDATE /////////////

  // determine whether two line segments intersect
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

  function updateBall(ball, user, comp, timeDelta) {
    var next_x = ball.x + ball.dx * ball.speed * timeDelta;
    var next_y = ball.y + ball.dy * ball.speed * timeDelta;

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

  //////////// POINT DETECTION ///////////////

  function userPoint(ball) {
    return ball.x < -2 * BALL_RADIUS;
  }

  function compPoint(ball) {
    return ball.x > WIDTH + BALL_RADIUS * 2;
  }

  ///////////// KEY DETECTION ////////////////

  function handleKeystrokes(user) {
    var map = [];

    listenForKeys(e => {
      map[e.keyCode] = (e.type === 'keydown');

      if (map[38]) {
        user.dy = -1;
      } else if (map[40]) {
        user.dy = 1;
      } else {
        user.dy = 0;
      }
    });
  }

  ////////////// GAME PLAY ///////////////////

  function prepForPoint(user, comp, ball, game, dom) {
    game.inPlay = false;

    resetUser(user);
    resetComp(comp);
    resetBall(ball);

    if (ball.dx === -1)
      predictComp(comp, ball);

    dom.clearCanvas();
    dom.drawPaddle(user);
    dom.drawPaddle(comp);
    dom.drawPoints(game.points);
    dom.showMessage(game);
  }

  function startPoint(user, comp, ball, game, dom) {

    function handlePoint(player) {
      game.points[player]++;
      game.lastPoint = player;
      prepForPoint(user, comp, ball, game, dom);
    }

    let prevTime;
    function gameLoop(curTime) {
      // detect points
      if (userPoint(ball))
        return handlePoint('user');
      else if (compPoint(ball))
        return handlePoint('comp');

      // calc time delta
      let timeDelta = 0.06 * ((curTime - prevTime) || 0);
      prevTime = curTime;

      // update game elements
      updateUser(user, timeDelta);
      updateComp(comp, ball, timeDelta);
      updateBall(ball, user, comp, timeDelta);

      // draw game elements
      dom.clearCanvas();
      dom.drawPaddle(user);
      dom.drawPaddle(comp);
      dom.drawBall(ball);

      // loop
      requestAnimationFrame(gameLoop);
    }

    // start the point
    game.inPlay = true;
    dom.hideMessage();
    requestAnimationFrame(gameLoop);
  }

  ////////////////// MAIN ////////////////////

  // initialize
  var user = {};
  var comp = {};
  var ball = {};
  var game = {
    inPlay: false,
    points: { user: 0, comp: 0 },
    lastPoint: null
  };
  var dom = PongDOM(rootElement, WIDTH, HEIGHT);

  // start key detection
  handleKeystrokes(user);

  // set up point
  prepForPoint(user, comp, ball, game, dom);

  // start point on click
  rootElement.addEventListener('click', function() {
    if (!game.inPlay)
      startPoint(user, comp, ball, game, dom);
  });

}
