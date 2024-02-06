import { canvasHeight, canvasWidth, particleSize } from './config.js';
import { Particle } from './particle.class.js';

let canvas = null;
let context = null;
let particles = [];
let started = false;
let mouseX = 0;
let mouseY = 0;
let mouseIsOver = false;
let cursorSize = 10;
let centerOfMassX = canvasWidth / 2;
let centerOfMassY = canvasHeight / 2;
let offsetX = 0;
let offsetY = 0;

function init(_canvas, _particles) {
  canvas = _canvas;
  context = canvas.getContext('2d');
  particles = _particles;
}

function drawMouseCursor() {
  const size = Math.round((cursorSize / 10) * particleSize);
  context.beginPath();
  if (size > 1) {
    const radius = Math.floor(size / 2);
    context.arc(mouseX, mouseY, radius, 0, Math.PI * 2);
    context.fillStyle = 'white';
    context.fill();
  } else {
    context.fillRect(mouseX, mouseY, 1, 1);
  }
}

function lerp(start, end, factor) {
  return (1 - factor) * start + factor * end;
}

function drawParticles() {
  const lerpFactor = 0.05; // Adjust this value to change the speed of interpolation

  const targetOffsetX = centerOfMassX - (canvasWidth / 2);
  const targetOffsetY = centerOfMassY - (canvasHeight / 2);

  offsetX = lerp(offsetX, targetOffsetX, lerpFactor);
  offsetY = lerp(offsetY, targetOffsetY, lerpFactor);

  context.clearRect(0, 0, canvas.width, canvas.height);

  const placeHolderParticle = new Particle(0, 0);
  particles.forEach((particle) => {
    placeHolderParticle.cast(particle);
    placeHolderParticle.x -= offsetX;
    placeHolderParticle.y -= offsetY;
    placeHolderParticle.draw(context);
  });

  if (mouseIsOver) drawMouseCursor(context);
}

function draw() {
  if (!started) return;
  drawParticles();
  requestAnimationFrame(draw);
}

function startDrawing() {
  started = true;
  requestAnimationFrame(draw);
}

function stopDrawing() {
  started = false;
}

function updateParticles(_particles) {
  particles = _particles;
}

function onMouseMove(x, y) {
  mouseX = x;
  mouseY = y;
  mouseIsOver = true;
}

function onMouseLeave() {
  mouseIsOver = false;
}

self.addEventListener('message', (event) => {
  switch (event.data.type) {
    case 'init':
      init(event.data.canvas, event.data.particles);
      break;
    case 'update':
      updateParticles(event.data.particles);
      break;
    case 'start':
      startDrawing();
      break;
    case 'stop':
      stopDrawing();
      break;
    case 'mousemove':
      onMouseMove(event.data.x, event.data.y);
      break;
    case 'mouseleave':
      onMouseLeave();
      break;
    case 'cursorsize':
      cursorSize = event.data.cursorSize;
      break;
    case 'centerofmass':
      centerOfMassX = event.data.x;
      centerOfMassY = event.data.y;
      break;
    default:
      break;
  }
});
