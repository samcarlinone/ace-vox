/**
 * Acts as global obj for passing data
 *
 * Variable List
 * - DOM: main, ui, can, gl
 * - Game: game_size, shader_cache
 * - Settings: CHUNK_R, CHUNK_H
 */
class AceVox {
  constructor() {
    //TODO: Make these loaded from localStorage
    this.CHUNK_R = 3;
    this.CHUNK_H = 1;
  }
}

//This is a singleton
export default (new AceVox);
