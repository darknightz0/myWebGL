//* Vertex shader program


import { Camera,Scene,WebGL,Mouse,FPS,ShaderProgram,Texture2D,Texture3D,Skybox,FrameBuffer,
  Cube,AxisPlain,PolyShape
 } from  "./class.js";
//const { mat4, vec3 } = glMatrix;

/*頂點著色器 從buffer中提取資訊
/*位置=相機*在地
/*attribute 迭代
/*uniform 全域變數
/*gl_Position gl_FragColor 系統變數
/*varying 傳遞變數 指定的精度有 highp、mediump 與 lowp
*/
//varying lowp vec4 vColor;vColor = aVertexColor;
/**@type {Camera} lazy*/
var camera;
/**@type {Camera} lazy*/
var camera2;
/**@type {Scene} */
var scene1=new Scene();
//varying lowp vec4 vColor;gl_FragColor = vColor;

/**@type {ShaderProgram} lazy const*/
var shaderProgram={};
/**@type {ShaderProgram} lazy const*/
var shaderProgram_skybox={};
/**@type {ShaderProgram} lazy const*/
var shaderBase={};
/**@type {ShaderProgram} lazy const*/
var shaderFB={};

/**@type {Texture2D} lazy const*/
var fireTexture;

/**@type {WebGL} lazy const*/
var system;
/**@type {Cube} lazy const*/
var myCube;

onload=()=>{
  /**@type {HTMLCanvasElement} */
  const canvas = document.querySelector("#viewport");
  system=new WebGL(canvas);
  
   var ms=new Mouse(canvas);
  ms.dragCallback=(v)=>{
   camera.addAz2(v[0]);
   camera.addAl2(v[1]);
  }
  ms.wheelCallback=(dir)=>{
    if(dir>0){
      camera.focusR++;
    }
    else
      camera.focusR--;
  }
  ShaderProgram.completeCallback=()=>main();
  ShaderProgram.loadShader(system, "/shader.vs", "/shader.fs", shaderProgram,() => {
    shaderProgram = shaderProgram.value;
    shaderProgram.projCameraLoca=shaderProgram.uniform["uProjCamera"];
  });  
  ShaderProgram.loadShader(system, "/skybox.vs", "/skybox.fs", shaderProgram_skybox,() => shaderProgram_skybox = shaderProgram_skybox.value);     
  ShaderProgram.loadShader(system, "/axis.vs", "/axis.fs", shaderBase,() =>{
     shaderBase = shaderBase.value;
     shaderBase.projCameraLoca = shaderBase.uniform["projCamera"];
    });     
     ShaderProgram.loadShader(system, "/fb.vs", "/fb.fs", shaderFB,() => shaderFB = shaderFB.value);     
};
function main() {
  var s2=new Scene();
  camera2=new Camera(system,s2);
  camera2.xStr="51%";
  camera2.wStr="49%";


  camera=new Camera(system,scene1);
 
  camera.frameBuffer=new FrameBuffer(system.gl,shaderFB.uniform["txt2D"],camera);
   //camera.frameBuffer.texture2D
  new PolyShape(system.gl,shaderFB,[-1,-1,1,-1,1,1,-1,-1,1,1,-1,1],shaderFB.attribute["a_pos"],{scene:s2,texture2D:camera.frameBuffer.texture2D,
    textureCoord:[0, 0, 1, 0, 1, 1, 0, 0,1,1,0,1],textureCoordLoca:shaderFB.attribute["txtCoord"]
  });
 


  /**@type {HTMLDivElement} */
  const info = document.querySelector("#info");
  FPS.init();
  FPS.displayCallback=()=>{
    info.textContent="FPS : "+FPS.frames;
  }
  // 初始化 GL context

  document.body.onkeydown=(event)=>{
    const key=event.key;
    switch (key) {
      case "w":
        camera.move(0,0,1);
        break;
      case "s":
        camera.move(0,0,-1);
        break;
      case "a":
        camera.move(-1,0,0);
        break;
      case "d":
        camera.move(1,0,0);
        break;
      case ",":
        camera.focusR--;
        break;  
      case ".":
        camera.focusR++;
        break;
      case "1":
        scene1.skybox.addSunTime(-1);
        break;
      case "3":
        scene1.skybox.addSunTime(1);
      break;
      case "8":
        myCube.z-=1;
        break;
      case "2":
        myCube.z+=1;
        break;
      case "4":
        myCube.x-=1;
        break;
      case "6":
        myCube.x+=1;
        break;
      case "9":
        console.log(camera.w);console.log(system.gl.canvas.clientWidth);console.log(system.gl.canvas.width);
        break;
        
      case "c":
         camera.frameBuffer.screenShot();
        break;  
      default:
        break;
    }
  };
  Cube.initStatic(system.gl,shaderProgram,shaderProgram.attribute["aVertexPosition"],shaderProgram.attribute["aVertexNormal"]);
  myCube=new Cube(shaderProgram,shaderProgram.uniform["uModelViewMatrix"],shaderProgram.uniform["uNormalMatrix"],
    shaderProgram.uniform["u_cameraPos"],new Texture3D(system.gl,["pos-x.jpg","neg-x.jpg","pos-y.jpg","neg-y.jpg","pos-z.jpg","neg-z.jpg"],
    shaderProgram.uniform["u_textureCube"]
  ),scene1
  );
  camera.wStr="50%";
  camera.hStr="100%";
  // Load texture
  //fireTexture=new Texture2D(system.gl,"cubetexture.png",shaderProgram.uniform["uSampler"]);
 
  scene1.skybox=new Skybox(system.gl,shaderProgram_skybox,shaderProgram_skybox.attribute["a_pos"],
    new Texture3D(system.gl,["pos-x.jpg","neg-x.jpg","pos-y.jpg","neg-y.jpg","pos-z.jpg","neg-z.jpg"],
    shaderProgram_skybox.uniform["u_textureId"])
  ,shaderProgram_skybox.uniform["u_inverse"],{sunColorLoca:shaderProgram_skybox.uniform["sunColor"],sunDirLoca:shaderProgram_skybox.uniform["sunDir"]});
      new AxisPlain(system.gl,shaderBase,shaderBase.attribute["posXZ"],20,scene1)

  //requestAnimationFrame 傳遞自頁面載入以來的時間（毫秒)
  function render(now) {
    system.render();
    FPS.frames++;
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

