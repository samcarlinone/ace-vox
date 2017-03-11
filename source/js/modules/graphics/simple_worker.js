/**
 * Simple Worker
 * -w {Worker}
 * -job {int} id of current job or -1 if idle
 */
export class SimpleWorker {
  constructor(script) {
    this.job = -1;
    this.w = new Worker(script);
    this.w.onerror = (e) => {console.error(e)};
  }
}
