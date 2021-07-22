// // Get the context to draw the features
// var canvas = document.getElementById('myCanvas');
// var gl= canvas.getContext("webgl2");
// if(!gl){
// 	throw new Error('Your browser does not support WebGL');
// }
	
// var mesh = {};
// var program = null;
// var objstr;
// var projectionMatrix, perspectiveMatrix, viewMatrix;
// var worldMatrices = [];
// var texture;
// defShaderParams = {
// 	DTexMix: 		0.5,
// 	lightColor:      	[1.0,   1.0,   1.0,   1.0],
// 	diffuseColor:    	[0.1,   0.1,   0.1,   1.0],
// 	emitColor: 	     	[136.0, 136.0, 136.0, 1.0],
// 	ambientColorSource: [2.0,   2.0,   2.0,   0.8],
// 	ambientMatColor: 	[0.0, 0.1, 0.1, 1.0],

// }
// var elevation = 0.0;
// var angle = 0.0;

// var lookRadius = 5.0;

// var objectKeys = [
//     "frame", "stand", "wheel",
// ]

// // create vertex shader
// var vs = `#version 300 es
// #define POSITION_LOCATION 0
// #define NORMAL_LOCATION 1
// #define UV_LOCATION 2

// layout(location = POSITION_LOCATION) in vec3 in_pos;
// layout(location = NORMAL_LOCATION) in vec3 in_norm;
// layout(location = UV_LOCATION) in vec2 in_uv;

// uniform mat4 matrix;
// uniform mat4 pMatrix; //Vertex positino transofrmation
// uniform mat4 nMatrix; //Matrix to transform normals

// out vec3 fs_pos;
// out vec3 fs_norm;
// out vec2 fs_uv;

// void main() {
// 	fs_pos = (pMatrix * vec4(in_pos, 1.0)).xyz;
// 	fs_norm = mat3(nMatrix) * in_norm;
// 	fs_uv = in_uv;
	
// 	gl_Position = matrix * vec4(in_pos, 1.0);
// }`;

// // create fragment shader

// var fs = `#version 300 es
// precision highp float;

// in vec3 fs_pos;
// in vec3 fs_norm;
// in vec2 fs_uv;

// uniform sampler2D u_texture;

// uniform vec3 LPos;
// uniform vec3 LDir;
// uniform vec3 lightDir;
// uniform vec4 lightColor;

// uniform float DTexMix;
// uniform vec4 ambientLightColor;
// uniform vec4 diffuseColor;
// uniform vec4 ambientMatColor;
// uniform vec4 emitColor;

// out vec4 color;

// vec4 compDiffuse(vec3 lightDir, vec4 lightCol, vec3 normalVec, vec4 diffColor) {
// 	// Diffuse
// 	// --> Lambert
// 	vec4 diffuseLambert = lightCol * clamp(dot(normalVec, lightDir),0.0,1.0) * diffColor;
// 	// ----> Select final component
// 	return diffuseLambert;
// }


// void main() {
//     vec3 LDir = lightDir;
//     vec4 texcol = texture(u_texture, fs_uv);
//     vec4 diffColor = diffuseColor * (1.0-DTexMix) + texcol * DTexMix;
// 	vec4 ambColor = ambientMatColor * (1.0-DTexMix) + texcol * DTexMix;
// 	vec4 emit = emitColor * (1.0-DTexMix) +
// 				   texcol * DTexMix * 
// 				   			max(max(emitColor.r, emitColor.g), emitColor.b);
	
// 	vec3 normalVec = normalize(fs_norm);
	
// 	vec3 lDir;
	
// 	vec4 lColor;
	
//     vec4 ambientColor;
    
//     lDir = normalize(LPos - fs_pos);
// 	lColor = lightColor;

//     ambientColor = ambientLightColor;

//     // Ambient
// 	vec4 ambient = ambientColor * ambColor;
// 	// Diffuse
// 	vec4 diffuse = compDiffuse(lDir, lColor, normalVec, diffColor);

//     vec4 out_color = clamp(ambient + diffuse, 0.0, 1.0);	
  
//     color = vec4(out_color.rgb, 1.0);
// }`


// async function main(){
	
// 	var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, vs);
// 	var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, fs);

// 	// create program and attach the vertex and fragment shaders
// 	program = utils.createProgram(gl, vertexShader, fragmentShader);

