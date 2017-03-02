import ShaderCache from './shader_cache.js';
import AceVox from './ace_vox.js';
import {BasicMesh} from './basic_mesh.js';
import {Chunk} from './chunk.js';
import MeshBuilder from './mesh_builder.js';
import {vec3, mat4} from 'gl-matrix';

export class BasicModule {
  constructor() {
    this.shader = ShaderCache.shaders['trs'];

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
    var matrix = mat4.create();
    mat4.perspective(matrix, 90, 16/9, 0.1, 100);
    mat4.translate(matrix, matrix, vec3.fromValues(window.pos.x, window.pos.y, window.pos.z));

    var mvpLocation = gl.getUniformLocation(program, 'MVP');
    gl.uniformMatrix4fv(mvpLocation, false, matrix);
    this.chunk_mesh.render();
  }

  update(timestep) {
    MeshBuilder.update();
  }
}
