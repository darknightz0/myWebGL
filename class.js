/**@typedef {vec2,vec3,vec4,mat4 } */

import { vec2,vec3,vec4,mat4 } from  "./node_modules/gl-matrix/esm/index.js";
const identity=mat4.create();
Number.re="";
Number.prototype.deg2rad=function () {
    return this / 180 * Math.PI;
};
Date.re="";
Date.prototype.addHours=function(hh=0,mm=0,ss=0){
    this.setHours(this.getHours()+hh,this.getMinutes()+mm,this.getSeconds()+ss);
}
/**
 * @returns round float Hours
 */
Date.prototype.roundHour=function(){
    return this.getHours()+this.getMinutes()/60+this.getSeconds()/360;
}
/**
 * @param {number} deg 
 * @returns {number}
 */
function sind(deg){
    return Math.sin(deg.deg2rad());
}
/**
 * @param {number} deg 
 * @returns {number}
 */
function cosd(deg){
    return Math.cos(deg.deg2rad());
}
function timer(fun,itvl){
    var id=new Object();
    tt(fun,itvl);
    return id;
    function tt(fun,itvl){
        id.value=setTimeout(() => {
            if(fun()){
                tt(fun,itvl);
            }
        }, itvl);
    }
}
class WebGL{
    /**@type {WebGLRenderingContext} */
    gl;
    /**@type {boolean} */
    depthTest;
    /**@type {boolean} */
    isHD;
    /**@type {boolean} */
    #pixelReverseY;
    set pixelReverseY(value){
        this.#pixelReverseY=value;
        // 瀏覽器從載入的映像複製像素時，是按照從上到下的順序（從左上角開始）進行的；但 WebGL 則要求按照從下到上的順序（從左下角開始）進行
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL,this.#pixelReverseY);
    }
    /**@type {boolean} */
    get pixelReverseY(){
        return this.#pixelReverseY;
    }
    /**@type {vec4} */
    #clearColor;
    set clearColor(value){
        vec4.copy(this.#clearColor,value);
        this.gl.clearColor(this.#clearColor[0],this.#clearColor[1],this.#clearColor[2],this.#clearColor[3])
    }
    /**@type  {vec4}*/
    get clearColor(){
        return this.#clearColor;
    }
    /**@type {boolean} */
    #isCullBack;
    /**@type {boolean} 逆時針為 front*/
    get isCullBack(){
        return this.#isCullBack;
    }
    set isCullBack(value){
        this.#isCullBack=value;
        if(this.#isCullBack)
            this.gl.enable(this.gl.CULL_FACE);
        else
            this.gl.disable(this.gl.CULL_FACE);
    }
 
    /**@type {Camera[]} */
    cameras;
    /**
     * @param {HTMLCanvasElement} canvas 
     */
    constructor(canvas){
        this.gl=canvas.getContext("webgl");
        if (this.gl === null) {
            alert("無法初始化 WebGL，你的瀏覽器不支援。");
        }
        this.depthTest=true;
        this.#clearColor=vec4.create();
        this.clearColor=vec4.fromValues(0,0,0,1);
        this.pixelReverseY=false;
        this.isCullBack=true;

        this.cameras=[];
        this.isHD=false;
    }
    //有許多 相機&viewport 拍攝唯一場景 場景中有許多物件
    render(){
        if (this.depthTest) {
            this.gl.clearDepth(1.0); // 清除所有東西 df=1
            this.gl.enable(this.gl.DEPTH_TEST); // Enable 深度測試
            this.gl.depthFunc(this.gl.LEQUAL); // Near things obscure far things
        }
        // width/height=輸出品質 clientWidth/Height=html元素的大小 window.devicePixelRatio=裝置實際像素倍率
        // 使 輸出=client *devicePixelRatio 顯示最佳品質 網頁位置viewport還是用client來算
        if(this.isHD){
            this.gl.canvas.width=this.gl.canvas.clientWidth*window.devicePixelRatio;
            this.gl.canvas.height=this.gl.canvas.clientHeight*window.devicePixelRatio;
        }
        else{
            this.gl.canvas.width=this.gl.canvas.clientWidth;
            this.gl.canvas.height=this.gl.canvas.clientHeight;
        }
        
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | (this.depthTest)?this.gl.DEPTH_BUFFER_BIT:0 );
        this.cameras.forEach(c=>{
            c.setViewport();
            c.scene?.render(c);
        });
    }
}
class Mouse{
    /**@type {vec2} */
    pos;
    /**@type {(v:vec2)=>} ReadonlyVec2 變化輛*/
    dragCallback;
    /**@type {(dir:number)=>} top -> buttom, - -> +*/
    wheelCallback;
    //
    #isDown;
    #dPos;
    /**
     * @param {HTMLElement} htmlEle 
     */
    constructor(htmlEle){
        this.#isDown=false;
        this.pos=vec2.create();
        this.#dPos=vec2.create();
        this.dragCallback=()=>{};
        this.wheelCallback=()=>{};
        htmlEle.onmousedown=(event)=>{
            this.#isDown=true;
            vec2.set(this.pos,event.offsetX,event.offsetY);
        }
        htmlEle.onmousemove=(event)=>{
            if(this.#isDown){
                vec2.set(this.#dPos,-event.offsetX,-event.offsetY);
                vec2.add(this.#dPos,this.pos,this.#dPos);
                this.dragCallback(this.#dPos);
                vec2.set(this.pos,event.offsetX,event.offsetY);
            }
        }
        htmlEle.onmouseup=(event)=>{
            this.#isDown=false;
        }
        htmlEle.onmouseleave=(event)=>{
            this.#isDown=false;
        }
        htmlEle.onwheel=(event)=>{
            this.wheelCallback(event.deltaY);
        }
    }
}
class FPS{
    /**@type {number} */
    static frames;
    /**@type {()=>} */
    static displayCallback;
    static init(){
        this.frames=0;
        this.displayCallback=()=>{};
        timer(()=>{

            this.displayCallback();
            this.frames=0;
            return true;
        },1000);
    }
}
class ShaderAttribute{
    /**@type {WebGLRenderingContext} */
    #gl;
    /**@type {number} */
    location;

    #type;
    #normalize;
    #stride;
    #offset;
    #num;
    /**
     * @param {WebGLRenderingContext} gl 
     * @param {number} location 
     * @param {number} num 幾個為一組數據
     * @param {number} [type] (def)gl.[FLOAT]
     * @param {boolean} [normalize] (def)false
     * @param {number} [stride] (def)0 間隔
     * @param {number} [offset] (def)0 起始
     */
    constructor(gl,location,num,type=gl.FLOAT,normalize=false,stride=0,offset=0){
        this.#gl=gl;
        this.location=location;

        this.#num=num;
        this.#type=type;
        this.#normalize=normalize;
        this.#stride=stride;
        this.#offset=offset;
    }
    attribPointer(num=this.#num,type=this.#type,normalize=this.#normalize,stride=this.#stride,offset=this.#offset) {
        this.#gl.vertexAttribPointer(
            this.location,
            num,
            type,
            normalize,
            stride,
            offset
        );
        this.#gl.enableVertexAttribArray(this.location);
    }
}
class ShaderUniform{
    /**@type {WebGLRenderingContext} */
    #gl;
    /**@type {WebGLUniformLocation} */
    location;
    /**
     * @param {WebGLRenderingContext} gl 
     * @param {WebGLUniformLocation} location 
     * @param {string} type vec4|vec3|vec2|number|mat4|sampler2D|samplerCube
     */
    constructor(gl,location,type){
        this.#gl=gl;
        
        this.location=location;

        switch (type) {
            case "mat4":
                this.setUniform=(data)=>this.#gl.uniformMatrix4fv(this.location,false,data);
                break;
            case "vec2":
                this.setUniform=(data)=>this.#gl.uniform2fv(this.location,data);
                break;    
            case "vec3":
                this.setUniform=(data)=>this.#gl.uniform3fv(this.location,data);
                break;
            case "vec4":
                this.setUniform=(data)=>this.#gl.uniform4fv(this.location,data);
                break;
            case "sampler2D":
                this.setUniform=(data)=>this.#gl.uniform1i(this.location,data);
                break;
            case "samplerCube":
                this.setUniform=(data)=>this.#gl.uniform1i(this.location,data);
                break;
            default:
                alert("ShaderUniform constructor unknow type:"+type);
                break;
        }
    }
    /**
     * @type {(data:vec4|vec3|vec2|number|mat4)=>void}  @virtual
     */
    setUniform;
}
class ShaderProgram{
    /**@type {WebGLRenderingContext} */
    #gl;
    /**@type {WebGLShader} */
    #vertexShader;
    /**@type {WebGLShader} */
    #fragmentShader;
    /**@type {WebGLProgram} */
    program;
    /**@type {Object.<string,ShaderAttribute>} number loca*/
    attribute;
    /**@type {Object.<string,ShaderUniform>} */
    uniform;
    /**@type {IObject[]} */
    renderObj;

    /**@type {ShaderUniform?} mat4Loca*/
    projCameraLoca=null;
    /**
     * @param {WebGLShader} gl 
     * @param {string} vSource 
     * @param {string} fSource 
     */
    constructor(gl, vSource,fSource){
        this.#gl = gl;
        this.renderObj=[];
        this.#vertexShader=this.#loadShader(this.#gl.VERTEX_SHADER,vSource);
        this.#fragmentShader=this.#loadShader(this.#gl.FRAGMENT_SHADER,fSource);
        this.program=this.#gl.createProgram();
        this.#gl.attachShader(this.program, this.#vertexShader);
        this.#gl.attachShader(this.program, this.#fragmentShader);
        this.#gl.linkProgram(this.program);

        // 錯誤處理
        if (!this.#gl.getProgramParameter(this.program, this.#gl.LINK_STATUS)) {
            alert(
                "Unable to initialize the shader program: " +
                this.#gl.getProgramInfoLog(this.program),
            );
        }
        this.attribute={};
    
        this.uniform={};
    }
    /**
     * @param {number} type gl.[shader type]
     * @param {string} source 
     * @returns 
     */
    #loadShader(type, source) {
        const shader = this.#gl.createShader(type);
        this.#gl.shaderSource(shader, source);
        this.#gl.compileShader(shader);
        if (!this.#gl.getShaderParameter(shader, this.#gl.COMPILE_STATUS)) {
            alert(
                "An error occurred compiling the shaders: " + this.#gl.getShaderInfoLog(shader),
            );
            this.#gl.deleteShader(shader);
            return null;
        }
        return shader;
    }
    /**
     * gl.useProgram()後才可用uniform
     * @param {mat4|null} projCamera 
     */
    useProgram(projCamera){
        this.#gl.useProgram(this.program);
        this.projCameraLoca?.setUniform(projCamera);
    }
    /**
     * @param {string} name =gl.getUniformLocation(this.program,name)
     */
    getUniformLocation(name){
       return this.#gl.getUniformLocation(this.program,name);
    }
    /**
     * @param {string} name =gl.getAttribLocation(this.program,name)
     */
    getAttribLocation(name){
       return this.#gl.getAttribLocation(this.program,name);
    }
    
    /**
     * @param  {string[][]} name varName in shade script
     */
    #setUniformLocation(name){
        this.useProgram();
        name.forEach(e=>{
            var loca=this.getUniformLocation(e[2]);
            if(loca!=null){//ShaderUniform
                this.uniform[e[2]]=new ShaderUniform(this.#gl,loca,e[1]) ;
            }
            else{
                alert("ShaderProgram:shade Uniform "+e[2]+" is not exist");
            }
        })
    }
    /**
     * @param  {string[][]} name varName in shade script
     */
    #setAttribLocation(name){
        this.useProgram();
        name.forEach(e=>{
            var loca=this.getAttribLocation(e[2]);
            if(loca!=-1){
                this.attribute[e[2]]=new ShaderAttribute(this.#gl,loca,e[1]);
            }
            else{
                alert("ShaderProgram:shade attribute "+e[2]+" is not exist");
            }
        })
    }
    static #attribReg=/attribute\s+vec(\d)\s+(\w+)\s*;/g;
    static #unifReg=/uniform\s+(?:\w+\s+)?(vec[2-4]|mat4|sampler(?:2D|Cube))\s+(\w+)\s*;/g;//有可能有精度
    /**
     * @param {WebGL} system 
     * @param {string} vsPath file path
     * @param {string} fsPath file path
     * @param {{value:ShaderProgram}} out output input require object
     * @param {()=>} completeCallback  
     */
    static loadShader(system,vsPath,fsPath,out,completeCallback=()=>{}){
        this.#loadShaderNum++;
        /**@type {string} */
        var vs,fs;
        /**@type {[]} */
        var att,uni;
        fetch(vsPath).then(e => e.text()).then(e => {
            vs = e;
            fetch(fsPath).then(e => e.text()).then(e => {
                fs = e;
                var sh=new ShaderProgram(system.gl,vs,fs);
                out.value=sh;

                this.#loadShaderNum--;
                
                att=[...vs.matchAll(this.#attribReg),...fs.matchAll(this.#attribReg)];
                uni=[...vs.matchAll(this.#unifReg),...fs.matchAll(this.#unifReg)];
                
                //console.log(att)
                //console.log(uni)
                
                sh.#setAttribLocation(att);
                sh.#setUniformLocation(uni);
                completeCallback();
                if(this.#loadShaderNum==0){
                    this.completeCallback();
                    this.#loadShaderNum=-1;
                    
                }
            })
        })
    }
    static #loadShaderNum=0;
    /**@virtual exe when all ShadeProgram.loadShader() complete*/
    static completeCallback(){

    }
}
class Buffer{
    /**@type {WebGLBuffer} */
    #buffer;
    /**@type {number} gl.[buffer type]*/
    #bufferType;
    /**@type {WebGLRenderingContext} */
    #gl;
    /**
     * @param {WebGLRenderingContext} gl 
     * @param {ArrayBufferLike} data arraytype :new Float32Array(),Int16Array...
     * @param {number} bufferType gl.[buffer type] [ARRAY_BUFFER,ELEMENT_ARRAY_BUFFER(index專用)]
     * @param {number} usage gl.[(default) STATIC_DRAW,STREAM_DRAW,DYNAMIC_DRAW]
     */
    constructor(gl,data,bufferType,usage=gl.STATIC_DRAW){
        this.#gl=gl;
        this.#bufferType=bufferType;
        this.#buffer=this.#gl.createBuffer();
        this.#gl.bindBuffer(this.#bufferType,this.#buffer);
        this.#gl.bufferData(this.#bufferType,data,gl.STATIC_DRAW);
    }
    bindBuffer(){
        this.#gl.bindBuffer(this.#bufferType,this.#buffer);
    }
}
class BufferData{
    /**@type {Buffer} */
    #buffer;
    /**@type {ShaderAttribute} */
    #shadeAttribute;
    /**
     * @param {Buffer} buffer new Buffer()
     * @param {ShaderAttribute} shaderAttribute shaderProgram.attribute["key"]
     */
    constructor(buffer,shaderAttribute){
        this.#buffer=buffer;
        this.#shadeAttribute=shaderAttribute;
    }
    /**buffer.bind + shade Aattribute pointer*/
    setData(){
        this.#buffer.bindBuffer();
        this.#shadeAttribute.attribPointer();
    }
}
/**@abstract */
class ITexture{
    /**@type {WebGLRenderingContext} @protected*/
    gl;
    /**@type {WebGLTexture} @protected*/
    texture;
    /**@type {ShaderUniform} shader*/
    location;
    /**@type {number}*/
    textureUnit;
    /**@type {number}*/
    w;
    /**@type {number}*/
    h;
    /**@abstract */
    bindTexture(){

    }
}

class Texture2D extends ITexture{
    /**@inheritdoc */
    gl;
    /**@inheritdoc*/
    texture;
    /**@inheritdoc*/
    location;
    /**@inheritdoc*/
    textureUnit;
    w;
    h;
    /**@type {HTMLImageElement} */
    img;
    /**
     * @param {WebGLRenderingContext} gl 
     * @param {ShaderUniform} location 
     * @param {string?} src 
     */
    constructor(gl,location,src=null,textureUnit=0){
        super();
        this.gl=gl;
        this.location=location;
        this.textureUnit=textureUnit;
        this.texture=this.gl.createTexture();
        this.img=new Image();
        const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.w=1;
        this.h=1;
        gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGBA,
            this.w,
            this.h,
            0,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            pixel,
        );
        
        this.img.onload=()=>{
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
            this.gl.texImage2D(
                this.gl.TEXTURE_2D,
                0,
                this.gl.RGBA,// internalFormat= GPU 格式
                this.gl.RGBA,
                this.gl.UNSIGNED_BYTE,//srcType 型別
                this.img
            );
            this.w=this.img.width;
            this.h=this.img.height;
            this.#mapping();
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);  
        };
        if(src!=null)
            this.img.src=src;
    }
    #isPowerOf2(value) {
        return (value & (value - 1)) === 0;
    }
    #mapping(){
        // WebGL1 對於圖片的小是否為2的次方有不同寫法
            if (this.#isPowerOf2(this.w) && this.#isPowerOf2(this.h)) {
                this.gl.generateMipmap(this.gl.TEXTURE_2D);
            } else {
                //gl.[REPEAT CLAMP_TO_EDGE MIRRORED_REPEAT]
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
                /**
                 * NEAREST= 從最大的貼圖中選擇1 個像素
                 LINEAR= 從最大的貼圖中選擇4個像素然後混合
                 NEAREST_MIPMAP_NEAREST= 選擇最適合的貼圖，然後從上面找到一個像素
                 LINEAR_MIPMAP_NEAREST= 選擇最適合的貼圖，然後取出4 個像素進行混合
                 NEAREST_MIPMAP_LINEAR= 選擇最適合的兩個貼圖，從每個上面選擇1 個像素然後混合
                 LINEAR_MIPMAP_LINEAR= 選擇最合適的兩個貼圖，從每個上選擇4 個像素然後混合
                 */
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR);
            }
    }
    /**
     * @param {number} w 
     * @param {number} h 
     */
    resize(w,h){
        this.gl.deleteTexture(this.texture);
        this.texture=this.gl.createTexture();
        this.w=w;this.h=h;
        this.gl.bindTexture(this.gl.TEXTURE_2D,this.texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.w,this.h,0,this.gl.RGBA,this.gl.UNSIGNED_BYTE,null);
        this.#mapping();
    }
    bindTexture(){
        // Tell WebGL we want to affect texture unit 0
        this.gl.activeTexture(this.gl.TEXTURE0+this.textureUnit);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        // Tell the shader we bound the texture to texture unit 0
        this.location.setUniform(this.textureUnit);
    }
}
class Texture3D extends ITexture{
    /**@inheritdoc*/
    gl;
    /**@inheritdoc*/
    texture;
    /**@inheritdoc*/
    location;
    /**@inheritdoc*/
    textureUnit;
    /**@type {HTMLImageElement[]} */
    #img;
    /**@type {number[]} webgl enum*/
    #dir;
    /**@type {number}*/
    #loadCount;
    /**
     * @param {WebGLRenderingContext} gl 
     * @param {string[]} src [x+,x-,y+,y-,z+,z-] len=6
     * @param {ShaderUniform} location shader uniform["key"]
     * @param {number} [textureUnit] 
     */
    constructor(gl, src,location,textureUnit=0) {
        super();
        this.location=location;
        this.textureUnit=textureUnit;
        this.gl = gl;
        this.texture=this.gl.createTexture();
        this.#img=[];
        this.#dir=[
            this.gl.TEXTURE_CUBE_MAP_POSITIVE_X,this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z,this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
        ];
        this.#loadCount=0;
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.texture);
        for(let i=0;i<this.#dir.length;i++){
            this.gl.texImage2D(this.#dir[i], 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
            this.#img.push(new Image());
            this.#img.at(-1).onload=(()=>{
                var ind=i;
                return ()=>{
                    this.#loadCount++;
                    this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.texture);
                    this.gl.texImage2D(this.#dir[ind], 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.#img[ind]);
                    if(this.#loadCount==6)
                        this.gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                }
            })();
            this.#img.at(-1).src=src[i];
        }
        this.gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        this.gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    }
    bindTexture(){
        this.gl.activeTexture(this.gl.TEXTURE0+this.textureUnit);
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.texture);
        this.location.setUniform(this.textureUnit);  
    }
}
class FrameBuffer{
    
