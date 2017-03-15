import {Chunk} from '../blocks/chunk.js';
import {PosStore} from './pos_store.js';
import MeshBuilder from '../graphics/mesh_builder.js';
import ChunkBuilder from './chunk_builder.js';
import AceVox from '../game/ace_vox.js';
import {vec3} from 'gl-matrix';

/**
 * ChunkGroup({Player}, {World})- stores chunks around a player
 * -player {Player}
 * -world {World}
 * -lastPos {vec3} object with floored world coords
 * -chunks {Chunk[]}
 * -meshes {ChunkMesh[]} !This will not be present if player is !RENDERED
 */
export class ChunkGroup {
  constructor(player, world) {
    this.player = player;
    this.world = world;

    this.lastPos = vec3.fromValues(Math.floor(player.pos[0]/64)*64, Math.floor(player.pos[1]/64)*64, Math.floor(player.pos[0]/64)*64);

    this.chunks = [];

    if(player.RENDERED)
      this.meshes = [];

    this.pos_store = new PosStore();

    for(var y=-AceVox.CHUNK_R; y<=AceVox.CHUNK_R; y++) {
      for(var x=-AceVox.CHUNK_R; x<=AceVox.CHUNK_R; x++) {
        for(var z=-AceVox.CHUNK_R; z<=AceVox.CHUNK_R; z++) {
          if(Math.sqrt(x*x + y*y + z*z) > AceVox.CHUNK_R)
            continue;

          var chunk = ChunkBuilder.createChunk(this.world);
          vec3.add(chunk.position, this.lastPos, vec3.fromValues(x*64, y*64, z*64));

          chunk.opQueue.push(ChunkBuilder.GEN_DATA);
          chunk.requireRebuild = true;
          chunk.dirty = false;

          if(player.RENDERED)
            this.meshes.push(MeshBuilder.createMesh(chunk));

          this.chunks.push(chunk);

          this.pos_store.addObj(chunk);
        }
      }
    }

    this.pos_arr = [];
    this.pos_arr_hold = [];

    for(var i=0; i<this.chunks.length; i++) {
      this.pos_arr.push(vec3.create());
    }
  }


  /**
   * update - Reload chunks if player has moved
   */
  update() {
    if(this.lastPos[0] == Math.floor(this.player.pos[0]/64)*64 && this.lastPos[1] == Math.floor(this.player.pos[1]/64)*64 && this.lastPos[2] == Math.floor(this.player.pos[2]/64)*64)
      return;

    this.lastPos = vec3.fromValues(Math.floor(this.player.pos[0]/64)*64, Math.floor(this.player.pos[1]/64)*64, Math.floor(this.player.pos[2]/64)*64);

    //Get all positions
    this.t_pos = vec3.create();
    this.c_pos = vec3.create();
    var index = 0;

    for(var y=-AceVox.CHUNK_R; y<=AceVox.CHUNK_R; y++) {
      for(var x=-AceVox.CHUNK_R; x<=AceVox.CHUNK_R; x++) {
        for(var z=-AceVox.CHUNK_R; z<=AceVox.CHUNK_R; z++) {
          if(Math.sqrt(x*x + y*y + z*z) > AceVox.CHUNK_R)
            continue;

          vec3.set(this.t_pos, x*64, y*64, z*64)
          vec3.add(this.c_pos, this.lastPos, this.t_pos);

          if(this.pos_store.getObj(this.c_pos) === -1) {
            for(var i=index; i < this.chunks.length; i++) {
              if(vec3.distance(this.chunks[i].position, this.lastPos) > AceVox.CHUNK_R*64) {
                this.pos_store.moveObj(this.chunks[i], this.c_pos[0], this.c_pos[1], this.c_pos[2]);
                this.chunks[i].opQueue.push(ChunkBuilder.GEN_DATA);
                this.chunks[i].requireRebuild = true;

                index = i;
                i = 1000000000;
              }
            }
          }
        }
      }
    }
  }
}
