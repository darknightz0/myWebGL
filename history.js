//資料輸入
/**
 * @param {WebGLRenderingContext} gl 
 * @returns {{position:WebGLBuffer,color:WebGLBuffer,indices:WebGLBuffer}}
 */
function initBuffers(gl) {
  const positions =  [
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
  ];
  const positionBuffer =new BufferData(
    new Buffer(gl,new Float32Array(positions),gl.ARRAY_BUFFER),
    new VertexAttribute(gl,shaderProgram.attribute["aVertexPosition"],gl.FLOAT,3)
    );

  //const colorBuffer = initColorBuffer(gl);
  const textureCoordBuffer = initTextureBuffer(gl);
  const normalBuffer = initNormalBuffer(gl);
  const indexBuffer = initIndexBuffer(gl);

  return {
    position: positionBuffer,
    //color: colorBuffer,
    normal: normalBuffer,
    textureCoord: textureCoordBuffer,
    indices: indexBuffer,
  };
}
function initColorBuffer(gl) {
  const faceColors = [
    [1.0, 1.0, 1.0, 1.0], // Front face: white
    [1.0, 0.0, 0.0, 1.0], // Back face: red
    [0.0, 1.0, 0.0, 1.0], // Top face: green
    [0.0, 0.0, 1.0, 1.0], // Bottom face: blue
    [1.0, 1.0, 0.0, 1.0], // Right face: yellow
    [1.0, 0.0, 1.0, 1.0], // Left face: purple
  ];

  // Convert the array of colors into a table for all the vertices.

  let colors = [];

  for (const c of faceColors) {
    // Repeat each color four times for the four vertices of the face
    colors = colors.concat(c, c, c, c);
  }

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  return colorBuffer;
}
/**
 * @param {WebGLRenderingContext} gl 
 * @returns {Buffer}
 */
function initIndexBuffer(gl) {
  const indices = [
     0,  1,  2,      0,  2,  3,    // front
     4,  5,  6,      4,  6,  7,    // back
     8,  9,  10,     8,  10, 11,   // top
     12, 13, 14,     12, 14, 15,   // bottom
     16, 17, 18,     16, 18, 19,   // right
     20, 21, 22,     20, 22, 23,   // left
  ];
  return new Buffer(gl,new Int16Array(indices),gl.ELEMENT_ARRAY_BUFFER);
}

/**
 * @param {WebGLRenderingContext} gl 
 * @returns {WebGLBuffer}
 */
function initTextureBuffer(gl) {
  const textureCoordinates = [
    // Front
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Back
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Top
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Bottom
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Right
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Left
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
  ];
  return new BufferData(
    new Buffer(gl,new Float32Array(textureCoordinates),gl.ARRAY_BUFFER),
    new VertexAttribute(gl,shaderProgram.attribute["aTextureCoord"],gl.FLOAT)
    );
}
function initNormalBuffer(gl) {
  const vertexNormals = [
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
  ];
  return new BufferData(
    new Buffer(gl,new Float32Array(vertexNormals),gl.ARRAY_BUFFER),
    new VertexAttribute(gl,shaderProgram.attribute["aVertexNormal"],gl.FLOAT,3)
  );
}
//參數設定 測試、viewport 剪裁體積(viewvolumn)
/**
 * 
 * @param {WebGLRenderingContext} gl   
 * @param {{position:BufferData,color:WebGLBuffer,indices:Buffer,normal:BufferData,textureCoord:BufferData}} buffers 
 */
function drawScene(gl, buffers) {
  system.renderInit();
  camera.skybox.draw();
  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.

  mat4.translate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to translate
    [-0.0, 0.0, -2.0],
  ); // amount to translate
  /*
  mat4.rotate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to rotate
    camera.rotationZ, // amount to rotate in radians
    [0, 0, 1],
  ); // axis to rotate around (Z)
  mat4.rotate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to rotate
    camera.rotationZ * 0.7, // amount to rotate in radians
    [0, 1, 0],
  ); // axis to rotate around (Y)
  mat4.rotate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to rotate
    camera.rotationZ * 0.3, // amount to rotate in radians
    [1, 0, 0],
  ); */
  //法線矩陣，該矩陣用於在處理立方體相對於光源的當前方向時變換
  const normalMatrix = mat4.create();
  mat4.invert(normalMatrix, modelViewMatrix);
  mat4.transpose(normalMatrix, normalMatrix);
  // 渲染器解析buffer&參數綁定 (位置)
   camera.setViewportProjShader();
   buffers.position.setData();
  /*
    const numComponents = 3; // pull out 2 values per iteration每組的數量(2D |3D)
    const type = gl.FLOAT; // the data in the buffer is 32bit floats
    const normalize = false; // don't normalize
    const stride = 0; // how many bytes to get from one set of values to the next
    // 0 = use type and numComponents above 間隔
    const offset = 0; // how many bytes inside the buffer to start from 起始
  */
  /* 
// 渲染器解析buffer&參數綁定 (顏色)
  {
  const numComponents = 4;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexColor,
    numComponents,
    type,
    normalize,
    stride,
    offset,
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
}
*/
//材質
  buffers.textureCoord.setData();
//法向量
  buffers.normal.setData();

  buffers.indices.bindBuffer();

  // Set the shader uniforms(把變換矩陣輸入到渲染器中)(渲染器常數位置,反轉?,mat4) column major [c][r]
  
 
  gl.uniformMatrix4fv(
    shaderProgram.uniform["uModelViewMatrix"],
    false,
    modelViewMatrix,
  );
  gl.uniformMatrix4fv(
  shaderProgram.uniform["uNormalMatrix"],
  false,
  normalMatrix,
  );

  
  gl.uniform3fv(
  shaderProgram.uniform["u_cameraPos"],
  camera.pos
  );
 
  scene3D.bindTexture();
  // Bind the texture to texture unit 0
  //fireTexture.bindTexture();

  /** 
  //開始畫
  {
    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }*/
  {
  const vertexCount = 36;
  const type = gl.UNSIGNED_SHORT;//index type
  const offset = 0;
  //gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }
  myCube.draw();
  FPS.frames++;
}