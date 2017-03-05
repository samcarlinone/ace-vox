import {vec3, mat4} from 'gl-matrix';
import AceVox from '../game/ace_vox.js';

export class Camera {
  constructor(player) {
    if(!player)
      var player = {};

    this.pos = player.pos || vec3.fromValues(30, 60, 30);
    this.target = player.lookVec || vec3.fromValues(0, 0, 0);
    this.up = vec3.fromValues(0, 1, 0);

    this.FOV = 100;
    this.NEAR = 0.01;
    this.FAR = 300;

    //TEMP variables for getVP
    this.V = mat4.create();
    this.rel_target = vec3.create();
    this.P = mat4.create();
    this.result = mat4.create();
  }

  get FOVY() {
    return Math.atan( Math.tan((this.FOV*Math.PI/180) / 2) * (AceVox.game_size[1] / AceVox.game_size[0]) ) * 2;
  }

  getVP() {
    vec3.add(this.rel_target, this.pos, this.target);

    mat4.lookAt(this.V, this.pos, this.rel_target, this.up);
    mat4.perspective(this.P, this.FOVY, AceVox.game_size[0] / AceVox.game_size[1], this.NEAR, this.FAR);

    mat4.mul(this.result, this.P, this.V);

    return this.result;
  }
}