    /**@type {WebGLRenderingContext} */
    #gl;
    /**@type {WebGLFramebuffer} */
    #buffer;
    /**@type {RenderBuffer} */
    #depthBuffer;
    /**@type {Texture2D} */
    texture2D;
    /**@type {Camera} */
    camera;

    /**
     * @param {WebGLRenderingContext} gl
     * @param {ShaderUniform?} textureLoca 
     * @param {Camera?} camera 
     */
    constructor(gl,textureLoca=null,camera=null){
        this.#gl=gl;
        this.camera=camera;//???

        this.#buffer=this.#gl.createFramebuffer();
        this.texture2D=new Texture2D(this.#gl,textureLoca);
        this.texture2D.resize(512,512)
        
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER,this.#buffer);
 
        
        /*
        canava 本身也是frame buffer 當bind= null
        指定 的連接點
        gl.COLOR_ATTACHMENT0：將紋理附加到幀緩衝區的顏色緩衝區。
        gl.DEPTH_ATTACHMENT：將紋理附加到幀緩衝區的深度緩衝區。
        gl.STENCIL_ATTACHMENT：將紋理附加到幀緩衝區的模板緩衝區。
        tar
        txt2D or x,y,z/+,- Cube
        */
        this.#gl.framebufferTexture2D(this.#gl.FRAMEBUFFER,this.#gl.COLOR_ATTACHMENT0,this.#gl.TEXTURE_2D,this.texture2D.texture,0);
        
        //framebuffer 附加物深度緩衝
        this.#depthBuffer=new RenderBuffer(this.#gl,this.#gl.DEPTH_COMPONENT16,512,512);
        this.#gl.framebufferRenderbuffer(this.#gl.FRAMEBUFFER,this.#gl.DEPTH_ATTACHMENT,this.#gl.RENDERBUFFER,this.#depthBuffer.buffer);
        
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER,null);
        //gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    }
    
    /**
     * @param {Camera} camera 
     */
    screenShot(camera=this.camera){
        this.#checkSize(camera);
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER,this.#buffer);
        this.#gl.viewport(0,0,this.texture2D.w,this.texture2D.h);
        
        this.#gl.clearColor(0, 0, 1, 1);   // clear to blue
        this.#gl.clear(this.#gl.COLOR_BUFFER_BIT | this.#gl.DEPTH_BUFFER_BIT);
        
        camera.scene.render(camera);
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER,null);
    }
    /**
     * @param {Camera} camera 
     */
    #checkSize(camera){
        if(this.texture2D.w!=camera.w||this.texture2D.h!=camera.h){
            //console.log("resize")
            this.texture2D.resize(camera.w,camera.h);
            
            this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER,this.#buffer);
            this.#gl.framebufferTexture2D(this.#gl.FRAMEBUFFER,this.#gl.COLOR_ATTACHMENT0,this.#gl.TEXTURE_2D,this.texture2D.texture,0);
            
            
            this.#depthBuffer.resize(camera.w,camera.h);
            this.#gl.framebufferRenderbuffer(this.#gl.FRAMEBUFFER,this.#gl.DEPTH_ATTACHMENT,this.#gl.RENDERBUFFER,this.#depthBuffer.buffer);
            
            this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER,null);
        }
    }
}
class RenderBuffer{
    /**@type {WebGLRenderingContext} */
    #gl;
    /**@type {WebGLRenderbuffer} */
    buffer;
    /**
        @type {number} 
        gl.RGBA4   
        gl.RGB565: 5 red bits, 6 green bits, 5 blue bits.    
        gl.RGB5_A1: 5 red bits, 5 green bits, 5 blue bits, 1 alpha bit.   
        gl.DEPTH_COMPONENT16: 16 depth bits.   
        gl.STENCIL_INDEX8: 8 stencil bits.   
        gl.DEPTH_STENCIL
    */
    type;
    /**
     * 
     * @param {WebGLRenderingContext} gl 
     * @param {number} type 
     * gl.RGBA4   4 red bits, 4 green bits, 4 blue bits 4 alpha bits.
        gl.RGB565: 5 red bits, 6 green bits, 5 blue bits.    
        gl.RGB5_A1: 5 red bits, 5 green bits, 5 blue bits, 1 alpha bit.   
        gl.DEPTH_COMPONENT16: 16 depth bits.   
        gl.STENCIL_INDEX8: 8 stencil bits.   
        gl.DEPTH_STENCIL
     * @param {number} w 
     * @param {number} h 
     */
    constructor(gl,type,w,h){
        this.#gl=gl;
        this.type=type;
        this.resize(w,h);
    }
    resize(w,h){
        this.#gl.deleteRenderbuffer(this.buffer);
        this.buffer=this.#gl.createRenderbuffer();
        this.#gl.bindRenderbuffer(this.#gl.RENDERBUFFER,this.buffer);
        this.#gl.renderbufferStorage(this.#gl.RENDERBUFFER,this.type,w,h);
    }
}
class IObject{
    /**@type {WebGLRenderingContext}@protected */
    static gl;
    /**@type {WebGLRenderingContext}@protected */
    gl;
    /**@type {ShaderProgram} @protected */
    shaderProgram;
    /**@type {BufferData} @virtual @protected */
    static vertex;
    /**@type {BufferData} @virtual @protected */
    vertex;
    /**@type {ShaderAttribute} @virtual*/
    posLoca;
    /**@type {ShaderUniform} @virtual*/
    modelLoca;
    /**@param {Camera} camera @abstract */
    draw(camera){

    }
    constructor(){}
}
class Skybox extends IObject{
    /**@type {BufferData} */
    #pos;
    /**@type {Texture3D} */
    #texture3D;
    inverseLoca;
    /**@type {mat4} */
    #inv;

