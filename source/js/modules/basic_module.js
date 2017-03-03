import ShaderCache from './shader_cache.js';
import TextureCache from './texture_cache.js';
import AceVox from './ace_vox.js';
import {BasicMesh} from './basic_mesh.js';
import {Chunk} from './chunk.js';
import MeshBuilder from './mesh_builder.js';
import {vec3, mat4} from 'gl-matrix';
import {Camera} from './camera.js';
import {Player} from './player.js';

export class BasicModule {
  constructor() {
    this.shader = ShaderCache.shaders['trs'];

    window.player = this.player = new Player();
    window.camera = this.camera = new Camera();

    this.camera.target = this.player.lookVec;

    window.pos = {x: 0, y: 0, z:-110};

    this.basic_mesh = new BasicMesh([0, 1, 0,
                                     1, 0, 0,
                                     1, 1, 0], this.shader);

    this.chunk = new Chunk();

    for(var x=0; x<64; x++) {
      for(var y=0; y<64; y++) {
        for(var z=0; z<64; z++) {
          var p = x + z*64 + y*4096;

          if(x % 3 == 0 && y > 30)
            this.chunk.data[p] = Chunk.AIR+1;

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
    gl.uniformMatrix4fv(mvpLocation, false, MVP);
    var diffuseLocation = gl.getUniformLocation(program, 'atlas')
    gl.uniform1i(diffuseLocation, 0);

    this.chunk_mesh.render();
  }

  update(timestep) {
    MeshBuilder.update();

    this.player.update();
  }
}
