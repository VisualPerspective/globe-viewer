// Based on https://github.com/glslify/glsl-diffuse-lambert

float lambertDiffuse(
  vec3 lightDirection,
    vec3 surfaceNormal) {
    return max(0.0, dot(lightDirection, surfaceNormal));
}