// 	gl.useProgram(program);
// 	// links mesh attributes to shader attributes
// 	program.vertexPositionAttribute = gl.getAttribLocation(program, "in_pos");
// 	program.vertexNormalAttribute = gl.getAttribLocation(program, "in_norm");
// 	program.textureCoordAttribute = gl.getAttribLocation(program, "in_uv");
		    
// 	// Define uniform variables
// 	program.textureUniform = gl.getUniformLocation(program, "u_texture");
// 	program.WVPmatrixUniform = gl.getUniformLocation(program, "matrix");
// 	program.normalMatrixPositionHandle = gl.getUniformLocation(program, "nMatrix");
// 	program.vertexPositionHandle = gl.getUniformLocation(program, "pMatrix");
// 	program.lightPos = gl.getUniformLocation(program, 'LPos')
// 	program.LDir = gl.getUniformLocation(program, "LDir");
// 	program.lightColor = gl.getUniformLocation(program, 'lightColor');
// 	program.DTexMix = gl.getUniformLocation(program, 'DTexMix');
// 	program.ambientLightColor = gl.getUniformLocation(program, "ambientLightColor");
// 	program.ambientMaterial = gl.getUniformLocation(program, "ambientMatColor");
// 	program.diffuseColor = gl.getUniformLocation(program, 'diffuseColor');
// 	program.emissionColor = gl.getUniformLocation(program, "emitColor");


// 	var meshUrls = getMeshes();
// 	for(const key of objectKeys) {
// 	  	objstr = await utils.get_objstr(meshUrls[key]);
// 	   	mesh[key] = new OBJ.Mesh(objstr);
	    	
// 	   	// Asynchronously load an image
// 	    var image = new Image();
		    
		    

// 	    if (key.includes('frame')) {
// 	    	image.src = "assets/frameSurface_Color.png";
// 	    	image.onload = function () {
// 	    	// Create a texture.
// 			var texture = gl.createTexture();
// 			// use texture unit 0 to set texture as current active
// 			gl.activeTexture(gl.TEXTURE0);
// 			// bind to the TEXTURE_2D bind point of texture unit 0
// 			gl.bindTexture(gl.TEXTURE_2D, texture);

// 	        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
// 	        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
// 	        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
// 	        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
// 	        gl.generateMipmap(gl.TEXTURE_2D);
// 	    	};

// 	    } else if (key.includes('wheel')){
// 	    	image.src = "assets/wheelSurface_Color.png";
// 	    	image.onload = function () {
// 	    	// Create a texture.
// 			var texture = gl.createTexture();
// 			// use texture unit 0 to set texture as current active
// 			gl.activeTexture(gl.TEXTURE0+key);
// 			// bind to the TEXTURE_2D bind point of texture unit 0
// 			gl.bindTexture(gl.TEXTURE_2D, texture);

// 	        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
// 	        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
// 	        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
// 	        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
// 	        gl.generateMipmap(gl.TEXTURE_2D);
// 	    	};
// 		}

// 		// Initial mesh buffer
// 		OBJ.initMeshBuffers(gl, mesh[key]);
// 		// }

// 		// for(const key of objectKeys) {
// 		let objModel = mesh[key];

		    
			

// 	    // Set the vertex buffer and enable it
// 	    var positionBuffer = gl.createBuffer();
// 	    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
// 	    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objModel.vertices), gl.STATIC_DRAW);
// 	    gl.enableVertexAttribArray(program.vertexPositionAttribute);
// 	    gl.vertexAttribPointer(program.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

// 	    // Set texture buffer and enable it
// 	    var uvBuffer = gl.createBuffer();
// 	    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
// 	    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objModel.textures), gl.STATIC_DRAW);
// 	    gl.enableVertexAttribArray(program.textureCoordAttribute);
// 	    gl.vertexAttribPointer(program.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
	    
	    	
// 	    // Set normals buffer and enable it
// 	    var normalBuffer = gl.createBuffer();
// 	    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
// 	    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objModel.vertexNormals), gl.STATIC_DRAW);
// 	    gl.enableVertexAttribArray(program.vertexNormalAttribute);
// 	    gl.vertexAttribPointer(program.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

// 	    // Set indices buffer
// 	    var indexBuffer = gl.createBuffer();
// 	    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
// 	    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(objModel.indices), gl.STATIC_DRAW);

// 	    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);  

// 	} 

// 	// //Load all initial world matrices
// 	worldMatrices = getInitialWorldmatrices();

//     drawScene();

// }


// function drawScene(){

