export default class Vertex {
  x: number;
  y: number;
  z: number;

  constructor (x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  normalize(): void {
    const length = this.length;

    this.x = this.x/length;
    this.y = this.y/length;
    this.z = this.z/length;
  }

  get length(): number {
    return Math.sqrt(this.x**2 + this.y**2 + this.z**2);
  }

  add(vertex: Vertex){
    this.x = this.x + vertex.x;
    this.y = this.y + vertex.y;
    this.z = this.z + vertex.z;
  }

  toDecimalPlaces(value: number, decimalPlaces: number) {
    const factor = 10**decimalPlaces;
    return Math.round(value * factor)/factor
  }

  toString(decimalPlaces?: number): string {
    if (decimalPlaces) {
      return `${this.toDecimalPlaces(this.x, decimalPlaces)} ${this.toDecimalPlaces(this.y, decimalPlaces)} ${this.toDecimalPlaces(this.z, decimalPlaces)}`;
    } else {
      return `${this.x} ${this.y} ${this.z}`;
    }
  }
}
