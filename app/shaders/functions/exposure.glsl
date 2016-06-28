// Set camera exposure based on angle between sun and eye

float exposure = mix(
  2.5,
  300.0,
  pow((1.0 - dot(normalize(vEye), L)) / 2.0, 8.0)
);

#pragma glslify: export(exposure)
