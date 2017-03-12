import {SimpleWorker} from '../graphics/simple_worker.js';
import {Chunk} from './chunk.js';

/**
 * Acts as global obj for performing chunk operations
 *
 * Variable List
 * -curID {int}
 * -chunks {Chunk[]}
 * -simpleWorkers {Worker[]}
 * -idle {int}
 */
class ChunkBuilder {
  get GEN_DATA() { return 0; } //Generate data opcode

  constructor() {
    this.curID = 0;
    this.chunks = [];

    this.simpleWorkers = [new SimpleWorker('chunk_simple.js'), new SimpleWorker('chunk_simple.js')];

    for(var i=0; i<this.simpleWorkers.length; i++)
      this.simpleWorkers[i].w.addEventListener('message', (msg) => {this.jobComplete(msg)});

    this.idle = 2;
  }


  /**
   * update - Call every update to check for chunks with pending operations
   */
  update() {
    //Check priority chunks
    for(var i=0; i<this.chunks.length; i++) {
      if(this.idle <= 0)
        break;

      if(this.chunks[i].priority && this.chunks[i].opQueue.length > 0 && !this.chunks[i].locked) {
        this.assignWorker(this.chunks[i]);
      }
    }
    //Check low priority chunks
    for(var i=0; i<this.chunks.length; i++) {
      if(this.idle <= 0)
        break;

      if(this.chunks[i].opQueue.length > 0 && !this.chunks[i].locked) {
        this.assignWorker(this.chunks[i]);
      }
    }
  }


  /**
   * assignWorker - begin processing a chunk
   * @param  {Chunk} chunk The chunk to begin processing with a thread, assumes worker idle
   */
  assignWorker(chunk) {
    for(var i=0; i<this.simpleWorkers.length; i++) {
      if(this.simpleWorkers[i].job == -1) {
        this.simpleWorkers[i].job = chunk.id;
        this.simpleWorkers[i].time = performance.now();

        this.simpleWorkers[i].w.postMessage(
            {
                id: chunk.id,
                dat: chunk.data.buffer, // Data reference
                bDat: chunk.bData.buffer,
                op: chunk.opQueue[0],
                pos: [chunk.position[0], chunk.position[1], chunk.position[2]],
                realm: chunk.realm
            },
            [
                chunk.data.buffer, // Data
                chunk.bData.buffer
            ]
        );

        this.idle -= 1;
        chunk.locked = true;
        chunk.requireRebuild = true;

        return;
      }
    }
  }


  /**
   * Called when thread completes, calls update when done to start working on next chunk
   * @param  {Object} msg contains id, as well as pos, tex, light {Buffer} members and dat {Buffer}
   */
  jobComplete(msg) {
    var worker;

    for(var i=0; i<this.simpleWorkers.length; i++) {
      if(this.simpleWorkers[i].job == msg.data.id) {
        worker = this.simpleWorkers[i];
        break;
      }
    }

    var chunk;

    for(var i=0; i<this.chunks.length; i++) {
      if(this.chunks[i].id == msg.data.id) {
        chunk = this.chunks[i];
        break;
      }
    }

    //console.log("Chunk Gen Took", performance.now() - worker.time);

    this.idle += 1;
    worker.job = -1;

    chunk.locked = false;
    chunk.opQueue.splice(0, 1);
    chunk.dirty = true;
    chunk.requireRebuild = true;

    chunk.data = new Uint16Array(msg.data.dat);
    chunk.bData = new Uint16Array(msg.data.bDat);

    this.update();
  }


  /**
   * createChunk - Create a new chunk
   * @param {string} realm this is the realm the chunk belongs to
   * @return {Chunk}
   */
  createChunk(realm) {
    this.chunks.push(new Chunk(this.curID, realm));
    this.curID += 1;
    return this.chunks[this.chunks.length-1];
  }


  /**
   * destroyChunk - Remove a chunk from processing queue
   * @param  {Chunk} chunk
   * @return {Chunk} returns the chunk
   */
  destroyChunk(chunk) {
    for(var i=0; i<this.chunks.length; i++) {
      if(this.chunks[i] == chunk) {
        return this.chunks.splice(i, 1);
      }
    }
  }
}

//This is a singleton
export default (new ChunkBuilder);
