import { Rectangle } from './rectangle.class.js';

export class Quadtree {
  constructor(boundary, capacity) {
    this.boundary = boundary;
    this.capacity = capacity;
    this.points = [];
    this.divided = false;
  }

  subdivide() {
    const {
      x, y, width, height,
    } = this.boundary;
    const w = width / 2;
    const h = height / 2;

    const nw = new Rectangle(x, y, w, h);
    this.northwest = new Quadtree(nw, this.capacity);

    const ne = new Rectangle(x + w, y, w, h);
    this.northeast = new Quadtree(ne, this.capacity);

    const se = new Rectangle(x + w, y + h, w, h);
    this.southeast = new Quadtree(se, this.capacity);

    const sw = new Rectangle(x, y + h, w, h);
    this.southwest = new Quadtree(sw, this.capacity);

    this.divided = true;
  }

  insert(point) {
    if (!this.boundary.contains(point)) return;

    if (this.points.length < this.capacity) {
      this.points.push(point);
    } else {
      if (!this.divided) this.subdivide();

      this.northeast.insert(point);
      this.northwest.insert(point);
      this.southeast.insert(point);
      this.southwest.insert(point);
    }
  }

  insertAll(points) {
    for (let i = 0; i < points.length; i += 1) {
      this.insert(points[i]);
    }
  }

  query(range, found) {
    if (!found) found = [];

    if (!this.boundary.intersects(range)) return found;

    for (let i = 0; i < this.points.length; i += 1) {
      if (range.contains(this.points[i])) {
        found.push(this.points[i]);
      }
    }

    if (this.divided) {
      this.northeast.query(range, found);
      this.northwest.query(range, found);
      this.southeast.query(range, found);
      this.southwest.query(range, found);
    }

    return found;
  }

  getInRange(x, y, width, height) {
    return this.query(new Rectangle(x, y, width, height));
  }

  queryAll(found) {
    if (!found) found = [];

    for (let i = 0; i < this.points.length; i += 1) {
      found.push(this.points[i]);
    }

    if (this.divided) {
      this.northeast.queryAll(found);
      this.northwest.queryAll(found);
      this.southeast.queryAll(found);
      this.southwest.queryAll(found);
    }

    return found;
  }

  draw(context) {
    context.strokeStyle = 'black';
    context.strokeRect(this.boundary.x, this.boundary.y, this.boundary.width, this.boundary.height);

    if (this.divided) {
      this.northeast.draw(context);
      this.northwest.draw(context);
      this.southeast.draw(context);
      this.southwest.draw(context);
    }
  }

  update(context) {
    for (let i = 0; i < this.points.length; i += 1) {
      this.points[i].update(context);
    }

    if (this.divided) {
      this.northeast.update(context);
      this.northwest.update(context);
      this.southeast.update(context);
      this.southwest.update(context);
    }
  }
}
