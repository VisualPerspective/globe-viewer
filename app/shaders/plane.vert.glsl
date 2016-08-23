precision highp float;

#pragma glslify: transpose = require('glsl-transpose')
#pragma glslify: inverse = require('glsl-inverse')

attribute vec3 position;
attribute vec2 texcoord;
attribute float elevation;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

uniform float oceanElevationScale;
uniform float landElevationScale;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

const float PI = 3.141592653589793;

void main(void) {
  mat4 modelView = view * model;
  vUv = texcoord;

  float scale;
  if (elevation > 0.0) {
    scale = elevation * landElevationScale;
  }
  else {
    scale = elevation * oceanElevationScale;
  }

  vec3 planePosition = vec3(position.x, scale, position.z);
  vec3 spherePosition = vec3(
    sin(planePosition.x * PI) * cos(planePosition.z * PI),
    sin(planePosition.z * PI),
    -cos(planePosition.x * PI) * cos(planePosition.z * PI)
  );

  gl_Position = projection * modelView * vec4(planePosition, 1.0);
  vPosition = vec3(model * vec4(planePosition, 1.0));

  mat3 normalMatrix = transpose(inverse(mat3(model)));
  vNormal = normalize(normalMatrix * spherePosition);
}
