/**
 * Class representing a 64^3 chunk of world data
 * -SIZE_1, SIZE_2, SIZE_3, Has static members for size in each dimensions
 * -data, {Uint16Array} representing block data
 * -active, {boolean} flag representing whether the chunk contains active blocks !This flag must be changed externally
 * -dirty, {boolean} flag representing whether the chunk has changed, starts true !This flag must be changed externally
 */
export class Chunk {
  /**
   * Sizes for three dimensions
   */
  static get SIZE_1() {
    return 64;
  }

  static get SIZE_2() {
    return 4096;
  }

  static get SIZE_3() {
    return 262144;
  }

  constructor() {
    this.active = false;
    this.dirty = true;

    this.data = new Uint16Array(Chunk.SIZE_3);
  }
}
