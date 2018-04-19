#extension GL_OES_standard_derivatives : enable
precision highp float;

@import ./functions/gamma;
@import ./functions/heightDerivative;
@import ./functions/perturbNormal;
@import ./functions/tonemap;
@import ./functions/exposure;
@import ./functions/terrainBumpScale;
@import ./functions/atmosphere;
@import ./functions/nightAmbient;
@import ./functions/brdf;

uniform sampler2D topographyMap;
uniform sampler2D diffuseMap;
uniform sampler2D landmaskMap;
uniform sampler2D bordersMap;
uniform sampler2D lightsMap;
uniform vec3 lightDirection;
uniform vec3 eye;
uniform bool flatProjection;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  vec3 constantLight = vNormal;
  vec3 V = vNormal;

  float landness = texture2D(landmaskMap, vUv, -0.25).r;
  float countryBorder = texture2D(bordersMap, vUv, -0.25).r;
  float elevation = texture2D(topographyMap, vUv).r;

  float steps = 16.0;
  vec3 diffuseColor = vec3(1.0, 0.75, 0.5) *
    floor((elevation / 0.9) * steps) / steps;

  if (landness < 0.5) {
    diffuseColor =vec3(0.25, 0.5, 1.0) *
    floor((elevation / 0.9) * steps) / steps;
  }

  // Outline the transition from land to sea
  diffuseColor = mix(
    diffuseColor,
    vec3(0.0, 0.0, 0.5),
    pow(1.0 - abs(landness - 0.5) * 2.0, 1.0)
  );

  vec3 N = vNormal;
  vec3 L = normalize(constantLight);
  vec3 H = normalize(L + V);

  vec3 color = vec3(0.0);
  if (dot(vNormal, L) > 0.0) {
    vec3 lightColor = vec3(20.0);

    color = lightColor * brdf(
      diffuseColor,
      0.0, //metallic
      0.5, //subsurface
      0.3, //specular
      0.99, //roughness
      L, V, N
    );

    if (!flatProjection) {
      color += atmosphere(
        dot(vNormal, L),
        dot(vNormal, normalize(eye - vPosition)),
        vec3(5.0)
      );
    }
  }

  vec3 shaded = toGamma(tonemap(color * 0.5));
  vec3 final = shaded + countryBorder;
  gl_FragColor = vec4(final, 1.0);
}
