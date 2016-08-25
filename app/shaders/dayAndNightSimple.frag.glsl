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
#pragma glslify: lambert = require(glsl-diffuse-lambert)
#pragma glslify: texture2DCubic = require(./functions/texture2DCubic)

uniform sampler2D topographyMap;
uniform vec2 topographyMapSize;
uniform sampler2D diffuseMap;
uniform sampler2D landmaskMap;
uniform sampler2D bordersMap;
uniform vec2 bordersMapSize;
uniform sampler2D lightsMap;
uniform vec3 lightDirection;
uniform vec3 eye;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vSpherePosition;
varying vec3 vNormal;

void main() {
  vec3 V = normalize(eye - vPosition);
  float vNdotL = dot(vNormal, lightDirection);
  float vNdotL_clamped = clamp(vNdotL, 0.0, 1.0);
  float vNdotV = dot(vNormal, V);
  float vNdotV_clamped = clamp(vNdotV, 0.0, 1.0);

  float landness = texture2D(landmaskMap, vUv, -0.25).r;
  float countryBorder = texture2D(bordersMap, vUv, -0.25).r;
  float oceanDepth = (0.5 - texture2D(topographyMap, vUv).r) * 2.0;

  vec2 dHdxy = heightDerivative(
    vUv,
    topographyMap,
    topographyMapSize
  );

  float poleFalloff = 1.0 - pow(abs(vPosition.z * 2.0), 4.0);
  dHdxy *= terrainBumpScale(
    landness,
    0.0,
    vNdotL,
    vNdotV,
    eye,
    vSpherePosition
  ) * poleFalloff;

  vec3 oceanColor = mix(
    vec3(0.15, 0.15, 0.35),
    vec3(0.125, 0.125, 0.3),
    oceanDepth
  );

  vec3 diffuseColor = mix(
    oceanColor,
    toLinear(texture2D(diffuseMap, vUv).rgb),
    landness
  );

  vec3 N = perturbNormal(vSpherePosition, vNormal, dHdxy);
  vec3 L = normalize(lightDirection);
  vec3 H = normalize(L + V);

  float roughness = mix(
    mix(0.6, 0.8, oceanDepth),
    (1.0 - diffuseColor.r * 0.5),
    smoothstep(0.25, 0.75, landness)
  );

  vec3 color = nightAmbient(
    vNdotL - 0.025,
    diffuseColor,
    texture2D(lightsMap, vUv).x,
    vUv
  );

  vec3 lightColor = vec3(0.05);

  if (dot(vNormal, L) > 0.0) {
    float incidence = dot(N, L);
    color = color + lightColor * pow(diffuseColor, vec3(2.2)) * incidence;
  }

  vec3 shaded = toGamma(tonemap(color * 100.0));
  vec3 final = shaded + countryBorder;

  vec3 terminatorColor = vec3(0.4, 0.4, 0.0);
  final += terminatorColor * min(pow(1.0 - abs(vNdotL), 350.0), 1.0);
  gl_FragColor = vec4(final, 1.0);
}
