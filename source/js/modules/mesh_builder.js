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
      this.simpleWorkers[i].addEventListener('message', (msg) => {this.jobComplete(msg)});

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

        this.simpleWorkers[i].postMessage(
            {
                id: mesh.id,
                dat: array // Data reference
            },
            [
                mesh.chunk.data.buffer // Data
            ]
        );

        this.idle -= 1;
        mesh.chunk.locked = true;
        mesh.processing = true;

        return;
      }
    }
  }


  /**
   * Called when thread completes, calls update when done
   * @param  {Object} msg contains id, as well as pos, tex, light {Float32Array} members and dat {Uint16Array}
   */
  jobComplete(msg) {
    var worker;

    for(var i=0; i<this.simpleWorkers.length; i++) {
      if(this.simpleWorkers[i].job = msg.id) {
        worker = this.simpleWorkers[i];
        break;
      }
    }

    var mesh;

    for(var i=0; i<this.meshes.length; i++) {
      if(this.meshes[i].id == msg.id) {
        mesh = this.meshes[i];
        break;
      }
    }

    this.idle += 1;

    mesh.processing = false;
    mesh.chunk.dirty = false;
    mesh.chunk.locked = false;

    mesh.chunk.data = msg.dat;

    mesh.pos = msg.pos;
    mesh.tex = msg.tex;
    mesh.light = msg.light;

    this.update();
  }


  /**
   * Create a new mesh
   * @param  {Chunk} chunk
   * @return {ChunkMesh}
   */
  createMesh(chunk) {
    this.meshes.append(new Mesh(this.curID, chunk));
    this.curID += 1;
    return this.meshes[this.meshes.length-1];
  }
}

//This is a singleton
export default (new MeshBuilder);
