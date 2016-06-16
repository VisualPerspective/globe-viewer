#extension GL_OES_standard_derivatives : enable
precision highp float;

#pragma glslify: lambert = require(glsl-diffuse-lambert)
#pragma glslify: toLinear = require(glsl-gamma/in)
#pragma glslify: toGamma = require(glsl-gamma/out)
#pragma glslify: luma = require(glsl-luma)

uniform float time;
uniform mat4 view;
uniform sampler2D topographyMap;
uniform sampler2D bathymetryMap;
uniform sampler2D diffuseMap;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vLightPosition;

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


void main() {
  vec2 dHdxy = heightDerivative(vUv) * 0.005;
  vec3 pNormal = perturbNormal(
    normalize(vPosition),
    normalize(vNormal),
    dHdxy
  );

  vec3 N = normalize(pNormal);
  vec3 L = normalize(vLightPosition);
  float bumpDiffuse = lambert(
    normalize(pNormal),
    normalize(vLightPosition)
  );

  float surfaceDiffuse = lambert(
    normalize(vNormal),
    normalize(vLightPosition)
  );

  float diffuse = mix(
    bumpDiffuse,
    surfaceDiffuse,
    0.5
  );

  if (surfaceDiffuse < 0.3) {
    diffuse = mix(
      surfaceDiffuse,
      bumpDiffuse,
      0.5 * surfaceDiffuse / 0.3
    );
  }

  diffuse = diffuse * 0.99 + 0.01;

  float oceanDepth = texture2D(bathymetryMap, vUv).x;
  vec4 baseColor = mix(
    vec4(0.0, 0.1, 0.2, 1.0),
    toLinear(texture2D(diffuseMap, vUv)),
    oceanDepth
  );

  vec4 finalColor = vec4(baseColor.rgb * diffuse, 1.0);

  gl_FragColor = toGamma(finalColor);
}
