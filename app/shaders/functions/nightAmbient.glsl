vec3 nightAmbient(
  float NdotL,
  vec3 diffuseColor,
  sampler2D lightsMap,
  vec2 vUv
) {
  return 0.01 * (
    texture2D(lightsMap, vUv).r * vec3(0.8, 0.8, 0.5) +
    0.3 * vec3(0.1, 0.1, 1.0) * diffuseColor
  ) * clamp((-NdotL + 0.01) * 2.0, 0.0, 1.0);
}

#pragma glslify: export(nightAmbient)
