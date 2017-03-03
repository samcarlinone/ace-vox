import {vec3} from 'gl-matrix';

export class Player {
  constructor() {
    this.pos = vec3.create();

    this.hRot = 0;
    this.vRot = 0;

    this.lookVec = vec3.fromValues(1, 0, 0);
  }

  update(delta) {
    this.lookVec[0] = Math.cos(this.hRot);
    this.lookvec[1] = Math.sin(this.vRot);
    this.lookVec[2] = Math.sin(this.hRot);
  }
}
