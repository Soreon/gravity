import {
  particleCount,
} from './config.js';
import { Particle } from './particle.class.js';

const drawerWorker = new Worker('./drawer.worker.js', { type: 'module' });
const processorWorker = new Worker('./processor.worker.js', { type: 'module' });

const canvasContainer = document.getElementById('canvasContainer');
const canvas = document.getElementById('myCanvas').transferControlToOffscreen();

const allPoints = [];
let isDragging = false;
let cursorParticleMass = 10;

window.allPoints = allPoints;

function createInitialParticles() {
  for (let i = 0; i < particleCount; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const particle = new Particle(x, y, x, y);
    allPoints.push(particle);
  }
}

function insertParticle(x, y) {
  processorWorker.postMessage({
    type: 'insert', x, y, mass: cursorParticleMass,
  });
}

canvasContainer.addEventListener('mousedown', () => {
  isDragging = true;
});

canvasContainer.addEventListener('mouseup', (event) => {
  isDragging = false;
  const rect = canvasContainer.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  insertParticle(x, y);
});

canvasContainer.addEventListener('mousemove', (event) => {
  const rect = canvasContainer.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  if (isDragging) insertParticle(x, y);
  drawerWorker.postMessage({ type: 'mousemove', x, y });
});

canvasContainer.addEventListener('mouseleave', () => {
  isDragging = false;
  drawerWorker.postMessage({ type: 'mouseleave' });
});

// on mousewheel event, change the cursor size
canvasContainer.addEventListener('wheel', (event) => {
  const increment = event.deltaY > 0 ? -0.1 : 0.1; // reduce the increment/decrement value
  cursorParticleMass += cursorParticleMass * increment;
  cursorParticleMass = Math.max(10, cursorParticleMass);
  drawerWorker.postMessage({ type: 'cursorsize', cursorSize: cursorParticleMass });
});

processorWorker.addEventListener('message', (event) => {
  switch (event.data.type) {
    case 'update':
      drawerWorker.postMessage({ type: 'update', particles: event.data.particles });
      break;
    case 'centerofmass':
      drawerWorker.postMessage({ type: 'centerofmass', x: event.data.centerOfMassX, y: event.data.centerOfMassY });
      break;
    default:
      break;
  }
});

createInitialParticles();

processorWorker.postMessage({ type: 'init', particles: allPoints });
processorWorker.postMessage({ type: 'start' });

drawerWorker.postMessage({ type: 'init', canvas, particles: allPoints }, [canvas]);
drawerWorker.postMessage({ type: 'start' });
