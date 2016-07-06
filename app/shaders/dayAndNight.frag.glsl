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
  vec3 V = normalize(eye - vPosition);
  float vNdotL = dot(vNormal, lightDirection);
  float vNdotL_clamped = clamp(vNdotL, 0.0, 1.0);
  float vNdotV = dot(vNormal, V);
  float vNdotV_clamped = clamp(vNdotV, 0.0, 1.0);

  float landness = texture2D(landmaskMap, vUv).r;
  float oceanDepth = 1.0 - texture2D(topographyMap, vUv).r;

  vec2 dHdxy = heightDerivative(vUv, topographyMap) *
    terrainBumpScale(landness, 0.0, vNdotL, vNdotV, eye, vPosition);

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

  vec3 N = perturbNormal(normalize(vPosition), vNormal, dHdxy);
  vec3 L = normalize(lightDirection);
  vec3 H = normalize(L + V);

  float roughness = mix(
    mix(0.75, 0.55, oceanDepth),
    (1.0 - diffuseColor.r * 0.5),
    step(0.5, landness)
  );

  vec3 color = nightAmbient(vNdotL, diffuseColor, lightsMap, vUv);
  if (dot(vNormal, L) > 0.0) {
    vec3 lightColor = vec3(10.0);

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

    color += atmosphere(vNdotL_clamped, vNdotV_clamped);
  }

  vec3 tonemapped = tonemap(color * exposure(eye, L));
  gl_FragColor = vec4(toGamma(tonemapped), 1.0);
}
