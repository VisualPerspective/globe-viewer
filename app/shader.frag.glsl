#extension GL_OES_standard_derivatives : enable
precision highp float;

#pragma glslify: lambert = require(glsl-diffuse-lambert)
#pragma glslify: toLinear = require(glsl-gamma/in)
#pragma glslify: toGamma = require(glsl-gamma/out)
#pragma glslify: luma = require(glsl-luma)
#pragma glslify: cookTorranceSpec = require(glsl-specular-cook-torrance)

uniform float time;
uniform mat4 view;
uniform sampler2D topographyMap;
uniform sampler2D bathymetryMap;
uniform sampler2D diffuseMap;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vLightDirection;
varying vec3 vEye;

const float PI = 3.141592653589793;

// Based on https://docs.unrealengine.com/latest/attachments/Engine/Rendering/LightingAndShadows/BumpMappingWithoutTangentSpace5mm_sfgrad_bump.pdf
vec3 perturbNormal(vec3 surf_pos, vec3 surf_norm, vec2 dHdxy) {
    vec3 vSigmaX = dFdx(surf_pos);
    vec3 vSigmaY = dFdy(surf_pos);
    vec3 vN = vec3(normalize(surf_norm)); // normalized
    vec3 R1 = cross(vSigmaY, vN);
    vec3 R2 = cross(vN, vSigmaX);

    float fDet = dot(vSigmaX, R1);
    vec3 vGrad = sign(fDet) * (dHdxy.x * R1 + dHdxy.y * R2);
    return normalize(abs(fDet) * surf_norm - vGrad);
}


// Based on https://docs.unrealengine.com/latest/attachments/Engine/Rendering/LightingAndShadows/BumpMappingWithoutTangentSpace/mm_sfgrad_bump.pdf
vec2 heightDerivative(vec2 texST) {
    vec2 TexDx = dFdx(texST);
    vec2 TexDy = dFdy(texST);
    vec2 STll = texST;
    vec2 STlr = texST + TexDx;
    vec2 STul = texST + TexDy;
    float Hll = (
      texture2D(topographyMap, STll).x +
      texture2D(bathymetryMap, STll).x
    );
    float Hlr = (
      texture2D(topographyMap, STlr).x +
      texture2D(bathymetryMap, STlr).x
    );
    float Hul = (
      texture2D(topographyMap, STul).x +
      texture2D(bathymetryMap, STul).x
    );
    float dBs = Hlr - Hll;
    float dBt = Hul - Hll;
    return vec2(dBs, dBt);
}


float fresnel(float f0, vec3 n, vec3 l) {
  return f0 + (1.0 - f0) * pow(1.0 - dot(n, l), 5.0);
}

void main() {
  float bumpScale = mix(
    0.001,
    0.003,
    clamp(distance(vEye, vPosition), 0.0, 10.0)
  );


  vec2 dHdxy = heightDerivative(vUv) * bumpScale;
  vec3 pNormal = perturbNormal(
    normalize(vPosition),
    normalize(vNormal),
    dHdxy
  );

  float vNdotL = dot(vNormal, vLightDirection);

  float landness = texture2D(diffuseMap, vUv).a;
  float oceanDepth = texture2D(bathymetryMap, vUv).r;

  float bumpiness = 0.5;

  if (landness < 0.5) {
    bumpiness = 0.1;
  }

  float shadowStart = 0.25;
  if (vNdotL < shadowStart) {
    bumpiness = mix(
      0.0,
      bumpiness,
      vNdotL / shadowStart
    );
  }

  vec3 oceanColor = mix(
    vec3(0.0, 0.05, 0.1),
    vec3(0.0, 0.05, 0.5),
    pow(oceanDepth, 0.5)
  );

  vec3 diffuseColor = mix(
    oceanColor,
    toLinear(texture2D(diffuseMap, vUv).rgb),
    landness
  );

  vec3 N = normalize(mix(vNormal, pNormal, bumpiness));
  vec3 L = normalize(vLightDirection);
  vec3 V = normalize(vEye - vPosition);
  vec3 H = normalize(L + V);
  float NdotL = dot(N, L);
  float NdotV = dot(N, V);
  float NdotL_clamped = max(NdotL, 0.0);
  float NdotV_clamped = max(NdotV, 0.0);

  gl_FragColor = vec4(1.0);
}
