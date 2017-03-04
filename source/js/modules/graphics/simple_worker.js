/**
 * Simple Worker
 * -w {Worker}
 * -job {int} id of current job or -1 if idle
 */
export class SimpleWorker {
  constructor() {
    this.job = -1;
    this.w = new Worker('mesh_simple.js');
  }
}
