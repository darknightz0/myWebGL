precision highp float;
varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    

    varying highp vec3 v_normal;
    varying highp vec3 v_pos;
    uniform  sampler2D uSampler;
    // 紋理。
    uniform samplerCube u_textureCube;
 
    // 相機位置。
    uniform highp vec3 u_cameraPos;

    void main(void) {
      //highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

      //gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
        vec3 worldNormal = normalize(v_normal);
      vec3 eyeToSurfaceDir = normalize(v_pos- u_cameraPos);//法線矩陣，該矩陣用於在處理立方體相對於光源的當前方向時變換
      vec3 direction = reflect(eyeToSurfaceDir,worldNormal);
 
      gl_FragColor = textureCube(u_textureCube, direction);
}