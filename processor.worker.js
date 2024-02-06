// import { canvasHeight, canvasWidth, quadtreeCapacity } from './config.js';
import { canvasHeight, canvasWidth } from './config.js';
import { Particle } from './particle.class.js';
// import { Quadtree } from './quadtree.class.js';
// import { Rectangle } from './rectangle.class.js';

let started = false;
let canInsert = true;
let particles = [];
let centerOfMassX = 0;
let centerOfMassY = 0;

// const boundary = new Rectangle(0, 0, canvasWidth, canvasHeight);
// const quadTree = new Quadtree(boundary, quadtreeCapacity);

function calculateCenterOfMass() {
  let totalMass = 0;

  for (let i = 0; i < particles.length; i += 1) {
    const particle = particles[i];
    totalMass += particle.mass;
    centerOfMassX += particle.x * particle.mass;
    centerOfMassY += particle.y * particle.mass;
  }

  if (totalMass !== 0) {
    centerOfMassX /= totalMass;
    centerOfMassY /= totalMass;
  }
}

function insertParticle(x, y, mass) {
  if (!canInsert) return;

  const offsetX = (canvasWidth / 2) - centerOfMassX;
  const offsetY = (canvasHeight / 2) - centerOfMassY;

  const particle = new Particle(x - offsetX, y - offsetY, x - offsetX, y - offsetY, mass);
  particles.push(particle);

  canInsert = false;
  setTimeout(() => {
    canInsert = true;
  }, 10);
}

function init(_particles) {
  particles = _particles;
}

function simulateStep() {
  if (!started) return;

  const placeHolderParticle = new Particle(0, 0);
  particles.forEach((particle) => {
    placeHolderParticle.cast(particle);
    placeHolderParticle.update(particles);
    particle.x = placeHolderParticle.x;
    particle.y = placeHolderParticle.y;
    particle.mass = placeHolderParticle.mass;
    particle.oldX = placeHolderParticle.oldX;
    particle.oldY = placeHolderParticle.oldY;
  });

  calculateCenterOfMass();

  self.postMessage({ type: 'update', particles });
  self.postMessage({ type: 'centerofmass', centerOfMassX, centerOfMassY });
  requestAnimationFrame(simulateStep);
}

function startSimulation() {
  started = true;
  requestAnimationFrame(simulateStep);
}

function stopSimulation() {
  started = false;
}

self.addEventListener('message', (event) => {
  switch (event.data.type) {
    case 'init':
      init(event.data.particles);
      break;
    case 'insert':
      insertParticle(event.data.x, event.data.y, event.data.mass);
      break;
    case 'start':
      startSimulation();
      break;
    case 'stop':
      stopSimulation();
      break;
    default:
      break;
  }
});
