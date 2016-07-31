// Based on:
// http://stackoverflow.com/questions/13501081/efficient-bicubic-filtering-code-in-glsl

vec4 cubic(float v) {
  vec4 n = vec4(1.0, 2.0, 3.0, 4.0) - v;
  vec4 s = n * n * n;
  float x = s.x;
  float y = s.y - 4.0 * s.x;
  float z = s.z - 4.0 * s.y + 6.0 * s.x;
  float w = 6.0 - x - y - z;
  return vec4(x, y, z, w);
}

vec4 texture2DCubic(
  sampler2D tex,
  vec2 uv,
  vec2 textureResolution
) {
  vec2 texcoord = uv * textureResolution;
  texcoord -= vec2(0.5);
  float fx = fract(texcoord.x);
  float fy = fract(texcoord.y);
  texcoord.x -= fx;
  texcoord.y -= fy;

  vec4 xcubic = cubic(fx);
  vec4 ycubic = cubic(fy);

  vec4 c = vec4(
    texcoord.x - 0.5,
    texcoord.x + 1.5,
    texcoord.y - 0.5,
    texcoord.y + 1.5
  );

  vec4 s = vec4(
    xcubic.x + xcubic.y,
    xcubic.z + xcubic.w,
    ycubic.x + ycubic.y,
    ycubic.z + ycubic.w
  );

  vec4 offset = c + vec4(
    xcubic.y,
    xcubic.w,
    ycubic.y,
    ycubic.w
  ) / s;

  vec4 sample0 = texture2D(tex,
    vec2(offset.x, offset.z) / textureResolution);

  vec4 sample1 = texture2D(tex,
    vec2(offset.y, offset.z) / textureResolution);

  vec4 sample2 = texture2D(tex,
    vec2(offset.x, offset.w) / textureResolution);

  vec4 sample3 = texture2D(tex,
    vec2(offset.y, offset.w) / textureResolution);

  float sx = s.x / (s.x + s.y);
  float sy = s.z / (s.z + s.w);

  return mix(
    mix(sample3, sample2, sx),
    mix(sample1, sample0, sx),
    sy
  );
}

#pragma glslify: export(texture2DCubic)
