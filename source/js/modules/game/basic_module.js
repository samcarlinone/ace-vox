import MeshBuilder from '../graphics/mesh_builder.js';
import ChunkBuilder from '../blocks/chunk_builder.js';
import {Camera} from '../graphics/camera.js';
import {Player} from '../player/player.js';
import {World} from '../blocks/world.js';

export class BasicModule {
  constructor() {
    this.world = new World("overworld-0.0.1");
    window.world = this.world;

    this.camera = new Camera();
    this.player = new Player(this.world, this.camera);
    this.world.addPlayer(this.player);
  }

  render() {
    var gl = AceVox.gl;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.world.render();
  }

  update(delta) {
    //Perform updates
    this.world.update(delta);
  }

  process() {
    //High-CPU tasks
    ChunkBuilder.update();
    MeshBuilder.update();
  }

  mouseMove(e) {
    this.player.hRot += e.movementX / 200;
    this.player.vRot -= e.movementY / 200;
  }
}
