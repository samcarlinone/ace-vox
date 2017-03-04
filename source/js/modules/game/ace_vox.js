/**
 * Acts as global obj for passing data
 *
 * Variable List
 * - DOM: main, ui, can, gl
 * - Game: game_size, shader_cache
 */
class AceVox {
  constructor() {
    //Do nothing here
  }
}

//This is a singleton
export default (new AceVox);
