import {SimpleWorker} from './simple_worker.js';
import {ChunkMesh} from './chunk_mesh.js';

/**
 * Acts as global obj for building chunk meshes
 *
 * Variable List
 * -curID {int}
 * -meshes {ChunkMesh[]}
 * -simpleWorkers {Worker[]}
 * -idle {int}
 */
class MeshBuilder {
  constructor() {
    this.curID = 0;
    this.meshes = [];

    this.simpleWorkers = [new SimpleWorker(), new SimpleWorker()];

    for(var i=0; i<this.simpleWorkers.length; i++)
      this.simpleWorkers[i].w.addEventListener('message', (msg) => {this.jobComplete(msg)});

    this.idle = 2;
  }

  update() {
    //Check priority meshes
    for(var i=0; i<this.meshes.length; i++) {
      if(this.idle <= 0)
        break;

      if(this.meshes[i].chunk.priority && this.meshes[i].chunk.dirty && !this.meshes[i].processing) {
        this.assignWorker(this.meshes[i]);
      }
    }
    //Check low priority meshes
    for(var i=0; i<this.meshes.length; i++) {
      if(this.idle <= 0)
        break;

      if(this.meshes[i].chunk.dirty && !this.meshes[i].processing) {
        this.assignWorker(this.meshes[i]);
      }
    }
  }


  /**
   * @param  {type} mesh The mesh to begin processing with a thread, assumes worker idle
   */
  assignWorker(mesh) {
    for(var i=0; i<this.simpleWorkers.length; i++) {
      if(this.simpleWorkers[i].job == -1) {
        this.simpleWorkers[i].job = mesh.id;

        this.simpleWorkers[i].w.postMessage(
            {
                id: mesh.id,
                dat: mesh.chunk.data.buffer // Data reference
            },
            [
                mesh.chunk.data.buffer // Data
            ]
        );

        this.idle -= 1;
        mesh.chunk.locked = true;
        mesh.processing = true;

        console.log("Processing mesh");

        return;
      }
    }
  }


  /**
   * Called when thread completes, calls update when done
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

    var mesh;

    for(var i=0; i<this.meshes.length; i++) {
      if(this.meshes[i].id == msg.data.id) {
        mesh = this.meshes[i];
        break;
      }
    }

    this.idle += 1;
    worker.job = -1;

    mesh.processing = false;
    mesh.chunk.dirty = false;
    mesh.chunk.locked = false;

    mesh.chunk.data = new Uint16Array(msg.data.dat);

    mesh.pos = new Float32Array(msg.data.pos);
    mesh.tex = new Float32Array(msg.data.tex);
    mesh.light = new Float32Array(msg.data.light);

    mesh.changed();

    this.update();
  }


  /**
   * Create a new mesh
   * @param  {Chunk} chunk
   * @return {ChunkMesh}
   */
  createMesh(chunk) {
    this.meshes.push(new ChunkMesh(this.curID, chunk));
    this.curID += 1;
    return this.meshes[this.meshes.length-1];
  }
}

//This is a singleton
export default (new MeshBuilder);