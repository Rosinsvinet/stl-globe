import Vertex from './Vertex';

export default class Facet {
  private vertices: Vertex [];

  constructor(vertices: Vertex[]) {
    this.vertices = vertices;
  }

  public getNormal() {
    // https://math.stackexchange.com/questions/305642/how-to-find-surface-normal-of-a-triangle
    const v = new Vertex (
      this.vertices[1].x - this.vertices[0].x,
      this.vertices[1].y - this.vertices[0].y,
      this.vertices[1].z - this.vertices[0].z
    );

    const w = new Vertex (
      this.vertices[2].x - this.vertices[0].x,
      this.vertices[2].y - this.vertices[0].y,
      this.vertices[2].z - this.vertices[0].z
    );

    const normal = new Vertex(
      v.y * w.z - v.z * w.y,
      v.z * w.x - v.x * w.z,
      v.x * w.y - v.y * w.x
    );

    normal.normalize();

    return normal;
  }

  toString(decimalPlaces?: number): string {
    return `\n  facet normal ${this.getNormal().toString(decimalPlaces)}
    outer loop
      vertex ${this.vertices[0].toString(decimalPlaces)}
      vertex ${this.vertices[1].toString(decimalPlaces)}
      vertex ${this.vertices[2].toString(decimalPlaces)}
    endloop
  endfacet`
  }
}
