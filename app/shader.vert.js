export default `

precision highp float;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 texcoord;

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

  vec4 spherePosition = vec4(
    sin(position.x * PI) * cos(position.z * PI),
    cos(position.x * PI) * cos(position.z * PI),
    sin(position.z * PI),
    1.0
  );

  vec4 mixPosition = mix(planePosition, spherePosition, 1.0);

  gl_Position = viewProjection * mixPosition;
  vNormal = vec3(view * mixPosition);
  vPosition = vec3(view * mixPosition);
}

`