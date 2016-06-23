// Based on https://docs.unrealengine.com/latest/attachments/Engine/Rendering/LightingAndShadows/BumpMappingWithoutTangentSpace5mm_sfgrad_bump.pdf
vec3 perturbNormal(vec3 surf_pos, vec3 surf_norm, vec2 dHdxy) {
    vec3 vSigmaX = dFdx(surf_pos);
    vec3 vSigmaY = dFdy(surf_pos);
    vec3 vN = vec3(normalize(surf_norm)); // normalized
    vec3 R1 = cross(vSigmaY, vN);
    vec3 R2 = cross(vN, vSigmaX);

    float fDet = dot(vSigmaX, R1);
    vec3 vGrad = sign(fDet) * (dHdxy.x * R1 + dHdxy.y * R2);
    return normalize(abs(fDet) * surf_norm - vGrad);
}

#pragma glslify: export(perturbNormal)
