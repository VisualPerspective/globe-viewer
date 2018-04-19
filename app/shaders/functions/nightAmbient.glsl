vec3 nightAmbient(
  float NdotL,
  vec3 diffuseColor,
  float nightLightAmount,
  vec2 vUv
) {
  return 0.01 * (
    nightLightAmount * vec3(1.0, 1.0, 0.8) +
    0.1 * vec3(0.1, 0.1, 1.0) * diffuseColor
  ) * clamp((-NdotL + 0.01) * 2.0, 0.0, 1.0);
}
