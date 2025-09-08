attribute vec2 posXZ;
uniform mat4 projCamera;

void main(){
  gl_Position=projCamera*vec4(posXZ.x,0,posXZ.y,1);
}