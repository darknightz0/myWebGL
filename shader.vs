attribute vec3 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec2 aTextureCoord;

    uniform mat4 uNormalMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjCamera;

    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    varying highp vec3 v_normal;
    varying highp vec3 v_pos;
    void main(void) {
      vec4 pos=vec4(aVertexPosition,1);
      gl_Position = uProjCamera* uModelViewMatrix * pos;
      vTextureCoord = aTextureCoord;

       // Apply lighting effect

      highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
      highp vec3 directionalLightColor = vec3(1, 1, 1);
      highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

      v_normal = mat3(uNormalMatrix) * aVertexNormal;

      highp float directional = max(dot(v_normal, directionalVector), 0.0);
      vLighting = ambientLight + (directionalLightColor * directional);

      v_pos=(uModelViewMatrix * pos).xyz;
    }