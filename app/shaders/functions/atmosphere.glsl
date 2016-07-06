vec3 atmosphere(float NdotL, float NdotV) {
  return (
    max(pow(NdotL, 2.0), 0.0) *
    pow(1.0 - NdotV, 12.0)
  ) * vec3(0.1, 0.1, 1.0) * 20.0;
}

#pragma glslify: export(atmosphere)
