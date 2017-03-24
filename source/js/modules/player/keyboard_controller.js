class KeyboardController {
  static get M1() { return 0; }
  static get M2() { return 2; }

  constructor() {
    //Keyboard stuff
    this.state = {vx: [0], vy: [0], vz: [0], M1: [0], M2: [0]};
    this.key = [
      {code: [65], val: -1, prop: "vx"},
      {code: [69], val: -1, prop: "vy"},
      {code: [87], val: -1, prop: "vz"},
      {code: [68], val:  1, prop: "vx"},
      {code: [81], val:  1, prop: "vy"},
      {code: [83], val:  1, prop: "vz"},
      {code: [KeyboardController.M1], val: 1, prop: "M1"},
      {code: [KeyboardController.M2], val: 1, prop: "M2"}
    ];

    // W: 87
    // S: 83
    // A: 65
    // D: 68
    // Q: 81
    // E: 69

    //Register Events
    window.addEventListener('keydown', (e) => {this.keyDown(e)}, false);
    window.addEventListener('keyup', (e) => {this.keyUp(e)}, false);
    window.addEventListener('mousedown', (e) => {this.keyDown(e)}, false);
    window.addEventListener('mouseup', (e) => {this.keyUp(e)}, false);
  }

  getState(name) {
    return this.state[name][0];
  }

  keyDown(e) {
    if(e.keyCode === undefined)
      e.keyCode = e.button;

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
    if(e.keyCode === undefined)
      e.keyCode = e.button;

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

export default (new KeyboardController);
