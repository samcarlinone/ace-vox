import ShaderCache from '../graphics/shader_cache.js';
import TextureCache from '../graphics/texture_cache.js';
import AceVox from '../game/ace_vox.js';
import {Chunk} from './chunk.js';
import {PosStore} from './pos_store.js';
import {vec3, mat4} from 'gl-matrix';
import {Camera} from '../graphics/camera.js';
import {Player} from '../player/player.js';
import ChunkBuilder from './chunk_builder.js';
import {ChunkGroup} from './chunk_group.js';
import {traceRay} from './raycast.js';
import MeshBuilder from '../graphics/mesh_builder.js';
import operate from './operator.js';

/**
 * Class representing a world or realm
 *
 * high level variables
 * -realm, {String} representing the world type
 * -seed, {float} from [0-1)
 * -players {Player[]}
 * -chunkStore {PosStore} holds chunks by position for rapid position based access
 * -cGroups {ChunkGroup[]} chunk groups around active players
 * -aChunks {Chunk[]} chunks with active blocks currently being simulated
 * -entities {Entity[]} active entities in this world
 *
 * internal variables
 * -tick_part {float} how long since last tick
 */
export class World {
  constructor(realm, seed) {
    //High level
    this.realm = realm;
    this.seed = seed;

    this.players = [];
    this.chunkStore = new PosStore();
    this.cGroups = [];
    this.aChunks = [];

    this.entities = [];

    //Internal
    this.tick_part = 0;

    //GL Variables
    var gl = AceVox.gl;
    this.program = ShaderCache.shaders['chunk_basic'].program;
    this.mvpLocation = gl.getUniformLocation(this.program, 'MVP');
    this.sunVecLocation = gl.getUniformLocation(this.program, 'sunVec');
    this.sunColLocation = gl.getUniformLocation(this.program, 'sunCol');
    this.atlasLocation = gl.getUniformLocation(this.program, 'atlas');
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
          if(!this.cGroups[i].meshes[j].chunk.requireRebuild) {
            var MVP = mat4.create();
            mat4.mul(MVP, MVP, this.cGroups[i].player.camera.getVP());
            mat4.translate(MVP, MVP, this.cGroups[i].meshes[j].chunk.position);
            gl.uniformMatrix4fv(this.mvpLocation, false, MVP);

            this.cGroups[i].meshes[j].render();
          }
        }
      }
    }
  }

  tick() {

  }

  addPlayer(player) {
    this.players.push(player);
    this.cGroups.push(new ChunkGroup(player, this));
  }

  //===================================================================[Chunk and Block Accessing]

  /**
   * posToChunk - Gets a chunk position from a world position
   *
   * @param  {vec3} pos world position
   * @return {vec3}     Resulting position
   */
  posToChunk(pos) {
    var new_pos = vec3.create();
    new_pos[0] = Math.floor(pos[0]/64)*64;
    new_pos[1] = Math.floor(pos[1]/64)*64;
    new_pos[2] = Math.floor(pos[2]/64)*64;
    return new_pos;
  }

  /**
   * posToBlock - Gets a chunk data index from a world position
   *
   * @param  {vec3} pos world position
   * @return {float}     data index
   */
  posToBlock(pos) {
    return (Math.floor(pos[0])%64) + (Math.floor(pos[2])%64)*Chunk.SIZE_1 + (Math.floor(pos[1])%64)*Chunk.SIZE_2;
  }

  /**
   * getBlock - Gets a block
   *
   * @param  {vec3|float} x Position vector or x
   * @param  {float=} y only needed for 3 float mode
   * @param  {float=} z only needed for 3 float mode
   * @return {Int32}   returns only the block value
   */
  getBlock(x, y, z) {
    var pos = x;

    if(y !== undefined) {
      pos = vec3.fromValues(x, y, z);
    }

    var chunk = this.chunkStore.getObj(this.posToChunk(pos));

    if(chunk === -1 || chunk.locked) {
      return undefined;
    }

    return chunk.data[this.posToBlock(pos)] & Chunk.BLOCK_MASK;
  }


  /**
   * setBlock - Set a block value at a world position
   *
   * @param  {vec3|float} x  Position vector or x
   * @param  {float|Int32} y   y or val
   * @param  {float=} z   z if 3 floats passed in
   * @param  {float=} val block value if 3 float version
   * @return {Int32}     returns passed in value or undefined if write could not be performed
   */
  setBlock(x, y, z, val) {
    var pos = x;
    var v = y;

    if(z !== undefined) {
      pos = vec3.fromValues(x, y, z);
      v = val;
    }

    var chunk = this.chunkStore.getObj(this.posToChunk(pos));

    if(chunk === -1 || chunk.locked) {
      return undefined;
    }

    chunk.data[this.posToBlock(pos)] = v;
    chunk.dirty = true;

    x = Math.floor(pos[0])%64;
    y = Math.floor(pos[1])%64;
    z = Math.floor(pos[2])%64;

    if(x === 0 || x === 63) {
      chunk.opQueue.push(ChunkBuilder.UPDATE_1B, [(x%63===0)?(x===0?-1:1):0, 0, 0, x, y, z]);
    }

    if(y === 0 || y === 63) {
      chunk.opQueue.push(ChunkBuilder.UPDATE_1B, [0, (y%63===0)?(y===0?-1:1):0, 0, x, y, z]);
    }

    if(z === 0 || z === 63) {
      chunk.opQueue.push(ChunkBuilder.UPDATE_1B, [0, 0, (z%63===0)?(z===0?-1:1):0, x, y, z]);
    }

    return v;
  }


  /**
   * raycast - Raycast against this world
   *
   * @param  {vec3} pos    Position !!! Must be positive vector !!!
   * @param  {vec3} dir    Direction
   * @param  {float} length Distance to Cast
   * @return {Object}        Object: type (block value), hit_pos (vec3), hit_norm (vec3)
   */
  raycast(pos, dir, length) {
    var result = {type: undefined, hit_pos: vec3.create(), hit_norm: vec3.create()};

    result.type = traceRay((x, y, z) => { return this.getBlock(x, y, z); }, pos, dir, length, result.hit_pos, result.hit_norm);

    if(result.hit_norm[0] > 0) {
      result.hit_pos[0] -= 1;
    }

    if(result.hit_norm[1] > 0) {
      result.hit_pos[1] -= 1;
    }

    if(result.hit_norm[2] > 0) {
      result.hit_pos[2] -= 1;
    }

    return result;
  }
}
