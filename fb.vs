attribute vec2 a_pos;
attribute vec2 txtCoord;
varying vec2 v_txtCoord;
void main(){
  gl_Position=vec4(a_pos,1,1);
  v_txtCoord=txtCoord;
}