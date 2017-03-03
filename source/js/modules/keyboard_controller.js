export class KeyboardController {
  constructor() {
    //Keyboard stuff
    this.state = {vx: [0], vy: [0]};
    this.key = [{code: [87], val: -1, prop: "vy"},
                {code: [65], val: -1, prop: "vx"},
                {code: [83], val:  1, prop: "vy"},
                {code: [68], val:  1, prop: "vx"}];

  }

  getState(name) {
    return this.state[name][0];
  }

  keyDown(e) {
    //console.log(e.keyCode);

    for(var i=0; i<this.key.length; i++) {
      if(this.key[i].code.indexOf(e.keyCode) != -1) {
        if(this.state[this.key[i].prop].indexOf(this.key[i].val) == -1)
          this.state[this.key[i].prop].unshift(this.key[i].val);

        return true;
      }
    }
  }

  keyUp(e) {
    for(var i=0; i<this.key.length; i++) {
      if(this.key[i].code.indexOf(e.keyCode) != -1) {
        var index = this.state[this.key[i].prop].indexOf(this.key[i].val);

        if(index != -1)
          this.state[this.key[i].prop].splice(index, 1);

        return true;
      }
    }
  }
}
