//
// Scale bump map effect to produce relatively even relief
// shading across surface. Goal is to avoid too much shading
// at glancing angles and too little shading in the center.
//
// Also, invert bumps for oceans since the ocean height map
// is inverted and allow for an additional bump scale factor with
// `oceanFactor`. This allows ocean floor rendering to show
// full bumps vs ocean surface rendering being flat.
//
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
  float distanceFactor = clamp(
    distance(vEye, vPosition), 0.0, 5.0
  ) / 10.0 + 0.5;

  float bumpScale = mix(
    0.009,
    0.09,
    vNdotL * vNdotL * vNdotV * distanceFactor
  ) * bumpFalloff;

  if (landness < 0.5) {
    bumpScale *= -oceanFactor;
  }

  return bumpScale;
}

#pragma glslify: export(terrainBumpScale)
