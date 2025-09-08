attribute vec3 pos;
attribute vec3 color;
uniform mat4 projCamera;
uniform float ps;

varying vec4 v_color;
void main(){
  gl_Position=projCamera*vec4(pos,1);
  gl_PointSize=ps;
  v_color=vec4(color,1);
}