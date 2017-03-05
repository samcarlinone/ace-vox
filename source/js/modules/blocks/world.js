import ShaderCache from '../graphics/shader_cache.js';
import TextureCache from '../graphics/texture_cache.js';
import AceVox from '../game/ace_vox.js';
import {Chunk} from '../blocks/chunk.js';
import {vec3, mat4} from 'gl-matrix';
import {Camera} from '../graphics/camera.js';
import {Player} from '../player/player.js';
import {ChunkGroup} from './chunk_group.js';

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
  }

  update(delta) {
    //Run Tick
    this.tick_part += delta;

    if(this.tick_part >= 1000/12) {
      this.tick();
      this.tick_part -= 1000/12;
    }

    //Update Objects
    // TODO: Fix
    this.player.update(timestep);
  }

  render() {
    //TODO: Fix
    var program = ShaderCache.shaders['chunk_basic'].program;
    gl.useProgram(program);
    var MVP = mat4.create();
    mat4.mul(MVP, mat4.create(), this.camera.getVP());

    var mvpLocation = gl.getUniformLocation(program, 'MVP');
    gl.uniformMatrix4fv(mvpLocation, false, this.camera.getVP());
    var sunVecLocation = gl.getUniformLocation(program, 'sunVec');
    gl.uniform3fv(sunVecLocation, vec3.fromValues(Math.sqrt(0.2), -Math.sqrt(0.5), Math.sqrt(0.3)));
    var sunVecLocation = gl.getUniformLocation(program, 'sunCol');
    gl.uniform3fv(sunVecLocation, vec3.fromValues(1, 1, 1));
    var diffuseLocation = gl.getUniformLocation(program, 'atlas')
    gl.uniform1i(diffuseLocation, 0);

    this.chunk_mesh.render();
  }

  tick() {

  }

  addPlayer(player) {
    this.players.push(player);
    this.cGroups.push(new ChunkGroup(player, this));
  }
}
