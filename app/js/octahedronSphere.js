import twgl from 'twgl.js'
import _ from 'lodash'

const v3 = twgl.v3

// icosphere-like sphere, except based on octahedron
// which gives a clean vertical seam for texturing
// based on:
// https://github.com/hughsk/icosphere/blob/master/index.js

export default function octahedronSphere(divisions) {
  let initialPoints = [
    [0,1,0], [0,0,-1], [-1,0,0],
    [0,1,0], [-1,0,0], [0,0,1],
    [0,1,0], [0,0,1], [1,0,0],
    [0,1,0], [1,0,0], [0,0,-1],
    [0,-1,0], [-1,0,0], [0,0,-1],
    [0,-1,0], [0,0,1], [-1,0,0],
    [0,-1,0], [1,0,0], [0,0,1],
    [0,-1,0], [0,0,-1], [1,0,0]
  ]

  let pointLODs = [new Float32Array(_.flatten(initialPoints))]
  for (let i = 0; i < divisions; i++) {
    let current = pointLODs[i]
    let split = new Float32Array(current.length * 4)

    for (let j = 0; j < current.length; j+=3) {
      splitTriangle(current, split, j)
    }

    pointLODs.push(split)
  }

  let points = pointLODs[pointLODs.length - 1]
  let pointUvs = new Float32Array(points.length / 3 * 2)

  for (let i = 0; i < points.length / 3; i+=3) {
    calculateUvs(pointUvs, points, i)
  }

  let index = 0
  let indices = []
  let indexedPoints = new Float32Array(points.length * 3)
  let indexedUvs = new Float32Array(points.length * 2)
  let pointMap = {}

  for (let i = 0; i < points.length / 3; i++) {
    let point = getVec3(points, i)
    let uv = getVec2(pointUvs, i)
    let key = JSON.stringify([point[0], point[1], point[2], uv[0], uv[1]])
    let existingIndex = pointMap[key]
    if (existingIndex === undefined) {
      pointMap[key] = index
      setVec3(indexedPoints, index, point)
      setVec2(indexedUvs, index, uv)
      indices.push(index)
      index += 1;
    }
    else {
      indices.push(existingIndex)
    }
  }

  return {
    indices: indices,
    position: indexedPoints.subarray(0, index * 3),
    texcoord: indexedUvs.subarray(0, index * 2),
    elevation: _.fill(Array(index), 0)
  }
}

function splitTriangle(points, target, offset) {
  var a = getVec3(points, offset)
  var b = getVec3(points, offset + 1)
  var c = getVec3(points, offset + 2)
  var ab = Array.prototype.slice.call(v3.normalize(v3.add(a, b)))
  var bc = Array.prototype.slice.call(v3.normalize(v3.add(b, c)))
  var ca = Array.prototype.slice.call(v3.normalize(v3.add(c, a)))

  setVec3Range(target, offset * 4, [
    a, ab, ca,
    ab, bc, ca,
    ab, b, bc,
    ca, bc, c
  ])
}

function calculateUvs(pointUvs, points, offset) {
  let a = uvPoint(getVec3(points, offset))
  let b = uvPoint(getVec3(points, offset + 1))
  let c = uvPoint(getVec3(points, offset + 2))

  let min = Math.min(a[0], b[0], c[0])
  let max = Math.max(a[0], b[0], c[0])

  // Seam triangle will span almost the whole range from 0 to 1.
  // Fix seam by clamping the high values to 0.
  if (max - min > 0.5) {
    a[0] = a[0] == 1 ? 0 : a[0]
    b[0] = b[0] == 1 ? 0 : b[0]
    c[0] = c[0] == 1 ? 0 : c[0]
  }

  setVec2Range(pointUvs, offset, [a, b, c])
}

function uvPoint(p) {
  return [
    (Math.atan2(p[0], p[2]) / (2 * Math.PI)) + 0.5,
    1.0 - ((Math.asin(p[1]) / Math.PI) + 0.5)
  ]
}

function getVec2(data, offset) {
  let begin = offset * 2
  return data.slice(begin, begin +2)
}

function setVec2Range(data, offset, range) {
  for (let i = 0; i < range.length; i++) {
    setVec2(data, offset + i, range[i])
  }
}

function setVec2(data, offset, entry) {
  data[offset * 2] = entry[0]
  data[offset * 2 + 1] = entry[1]
}

function getVec3(data, offset) {
  let begin = offset * 3
  return data.slice(begin, begin + 3)
}

function setVec3Range(data, offset, range) {
  for (let i = 0; i < range.length; i++) {
    setVec3(data, offset + i, range[i])
  }
}

function setVec3(data, offset, entry) {
  data[offset * 3] = entry[0]
  data[offset * 3 + 1] = entry[1]
  data[offset * 3 + 2] = entry[2]
}
