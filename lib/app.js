// Resize the canvas to full screen
function autoResizeCanvas(canvas) {
    const expandFullScreen = () => {
      canvas.width = window.innerWidth - 25;
      canvas.height = window.innerHeight - 30;
    };
    expandFullScreen();
    // Resize screen when the browser has triggered the resize event
    window.addEventListener('resize', expandFullScreen);
  }

autoResizeCanvas(myCanvas);

// event handler

var mouseState = false;
var lastMouseX = -100, lastMouseY = -100;
function doMouseDown(event) {
	lastMouseX = event.pageX;
	lastMouseY = event.pageY;
	mouseState = true;
}
function doMouseUp(event) {
	lastMouseX = -100;
	lastMouseY = -100;
	mouseState = false;
}
function doMouseMove(event) {
	if(mouseState) {
		var dx = event.pageX - lastMouseX;
		var dy = lastMouseY - event.pageY;
		lastMouseX = event.pageX;
		lastMouseY = event.pageY;
		
		if((dx != 0) || (dy != 0)) {
			angle = angle + 0.03 * dx;
			elevation = elevation + 0.03 * dy;
		}
	}
}
function doMouseWheel(event) {
	var nLookRadius = lookRadius + event.wheelDelta/1000.0;
	if((nLookRadius > 2.0) && (nLookRadius < 20.0)) {
		lookRadius = nLookRadius;
	}
}

// Get the context to draw the features
var canvas = document.getElementById('myCanvas');
var gl= canvas.getContext("webgl2");
if(!gl){
	throw new Error('Your browser does not support WebGL');
}


// ----------------------------------------------------------------------




// ---------------------------------------------------------------------------------
var wheel;
var objectKeys = [ "frame", "stand", "wheel",];
var ambKeys = ["frameAmb", "wheelAmb",];

var meshes = [];
var textures = [];
var vaos = [];
var program = null;
var objstr;
var projectionMatrix, perspectiveMatrix, viewMatrix;
var worldMatrices = [];
var worldMatrix = [];
var texture;

// Retrieve the id of the spin and start rotation of the wheel
var isRotating = false;
if (isRotating ===false){
	var spinButton = document.getElementById('spin_wheel');
	spinButton.onclick = function() {
		// spinButton.style.pointerEvents = 'none';
		isRotating = true;
		spinButton.disabled = true;
	}
}

defShaderParams = {
	DTexMix: 		0.5,
	lightColor:      	[1.0,   1.0,   1.0,   1.0],
	diffuseColor:    	[0.1,   0.1,   0.1,   1.0],
	emitColor: 	     	[136.0, 136.0, 136.0, 1.0],
	ambientLightColor: [1.0,1.0,1.0,1.0],
	ambientMatColor: [0,0.1,0.1,1.0],
	
    lightColor: [1,1,1,1],
	LPosX: 20,
	LPosY: 30,
	LPosZ: 10,
	LDirTheta: 0,
	LDirPhi: 0,
    LTarget: 61,
    DTexMix: 0.8,
}

//Parameters for Camera
var cx = 0.0;
var cy = 0.0;
var cz = 0.0;
var elevation = 0.0;
var angle = 0.0;

var lookRadius = 5.0;


// create vertex shader
var vs = `#version 300 es
#define POSITION_LOCATION 0
#define NORMAL_LOCATION 1
#define UV_LOCATION 2

layout(location = POSITION_LOCATION) in vec3 in_pos;
layout(location = NORMAL_LOCATION) in vec3 in_norm;
layout(location = UV_LOCATION) in vec2 in_uv;

uniform mat4 matrix;
uniform mat4 pMatrix; //Vertex position transofrmation
uniform mat4 nMatrix; //Matrix to transform normals

out vec3 fs_pos;
out vec3 fs_norm;
out vec2 fs_uv;

void main() {
	fs_pos = (pMatrix * vec4(in_pos, 1.0)).xyz;
	fs_norm = mat3(nMatrix) * in_norm;
	fs_uv = in_uv;
	
	gl_Position = matrix * vec4(in_pos, 1.0);
}`;

// create fragment shader

