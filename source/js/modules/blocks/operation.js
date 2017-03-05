export class Operation {
  static get GEN_DATA() { return 0; }

  constructor(type, target, args) {
    this.type = type;
    this.target = target;
    this.args = args;
  }
}
