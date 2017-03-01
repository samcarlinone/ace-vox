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
    this.chunk = chunk;
    this.id = id;

    this.processing = false;
    this.optimized = false;
    this.pos = this.tex = this.light = new Float32Array(3);

    this.position = {x: 0, y: 0, z:0};
    this.scale = {x: 1, y: 1, z: 1};
  }
}
