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

  vec3 infoSample = texture2D(landmaskMap, vUv, -0.5).rgb;
  float landness = max(infoSample.r, infoSample.b);
  float countryBorder = infoSample.b;

  float oceanDepth = (0.5 - texture2D(topographyMap, vUv).r) * 2.0;

  vec2 dHdxy = heightDerivative(vUv, topographyMap) *
    terrainBumpScale(landness, 0.0, vNdotL, vNdotV, eye, vPosition);

  vec3 oceanColor = mix(
    vec3(0.0, 0.0, 0.35),
    vec3(0.0, 0.0, 0.3),
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
    mix(0.6, 0.8, oceanDepth),
    (1.0 - diffuseColor.r * 0.5),
    smoothstep(0.25, 0.75, landness)
  );

  vec3 color = nightAmbient(vNdotL, diffuseColor, lightsMap, vUv);
  if (dot(vNormal, L) > 0.0) {
    vec3 lightColor = vec3(8.0);

    float incidence = pow(dot(N, L), 1.5);

    color = lightColor * incidence * brdf(
      diffuseColor,
      0.0, //metallic
      0.5, //subsurface
      0.3, //specular
      roughness, //roughness
      L, V, N
    );

    color += atmosphere(
      vNdotL_clamped,
      vNdotV_clamped,
      vec3(0.1, 0.1, 1.0) * 20.0
    );
  }

  vec3 shaded = toGamma(tonemap(color * exposure(eye, L)));
  vec3 final = mix(shaded, vec3(1.0), countryBorder);
  gl_FragColor = vec4(final, 1.0);
}
