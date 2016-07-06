#extension GL_OES_standard_derivatives : enable
precision highp float;

#pragma glslify: toLinear = require(glsl-gamma/in)
#pragma glslify: toGamma = require(glsl-gamma/out)
#pragma glslify: heightDerivative = require(./functions/heightDerivative)
#pragma glslify: perturbNormal = require(./functions/perturbNormal)
#pragma glslify: tonemap = require(./functions/tonemap)
#pragma glslify: exposure = require(./functions/exposure)
#pragma glslify: terrainBumpScale = require(./functions/terrainBumpScale)
#pragma glslify: atmosphere = require(./functions/atmosphere)
#pragma glslify: nightAmbient = require(./functions/nightAmbient)
#pragma glslify: brdf = require(./functions/brdf)

uniform sampler2D topographyMap;
uniform sampler2D diffuseMap;
uniform sampler2D landmaskMap;
uniform sampler2D lightsMap;
uniform vec3 lightDirection;
uniform vec3 eye;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  vec3 constantLight = vNormal;
  vec3 V = vNormal;
  float vNdotL = dot(vNormal, constantLight);
  float vNdotL_clamped = clamp(vNdotL, 0.0, 1.0);
  float vNdotV = dot(vNormal, V);
  float vNdotV_clamped = clamp(vNdotV, 0.0, 1.0);

  float landness = texture2D(landmaskMap, vUv).r;
  float elevation = texture2D(topographyMap, vUv).r;

  vec2 dHdxy = heightDerivative(vUv, topographyMap) *
    terrainBumpScale(landness, 0.0, vNdotL, vNdotV, eye, vPosition);

  float highestPoint = 8848.0;
  float lowestPoint = 11034.0;
  float seaLevel = lowestPoint / (highestPoint + lowestPoint);

  float steps = 10.0;
  vec3 diffuseColor = mix(
    mix(
      vec3(seaLevel),
      vec3(0.0),
      floor(elevation * steps) / steps
    ),
    mix(
      vec3(seaLevel),
      vec3(1.0),
      floor(elevation * steps) / steps
    ),
    landness
  );

  diffuseColor = mix(
    diffuseColor,
    vec3(0.0, 0.0, 0.5),
    pow(1.0 - abs(landness - 0.5) * 2.0, 1.0)
  );

  vec3 N = perturbNormal(normalize(vPosition), vNormal, dHdxy);
  vec3 L = normalize(constantLight);
  vec3 H = normalize(L + V);

  float roughness = 0.99;

  vec3 color = vec3(0.0);
  if (dot(vNormal, L) > 0.0) {
    vec3 lightColor = vec3(20.0);

    // Accurate would just be NdotL, pow makes falloff more gradual
    float incidence = pow(dot(N, L), 1.5);

    color = lightColor * incidence * brdf(
      diffuseColor,
      0.0, //metallic
      0.5, //subsurface
      0.3, //specular
      roughness, //roughness
      L, V, N
    );
  }

  vec3 tonemapped = tonemap(color * 0.5);
  gl_FragColor = vec4(toGamma(tonemapped), 1.0);
}
