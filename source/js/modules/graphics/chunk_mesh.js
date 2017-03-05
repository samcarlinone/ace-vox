import AceVox from '../game/ace_vox.js';

/**
 * Class containing mesh data for a given chunk
 * -chunk, {Chunk} the chunk this mesh represents
 * -id, {int} the mesh builder id of this mesh
 * -processing, {boolean} flag if the chunk is being worked on by a thread !This flag must be changed externally
 * -optimized, {boolean} flag whether the meshes are optimized !This flag must be changed externally
 * -pos, {Float32Array} mesh position data
 * -tex, {Float32Array} mesh texture data
 * -light, {Float32Array} mesh lighting data data
 * -position, {Vec3} position of chunk in world space
 * -scale, {Vec3} scale of chunk in world space
 */
export class ChunkMesh {
  constructor(id, chunk) {
    //Data properties
    this.chunk = chunk;
    this.id = id;

    this.processing = false;
    this.optimized = false;
    this.pos = this.norm = this.tex = new Float32Array(3);
    this.light = new Uint8Array(3);

    this.position = {x: 0, y: 0, z:0};
    this.scale = {x: 1, y: 1, z: 1};

    //WebGL things
    var gl = AceVox.gl;

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    //Position buffer
    this.posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, this.pos, gl.DYNAMIC_DRAW);

    var pos_location = 0;
    gl.enableVertexAttribArray(pos_location);
    gl.vertexAttribPointer(pos_location, 3, gl.FLOAT, false, 0, 0);

    //Normal buffer
    this.normBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normBuf);
    gl.bufferData(gl.ARRAY_BUFFER, this.norm, gl.DYNAMIC_DRAW);

    var pos_location = 1;
    gl.enableVertexAttribArray(pos_location);
    gl.vertexAttribPointer(pos_location, 3, gl.FLOAT, false, 0, 0);

    //Texture buffer
    this.texBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuf);
    gl.bufferData(gl.ARRAY_BUFFER, this.tex, gl.DYNAMIC_DRAW);

    var tex_location = 2;
    gl.enableVertexAttribArray(tex_location);
    gl.vertexAttribPointer(tex_location, 3, gl.FLOAT, false, 0, 0);

    //Lighting buffer
    this.lightBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.lightBuf);
    gl.bufferData(gl.ARRAY_BUFFER, this.light, gl.DYNAMIC_DRAW);

    var tex_location = 3;
    gl.enableVertexAttribArray(tex_location);
    gl.vertexAttribPointer(tex_location, 3, gl.BYTE, false, 0, 0);
  }


  /**
   * changed - Call this function when the a new mesh has been generated to rebind data
   */
  changed() {
    var gl = AceVox.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, this.pos, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normBuf);
    gl.bufferData(gl.ARRAY_BUFFER, this.norm, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuf);
    gl.bufferData(gl.ARRAY_BUFFER, this.tex, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.lightBuf);
    gl.bufferData(gl.ARRAY_BUFFER, this.light, gl.DYNAMIC_DRAW);
  }


  /**
   * render - binds the vertex array, and calls gl.drawArrays
   */
  render() {
    AceVox.gl.bindVertexArray(this.vao);
    AceVox.gl.drawArrays(AceVox.gl.TRIANGLES, 0, this.pos.length / 3);
  }


  /**
   * destroy - destroys associated buffer data
   */
  destroy() {
    var gl = AceVox.gl;
    gl.deleteBuffer(this.posBuf);
    gl.deleteBuffer(this.normBuf);
    gl.deleteBuffer(this.texBuf);
    gl.deleteBuffer(this.lightBuf);
  }
}
