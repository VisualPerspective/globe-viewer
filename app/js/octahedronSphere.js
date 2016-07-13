import twgl from 'twgl.js'

const v3 = twgl.v3

// icosphere-like sphere, except based on octahedron
// which gives a clean vertical seam for texturing
// based on:
// https://github.com/hughsk/icosphere/blob/master/index.js

export default function octahedronSphere(divisions) {
  var triangles = [
    [
      [[0,1,0], [0,0,-1], [-1,0,0]],
      [[0,1,0], [-1,0,0], [0,0,1]],
      [[0,1,0], [0,0,1], [1,0,0]],
      [[0,1,0], [1,0,0], [0,0,-1]],
      [[0,-1,0], [0,0,-1], [-1,0,0]],
      [[0,-1,0], [-1,0,0], [0,0,1]],
      [[0,-1,0], [0,0,1], [1,0,0]],
      [[0,-1,0], [1,0,0], [0,0,-1]]
    ]
  ]

  for (var i = 0; i < divisions; i++) {
    let current = triangles[i]
    let split = []

    for (var j = 0; j < current.length; j++) {
      split = split.concat(splitTriangle(current[j]))
    }

    triangles.push(split)
  }

  var uvs = []
  for (let triangle of triangles[triangles.length - 1]) {
    uvs.push(calculateUvs(triangle))
  }

  return {
    triangles: triangles[triangles.length - 1],
    uvs: uvs
  }
}

function splitTriangle(triangle) {
  var a = triangle[0]
  var b = triangle[1]
  var c = triangle[2]
  var ab = Array.from(v3.normalize(v3.add(a, b)))
  var bc = Array.from(v3.normalize(v3.add(b, c)))
  var ca = Array.from(v3.normalize(v3.add(c, a)))
  return [
    [ca, ab, a],
    [c, bc, ca],
    [bc, ab, ca],
    [b, ab, bc]
  ]
}

function calculateUvs(triangle) {
  let a = uvPoint(...triangle[0])
  let b = uvPoint(...triangle[1])
  let c = uvPoint(...triangle[2])

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
