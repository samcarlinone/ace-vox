import {vec3} from 'gl-matrix';
import KeyboardController from './keyboard_controller.js';
import {Chunk} from '../blocks/chunk.js';

export class Player {
  constructor(world, camera) {
    //Configurations
    this.SPEED = 0.01;
    this.RENDERED = true;
    //Properties
    this.pos = vec3.fromValues(1000, 45, 1000);
    this.tMove = vec3.create();
    this.tSpeed = vec3.create();
    this.tOrigin = vec3.fromValues(0, 0, 0);

    this.hRot = 0;
    this.vRot = 0;

    this.lookVec = vec3.fromValues(1, 0, 0);

    this.controller = KeyboardController;

    if(camera) {
      this.camera = camera;
      camera.pos = this.pos;
      camera.target = this.lookVec;
    }

    this.world = world;

    //Internal Variables
    this.mouse_cooldown = 15;
  }

  update(delta) {
    //Move
    vec3.set(this.tMove, this.controller.getState('vx'), this.controller.getState('vy'), this.controller.getState('vz'));
    vec3.set(this.tSpeed, this.SPEED * delta, this.SPEED * delta, this.SPEED * delta);
    vec3.mul(this.tMove, this.tMove, this.tSpeed);
    vec3.rotateY(this.tMove, this.tMove, this.tOrigin, (3*Math.PI/2)-this.hRot);
    vec3.add(this.pos, this.pos, this.tMove);

    //Look
    this.vRot = Math.max(-80*Math.PI/180, Math.min(this.vRot, 80*Math.PI/180));

    this.lookVec[0] = Math.cos(this.hRot) * Math.cos(this.vRot);
    this.lookVec[1] = Math.sin(this.vRot);
    this.lookVec[2] = Math.sin(this.hRot) * Math.cos(this.vRot);

    //Raycast Testing
    if(this.mouse_cooldown < 15) {
      this.mouse_cooldown--;

      if(this.mouse_cooldown === 0) {
        this.mouse_cooldown = 15;
      }
    }

    if(this.controller.getState('M1') && this.mouse_cooldown === 15) {
      var result = this.world.raycast(this.pos, this.lookVec, 6);

      if(result.type !== undefined) {
        this.world.setBlock(result.hit_pos, Chunk.SUN_AIR);
        this.mouse_cooldown = 14;
      }
    }
  }
}
