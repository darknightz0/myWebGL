precision mediump float;
uniform mat4 u_inverse;
uniform samplerCube u_textureId;

uniform vec3 sunColor;
uniform vec3 sunDir;


varying vec4 v_pos;
void main(){
  vec4 pos=u_inverse*v_pos;
  vec3 ambientLight = vec3(0.3, 0.3, 0.3);
  gl_FragColor=textureCube(u_textureId,normalize(pos.xyz/pos.w));

  vec3 lightC = ambientLight+max(dot(vec3(0,1,0), sunDir), 0.0)*sunColor;
  gl_FragColor=vec4(gl_FragColor.xyz*lightC,gl_FragColor.a);
}