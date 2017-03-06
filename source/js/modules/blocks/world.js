import ShaderCache from '../graphics/shader_cache.js';
import TextureCache from '../graphics/texture_cache.js';
import AceVox from '../game/ace_vox.js';
import Operator from './operator.js';
import {Chunk} from './chunk.js';
import {vec3, mat4} from 'gl-matrix';
import {Camera} from '../graphics/camera.js';
import {Player} from '../player/player.js';
import {ChunkGroup} from './chunk_group.js';

import MeshBuilder from '../graphics/mesh_builder.js';

/**
 * Class representing a world or realm
 *
 * high level variables
 * -realm, {String} representing the world type
 * -players {Player[]}
 * -cGroups {ChunkGroup[]} chunk groups around active players
 * -aChunks {Chunk[]} chunks with active blocks currently being simulated
 * -entities {Entity[]} active entities in this world
 *
 * internal variables
 * -op_queue {Operation[]} pending world modification operations
 * -tick_part {float} how long since last tick
 */
export class World {
  constructor(realm) {
    //High level
    this.realm = realm;

    this.players = [];
    this.cGroups = [];
    this.aChunks = [];

    this.entities = [];

    //Internal
    this.op_queue = [];
    this.tick_part = 0;

    //GL Variables
    var gl = AceVox.gl;
    this.program = ShaderCache.shaders['chunk_basic'].program;
    this.mvpLocation = gl.getUniformLocation(this.program, 'MVP');
    this.sunVecLocation = gl.getUniformLocation(this.program, 'sunVec');
    this.sunColLocation = gl.getUniformLocation(this.program, 'sunCol');
    this.atlasLocation = gl.getUniformLocation(this.program, 'atlas');

    //Testing
    this.chunk = new Chunk();

    for(var x=0; x<64; x++) {
      for(var y=0; y<64; y++) {
        for(var z=0; z<64; z++) {
          var p = x + z*64 + y*4096;

          if(x + z < y)
            this.chunk.data[p] = Chunk.SUN_AIR;//0b1011110001100111;

        }
      }
    }

    this.chunk_mesh = MeshBuilder.createMesh(this.chunk);
  }

  update(delta) {
    //Run Tick
    this.tick_part += delta;

    if(this.tick_part >= 1000/12) {
      this.tick();
      this.tick_part -= 1000/12;
    }

    //Update Objects
    if(this.players.length > 0) {
      for(var i=0; i<this.players.length; i++) {
        this.players[i].update(delta);
      }

      for(var i=0; i<this.cGroups.length; i++) {
        this.cGroups[i].update(delta);
      }
    }

    //Execute operations
    for(var i=0; i<this.op_queue.length; i++) {
      if(!this.op_queue[i].target.locked) {
        if(Operator.execute(this.op_queue[i])) {
          this.op_queue.splice(i, 1);
          i--;
        }
      }
    }
  }

  render() {
    var gl = AceVox.gl;
    gl.useProgram(this.program);
    gl.uniform3fv(this.sunVecLocation, vec3.fromValues(Math.sqrt(0.2), -Math.sqrt(0.5), Math.sqrt(0.3)));
    gl.uniform3fv(this.sunColLocation, vec3.fromValues(1, 1, 1));
    gl.uniform1i(this.atlasLocation, 0);

    for(var i=0; i<this.cGroups.length; i++) {
      if(this.cGroups[i].player.RENDERED) {
        for(var j=0; j<this.cGroups[i].meshes.length; j++) {
          var MVP = mat4.create();
          mat4.translate(MVP, MVP, this.cGroups[i].meshes[j].position);
          mat4.mul(MVP, MVP, this.cGroups[i].player.camera.getVP());
          gl.uniformMatrix4fv(this.mvpLocation, false, this.cGroups[i].player.camera.getVP());

          this.cGroups[i].meshes[j].render();
        }
      }
    }

    // gl.uniformMatrix4fv(this.mvpLocation, false, this.cGroups[0].player.camera.getVP());
    // this.chunk_mesh.render();
  }

  tick() {

  }

  addPlayer(player) {
    this.players.push(player);
    this.cGroups.push(new ChunkGroup(player, this));
  }
}
