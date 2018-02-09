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
  var midline = document.createElement('div');
  var messageBox = document.createElement('div');
  var message = document.createElement('div');

  // dom initialization
  canvas.width = tableWidth;
  canvas.height = tableHeight;
  rootEl.appendChild(canvas);

  userPoints.classList.add('points', 'user');
  rootEl.appendChild(userPoints);

  compPoints.classList.add('points', 'comp');
  rootEl.appendChild(compPoints);

  midline.classList.add('midline');
  rootEl.appendChild(midline);

  messageBox.classList.add('message-box');
  rootEl.appendChild(messageBox);

  message.classList.add('message');
  messageBox.appendChild(message);

  // FUNCTIONS //

  function clearCanvas() {
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

  function showMessage(game) {
    let text = '',
        { lastPoint } = game,
        { user, comp } = game.points;

    if (user === 0 && comp === 0)
      text = 'Click anywhere to begin.';
    else if (user === 0 && comp === 3)
      text = 'Yeah, it\'s hard.';
    else if (user === 0 && comp === 7)
      text = 'You appear to lack skill.';
    else if (lastPoint === 'user' && user === 1 && comp > 5)
      text = 'You scored...finally.';
    else if (lastPoint === 'user' && user === 1)
      text = 'You scored!';
    else if (lastPoint === 'user' && user === 3)
      text = 'Not bad...';
    else if (user + comp > 30)
      text = 'I can\' believe you\'re still playing.';

    if (text !== '') {
      message.textContent = text;
      messageBox.style.display = 'flex';
    }
  }

  function hideMessage(game) {
    messageBox.style.display = 'none';
  }

  // PUBLIC //

  return {
    clearCanvas,
    drawPaddle,
    drawBall,
    drawPoints,
    showMessage,
    hideMessage
  };

}
