/**
 * Acts as global obj for passing data
 *
 * Variable List
 * - DOM: main, ui, can, gl
 * - Game: game_size, shader_cache, last_render
 * - Settings: CHUNK_R, CHUNK_H
 */
class AceVox {
  get CREATIVE() { return 0; }

  constructor() {
    //TODO: Make these loaded from localStorage
    this.CHUNK_R = 3; //Radius in chunks to load around each player

    this.MODE = this.CREATIVE;

    this.PROCESS_THRESHHOLD = 15; //Number of ms to allow additional processing
  }
}

//This is a singleton
export default (new AceVox);
