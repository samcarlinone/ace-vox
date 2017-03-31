import {vec3, mat4} from 'gl-matrix';
import KeyboardController from './keyboard_controller.js';
import {Chunk} from '../blocks/chunk.js';
import {BlockOutline} from '../graphics/block_outline.js';
import Collision from '../game/collision.js';

export class Player {
  constructor(world, camera) {
    //Configurations
    this.SPEED = 0.01;
    this.RENDERED = true;
    //Properties
    this.pos = vec3.fromValues(1000, 128, 1000);
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

      this.outline = new BlockOutline();
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

    //Use tSpeed as temp
    vec3.set(this.tSpeed, Math.floor(this.pos[0]), Math.floor(this.pos[1]), Math.floor(this.pos[2]));

    if(this.tMove[1] !== 0) {
      for(var x=-1; x<2; x++) {
        for(var z=-1; z<2; z++) {
          var bPos = [this.tSpeed[0]+x, this.tSpeed[1]+Math.sign(this.tMove[1]), this.tSpeed[2]+z];
          var val = this.world.getBlock(bPos);

          if(val > 0) {
            this.result = vec3.create();

            if(Collision.boxSphere(bPos, [bPos[0]+1, bPos[1]+1, bPos[2]+1], this.pos, 0.5, this.result)) {
              vec3.add(this.pos, this.pos, this.result);
            }
          }
        }
      }
    }

    //Look
    this.vRot = Math.max(-85*Math.PI/180, Math.min(this.vRot, 85*Math.PI/180));

    this.lookVec[0] = Math.cos(this.hRot) * Math.cos(this.vRot);
    this.lookVec[1] = Math.sin(this.vRot);
    this.lookVec[2] = Math.sin(this.hRot) * Math.cos(this.vRot);

    if(this.camera)
      vec3.add(this.outline.pos, this.pos, vec3.fromValues(2, 0, 0));

    //Raycast Testing
    if(this.mouse_cooldown < 15) {
      this.mouse_cooldown--;

      if(this.mouse_cooldown === 0) {
        this.mouse_cooldown = 15;
      }
    }

    var result = this.world.raycast(this.pos, this.lookVec, 8);

    if(result.type !== undefined) {
      this.outline.doRender = true;

      this.outline.pos[0] = Math.floor(result.hit_pos[0]);
      this.outline.pos[1] = Math.floor(result.hit_pos[1]);
      this.outline.pos[2] = Math.floor(result.hit_pos[2]);

      if(this.controller.getState('M1') && this.mouse_cooldown === 15) {
        this.world.setBlock(result.hit_pos, Chunk.SUN_AIR);
        this.mouse_cooldown = 14;
      }

      if(this.controller.getState('M2') && this.mouse_cooldown === 15) {
        this.world.setBlock(result.hit_pos[0]+result.hit_norm[0], result.hit_pos[1]+result.hit_norm[1], result.hit_pos[2]+result.hit_norm[2], 1);
        this.mouse_cooldown = 14;
      }
    } else {
      this.outline.doRender = false;
    }
  }

  render(gl) {
    if(!this.camera)
      return;

    if(this.outline.doRender) {
      gl.useProgram(this.outline.program);
      var MVP = mat4.create();
      mat4.mul(MVP, MVP, this.camera.getVP());
      mat4.translate(MVP, MVP, this.outline.pos);
      gl.uniformMatrix4fv(this.outline.mvpLocation, false, MVP);
      this.outline.render(this.world, this.pos);
    }
  }
}
