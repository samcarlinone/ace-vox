import MeshBuilder from '../graphics/mesh_builder.js';
import {Camera} from '../graphics/camera.js';
import {Player} from '../player/player.js';
import {World} from '../blocks/world.js';

export class BasicModule {
  constructor() {
    this.camera = new Camera();
    this.player = new Player(this.camera);

    this.world = new World("overworld-0.0.1");
    this.world.addPlayer(this.player);
    window.world = this.world;
  }

  render() {
    var gl = AceVox.gl;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.world.render();
  }

  update(delta) {
    this.world.update(delta);
    //Actual important
    MeshBuilder.update();
  }

  mouseMove(e) {
    this.player.hRot += e.movementX / 200;
    this.player.vRot -= e.movementY / 200;
  }
}
