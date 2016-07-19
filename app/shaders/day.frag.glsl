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

  vec3 infoSample = texture2D(landmaskMap, vUv).rgb;
  float landness = infoSample.r;
  float countryBorder = infoSample.b;

  float oceanDepth = (0.5 - texture2D(topographyMap, vUv).r) * 2.0;

  vec3 oceanColor = mix(
    vec3(0.1, 0.15, 0.45),
    vec3(0.1, 0.15, 0.35),
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
    landness
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

  vec3 shaded = toGamma(tonemap(color * 1.0));
  vec3 final = mix(shaded, vec3(1.0), countryBorder);
  gl_FragColor = vec4(final, 1.0);
}
