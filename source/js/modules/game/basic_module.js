import ShaderCache from '../graphics/shader_cache.js';
import TextureCache from '../graphics/texture_cache.js';
import AceVox from '../game/ace_vox.js';
import {BasicMesh} from '../graphics/basic_mesh.js';
import {Chunk} from '../blocks/chunk.js';
import MeshBuilder from '../graphics/mesh_builder.js';
import {vec3, mat4} from 'gl-matrix';
import {Camera} from '../graphics/camera.js';
import {Player} from '../player/player.js';

export class BasicModule {
  constructor() {
    this.shader = ShaderCache.shaders['trs'];

    window.player = this.player = new Player();
    window.camera = this.camera = new Camera();

    this.camera.target = this.player.lookVec;
    this.camera.pos = this.player.pos;

    this.anim = 0;

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

    window.chunk = this.chunk;

    this.chunk_mesh = MeshBuilder.createMesh(this.chunk);
  }

  render() {
    var gl = AceVox.gl;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //gl.useProgram(this.shader.program);
    //this.basic_mesh.render();

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

  update(timestep) {
    //Actual important
    MeshBuilder.update();

    this.player.update(timestep);
  }

  mouseMove(e) {
    this.player.hRot += e.movementX / 200;
    this.player.vRot -= e.movementY / 200;
  }
}
