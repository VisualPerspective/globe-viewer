#extension GL_OES_standard_derivatives : enable
precision highp float;

#pragma glslify: toLinear = require(glsl-gamma/in)
#pragma glslify: toGamma = require(glsl-gamma/out)
#pragma glslify: tonemap = require(./functions/tonemap)
#pragma glslify: exposure = require(./functions/exposure)
#pragma glslify: brdf = require(./functions/brdf)

uniform sampler2D topographyMap;
uniform sampler2D diffuseMap;
uniform sampler2D landmaskMap;

varying vec2 vUv;
varying vec3 vNormal;

void main() {
  vec3 constantLight = vNormal;
  vec3 V = vNormal;

  float landness = texture2D(landmaskMap, vUv).r;
  float oceanDepth = 1.0 - texture2D(topographyMap, vUv).r;

  vec3 oceanColor = mix(
    vec3(0.0, 0.0, 0.25),
    vec3(0.0, 0.0, 0.35),
    oceanDepth
  );

  vec3 diffuseColor = mix(
    oceanColor,
    toLinear(texture2D(diffuseMap, vUv).rgb),
    landness
  );

  vec3 N = vNormal;
  vec3 L = normalize(constantLight);
  vec3 H = normalize(L + V);

  float roughness = mix(
    mix(0.75, 0.55, oceanDepth),
    (1.0 - diffuseColor.r * 0.5),
    step(0.5, landness)
  );

  vec3 color = vec3(0.0);
  if (dot(vNormal, L) > 0.0) {
    vec3 lightColor = vec3(10.0);

    color = lightColor * brdf(
      diffuseColor,
      0.0, //metallic
      0.5, //subsurface
      0.0, //specular
      roughness, //roughness
      L, V, N
    );
  }

  vec3 tonemapped = tonemap(color * 1.25);
  gl_FragColor = vec4(toGamma(tonemapped), 1.0);
}