    /**@type {ShaderUniform?} */
    sunColorLoca;
    /**@type {ShaderUniform?} */
    sunDirLoca;
    /**@type {vec3} */
    sunColor;
    /**@type {vec3} */
    sunDir;
    /**@type {vec3} */
    #sunDir;
    /**@type {vec3} */
    #dz;
    /**@type {Date} */
    #sunTime;
    get sunTime(){
        return this.#sunTime;
    }
    set sunTime(value){
        this.#sunTime=value;
        vec3.rotateZ(this.sunDir,this.#sunDir,this.#dz,this.#sunTime.roundHour()/12*Math.PI);
    }
    addSunTime(hh=0,mm=0,ss=0){
        this.#sunTime.addHours(hh,mm,ss);
        vec3.rotateZ(this.sunDir,this.#sunDir,this.#dz,this.#sunTime.roundHour()/12*Math.PI);
    }
    /**
     * @param {WebGLRenderingContext} gl 
     * @param {ShaderProgram} shaderProgram 
     * @param {ShaderAttribute} posLoca shader attribute loca vec2
     * @param {Texture3D} texture3D 
     * @param {ShaderUniform} inverseLoca shader uniform loca (proj*camera)^-1 =camera^-1*proj^-1
     * @param {Object} [param5={}] 
     * @param {ShaderUniform?} [param5.sunColorLoca] 
     * @param {ShaderUniform?} [param5.sunDirLoca] 
     */
    constructor(gl,shaderProgram,posLoca,texture3D,inverseLoca,{sunColorLoca=null,sunDirLoca=null}={}){
        super();
        this.gl=gl;
        this.shaderProgram=shaderProgram;

        this.#texture3D=texture3D;

        this.#inv=mat4.create();

        this.inverseLoca=inverseLoca;
        this.sunColorLoca=sunColorLoca;
        this.sunDirLoca=sunDirLoca;
        this.#pos = new BufferData(new Buffer(this.gl, new Float32Array([
            -1, -1, 1, -1, -1, 1,
            -1, 1, 1, -1, 1, 1,
        ]), gl.ARRAY_BUFFER),
        posLoca);

        this.sunColor=vec3.fromValues(1,1,0.8);
        this.sunDir=vec3.fromValues(0,-1,0);
        this.#sunDir=vec3.fromValues(0,-1,0);
        this.#dz=vec3.fromValues(0,0,0);
        this.#sunTime=new Date(2000,0,1,0,0,0);
    }
    /**@param {Camera} camera @override */
    draw(camera){
        mat4.copy(this.#inv,camera.modelMatrix);
        this.#inv[12]=0;
        this.#inv[13]=0;
        this.#inv[14]=0;

        mat4.multiply(this.#inv,this.#inv,camera.projectMatrixInv);
        
        this.shaderProgram.useProgram(camera.projCamera);
        this.inverseLoca.setUniform(this.#inv);
        this.#pos.setData();
        this.#texture3D.bindTexture();
        
        this.sunColorLoca?.setUniform(this.sunColor);
        this.sunDirLoca?.setUniform(this.sunDir);

        this.gl.drawArrays(this.gl.TRIANGLES,0,6);
    }
}

class IObject3D extends IObject{
    /**@type {BufferData?} @virtual*/
    static normal=null;
    /**@type {ShaderProgram?}@virtual*/
    static shaderProgram=null;
    /**@type {Buffer?} @virtual*/
    static index=null;

    /**@type {ShaderUniform?} @virtual*/
    modelInvTLoca;
    /**@type {BufferData?} @virtual*/
    normal=null;
    /**@type {ShaderProgram?}@virtual*/
    shaderProgram=null;
    /**@type {Buffer?} @virtual*/
    index=null;
    /**@type {number?} @virtual*/
    count=null;

    /**@type {BufferData?} @virtual s t*/
    textureCoord=null;

    /**@type {Texture2D?} @virtual Image*/
    texture2D=null;
    /**@type {Texture3D?} @virtual Image Cube*/
    texture3D=null;

    /**@type {vec3} */
    rotate;
     /**@type {IObject3D[]} */
    children;
    /**@type {IObject3D?} */
    parent;

    /**@param {number} value degree*/
    set rx(value){ this.rotate[0]=value;}
    get rx(){return this.rotate[0];}
    /**@param {number} value degree*/
    set ry(value){ this.rotate[1]=value;}
    get ry(){return this.rotate[1];}    
    /**@param {number} value degree*/
    set rz(value){ this.rotate[2]=value;}
    get rz(){return this.rotate[2];}
    /**@virtual */ 
    get pos(){
        return this.#pos;
    }
    /**
     * @param {vec3} value
     *  @virtual
     * */
    set pos(value){
        this.#pos=value;
    }
    /**@virtual */ 
    get x(){
        return this.#pos[0];
    }
    /** @param {number} value */
    set x(value){
        this.#pos[0]=value;
    }
    /**@virtual */ 
    get y(){
        return this.#pos[1];
    }
    /** @param {number} value */
    set y(value){
        this.#pos[1]=value;
    }
    /**@virtual */ 
    get z(){
        return this.#pos[2];
    }
    /** @param {number} value */
    set z(value){
        this.#pos[2]=value;
    }
    /**@virtual */
    get modelMatrix(){
        mat4.translate(this.#modelMatrix,identity,this.#pos);
        mat4.rotateX(this.#modelMatrix,this.#modelMatrix,this.rx.deg2rad());
        mat4.rotateY(this.#modelMatrix,this.#modelMatrix,this.ry.deg2rad());
        mat4.rotateZ(this.#modelMatrix,this.#modelMatrix,this.rz.deg2rad());
        return this.#modelMatrix;
    }
    get normalMatrix(){
        mat4.invert(this.#normalMatrix, this.modelMatrix);
        mat4.transpose(this.#normalMatrix, this.#normalMatrix);
        return this.#normalMatrix;
    }
//private
    /**@type {mat4} */
    #modelMatrix;
    /**@type {vec3} */
    #pos;
    #normalMatrix;
    constructor(){
        super();
        this.#modelMatrix=mat4.create();
        this.#normalMatrix=mat4.create();
        this.#pos=vec3.create();
        this.pos=vec3.create();
        this.rotate=vec3.create();
        this.children=[];
        this.parent=null;
    }
    
    /** @param {vec3} value */
    addPos(value){
        vec3.add(this.pos,this.pos,value);
    }
    /** @param {vec3} value */
    addRotate(value){
        vec3.add(this.rotate,this.rotate,value);
    }
    /**@virtual */ 
    drawLoop(){
        
    }
    /**@abstract vertex normal*/
    static initStatic(){

    }
}
class Camera extends IObject3D{
    /**@type {FrameBuffer?}*/
    frameBuffer;
    /**@type {IObject3D?}*/
    focusObj;
    /**@type {number} 1 2 3人稱*/
    viewMode;
    /**@type {number} */
    sensitivity;
    /**@type {number} */
    sensitivityBase;
    /**@type {number} +z=0 ,+x=90  0~+359 deg 方位角(1)*/
    get az1(){
        return this.#az1;
    }
    set az1(value){
        value=value%360;
        if(value<0)
            value+=360;
        this.#az1=value;
    }
    /**@type {number} +z=0 ,+y=90 -90~+90 deg 高度角(1)*/
    get al1(){
        return this.#al1;
    }
    set al1(value){
        value=value%90;
        this.#al1=value;
    }
    
    /**@type {number} +z=0 ,+x=90  -359~+359 deg 方位角(2)*/
    get az2(){
        return this.#az2;
    }
    set az2(value){
        value=value%360;
        this.#az2=value;
    }
    /**@type {number} +z=0 ,+y=90 -90~+90 deg 高度角(2)*/
    get al2(){
        return this.#al2;
    }
    set al2(value){
        value=Math.min(value,90);
        value=Math.max(value,-90);
        /*
        value=value%360;
        if(Math.abs(value)>270){
            if(value>0){
                value=value-360; 
            }
            else{
                value=value+360; 
            }
        }
        else if(Math.abs(value)>180){
            this.az2=this.az2+180;
            value=-value%180; 
        }
        else if(Math.abs(value)>90){
            this.az2=this.az2+180;
            if(value>0){
                value=-value%90+90;
            }
            else{
                value=-value%90-90;
            }
        }
            */
        this.#al2=value;
    }
    get focusR(){
        return this.#focusR;
    }
    /**@param {number} value focus center dis*/
    set focusR(value){
        if(value<0){
            value=0.01;
        }
        this.#focusR=value;
    }
    /** 攝影機mat4*/
    get viewMat4(){
        mat4.lookAt(this.#viewMat4,this.pos,this.focusPos,this.#vUp);
        mat4.invert(this.#modelMatrix,this.#viewMat4);
        return this.#viewMat4;
    }
    
    /**@override 位置矩陣 相機的反矩陣*/
    get modelMatrix(){
        return this.#modelMatrix;
    }
    /**@override */
    get pos() {
        if (this.viewMode == 2) {
            vec3.set(this.#pos, cosd(this.#al2) * sind(this.#az2), sind(this.#al2), cosd(this.#al2) * cosd(this.#az2));
            vec3.scale(this.#pos, this.#pos, this.#focusR);

            if (this.focusObj != null) {
                vec3.add(this.#pos, this.focusObj.pos, this.#pos);
                vec3.copy(this.#focusPos, this.focusObj.pos);
            }else{
                vec3.add(this.#pos, this.#focusPos, this.#pos);
            }
        }
        return this.#pos;
    }
    /**@override */
    set pos(value) {
        if (this.viewMode == 1) {
            vec3.copy(this.#pos,value);
        }
    }
    set focusPos(value){
        vec3.copy(this.#focusPos,value);
    }
    /**@type {vec3} */
    get focusPos(){
        if(this.viewMode==1){
            vec3.set(this.#focusPos,cosd(this.#al1) * sind(this.#az1), sind(this.#al1), cosd(this.#al1) * cosd(this.#az1));
            vec3.scale(this.#focusPos, this.#focusPos, this.#focusR);
            vec3.add(this.#focusPos, this.#focusPos, this.pos);
        }
        return this.#focusPos;
    }
    /**@type {number}  0~180 degree*/
    fieldOfViewY;
    /**@type {number}*/
    zNear;
    /**@type {number}*/
    zFar;
    #projectMatrix;
    #projectMatrixInv;
    get projectMatrix(){
        //aspect
        mat4.perspective(this.#projectMatrix,this.fieldOfViewY.deg2rad(),
        this.w/this.h,this.zNear,this.zFar);
        return this.#projectMatrix;
    }
    get projectMatrixInv(){
        mat4.invert(this.#projectMatrixInv,this.projectMatrix);
        return this.#projectMatrixInv;
    }
    /**@type {number} */
    x=0;
    /**@type {string?} */
    xStr=null;
    /**@type {number} */
    y=0;
    /**@type {string?} */
    yStr=null;
    /**@type {number} */
    w;
    /**@type {string?} */
    wStr=null;
    /**@type {number} */
    h;
    /**@type {string?} */
    hStr=null;
    
    /**@type {mat4} shader loca*/
    #projCamera;
    
    /**@type {Scene?} */
    scene;
    get projCamera(){
        mat4.multiply(this.#projCamera,this.projectMatrix,this.viewMat4);
        return this.#projCamera;
    }
    /**
     * @param {string} str 
     * @param {number} ref 
     */
    #str2num(str,ref){
        str=str.replaceAll(/\s/g,"");
        if(str.at(-1)=="%")
            return Math.round(parseFloat(str)/100*ref);
    }
    //not finish

    setViewport(){
        if(this.xStr!=null)
            this.x=this.#str2num(this.xStr,this.gl.canvas.width);
        if(this.wStr!=null){
            this.w=this.#str2num(this.wStr,this.gl.canvas.width);
        }
            
        if(this.hStr!=null)
            this.h=this.#str2num(this.hStr,this.gl.canvas.clientHeight);
        if(this.yStr!=null)
            this.y=this.#str2num(this.yStr,this.gl.canvas.clientHeight);
        this.gl.viewport(this.x, this.y, this.w, this.h);
    }
//private
    /**@type {number} +z=0 ,+x=90  0~+359 deg 方位角(1)*/
    #az1;
    /**@type {number} +z=0 ,+y=90 -90~+90 deg 高度角(1)*/
    #al1;     
    /**@type {number} +z=0 ,+x=90  -359~+359 deg 方位角(2)*/
    #az2;
    /**@type {number} +z=0 ,+y=90 -90~+90 deg 高度角(2)*/
    #al2;
    /**@type {vec3}*/
    #pos;
    /**@inheritdoc*/
    gl;
    /**@type {number}focus center dis*/
    #focusR;
    #viewMat4;
    #modelMatrix;
    #vUp;
    #focusPos;
    
    /**
     * @param {WebGL} system 
    *@param {Scene|null} scene 
     */
    constructor(system,scene=null){
        super();
        system.cameras.push(this);

        this.gl=system.gl;

        this.#al2=0;
        this.#az2=0;
        this.focusObj=null;
        this.#focusR=10;
        this.#viewMat4=mat4.create();
        this.#modelMatrix=mat4.create();
        this.#pos=vec3.create();
        this.viewMode=2;
        this.#vUp=vec3.fromValues(0,1,0);
        this.#focusPos=vec3.create();
        this.sensitivityBase=0.3;
        this.sensitivity=1;

        this.#projectMatrix=mat4.create();
        this.#projectMatrixInv=mat4.create();
        this.fieldOfViewY=45;
        this.zNear = 0.1;
        this.zFar = 100.0;

        
        this.#projCamera=mat4.create();
        
        this.scene=scene;

        this.x=0;this.y=0;
        this.w=this.gl.canvas.clientWidth;
        this.h=this.gl.canvas.clientHeight;
    }
    /**
     * @param {number} value 
     */
    addAl2(value){
        this.al2+=value*this.sensitivityBase*this.sensitivity;
    }
    /**
     * @param {number} value 
     */
    addAz2(value){
        this.az2+=value*this.sensitivityBase*this.sensitivity;
    }
    /** @param {vec3} value */
    addFocusPos(value){
        vec3.add(this.#focusPos,this.#focusPos,value);
    }
    /**
     * @param {number} x  沿著當前世界方向前進 
     * @param {number} y  沿著當前世界方向前進 
     * @param {number} z  沿著當前世界方向前進 cz=-wz 右,上,前
     */  
    move(x,y,z){
        
        var ax=vec3.fromValues(this.#viewMat4[0],this.#viewMat4[4],this.#viewMat4[8]);
        vec3.scale(ax,ax,x);
        var ay=vec3.fromValues(this.#viewMat4[1],this.#viewMat4[5],this.#viewMat4[9]);
        vec3.scale(ay,ay,y);
        var az=vec3.fromValues(this.#viewMat4[2],this.#viewMat4[6],this.#viewMat4[10]);
        vec3.scale(az,az,-z);
        vec3.add(ax,ax,ay);
        vec3.add(ax,ax,az);
        ax[1]=0;
            vec3.add(this.#focusPos,this.#focusPos,ax);
    }
}
class Scene{
    /**@type {IObject[]} */
    object;
    /**@type {Skybox?}*/
    skybox;
    /**
     * @param {Skybox?} skybox 
     */
    constructor(skybox=null){
        this.object=[];
        this.skybox=skybox;
    }
    /**
     * @param {Camera} camera 
     */
    render(camera){
        this.skybox?.draw(camera);
        this.object.forEach(e=>e.draw(camera));
    }
}
//shape
class PolyShape extends IObject3D{
    /**@inheritdoc */
    vertex;
    gl;
    shaderProgram;
    count;
    textureCoord;
    /**
     * @param {WebGL2RenderingContext} gl
     * @param {ShaderProgram} shaderProgram 
     * @param {number[]} vertex 
     * @param {ShaderAttribute} vertexLoca
     * @param {Object} param2
     * @param {number?} param2.textureCoord
     * @param {ShaderAttribute?} param2.textureCoordLoca
     * @param {Texture2D?} param2.texture2D
     * @param {number[]?} param2.index 
     * @param {Scene?} param2.scene 
     * @implements not finish
     */
    constructor(gl,shaderProgram,vertex,vertexLoca,{index=null,textureCoord=null,textureCoordLoca=null,texture2D=null,texture3D=null,scene=null}={}){
        super();
        this.gl=gl;
        this.shaderProgram=shaderProgram;
        this.vertex=new BufferData(new Buffer(this.gl,new Float32Array(vertex),this.gl.ARRAY_BUFFER),vertexLoca);
        
        this.texture2D=texture2D;
        if(textureCoord!=null&&textureCoordLoca!=null)
            this.textureCoord=new BufferData(new Buffer(this.gl,new Float32Array(textureCoord),this.gl.ARRAY_BUFFER),textureCoordLoca);
        
        this.count=vertex.length/2;
        scene?.object.push(this);
    }
    /**@param {Camera} camera @override */
    draw(camera){
        this.shaderProgram.useProgram(camera);
        this.vertex.setData();
        this.texture2D?.bindTexture();
        this.textureCoord?.setData();
        

        this.gl.drawArrays(this.gl.TRIANGLES,0,this.count)
    }
}
class Cube extends IObject3D{
    /**@inheritdoc */
    modelLoca;
    /**@inheritdoc */
    texture3D;
    /**@inheritdoc */
    modelInvTLoca;
    /**@type {ShaderUniform} */
    CameraPosLoca;
    
    /** fist use Cube.initStatic()*/
    /**
     * @param {ShaderProgram} shaderProgram 
     * @param {ShaderUniform} modelLoca 
     * @param {ShaderUniform} modelInvTLoca for normal

     * @param {Texture3D} txt3D 
     * @param {Scene} scene 
     */
    constructor(shaderProgram,modelLoca,modelInvTLoca,CameraPosLoca,txt3D,scene){
        super();
        this.shaderProgram=shaderProgram;
        this.modelLoca=modelLoca;this.CameraPosLoca=CameraPosLoca;this.texture3D=txt3D;
        this.modelInvTLoca=modelInvTLoca;
        scene.object.push(this);
    }
    /**@param {Camera} camera @override*/
    draw(camera){
        this.shaderProgram.useProgram(camera.projCamera);
      
        Cube.vertex.setData();
        Cube.normal.setData();
       
        Cube.index?.bindBuffer();
        this.texture2D?.bindTexture();
        this.textureCoord?.setData();

        this.modelLoca.setUniform(this.modelMatrix);
        this.modelInvTLoca.setUniform(this.normalMatrix);
        this.CameraPosLoca.setUniform(camera.pos);
        this.texture3D.bindTexture();
        //index type
        Cube.gl.drawElements(Cube.gl.TRIANGLES, 36, Cube.gl.UNSIGNED_SHORT, 0);
    }

    /**
     * @param {WebGLRenderingContext} gl
     * @param {ShaderProgram} shaderProgram  
     * @param {ShaderAttribute} normalLoca 
     * @param {ShaderAttribute} vertexLoca @override 
     * */
    static initStatic(gl,shaderProgram,vertexLoca,normalLoca){
        Cube.gl=gl;
        Cube.shaderProgram=shaderProgram;
        
        Cube.vertex=new BufferData(new Buffer(gl,new Float32Array([
            // Front face
            -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,

            // Back face
            -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,

            // Top face
            -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,

            // Bottom face
            -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,

            // Right face
            1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,

            // Left face
            -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
        ]),gl.ARRAY_BUFFER),vertexLoca);
        
        Cube.normal =new BufferData(new Buffer(gl,new Float32Array([
            // Front
            0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,

            // Back
            0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,

            // Top
            0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,

            // Bottom
            0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,

            // Right
            1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,

            // Left
            -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
        ]),gl.ARRAY_BUFFER),normalLoca);
        
        Cube.index=new Buffer(gl,new Int16Array([
            0, 1, 2, 0, 2, 3,    // front
            4, 5, 6, 4, 6, 7,    // back
            8, 9, 10, 8, 10, 11,   // top
            12, 13, 14, 12, 14, 15,   // bottom
            16, 17, 18, 16, 18, 19,   // right
            20, 21, 22, 20, 22, 23,   // left
        ]),gl.ELEMENT_ARRAY_BUFFER);
        
    }   
}
class AxisPlain extends IObject3D{
    /**@inheritdoc */
    vertex;
    /**@inheritdoc */
    shaderProgram;
    /**@inheritdoc */
    count;
    /**
     * @param {WebGLRenderingContext} gl 
     * @param {ShaderProgram} shader 
     * @param {ShaderAttribute} posLoca 
     * @param {number} size width height

     * @param {number} stride 
    @param {Scene} scene 
     */
    constructor(gl,shader,posLoca,size,scene,stride=1){
        super();
        this.gl=gl;
        this.shaderProgram=shader;
        scene.object.push(this);

        
        //this.count=Math.floor(size/stride);
        //this.count=this.count*this.count*3*2;
   
        var pos=[];var id=[];
        var base=-size/2;
        var x,z;
        var id2;
        
        for (let i = 0; i < size; i++) {
            x=base+i*stride;
            for (let j = 0; j < size; j++) {
                id2=j*4+i*size*4;
                z=base+j*stride;
                pos.push(x,z);
                pos.push(x,z+1);
                pos.push(x+1,z+1);
                pos.push(x+1,z);

                id.push(id2,id2+1,id2+2);
                id.push(id2,id2+2,id2+3);
            }
            
        }
        this.count=id.length;
        
        this.vertex=new BufferData(new Buffer(gl,new Float32Array(pos),gl.ARRAY_BUFFER),posLoca);
        this.index=new Buffer(gl,new Int16Array(id),gl.ELEMENT_ARRAY_BUFFER);
    }

    /**@param {Camera} camera @override */
    draw(camera){
        this.shaderProgram.useProgram(camera.projCamera);
        this.vertex.setData();
        this.index.bindBuffer();
       
        this.gl.drawElements(this.gl.TRIANGLES,this.count,this.gl.UNSIGNED_SHORT,0);
    }
}

export {Camera,Scene,WebGL,Mouse,FPS,ShaderProgram,Texture2D,Texture3D,Skybox,FrameBuffer,
    Cube,AxisPlain,PolyShape
}