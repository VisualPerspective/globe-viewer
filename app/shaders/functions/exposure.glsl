// Set camera exposure based on angle between sun and eye

float exposure(vec3 eye, vec3 L, float low, float high) {
  return mix(
    low,
    high,
    pow((1.0 - dot(normalize(eye), L)) / 2.0, 10.0)
  );
}
