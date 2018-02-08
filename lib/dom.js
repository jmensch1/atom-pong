'use babel';

export default function(rootEl, tableWidth, tableHeight) {

  // constants
  var TWO_PI = 2 * Math.PI;
  var BALL_COLOR = "#ffffff";
  var PADDLE_COLOR = "#f6eb16";

  // dom elements
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  var userPoints = document.createElement('div');
  var compPoints = document.createElement('div');
  let midline = document.createElement('div');

  // dom initialization
  canvas.width = tableWidth;
  canvas.height = tableHeight;
  rootEl.appendChild(canvas);

  userPoints.classList.add('points');
  userPoints.classList.add('user');
  rootEl.appendChild(userPoints);

  compPoints.classList.add('points');
  compPoints.classList.add('comp');
  rootEl.appendChild(compPoints);

  midline.classList.add('midline');
  rootEl.appendChild(midline);

  // FUNCTIONS //

  function resetCanvas() {
    ctx.clearRect(0, 0, tableWidth, tableHeight);
  }

  function drawPaddle(paddle) {
    ctx.fillStyle = PADDLE_COLOR;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  }

  function drawBall(ball) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, TWO_PI, false);
    ctx.fillStyle = BALL_COLOR;
    ctx.fill();
    ctx.stroke();
  }

  function drawPoints(points) {
    userPoints.textContent = points.user;
    compPoints.textContent = points.comp;
  }

  // PUBLIC //

  return {
    resetCanvas,
    drawPaddle,
    drawBall,
    drawPoints
  };

}
