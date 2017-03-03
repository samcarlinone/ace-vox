import {vec3} from 'gl-matrix';
import {KeyboardController} from './keyboard_controller.js';

export class Player {
  constructor() {
    this.pos = vec3.fromValues(30, 45, 30);

    this.hRot = 0;
    this.vRot = 0;

    this.lookVec = vec3.fromValues(1, 0, 0);

    this.controller = new KeyboardController();
  }

  update(delta) {
    //Move
    this.pos[0] += this.controller.getState['vx'] * delta / 100;

    //Look
    this.vRot = Math.max(-80*Math.PI/180, Math.min(this.vRot, 80*Math.PI/180));

    this.lookVec[0] = Math.cos(this.hRot) * Math.cos(this.vRot);
    this.lookVec[1] = Math.sin(this.vRot);
    this.lookVec[2] = Math.sin(this.hRot) * Math.cos(this.vRot);
  }
}
