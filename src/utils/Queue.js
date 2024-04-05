export default class Queue {
  head = null;
  tail = null;

  enqueue(data) {
    const node = new Node(data);
    if (this.head === null) {
      this.head = node;
    } else {
      this.tail.next = node;
    }
    this.tail = node;
    return data;
  }

  dequeue() {
    if (this.head === null) {
      return null;
    } else {
      const data = this.head.data;
      this.head = this.head.next;
      return data;
    }
  }
}

class Node {
  next = null;
  data;
  constructor(data) {
    this.data = data;
  }
}
