class myQueue {
  constructor() {
    this.data = [];
    this.pos = 0;
  }

  size() {
    return this.data.length - this.pos;
  }

  empty() {
    return this.pos == this.data.length;
  }

  push(v) {
    this.data.push(v);
  }

  front() {
    return this.data[this.pos];
  }

  pop() {
    this.pos++;
  }
}
