import {vec3} from 'gl-matrix';

/**
 * Class representing a 64^3 chunk of world data
 * -SIZE_1, SIZE_2, SIZE_3, Has static members for size in each dimensions, and masks for ROT, AIR, and BLOCK type
 * -data, {Uint16Array} representing block data
 * -active, {boolean} flag representing whether the chunk contains active blocks !This flag must be changed externally
 * -dirty, {boolean} flag representing whether the chunk has changed, starts true !This flag must be changed externally
 * -locked, {boolean} flag whether data is in use by builder thread !This flag must be changed externally
 * -priority, {boolean} flag whether mesh should be prioritized in build queue !This flag must be changed externally
 * -position, {vec3}
 */
export class Chunk {
  /**
   * Sizes for three dimensions
   */
  static get SIZE_1() { return 64; }
  static get SIZE_2() { return 4096; }
  static get SIZE_3() { return 262144; }

  static get AIR() {        return 0b1000000000000000; }
  static get SUN_AIR() {    return 0b1111111111111111; }
  static get BLOCK_MASK() { return 0b0000111111111111; }
  static get ROT_MASK() {   return 0b0111000000000000; }

  constructor() {
    this.data = new Uint16Array(Chunk.SIZE_3);
    this.bData = new Uint16Array(Chunk.SIZE_2 * 6);
    this.bData.fill(Chunk.SUN_AIR);

    this.active = false;
    this.dirty = true;
    this.locked = false;
    this.priority = false;

    this.position = vec3.create();
  }
}
