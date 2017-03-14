import {Chunk} from '../blocks/chunk.js';
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
        }
      }
    }
  }


  /**
   * update - Reload chunks if player has moved
   */
  update() {
    if(this.lastPos[0] == Math.floor(this.player.pos[0]/64)*64 && this.lastPos[1] == Math.floor(this.player.pos[1]/64)*64 && this.lastPos[2] == Math.floor(this.player.pos[2]/64)*64)
      return;

    this.lastPos = vec3.fromValues(Math.floor(this.player.pos[0]/64)*64, Math.floor(this.player.pos[1]/64)*64, Math.floor(this.player.pos[2 ]/64)*64);

    //Get all positions
    var pos_arr = [];
    for(var y=-AceVox.CHUNK_R; y<=AceVox.CHUNK_R; y++) {
      for(var x=-AceVox.CHUNK_R; x<=AceVox.CHUNK_R; x++) {
        for(var z=-AceVox.CHUNK_R; z<=AceVox.CHUNK_R; z++) {
          if(Math.sqrt(x*x + y*y + z*z) > AceVox.CHUNK_R)
            continue;

          var new_pos = vec3.create();
          vec3.add(new_pos, this.lastPos, vec3.fromValues(x*64, y*64, z*64));
          pos_arr.push(new_pos);
        }
      }
    }

    //Remove all positions & chunks that exist
    var c_temp = this.chunks.slice();
    for(var i=0; i<c_temp.length; i++) {
      var match = false;

      for(var j=0; j<pos_arr.length; j++) {
        if(vec3.equals(c_temp[i].position, pos_arr[j])) {
          match = true;
          break;
        }
      }

      if(match) {
        c_temp.splice(i, 1);
        i--;
        pos_arr.splice(j, 1);
        j--;
      }
    }

    //Actually reassign
    for(var i=0; i<c_temp.length; i++) {
      c_temp[i].position = pos_arr[i];
      c_temp[i].opQueue.push(ChunkBuilder.GEN_DATA);
      c_temp[i].requireRebuild = true;
    }
  }
}
