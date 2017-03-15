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

    this.simpleWorkers = [new SimpleWorker('mesh_simple.js'), new SimpleWorker('mesh_simple.js')];

    for(var i=0; i<this.simpleWorkers.length; i++)
      this.simpleWorkers[i].w.addEventListener('message', (msg) => {this.jobComplete(msg)});

    this.idle = 2;
  }


  /**
   * update - Call every update to check for dirty meshes
   */
  update() {
    //Check priority meshes
    for(var i=0; i<this.meshes.length; i++) {
      if(this.idle <= 0)
        break;

      if(this.meshes[i].chunk.priority && this.meshes[i].chunk.dirty && !this.meshes[i].processing && !this.meshes[i].chunk.locked) {
        this.assignWorker(this.meshes[i]);
      }
    }
    //Check low priority meshes
    for(var i=0; i<this.meshes.length; i++) {
      if(this.idle <= 0)
        break;

      if(this.meshes[i].chunk.dirty && !this.meshes[i].processing && !this.meshes[i].chunk.locked) {
        this.assignWorker(this.meshes[i]);
      }
    }
  }


  /**
   * @param  {ChunkMesh} mesh The mesh to begin processing with a thread, assumes worker idle
   */
  assignWorker(mesh) {
    for(var i=0; i<this.simpleWorkers.length; i++) {
      if(this.simpleWorkers[i].job == -1) {
        this.simpleWorkers[i].job = mesh.id;
        this.simpleWorkers[i].time = performance.now();

        this.simpleWorkers[i].w.postMessage(
            {
                id: mesh.id,
                dat: mesh.chunk.data.buffer, // Data reference
                bDat: mesh.chunk.bData.buffer
            },
            [
                mesh.chunk.data.buffer, // Data
                mesh.chunk.bData.buffer
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
   * Called when thread completes, calls update when done to start working on next mesh
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

    console.log("Mesh Build Took", performance.now() - worker.time);

    this.idle += 1;
    worker.job = -1;

    mesh.processing = false;
    mesh.chunk.dirty = false;
    mesh.chunk.locked = false;
    mesh.chunk.requireRebuild = false;

    mesh.chunk.data = new Uint32Array(msg.data.dat);
    mesh.chunk.bData = new Uint32Array(msg.data.bDat);

    mesh.pos = new Float32Array(msg.data.pos);
    mesh.norm = new Float32Array(msg.data.norm);
    mesh.tex = new Float32Array(msg.data.tex);
    mesh.light = new Uint8Array(msg.data.light);

    mesh.changed();

    this.update();
  }


  /**
   * createMesh - Create a new mesh
   * @param  {Chunk} chunk
   * @return {ChunkMesh}
   */
  createMesh(chunk) {
    this.meshes.push(new ChunkMesh(this.curID, chunk));
    this.curID += 1;
    return this.meshes[this.meshes.length-1];
  }


  /**
   * destroyMesh - Remove a mesh from generation queue
   * @param  {ChunkMesh} mesh
   * @return {ChunkMesh} returns the mesh
   */
  destroyMesh(mesh) {
    for(var i=0; i<this.meshes.length; i++) {
      if(this.meshes[i] == mesh) {
        this.meshes[i].destroy();
        return this.meshes.splice(i, 1);
      }
    }
  }
}

//This is a singleton
export default (new MeshBuilder);
