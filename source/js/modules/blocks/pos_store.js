/**
 * Class for Storing Objects by Position
 */
export class PosStore {
  constructor {
    this.store = {};
  }


  /**
   * addObj - Adds object, must have an array vec3 position
   *
   * @param  {Object} obj the object
   * @return {Object}     allows chaining
   */
  addObj(obj) {
    if(!this.store[obj.position[0]])
      this.store[obj.position[0]] = {};

    if(!this.store[obj.position[0]][obj.position[1]])
      this.store[obj.position[0]][obj.position[1]] = {};

    this.store[obj.position[0]][obj.position[1]][obj.position[2]] = obj;

    return obj;
  }


  /**
   * removeObj - Removes object
   *
   * @param  {Object} obj
   * @return {Object}     allows chaining
   */
  removeObj(obj) {
    delete this.store[obj.position[0]][obj.position[1]][obj.position[2]];

    if(Object.keys(this.store[obj.position[0]][obj.position[1]]).length === 0)
      delete this.store[obj.position[0]][obj.position[1]];

    if(Object.keys(this.store[obj.position[0]]).length === 0)
      delete this.store[obj.position[0]];

    return obj;
  }


  /**
   * moveObj - Moves object
   *
   * @param  {Object} obj Move the object by removing and adding
   * @return {Object}     allows chaining   
   */
  moveObj(obj) {
    this.addObj(this.removeObj(obj));

    return obj;
  }


  /**
   * getObj - Gets object at array vec3 position, or -1 if not found
   *
   * @param  {vec3} position
   * @return {Object}          return object or -1 if not found
   */
  getObj(position) {
    if(!this.store[position[0]])
      return -1;

    if(!this.store[position[0]][position[1]])
      return -1;

    return this.store[position[0]][position[1]][position[2]];
  }
}