var fs = `#version 300 es
precision highp float;

in vec3 fs_pos;
in vec3 fs_norm;
in vec2 fs_uv;

uniform sampler2D u_texture;

uniform vec3 LPos;
uniform vec3 LDir;
uniform vec3 lightDir;
uniform vec4 lightColor;

uniform float DTexMix;
uniform vec4 ambientLightColor;
uniform vec4 diffuseColor;
uniform vec4 ambientMatColor;
uniform vec4 emitColor;

out vec4 color;

vec4 compDiffuse(vec3 lightDir, vec4 lightCol, vec3 normalVec, vec4 diffColor) {
	// Diffuse
	// --> Lambert
	vec4 diffuseLambert = lightCol * clamp(dot(normalVec, lightDir),0.0,1.0) * diffColor;
	// ----> Select final component
	return diffuseLambert;
}


void main() {
    vec3 LDir = lightDir;
    vec4 texcol = texture(u_texture, fs_uv);
    vec4 diffColor = diffuseColor * (1.0-DTexMix) + texcol * DTexMix;
	vec4 ambColor = ambientMatColor * (1.0-DTexMix) + texcol * DTexMix;
	vec4 emit = emitColor * (1.0-DTexMix) +
				   texcol * DTexMix * 
				   			max(max(emitColor.r, emitColor.g), emitColor.b);
	
	vec3 normalVec = normalize(fs_norm);
	
	vec3 lDir;
	
	vec4 lColor;
	
    vec4 ambientColor;
    
    lDir = normalize(LPos - fs_pos);
	lColor = lightColor;

    ambientColor = ambientLightColor;

    // Ambient
	vec4 ambient = ambientColor * ambColor;
	// Diffuse
	vec4 diffuse = compDiffuse(lDir, lColor, normalVec, diffColor);

    vec4 out_color = clamp(ambient + diffuse, 0.0, 1.0);	
  
    color = vec4(out_color.rgb, 1.0);
}`;


var textureUrls = getTextures();

function textureLoading (image) {
   	// Create a texture.
	var texture = gl.createTexture();
	// use texture unit 0 to set texture as current active
	gl.activeTexture(gl.TEXTURE0 + 3.0);
	// bind to the TEXTURE_2D bind point of texture unit 0
	gl.bindTexture(gl.TEXTURE_2D, texture);

	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.generateMipmap(gl.TEXTURE_2D);
};

async function main(){
	// ----------------------------------------------------------------------------------------
	var spinResult = document.getElementById("spin_result");
    spinResult.innerHTML = "You have: " + 0;

	// var totalScore = document.getElementById("totalPoints");
 //    totalScore.innerHTML = "Total Gain: " + 0;
	// // --------------------------------------------------------------------------------------
	canvas.addEventListener("mousedown", doMouseDown, false);
	canvas.addEventListener("mouseup", doMouseUp, false);
	canvas.addEventListener("mousemove", doMouseMove, false);
	canvas.addEventListener("mousewheel", doMouseWheel, false);
	
	
	var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, vs);
    var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, fs);

    // create program and attach the vertex and fragment shaders
    program = utils.createProgram(gl, vertexShader, fragmentShader);

    gl.useProgram(program);


    // links mesh attributes to shader attributes
    program.vertexPositionAttribute = gl.getAttribLocation(program, "in_pos");
    program.vertexNormalAttribute = gl.getAttribLocation(program, "in_norm");
    program.textureCoordAttribute = gl.getAttribLocation(program, "in_uv");
	    
    // Define uniform variables
    program.textureUniform = gl.getUniformLocation(program, "u_texture");
    program.WVPmatrixUniform = gl.getUniformLocation(program, "matrix");
    program.normalMatrixPositionHandle = gl.getUniformLocation(program, "nMatrix");
    program.vertexPositionHandle = gl.getUniformLocation(program, "pMatrix");
    program.lightPos = gl.getUniformLocation(program, 'LPos')
    program.LDir = gl.getUniformLocation(program, "LDir");
    program.lightColor = gl.getUniformLocation(program, 'lightColor');
    program.DTexMix = gl.getUniformLocation(program, 'DTexMix');
    program.ambientLightColor = gl.getUniformLocation(program, "ambientLightColor");
    program.ambientMaterial = gl.getUniformLocation(program, "ambientMatColor");


    // Load meshes
    var meshUrls = getMeshes();
    
    
    for(const key of objectKeys) {
        objstr = await utils.get_objstr(meshUrls[key]);
        meshes[key] = new OBJ.Mesh(objstr)

     	if(key.includes('frame') | key.includes('wheel')){
     		var image = new Image();
     		if(key.includes('frame')){
     	    	image.src = textureUrls[key];

	        } else if (key.includes('wheel')){
	    
	        	image.src = textureUrls[key];

	        }
	    
	        image.onload = function(){
	        	var texture = gl.createTexture();
				// use texture unit 0 to set texture as current active
				gl.activeTexture(gl.TEXTURE0 + 1.0);
				// bind to the TEXTURE_2D bind point of texture unit 0
				gl.bindTexture(gl.TEXTURE_2D, texture);

				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				gl.generateMipmap(gl.TEXTURE_2D);
				textures[key] = texture;
	        };
     	}

        // Initial mesh buffer
        OBJ.initMeshBuffers(gl, meshes[key]);
    }



    var objModel = [];
    //Add all meshes 
    for(const key of objectKeys) {
        let objModel = meshes[key];
        let vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        vaos[key] = vao;


        // // // Create Buffer and load vertexData into buffer

        // Set the vertex buffer and enable it
        var positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objModel.vertices), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(program.vertexPositionAttribute);
        gl.vertexAttribPointer(program.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

        // Set texture buffer and enable it
        var uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objModel.textures), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(program.textureCoordAttribute);
        gl.vertexAttribPointer(program.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
    	
    	// Set normals buffer and enable it
        var normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objModel.vertexNormals), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(program.vertexNormalAttribute);
        gl.vertexAttribPointer(program.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
    	
    	// Set indices buffer
        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(objModel.indices), gl.STATIC_DRAW);  
    }

