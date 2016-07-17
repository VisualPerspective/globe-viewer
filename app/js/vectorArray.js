// Utilities for managing an array of vec2 or vec3
// using a one-dimensional TypedArray

export class Vec2Array {
  constructor(data) {
    this.data = data
    this.length = data.length / 2
  }

  get(offset) {
    let begin = offset * 2
    return this.data.slice(begin, begin + 2)
  }

  setRange(offset, range) {
    for (let i = 0; i < range.length; i++) {
      this.set(offset + i, range[i])
    }
  }

  set(offset, entry) {
    this.data[offset * 2] = entry[0]
    this.data[offset * 2 + 1] = entry[1]
  }
}


export class Vec3Array {
  constructor(data) {
    this.data = data
    this.length = data.length / 3
  }

  get(offset) {
    let begin = offset * 3
    return this.data.slice(begin, begin + 3)
  }

  setRange(offset, range) {
    for (let i = 0; i < range.length; i++) {
      this.set(offset + i, range[i])
    }
  }

  set(offset, entry) {
    this.data[offset * 3] = entry[0]
    this.data[offset * 3 + 1] = entry[1]
    this.data[offset * 3 + 2] = entry[2]
  }
}
