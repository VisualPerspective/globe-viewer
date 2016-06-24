#extension GL_OES_standard_derivatives : enable
precision highp float;

#pragma glslify: lambert = require(glsl-diffuse-lambert)
#pragma glslify: toLinear = require(glsl-gamma/in)
#pragma glslify: toGamma = require(glsl-gamma/out)
#pragma glslify: luma = require(glsl-luma)
#pragma glslify: heightDerivative = require(./functions/heightDerivative)
#pragma glslify: perturbNormal = require(./functions/perturbNormal)
#pragma glslify: tonemap = require(./functions/tonemap)

uniform float time;
uniform mat4 view;
uniform sampler2D topographyMap;
uniform sampler2D bathymetryMap;
uniform sampler2D diffuseMap;
uniform sampler2D landmaskMap;
uniform sampler2D lightsMap;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vLightDirection;
varying vec3 vEye;

const float PI = 3.141592653589793;

bool isNan(float val) {
  return (val <= 0.0 || 0.0 <= val) ? false : true;
}

void main() {
  vec3 V = normalize(vEye - vPosition);
  float vNdotL = dot(vNormal, vLightDirection);
  float vNdotL_clamped = clamp(vNdotL, 0.0, 1.0);
  float vNdotV = dot(vNormal, V);
  float vNdotV_clamped = clamp(vNdotV, 0.0, 1.0);

  float bumpScale = mix(
    0.001,
    0.01,
    vNdotL * vNdotL * vNdotV * (
      (clamp(distance(vEye, vPosition), 0.0, 5.0) / 10.0 + 0.5)
    )
  );

  vec2 dHdxy = heightDerivative(vUv, topographyMap) * bumpScale;
  vec3 pNormal = perturbNormal(
    normalize(vPosition),
    normalize(vNormal),
    dHdxy
  );

  float landness = texture2D(landmaskMap, vUv).r;
  float oceanDepth = texture2D(bathymetryMap, vUv).r;

  float bumpiness = 1.0;
  float shadowStart = 0.25;
  if (vNdotL < shadowStart) {
    bumpiness = mix(
      0.0,
      bumpiness,
      vNdotL / shadowStart
    );
  }

  vec3 oceanColor = mix(
    vec3(0.0, 0.00, 0.3),
    vec3(0.0, 0.05, 0.3),
    pow(oceanDepth, 0.5)
  );

  vec3 diffuseColor = mix(
    oceanColor,
    toLinear(texture2D(diffuseMap, vUv).rgb),
    landness
  );

  vec3 N = normalize(mix(vNormal, pNormal, bumpiness));
  vec3 L = normalize(vLightDirection);
  vec3 H = normalize(L + V);
  float NdotL = dot(N, L);
  float NdotV = dot(N, V);
  float NdotL_clamped = max(NdotL, 0.000001);
  float NdotV_clamped = max(NdotV, 0.000001);

  float roughness = landness > 0.5 ?
<<<<<<< HEAD
    (0.5 + diffuseColor.r * 0.5) :
    0.3;

  float atmosphere = (NdotL_clamped * pow(1.0 - NdotV_clamped, 5.0)) * 0.1;

  vec3 colorAmbient = 0.25 * step(vNdotL, 0.0) *
    pow(texture2D(lightsMap, vUv).r, 1.0) *
    vec3(0.8, 0.8, 0.5) +
    0.016 * vec3(0.1, 0.1, 1.0) * diffuseColor +
    atmosphere;

  vec3 color = colorDiff + colorSpec + colorAmbient;
  float exposure = mix(
    2.0,
    50.0,
    pow((1.0 - dot(normalize(vEye), L)) / 2.0, 10.0)
  );

  vec3 color = colorAmbient + atmosphere;
  float exposure = (2.0 - dot(V, L)) * 1.5;
  vec3 tonemapped = tonemap(color * exposure);
  vec3 gamma = toGamma(tonemapped);

  gl_FragColor = vec4(gamma, 1.0);
}
