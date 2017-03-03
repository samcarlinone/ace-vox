import {vec3, mat4} from 'gl-matrix';
import AceVox from './ace_vox.js';

export class Camera {
  constructor() {
    this.pos = vec3.create();

    this.target = vec3.fromValues(1, 0, 0);

    this.up = vec3.fromValues(0, 1, 0);
  }

  getVP() {
    var V = mat4.create();
    mat4.lookAt(V, this.pos, this.target, this.up);

    var P = mat4.create();
    mat4.perspective(P, 100*Math.PI/180, AceVox.game_size[0] / AceVox.game_size[1], 0.01, 100);

    var val = mat4.create();
    mat4.mul(val, V, P);

    return val;
  }
}
