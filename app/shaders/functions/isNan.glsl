// Hack isNan for debugging since WebGL doesn't define it

bool isNan(float val) {
  return (val <= 0.0 || 0.0 <= val) ? false : true;
}

#pragma glslify: export(isNan)
