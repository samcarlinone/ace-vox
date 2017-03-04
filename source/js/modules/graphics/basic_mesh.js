import AceVox from '../game/ace_vox.js';

export class BasicMesh {

  /**
   * BasicMesh demo code
   * @param  {number[]} vertices The vertices of the mesh
   * @param  {Shader} shader The initialized shader that will render this
   */
  constructor(vertices, shader) {
    var gl = AceVox.gl;

    this.shader = shader;

    this.vertices = new Float32Array(vertices);

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    this.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

    var attribLoc = gl.getAttribLocation(this.shader.program, "a_position");
    gl.enableVertexAttribArray(attribLoc);
    gl.vertexAttribPointer(attribLoc, 3, gl.FLOAT, false, 0, 0);
  }

  render() {
      AceVox.gl.bindVertexArray(this.vao);
      AceVox.gl.drawArrays(AceVox.gl.TRIANGLES, 0, this.vertices.length / 3);
  }
}
