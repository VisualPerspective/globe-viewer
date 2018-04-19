#extension GL_OES_standard_derivatives : enable
precision highp float;

@import ./functions/gamma;
@import ./functions/tonemap;
@import ./functions/exposure;
@import ./functions/nightAmbient;
@import ./functions/texture2DCubic;

uniform sampler2D topographyMap;
uniform sampler2D diffuseMap;
uniform sampler2D landmaskMap;
uniform sampler2D bordersMap;
uniform vec2 bordersMapSize;
uniform sampler2D lightsMap;
uniform vec3 eye;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  float landness = texture2D(landmaskMap, vUv, -0.25).r;
  float countryBorder = texture2DCubic(
    bordersMap,
    vUv,
    bordersMapSize
  ).r;

  float oceanDepth = (0.5 - texture2D(topographyMap, vUv).r) * 2.0;

  vec3 oceanColor = mix(
    vec3(0.0, 0.0, 0.3),
    vec3(0.0, 0.0, 0.35),
    oceanDepth
  );

  vec3 diffuseColor = mix(
    oceanColor,
    toLinear(texture2D(diffuseMap, vUv).rgb),
    landness
  );

  vec3 color = nightAmbient(
    -1.0,
    diffuseColor,
    texture2D(lightsMap, vUv).x,
    vUv
  );

  vec3 shaded = toGamma(tonemap(color * 200.0));
  vec3 final = shaded + countryBorder;
  gl_FragColor = vec4(final, 1.0);
}
