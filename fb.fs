precision highp float;
uniform sampler2D txt2D;
varying vec2 v_txtCoord;
void main(){
    gl_FragColor=texture2D(txt2D,v_txtCoord);
}