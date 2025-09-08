attribute vec2 a_pos;
varying vec4 v_pos;
void main(){
  gl_Position=vec4(a_pos,1,1);
  v_pos=gl_Position;
}