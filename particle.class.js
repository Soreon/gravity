import {
  particleMass, particleSize,
} from './config.js';

export class Particle {
  constructor(x, y, oldX = null, oldY = null, mass = null) {
    this.uid = Math.random().toString(36).substring(2, 15);
    this.x = x;
    this.y = y;
    this.oldX = oldX ?? x - (Math.random() - 0.5) * 5; // Previous horizontal position
    this.oldY = oldY ?? y - (Math.random() - 0.5) * 5; // Previous vertical position
    this.mass = mass ?? particleMass;
  }

  cast(methodlessParticle) {
    this.x = methodlessParticle.x;
    this.y = methodlessParticle.y;
    this.mass = methodlessParticle.mass;
    this.oldX = methodlessParticle.oldX;
    this.oldY = methodlessParticle.oldY;
  }

  // Add a method to apply a force to this particle
  applyForce(force) {
    const accelerationX = force.x / this.mass;
    const accelerationY = force.y / this.mass;
    const newX = 2 * this.x - this.oldX + accelerationX;
    const newY = 2 * this.y - this.oldY + accelerationY;
    this.oldX = this.x;
    this.oldY = this.y;
    this.x = newX;
    this.y = newY;
  }

  // Add a method to calculate the gravitational force between this particle and another
  calculateGravity(other) {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const softeningConstant = 1000; // This can be adjusted as needed
    const distanceSquared = distance * distance + softeningConstant;
    let forceMagnitude = (this.mass * other.mass) / distanceSquared;

    // Normalize dx and dy to get a direction vector
    const directionX = distance !== 0 ? dx / distance : 0;
    const directionY = distance !== 0 ? dy / distance : 0;

    // Limit the maximum force
    const maxForce = 0.01; // Adjust as needed
    if (forceMagnitude > maxForce) {
      forceMagnitude = maxForce;
    }

    return {
      x: forceMagnitude * directionX,
      y: forceMagnitude * directionY,
    };
  }

  // Update particle position
  update(particles) {
    // Calculate the total gravitational force exerted on this particle by the nearby particles
    const totalForce = { x: 0, y: 0 };
    particles.forEach((other) => {
      if (other === this) return;
      if (other.x === this.x && other.y === this.y) return;
      const gravity = this.calculateGravity(other);
      totalForce.x += gravity.x;
      totalForce.y += gravity.y;
    });

    this.applyForce(totalForce);
  }

  // Draw particle
  draw(context) {
    context.beginPath();
    const size = Math.round((this.mass / 10) * particleSize);
    if (size > 1) {
      const radius = Math.floor(size / 2);
      context.arc(this.x, this.y, radius, 0, Math.PI * 2);
      context.fillStyle = 'white';
      context.fill();
    } else {
      context.fillRect(this.x, this.y, 1, 1);
    }
  }
}
