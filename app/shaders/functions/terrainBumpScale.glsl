// Scale bump map effect to produce relatively even relief
// shading across surface. Goal is to avoid too much shading
// at glancing angles and too little shading in the center.
//
// Also, allow for an additional bump scale factor with
// `oceanFactor`. This allows ocean floor rendering to show
// full bumps vs ocean surface rendering being flat.

float terrainBumpScale(
  float landness,
  float oceanFactor,
  float vNdotL,
  float vNdotV,
  vec3 vEye,
  vec3 vPosition
) {
  float shadowStart = 0.25;
  float bumpFalloff = clamp(vNdotL / shadowStart, 0.0, 0.5);

  float bumpScale = mix(
    0.005,
    0.05,
    vNdotL * vNdotL * vNdotV
  ) * bumpFalloff;

  if (landness < 0.5) {
    bumpScale *= -oceanFactor;
  }

  return bumpScale;
}
