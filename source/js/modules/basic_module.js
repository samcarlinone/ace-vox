import ShaderCache from './shader_cache.js';
import AceVox from './ace_vox.js';
import {BasicMesh} from './basic_mesh.js';

export class BasicModule {
  constructor() {
    this.shader = ShaderCache.shaders['trs'];

    console.log(this.shader);

    this.basic_mesh = new BasicMesh([0, 1, 0,
                                     1, 0, 0,
                                     1, 1, 0], this.shader);
  }

  render() {
    var gl = AceVox.gl;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.useProgram(this.shader.program);

    this.basic_mesh.render();
  }

  update(timestep) {

  }
}