// -------------------------------------------------------
    // Load all initial world matrices (x, y, z, rx, ry, rz, s) of the object
    worldMatrices = getInitialWorldmatrices();
	
    drawScene();
};



wheel = new Wheel(0.5, 1.4, 1.0, 1, 1, 1, 1);


// // // draw scences

function drawScene() {
	
	//SET Global states (viewport size, viewport background color, Depth test and backface culling)
	gl.viewport(0.0, 0.0, gl.canvas.width, gl.canvas.height);
	// gl.clearColor(0.85, 0.85, 0.85, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);


    // Compute the projection matrix(fieldOfView, aspect ratio, near plane, far plane)
    var aspect = gl.canvas.width / gl.canvas.height;
    perspectiveMatrix = utils.MakePerspective(100.0, aspect, 0.1, 100.0);
	
    // Compute view matrix(camera position x, y, z, elevation(x-axis), angle(y-axis))
	cz = lookRadius * Math.cos(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
	cx = lookRadius * Math.sin(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
	cy = lookRadius * Math.sin(utils.degToRad(-elevation));
	viewMatrix = utils.MakeView(cx, cy, cz, elevation, -angle);
	
	var t = utils.degToRad(defShaderParams.LDirTheta);
    var p = utils.degToRad(defShaderParams.LDirPhi);
    
    directionalLight = [
        
        Math.sin(t) * Math.sin(p),
        Math.cos(t),
        Math.sin(t) * Math.cos(p)
    ];
   	
	
	for(const key of objectKeys) {
		let objModel = meshes[key];
		
		// worldMatrix[key] = utils.MakeWorld(worldMatrices[key].x)

		// Compute normal Matrix
		if (key.includes('wheel')){
	   		// Fill the segments with the values that will be used when the wheel transition ends

	   		if (isRotating){
		   		wheel.isRotating = true;
		   		wheel.hasStopped = false;
		   		wheel.animate();
		   		worldMatrices["wheel"] = wheel.getWorldMatrix();
		   		
			} 
		   	
	   	}

		var normalMatrix = utils.invertMatrix(utils.transposeMatrix(worldMatrices[key]));
		
	    var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, worldMatrices[key]);

	    // Compute projection matrix
	    var projMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);

	    // Translate the objects to the centre of the view space
	    var translationMatrix = utils.MakeTranslateMatrix(-0.5,-3.0,0.0);

	   
	    var projectionMatrix = utils.multiplyMatrices(projMatrix, translationMatrix);


        var lightDirMatrix = utils.sub3x3from4x4(utils.transposeMatrix(worldMatrices[key]));

        gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, textures[key]);
		
		// Define the values of the uniforms and send to GPU
		gl.uniform1i(program.textureUniform, 0);

		gl.uniform4fv(program.lightColor, defShaderParams.lightColor);
        gl.uniform4fv(program.diffuseColor, defShaderParams.diffuseColor);

		gl.uniform1i(program.ambientMaterial, defShaderParams.ambientMatColor);
        
		
		// gl.uniform4fv(program.ambientMaterial, x);
		gl.uniform4fv(program.ambientLightColor, defShaderParams.ambientLightColor);
        

        gl.uniform3fv(program.lightDir, lightDirMatrix);
        gl.uniform1f(program.DTexMix, defShaderParams.DTexMix);
        gl.uniform3fv(program.lightPos, [defShaderParams.LPosX, defShaderParams.LPosY, defShaderParams.LPosZ]);
        gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(projectionMatrix));	
        // gl.uniform4fv(program.emitColor, defShaderParams.emitColor);
        gl.uniform1f(program.DTexMix, defShaderParams.DTexMix);
        // gl.uniformMatrix4fv(program.normalMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(normalMatrix));
    	gl.uniformMatrix4fv(program.vertexPositionHandle, gl.FALSE, utils.transposeMatrix(worldMatrices[key]));

		gl.uniform1i(program.u_textureUniform, 0);
		gl.uniform3f(program.eyePosUniform, cx, cy, cz);

        gl.bindVertexArray(vaos[key]);
        gl.drawElements(gl.TRIANGLES, objModel.indices.length, gl.UNSIGNED_SHORT, 0);  
    }
	
	window.requestAnimationFrame(drawScene);		
}

window.onload = main;