// 	//SET Global states (viewport size, viewport background color, Depth test and backface culling)
// 	gl.viewport(0.0, 0.0, gl.canvas.width, gl.canvas.height);
// 	gl.clearColor(0.85, 0.85, 0.85, 1.0);
// 	gl.enable(gl.DEPTH_TEST);
// 	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
// 	gl.enable(gl.CULL_FACE);
// 	gl.cullFace(gl.BACK);


//     // Compute the projection matrix(fieldOfView, aspect ratio, near plane, far plane)
//     var aspect = gl.canvas.width / gl.canvas.height;   
//     var perspectiveMatrix = utils.MakePerspective(100.0, aspect, 0.1, 100.0);

//     // Compute view matrix(camera position x, y, z, elevation(x-axis), angle(y-axis))
// 	var viewMatrix = utils.MakeView(3.0, 0.0, 6.0, 0.0, 0.0);

// 	// Compute world matrix(x, y, z, rx, ry, rz, s) of the object
// 	for(const key of objectKeys) {
// 		let objModel = mesh[key];
//         var worldMatrix = worldMatrices[key];
//         console.log(worldMatrix);
// 		// utils.MakeWorld(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0);

// 		// Compute normal Matrix
// 		var normalMatrix = utils.invertMatrix(utils.transposeMatrix(worldMatrix));
		
// 	    var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, worldMatrix);

// 	    // Compute projection matrix
// 	    var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
   

// 		gl.activeTexture(gl.TEXTURE0+key);
// 		gl.bindTexture(gl.TEXTURE_2D, texture);
		
// 		// Define the values of the uniforms and send to GPU
// 		gl.uniform1i(program.textureUniform, 0);
// 	    gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(projectionMatrix));
// 	    gl.uniformMatrix4fv(program.normalMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(normalMatrix));
// 	    gl.uniformMatrix4fv(program.vertexPositionHandle, gl.FALSE, utils.transposeMatrix(worldMatrix));
    
// 	    gl.uniform4fv(program.lightColor, defShaderParams.lightColor);
// 	    gl.uniform4fv(program.diffuseColor, defShaderParams.diffuseColor);
// 	    gl.uniform4fv(program.ambientLightColor, defShaderParams.ambientColorSource);
// 	    gl.uniform4fv(program.emitColor, defShaderParams.emitColor);
// 	    gl.uniform1f(program.DTexMix, defShaderParams.DTexMix);
	
// 		var x;
//     	if (key.includes('frame')) {
// 		   	x = utils.getTexture(gl, "assets/frameAmbient_Occlusion.png");
		   	
// 		} else if (key.includes('stand')){
// 		   	x = defShaderParams.ambientMatColor;
// 		   	console.log(x);
// 		} else if (key.includes('wheel')){
// 		   	x = utils.getTexture(gl, "assets/wheelAmbient_Occlusion.png");
// 		}

// 		gl.uniform1i(program.ambientMaterial, x);
		

// 		// Draw the primitive
// 		gl.drawElements(gl.TRIANGLES, objModel.indices.length, gl.UNSIGNED_SHORT, 0);
//     }

// 	window.requestAnimationFrame(drawScene);
// }


// // function Anim3(t) {
// // 	// rotating fan
// // 	var  uv= ([0.625, 0.875, 0, 1]);
// // 	var trans = utils.MakeTranslateMatrix(uv[0], uv[1], 1);
// //     var RZ = utils.MakeRotateZMatrix(Math.random()* 360);
// //     var back = utils.MakeTranslateMatrix(-0.50, -0.50, 1);
// //     var scale = utils.MakeScaleMatrix(0.25);
// //     var out = utils.multiplyMatrices(trans,  
// //     			utils.multiplyMatrices(RZ,
// //     				utils.multiplyMatrices(scale, back)));
// // // 	let deg = 0;
// // // startBUtton.addEventListener('click', () =>{
// // // 	startButton.pointerEvents = 'none';
// // // 	deg = Math.floor(5000+Math.random() * 5000);
// // // 	wheel.style.transition = 'all 10s ease-out';
// // // 	wheel.style.transform =  `rotate(${deg}deg)`;
// // // })

// // // wheel.addEventListener('transitionend', () =>{
// // // 	startButton.style.pointerEvents = 'auto';
// // // 	wheel.style.transition = 'none';
// // // 	const actualDeg = deg % 360;
// // // 	wheel.style.transform=`rotate(${actualDeg}deg);
// // // })

// // 	return out;
// // }


// window.onload = main;