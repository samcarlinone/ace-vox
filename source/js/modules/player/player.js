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
    this.result = vec3.create();

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
    this._cDir = vec3.create();

    this.lookDir = document.querySelector("#lookDir");
  }

  update(delta) {
    //Look
    this.vRot = Math.max(-85*Math.PI/180, Math.min(this.vRot, 85*Math.PI/180));

    this.lookVec[0] = Math.cos(this.hRot) * Math.cos(this.vRot);
    this.lookVec[1] = Math.sin(this.vRot);
    this.lookVec[2] = Math.sin(this.hRot) * Math.cos(this.vRot);

    if(this.camera)
      vec3.add(this.outline.pos, this.pos, vec3.fromValues(2, 0, 0));

    //DEBUG: Look dir
    this.lookDir.innerText = vec3.dot(vec3.fromValues(1, 0, 0), this.lookVec);

    //Move
    vec3.set(this.tMove, this.controller.getState('vx'), this.controller.getState('vy'), this.controller.getState('vz'));
    vec3.set(this.tSpeed, this.SPEED * delta, this.SPEED * delta, this.SPEED * delta);
    vec3.mul(this.tMove, this.tMove, this.tSpeed);
    vec3.rotateY(this.tMove, this.tMove, this.tOrigin, (3*Math.PI/2)-this.hRot);
    vec3.add(this.pos, this.pos, this.tMove);

    this.checkCollision();

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

  checkCollision() {
    vec3.set(this.tSpeed, Math.floor(this.pos[0]), Math.floor(this.pos[1]), Math.floor(this.pos[2]));
    vec3.set(this._cDir, this.pos[0]%1>=0.5?1:-1, this.pos[1]%1>=0.5?1:-1, this.pos[2]%1>=0.5?1:-1);

    var origX = this.pos[0];
    var origY = this.pos[1];
    var origZ = this.pos[2];

    var score = this.resolveCollisionXZ();
    var resY = this.resolveCollisionY();

    this.pos[0] = origX;
    this.pos[2] = origZ;

    var resY2 = this.resolveCollisionY();
    this.pos[1] = (resY2===undefined?this.pos[1]:resY2);
    var score2 = this.resolveCollisionXZ();

    if((resY2===undefined?0:1)+score2 > (resY===undefined?0:1)+score) {
      this.pos[0] = origX;
      this.pos[1] = origY;
      this.pos[2] = origZ;

      this.resolveCollisionXZ();
      resY2 = this.resolveCollisionY();
      this.pos[1] = (resY2===undefined?this.pos[1]:resY2);
    }
  }

  resolveCollisionXZ() {
    var resX = this.checkCollisionX();
    var resZ = this.checkCollisionZ();

    if(resX === undefined && resZ === undefined) {
      return 0;
    }

    if(resX !== undefined && resZ !== undefined) {
      //Resolve if possible
      var orgX = this.pos[0];

      this.pos[0] = resX;

      if(this.checkCollisionZ() === undefined) {
        return 1;
      }

      this.pos[0] = orgX;
      this.pos[2] = resZ;

      if(this.checkCollisionX() === undefined) {
        return 1;
      }

      this.pos[0] = resX;
      return 2;
    }

    this.pos[0] = resX?resX:this.pos[0];
    this.pos[2] = resZ?resZ:this.pos[2];

    return 1;
  }

  resolveCollisionY() {
    var xPer = this.pos[0]%1;
    var zPer = this.pos[2]%1;

    if(this.pos[1]%1 < 0.5) {
      //Check below
      for(var x=(xPer<0.375?-1:0); x<(xPer>0.625?2:1); x++) {
        for(var z=(zPer<0.375?-1:0); z<(zPer>0.625?2:1); z++) {
          var bPos = vec3.fromValues(this.tSpeed[0]+x, this.tSpeed[1]-2, this.tSpeed[2]+z);
          if(this.world.getBlock(bPos)) {
            return this.tSpeed[1]+0.5;
          }
        }
      }
    }

    if(this.pos[1]%1 > 0.75) {
      //Check above
      for(var x=(xPer<0.375?-1:0); x<(xPer>0.625?2:1); x++) {
        for(var z=(zPer<0.375?-1:0); z<(zPer>0.625?2:1); z++) {
          var bPos = vec3.fromValues(this.tSpeed[0]+x, this.tSpeed[1]+1, this.tSpeed[2]+z);
          if(this.world.getBlock(bPos)) {
            return this.tSpeed[1]+0.75;
          }
        }
      }
    }

    return undefined;
  }

  checkCollisionX() {
    if(this.pos[0]%1<0.375 || 0.625<this.pos[0]%1) {
      for(var i=(this.pos[1]%1<0.5?-2:-1); i<(this.pos[1]%1>0.75?2:1); i++) {
        var bPos = vec3.fromValues(this.tSpeed[0]+this._cDir[0], this.tSpeed[1]+i, this.tSpeed[2]);
        var corrected = this.tSpeed[0]+(this._cDir[0]===-1?0.375:0.625);
        if(this.world.getBlock(bPos)) {
          return corrected;
        }

        if(this.pos[2]%1<0.375) {
          var bPos = vec3.fromValues(this.tSpeed[0]+this._cDir[0], this.tSpeed[1]+i, this.tSpeed[2]-1);
          if(this.world.getBlock(bPos)) {
            return corrected
          }
        }

        if(this.pos[2]%1>0.625) {
          var bPos = vec3.fromValues(this.tSpeed[0]+this._cDir[0], this.tSpeed[1]+i, this.tSpeed[2]+1);
          if(this.world.getBlock(bPos)) {
            return corrected;
          }
        }
      }
    }

    return undefined;
  }

  checkCollisionZ() {
    if(this.pos[2]%1<0.375 || 0.625<this.pos[2]%1) {
      for(var i=(this.pos[1]%1<0.5?-2:-1); i<(this.pos[1]%1>0.75?2:1); i++) {
        var bPos = vec3.fromValues(this.tSpeed[0], this.tSpeed[1]+i, this.tSpeed[2]+this._cDir[2]);
        var corrected = this.tSpeed[2]+(this._cDir[2]===-1?0.375:0.625);
        if(this.world.getBlock(bPos)) {
          return corrected;
        }

        if(this.pos[0]%1<0.375) {
          var bPos = vec3.fromValues(this.tSpeed[0]-1, this.tSpeed[1]+i, this.tSpeed[2]+this._cDir[2]);
          if(this.world.getBlock(bPos)) {
            return corrected;
          }
        }

        if(this.pos[0]%1>0.625) {
          var bPos = vec3.fromValues(this.tSpeed[0]+1, this.tSpeed[1]+i, this.tSpeed[2]+this._cDir[2]);
          if(this.world.getBlock(bPos)) {
            return corrected;
          }
        }
      }
    }

    return undefined;
  }
}
