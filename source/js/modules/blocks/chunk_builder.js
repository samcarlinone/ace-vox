import {SimpleWorker} from '../graphics/simple_worker.js';
import {Chunk} from './chunk.js';
import operate from './operator.js';

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
  get UPDATE_N() { return 32; } //Update north chunk
  get UPDATE_S() { return 33; } //Update north chunk
  get UPDATE_E() { return 34; } //Update north chunk
  get UPDATE_W() { return 35; } //Update north chunk
  get UPDATE_U() { return 36; } //Update north chunk
  get UPDATE_D() { return 37; } //Update north chunk

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
    var non_synchronous = [];

    //Check priority chunks
    for(var i=0; i<this.chunks.length; i++) {
      if(this.idle <= 0)
        break;

      if(this.chunks[i].priority && this.chunks[i].opQueue.length > 0 && !this.chunks[i].locked) {
        if(this.chunks[i].opQueue[0] < 32) {
          this.assignWorker(this.chunks[i]);
        } else {
          non_synchronous.push(this.chunks[i]);
        }
      }
    }
    //Check low priority chunks
    for(var i=0; i<this.chunks.length; i++) {
      if(this.idle <= 0)
        break;

      if(this.chunks[i].opQueue.length > 0 && !this.chunks[i].locked) {
        if(this.chunks[i].opQueue[0] < 32) {
          this.assignWorker(this.chunks[i]);
        } else {
          non_synchronous.push(this.chunks[i]);
        }
      }
    }

    this.nonSync(non_synchronous);
  }

  nonSync(chunk_list) {
    var time = performance.now();

    for(var i=0; i<chunk_list.length; i++) {
      for(var k=0; k<chunk_list[i].opQueue.length; k++) {
        if(chunk_list[i].opQueue[k] >= 32) {
          if(operate(chunk_list[i].opQueue[k], chunk_list[i], this)) {
            chunk_list[i].opQueue.splice(k, 1);
            k--;
          }
        }
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
        this.simpleWorkers[i].op = chunk.opQueue[0];

        this.simpleWorkers[i].w.postMessage(
            {
                id: chunk.id,
                dat: chunk.data.buffer, // Data reference
                bDat: chunk.bData.buffer,
                op: chunk.opQueue[0],
                pos: [chunk.position[0], chunk.position[1], chunk.position[2]],
                realm: chunk.world.realm,
                seed: chunk.world.seed
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

    if(worker.op == 0) {
      //Update Chunk
      chunk.opQueue.push(this.UPDATE_N, this.UPDATE_S, this.UPDATE_E, this.UPDATE_W, this.UPDATE_U, this.UPDATE_D);
      //Update Neighbors
      var c = -1;

      c = chunk.world.chunkStore.getObj([chunk.position[0], chunk.position[1], chunk.position[2]+64]);
      if(c !== -1) { c.opQueue.push(this.UPDATE_S) };

      c = chunk.world.chunkStore.getObj([chunk.position[0], chunk.position[1], chunk.position[2]-64]);
      if(c !== -1) { c.opQueue.push(this.UPDATE_N) };

      c = chunk.world.chunkStore.getObj([chunk.position[0]+64, chunk.position[1], chunk.position[2]]);
      if(c !== -1) { c.opQueue.push(this.UPDATE_W) };

      c = chunk.world.chunkStore.getObj([chunk.position[0]-64, chunk.position[1], chunk.position[2]]);
      if(c !== -1) { c.opQueue.push(this.UPDATE_E) };
    }

    chunk.locked = false;
    chunk.opQueue.splice(0, 1);
    chunk.dirty = true;
    chunk.requireRebuild = true;

    chunk.data = new Uint32Array(msg.data.dat);
    chunk.bData = new Uint32Array(msg.data.bDat);

    this.update();
  }


  /**
   * createChunk - Create a new chunk
   * @param {string} realm this is the realm the chunk belongs to
   * @return {Chunk}
   */
  createChunk(world) {
    this.chunks.push(new Chunk(this.curID, world));
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
