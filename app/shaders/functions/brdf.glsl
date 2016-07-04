/*
Modified from:
https://github.com/wdas/brdf/blob/master/src/brdfs/disney.brdf
*/

vec3 baseColor = vec3(0.82, 0.67, 0.16);
//float metallic = 0.0;
//float subsurface = 0.5;
//float specular = 0.5;
//float roughness = 0.75;
float specularTint = 0.0;
float anisotropic = 0.0;
float sheen = 0.0;
float sheenTint = 0.5;
float clearcoat = 0.0;
float clearcoatGloss = 1.0;

const float PI = 3.14159265358979323846;

float sqr(float x) { return x*x; }

float SchlickFresnel(float u) {
  float m = clamp(1.0 - u, 0.0, 1.0);
  float m2 = m * m;
  return m2 * m2 * m; // pow(m, 5)
}

float GTR1(float NdotH, float a) {
  if (a >= 1.0) return 1.0 / PI;
  float a2 = a * a;
  float t = 1.0 + (a2 - 1.0) * NdotH * NdotH;
  return (a2 - 1.0) / (PI * log(a2) * t);
}

float GTR2(float NdotH, float a) {
  float a2 = a * a;
  float t = 1.0 + (a2 - 1.0) * NdotH * NdotH;
  return a2 / (PI * t * t);
}

float GTR2_aniso(float NdotH, float HdotX, float HdotY, float ax, float ay) {
  return 1.0 / (
    PI * ax * ay *
    sqr(sqr(HdotX / ax) + sqr(HdotY / ay) + NdotH * NdotH)
  );
}

float smithG_GGX(float Ndotv, float alphaG) {
  float a = alphaG * alphaG;
  float b = Ndotv * Ndotv;
  return 1.0 / (Ndotv + sqrt(a + b - a * b));
}

vec3 mon2lin(vec3 x) {
  return vec3(pow(x[0], 2.2), pow(x[1], 2.2), pow(x[2], 2.2));
}

vec3 brdf(
  vec3 baseColor,
  float metallic,
  float subsurface,
  float specular,
  float roughness,
  vec3 L, vec3 V, vec3 N
) {
  float NdotL = dot(N, L);
  float NdotV = dot(N, V);

  vec3 H = normalize(L + V);
  float NdotH = dot(N, H);
  float LdotH = dot(L, H);

  vec3 Cdlin = mon2lin(baseColor);
  float Cdlum = 0.3 * Cdlin[0] + 0.6 * Cdlin[1]  + 0.1 * Cdlin[2]; // luminance approx.

  vec3 Ctint = Cdlum > 0.0 ? Cdlin / Cdlum : vec3(1.0); // normalize lum. to isolate hue+sat
  vec3 Cspec0 = mix(specular * .08 * mix(vec3(1.0), Ctint, specularTint), Cdlin, metallic);
  vec3 Csheen = mix(vec3(1.0), Ctint, sheenTint);

  // Diffuse fresnel - go from 1 at normal incidence to .5 at grazing
  // and mix in diffuse retro-reflection based on roughness
  float FL = SchlickFresnel(NdotL), FV = SchlickFresnel(NdotV);
  float Fd90 = 0.5 + 2.0 * LdotH * LdotH * roughness;
  float Fd = mix(1.0, Fd90, FL) * mix(1.0, Fd90, FV);

  // Based on Hanrahan-Krueger brdf approximation of isotropic bssrdf
  // 1.25 scale is used to (roughly) preserve albedo
  // Fss90 used to "flatten" retroreflection based on roughness
  float Fss90 = LdotH * LdotH * roughness;
  float Fss = mix(1.0, Fss90, FL) * mix(1.0, Fss90, FV);
  float ss = 1.25 * (Fss * (1.0 / (NdotL + NdotV) - 0.5) + 0.5);

  // specular
  float Ds = GTR2(NdotH, max(0.001, sqr(roughness)));
  float FH = SchlickFresnel(LdotH);
  vec3 Fs = mix(Cspec0, vec3(1.0), FH);
  float roughg = sqr(roughness * 0.5 + 0.5);
  float Gs = smithG_GGX(NdotL, roughg) * smithG_GGX(NdotV, roughg);

  // sheen
  vec3 Fsheen = FH * sheen * Csheen;

  // clearcoat (ior = 1.5 -> F0 = 0.04)
  float Dr = GTR1(NdotH, mix(0.1, 0.001, clearcoatGloss));
  float Fr = mix(0.04, 1.0, FH);
  float Gr = smithG_GGX(NdotL, 0.25) * smithG_GGX(NdotV, 0.25);

  return ((1.0/PI) * mix(Fd, ss, subsurface) * Cdlin + Fsheen)
    * (1.0 - metallic) +
    Gs * Fs * Ds +
    0.25 * clearcoat * Gr * Fr * Dr;
}

#pragma glslify: export(brdf)
