export default `

precision highp float;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 texcoord;

uniform sampler2D topographyMap;
uniform sampler2D bathymetryMap;
uniform vec3 lightPosition;
uniform mat4 view;
uniform mat4 viewProjection;
uniform float sphereMix;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

const float PI = 3.141592653589793;

void main(void) {
  vUv = vec2(1, 1) - texcoord;

  vec4 planePosition = vec4(position, 1.0);

  planePosition.y += (
    texture2D(topographyMap, vUv).r * 0.01 -
    (1.0 - texture2D(bathymetryMap, vUv).r) * 0.01
  );

  float scale = (1.0 + planePosition.y);
  vec4 spherePosition = vec4(
    scale * sin(planePosition.x * PI) * cos(planePosition.z * PI),
    scale * cos(planePosition.x * PI) * cos(planePosition.z * PI),
    scale * sin(planePosition.z * PI),
    1.0
  );

  vec4 mixPosition = mix(planePosition, spherePosition, 0.0);

  gl_Position = viewProjection * mixPosition;
  vNormal = vec3(view * mixPosition);
  vPosition = vec3(view * mixPosition);
}

`