precision highp float;

#pragma glslify: transpose = require('glsl-transpose')
#pragma glslify: inverse = require('glsl-inverse')

attribute vec3 position;
attribute vec3 normal;
attribute vec2 texcoord;

uniform sampler2D topographyMap;
uniform sampler2D bathymetryMap;
uniform vec3 lightDirection;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vLightDirection;
varying vec3 vEye;

const float PI = 3.141592653589793;

void main(void) {
  mat4 modelView = view * model;
  vUv = vec2(1, 1) - texcoord;

  vec3 planePosition = position;

  planePosition.y += (
    texture2D(topographyMap, vUv).r +
    texture2D(bathymetryMap, vUv).r
  ) * 0.01;

  float scale = (1.0 + planePosition.y);
  vec3 spherePosition = vec3(
    scale * sin(planePosition.x * PI) * cos(planePosition.z * PI),
    scale * sin(planePosition.z * PI),
    scale * -cos(planePosition.x * PI) * cos(planePosition.z * PI)
  );

  vec3 mixPosition = mix(planePosition, spherePosition, 0.0);

  gl_Position = projection * modelView * vec4(mixPosition, 1.0);
  vPosition = vec3(model * vec4(spherePosition, 1.0));

  vLightDirection = lightDirection;

  mat3 normalMatrix = transpose(inverse(mat3(model)));
  vNormal = normalize(normalMatrix * spherePosition);
}