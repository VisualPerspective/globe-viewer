precision highp float;

#pragma glslify: transpose = require('glsl-transpose')
#pragma glslify: inverse = require('glsl-inverse')

attribute vec3 position;
attribute vec2 texcoord;

uniform sampler2D topographyMap;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

const float PI = 3.141592653589793;

void main(void) {
  mat4 modelView = view * model;
  vUv = texcoord;

  float scale = 1.0 + (
    texture2D(topographyMap, vUv).r
  ) * 0.0;

  vec3 spherePosition = scale * position;

  gl_Position = projection * modelView * vec4(spherePosition, 1.0);
  vPosition = vec3(model * vec4(spherePosition, 1.0));

  mat3 normalMatrix = transpose(inverse(mat3(model)));
  vNormal = normalize(normalMatrix * spherePosition);
}