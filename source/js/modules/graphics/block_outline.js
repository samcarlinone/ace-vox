import AceVox from '../game/ace_vox.js';
import ShaderCache from '../graphics/shader_cache.js';
import {vec3} from 'gl-matrix';

export class BlockOutline {
  constructor() {
    var gl = AceVox.gl;

    this.doRender = false;

    this.pos = vec3.create();
    this.program = ShaderCache.shaders['outline'].program;
    this.mvpLocation = gl.getUniformLocation(this.program, 'MVP');

    var verts = [
      0, 0, 0,
      1, 0, 0,

      0, 0, 0,
      0, 0, 1,

      0, 0, 1,
      1, 0, 1,

      1, 0, 0,
      1, 0, 1,

      0, 1, 0,
      1, 1, 0,

      0, 1, 0,
      0, 1, 1,

      0, 1, 1,
      1, 1, 1,

      1, 1, 0,
      1, 1, 1,

      0, 0, 0,
      0, 1, 0,

      1, 0, 0,
      1, 1, 0,

      0, 0, 1,
      0, 1, 1,

      1, 0, 1,
      1, 1, 1
    ];

    var tolerance = 0.0025;

    for(var i=0; i<verts.length; i++) {
      if(verts[i] === 0) {
        verts[i] -= tolerance;
      } else {
        verts[i] += tolerance;
      }
    }

    this.vertices = new Float32Array(verts);

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    this.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

    var pos_location = 0;
    gl.enableVertexAttribArray(pos_location);
    gl.vertexAttribPointer(pos_location, 3, gl.FLOAT, false, 0, 0);
  }

  render() {
      //AceVox.gl.depthRange(0, 0.1);
      AceVox.gl.bindVertexArray(this.vao);
      AceVox.gl.drawArrays(AceVox.gl.LINES, 0, this.vertices.length / 3);
      //AceVox.gl.depthRange(0, 1);
  }
}
