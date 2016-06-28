// Based on https://docs.unrealengine.com/latest/attachments/Engine/Rendering/LightingAndShadows/BumpMappingWithoutTangentSpace/mm_sfgrad_bump.pdf

vec2 heightDerivative(vec2 texST, sampler2D map) {
    vec2 TexDx = dFdx(texST);
    vec2 TexDy = dFdy(texST);
    vec2 STll = texST;
    vec2 STlr = texST + TexDx;
    vec2 STul = texST + TexDy;
    float Hll = texture2D(map, STll).x;
    float Hlr = texture2D(map, STlr).x;
    float Hul = texture2D(map, STul).x;
    float dBs = Hlr - Hll;
    float dBt = Hul - Hll;
    return vec2(dBs, dBt);
}

#pragma glslify: export(heightDerivative)
