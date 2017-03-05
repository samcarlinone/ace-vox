import ShaderCache from '../graphics/shader_cache.js';
import TextureCache from '../graphics/texture_cache.js';
import AceVox from '../game/ace_vox.js';
import {BasicMesh} from '../graphics/basic_mesh.js';
import {Chunk} from '../blocks/chunk.js';
import MeshBuilder from '../graphics/mesh_builder.js';
import {vec3, mat4} from 'gl-matrix';
import {Camera} from '../graphics/camera.js';
import {Player} from '../player/player.js';
import {World} from '../blocks/world.js';

export class BasicModule {
  constructor() {
    this.player = new Player();
    this.camera = new Camera(this.player);

    this.world = new World("overworld-0.0.1");
  }

  render() {
    var gl = AceVox.gl;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //gl.useProgram(this.shader.program);
    //this.basic_mesh.render();

    this.world.update();
  }

  update(timestep) {
    this.world.update();
    //Actual important
    MeshBuilder.update();
  }

  mouseMove(e) {
    this.player.hRot += e.movementX / 200;
    this.player.vRot -= e.movementY / 200;
  }
}
