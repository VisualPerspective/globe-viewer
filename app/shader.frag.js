export default `

#extension GL_OES_standard_derivatives : enable
precision highp float;

uniform float time;
uniform mat4 view;
uniform sampler2D topographyMap;
uniform sampler2D bathymetryMap;
uniform sampler2D diffuseMap;
uniform vec3 lightPosition;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

// Based on https://docs.unrealengine.com/latest/attachments/Engine/Rendering/LightingAndShadows/BumpMappingWithoutTangentSpace5mm_sfgrad_bump.pdf
vec3 perturbNormal(vec3 surf_pos, vec3 surf_norm, vec2 dHdxy) {
  vec3 vSigmaX = dFdx(surf_pos);
  vec3 vSigmaY = dFdy(surf_pos);
  vec3 vN = surf_norm; // normalized
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
  float Hll = texture2D(topographyMap, STll).x;
  float Hlr = texture2D(topographyMap, STlr).x;
  float Hul = texture2D(topographyMap, STul).x;

  float dBs = Hlr - Hll;
  float dBt = Hul - Hll;
  return vec2(dBs, dBt);
}

float luma(vec3 color) {
  return dot(color, vec3(0.299, 0.587, 0.114));
}

vec3 lightAmount(vec3 direction, vec3 color, vec3 normal) {
  float lightStrength = max(dot(normalize(normal).xyz, normalize(direction)), 0.0);
  float luminance = luma(texture2D(diffuseMap, vUv).rgb);
  float glossStrength = luminance;
  lightStrength += glossStrength * pow(lightStrength, 10.0);
  return lightStrength * color;
}

void main() {
  vec2 dHdxy = heightDerivative(vUv) * 0.001;
  vec3 pNormal = perturbNormal(vPosition, vNormal, dHdxy);

  vec3 light = lightAmount(
    vec3(vec4(lightPosition, 1.0)),
    vec3(1.0, 1.0, 1.0),
    pNormal
  ) + vec3(0.2);

  gl_FragColor = vec4(
    light * 4.0 * (
      (texture2D(diffuseMap, vUv).rgb * 0.5 + 0.25) +
      (
        (
          vec3(1.0) -
          texture2D(bathymetryMap, vUv).rgb
        ) *
        vec3(0.0, 0.1, 0.25)
      )
    ),
    1.0
  );
}

`
