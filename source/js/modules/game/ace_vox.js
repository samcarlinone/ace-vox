/**
 * Acts as global obj for passing data
 *
 * Variable List
 * - DOM: main, ui, can, gl
 * - Game: game_size, shader_cache, last_render
 * - Settings: CHUNK_R, CHUNK_H
 */
class AceVox {
  constructor() {
    //TODO: Make these loaded from localStorage
    this.CHUNK_R = 2; //Radius in chunks to load around each player

    this.PROCESS_THRESHHOLD = 15; //Number of ms to allow additional processing
  }
}

//This is a singleton
export default (new AceVox);
