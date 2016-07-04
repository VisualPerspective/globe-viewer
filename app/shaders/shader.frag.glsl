#extension GL_OES_standard_derivatives : enable
precision highp float;

#pragma glslify: toLinear = require(glsl-gamma/in)
#pragma glslify: toGamma = require(glsl-gamma/out)
#pragma glslify: luma = require(glsl-luma)
#pragma glslify: heightDerivative = require(./functions/heightDerivative)
#pragma glslify: perturbNormal = require(./functions/perturbNormal)
#pragma glslify: tonemap = require(./functions/tonemap)
#pragma glslify: exposure = require(./functions/exposure)
#pragma glslify: terrainBumpScale = require(./functions/terrainBumpScale)
#pragma glslify: brdf = require(./functions/brdf)

uniform float time;
uniform mat4 view;
uniform sampler2D topographyMap;
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

  float landness = texture2D(landmaskMap, vUv).r;
  float oceanDepth = 1.0 - texture2D(topographyMap, vUv).r;

  vec2 dHdxy = heightDerivative(vUv, topographyMap) *
    terrainBumpScale(landness, 0.0, vNdotL, vNdotV, vEye, vPosition);

  vec3 pNormal = perturbNormal(
    normalize(vPosition),
    normalize(vNormal),
    dHdxy
  );

  vec3 oceanColor = mix(
    vec3(0.0, 0.0, 0.3),
    vec3(0.0, 0.0, 0.35),
    pow(oceanDepth, 0.5)
  );

  vec3 diffuseColor = mix(
    oceanColor,
    toLinear(texture2D(diffuseMap, vUv).rgb),
    landness
  );

  vec3 N = normalize(pNormal);
  vec3 L = normalize(vLightDirection);
  vec3 H = normalize(L + V);
  float NdotL = dot(N, L);
  float NdotV = dot(N, V);
  float NdotL_clamped = max(NdotL, 0.000001);
  float NdotV_clamped = max(NdotV, 0.000001);

  float roughness = landness > 0.5 ?
    (1.0 - diffuseColor.r * 0.5) :
    mix(0.75, 0.65, oceanDepth);

  vec3 atmosphere = vec3(0.0);
  vec3 lightColor = vec3(1.0, 1.0, 1.0) * 10.0;

  vec3 color = vec3(0.0, 0.0, 0.0);

  if (dot(vNormal, L) > 0.0) {
    atmosphere = (
      max(pow(vNdotL_clamped, 5.0), 0.0) *
      pow(1.0 - vNdotV_clamped, 12.0)
    ) * vec3(0.1, 0.1, 1.0) * 20.0;

    color = lightColor * pow(NdotL, 1.5) * brdf(
      diffuseColor,
      0.0, //metallic
      0.5, //subsurface
      landness > 0.5 ? 0.3 : 0.3, //specular
      roughness, //roughness
      L, V, N
    );
  }

  vec3 colorAmbient = 0.1 * (
    texture2D(lightsMap, vUv).r * vec3(0.8, 0.8, 0.5) +
    0.3 * vec3(0.1, 0.1, 1.0) * diffuseColor
  ) * clamp((-vNdotL + 0.01) * 2.0, 0.0, 1.0);

  color += colorAmbient + atmosphere;

  vec3 tonemapped = tonemap(color * exposure(vEye, L));
  vec3 gamma = toGamma(tonemapped);
  gl_FragColor = vec4(gamma, 1.0);
}
