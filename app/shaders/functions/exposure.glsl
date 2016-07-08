// Set camera exposure based on angle between sun and eye

float exposure(vec3 eye, vec3 L) {
  return mix(
    1.5,
    300.0,
    pow((1.0 - dot(normalize(eye), L)) / 2.0, 10.0)
  );
}

#pragma glslify: export(exposure)
