import twgl from 'twgl.js'

const v3 = twgl.v3

// icosphere-like sphere, except based on octahedron
// which gives a clean vertical seam for texturing
// based on:
// https://github.com/hughsk/icosphere/blob/master/index.js

export default function octahedronSphere(divisions) {
  let initialPoints = [
    [0,1,0], [-1,0,0], [0,0,-1],
    [0,1,0], [0,0,1], [-1,0,0],
    [0,1,0], [1,0,0], [0,0,1],
    [0,1,0], [0,0,-1], [1,0,0],
    [0,-1,0], [0,0,-1], [-1,0,0],
    [0,-1,0], [-1,0,0], [0,0,1],
    [0,-1,0], [0,0,1], [1,0,0],
    [0,-1,0], [1,0,0], [0,0,-1]
  ]

  let pointLODs = [initialPoints]
  for (let i = 0; i < divisions; i++) {
    let current = pointLODs[i]
    let split = []

    for (let j = 0; j < current.length; j+=3) {
      split = split.concat(splitTriangle(current, j))
    }

    pointLODs.push(split)
  }

  let points = pointLODs[pointLODs.length - 1]
  var pointUvs = []
  for (let i = 0; i < points.length; i+=3) {
    pointUvs = pointUvs.concat(calculateUvs(points, i))
  }

  let index = 0
  let indices = []
  let indexedPoints = []
  let indexedUvs = []
  let pointMap = {}

  for (var i = 0; i < points.length; i++) {
    let point = points[i]
    let uv = pointUvs[i]
    let key = JSON.stringify([point, uv])
    let existingIndex = pointMap[key]
    if (existingIndex === undefined) {
      pointMap[key] = index
      indexedPoints.push(point)
      indexedUvs.push(uv)
      indices.push(index)
      index += 1;
    }
    else {
      indices.push(existingIndex)
    }
  }

  return {
    indices: indices,
    position: indexedPoints,
    texcoord: indexedUvs
  }
}

function splitTriangle(points, offset) {
  var a = points[offset]
  var b = points[offset + 1]
  var c = points[offset + 2]
  var ab = Array.prototype.slice.call(v3.normalize(v3.add(a, b)))
  var bc = Array.prototype.slice.call(v3.normalize(v3.add(b, c)))
  var ca = Array.prototype.slice.call(v3.normalize(v3.add(c, a)))
  return [
    ca, ab, a,
    c, bc, ca,
    bc, ab, ca,
    b, ab, bc
  ]
}

function calculateUvs(points, offset) {
  let a = uvPoint(...points[offset])
  let b = uvPoint(...points[offset + 1])
  let c = uvPoint(...points[offset + 2])

  let min = Math.min(a[0], b[0], c[0])
  let max = Math.max(a[0], b[0], c[0])

  // Seam triangle will span almost the whole range from 0 to 1.
  // Fix seam by clamping the high values to 0.
  if ((max - min) > 0.5) {
    a[0] = a[0] > 0.5 ? 0 : a[0]
    b[0] = b[0] > 0.5 ? 0 : b[0]
    c[0] = c[0] > 0.5 ? 0 : c[0]
  }

  return [a, b, c]
}

function uvPoint(x, y, z) {
  return [
    (Math.atan2(x, z) / (2 * Math.PI)) + 0.5,
    1.0 - ((Math.asin(y) / Math.PI) + 0.5)
  ]
}
