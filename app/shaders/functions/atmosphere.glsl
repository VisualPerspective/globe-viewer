vec3 atmosphere(float NdotL, float NdotV, vec3 color) {
  return (
    max(pow(NdotL, 2.0), 0.0) *
    pow(1.0 - NdotV, 12.0)
  ) * color;
}
