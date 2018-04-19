precision highp float;

@import ./functions/transpose;
@import ./functions/inverse;

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

void main(void) {
  mat4 modelView = view * model;
  vUv = texcoord;

  float scale = 1.0;
  if (elevation > 0.0) {
    scale += elevation * landElevationScale;
  }
  else {
    scale += elevation * oceanElevationScale;
  }

  vec3 spherePosition = scale * position;

  gl_Position = projection * modelView * vec4(spherePosition, 1.0);
  vPosition = vec3(model * vec4(spherePosition, 1.0));

  mat3 normalMatrix = transpose(inverse(mat3(model)));
  vNormal = normalize(normalMatrix * spherePosition);
}
