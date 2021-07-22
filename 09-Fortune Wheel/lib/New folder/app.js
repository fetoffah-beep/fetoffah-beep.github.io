// // Resize the canvas to full screen
// function autoResizeCanvas(canvas) {
//     const expandFullScreen = () => {
//       canvas.width = window.innerWidth - 16;
//       canvas.height = window.innerHeight - 20;
//     };
//     expandFullScreen();
//     // Resize screen when the browser has triggered the resize event
//     window.addEventListener('resize', expandFullScreen);
//   }

// autoResizeCanvas(myCanvas);

// // event handler

// var mouseState = false;
// var lastMouseX = -100, lastMouseY = -100;
// function doMouseDown(event) {
// 	lastMouseX = event.pageX;
// 	lastMouseY = event.pageY;
// 	mouseState = true;
// }
// function doMouseUp(event) {
// 	lastMouseX = -100;
// 	lastMouseY = -100;
// 	mouseState = false;
// }
// function doMouseMove(event) {
// 	if(mouseState) {
// 		var dx = event.pageX - lastMouseX;
// 		var dy = lastMouseY - event.pageY;
// 		lastMouseX = event.pageX;
// 		lastMouseY = event.pageY;
		
// 		if((dx != 0) || (dy != 0)) {
// 			angle = angle + 0.1 * dx;
// 			elevation = elevation + 0.1 * dy;
// 		}
// 	}
// }
// function doMouseWheel(event) {
// 	var nLookRadius = lookRadius + event.wheelDelta/1000.0;
// 	if((nLookRadius > 2.0) && (nLookRadius < 20.0)) {
// 		lookRadius = nLookRadius;
// 	}
// }

// // Get the context to draw the features
// var canvas = document.getElementById('myCanvas');
// var gl= canvas.getContext("webgl2");
// if(!gl){
// 	throw new Error('Your browser does not support WebGL');
// }


// // // // VertexData
// //Objects
// // var frame;
// // var stand;
// // var wheel;




// var meshes = {};
// var vaos = [];
// var program = null;
// var objstr;
// var projectionMatrix, perspectiveMatrix, viewMatrix;
// var worldMatrices = [];
// var texture;

// const digitsUV = [[
// 0.0, 0.0, 
// 0.0, 1.0,
// 1.0, 0.0,
// 1.0, 0.0,
// 0.0, 1.0,
// 1.0, 1.0]];

// defShaderParams = {
// 	ambientType: "ambient",
// 	diffuseType: "lambert",
// 	ambientLightColor: [1.0,1.0,1.0,1.0],
// 	diffuseColor: [0.1 ,0.1,0.1,1],
// 	ambientMatColor: [0,0.1,0.1,1.0],
	

//     lightColor: [1,1,1,1],
// 	LPosX: 20,
// 	LPosY: 30,
// 	LPosZ: 10,
// 	LDirTheta: 0,
// 	LDirPhi: 0,
//     LTarget: 61,
//     DTexMix: 0.8,
// }

// //Parameters for Camera
// var cx = 0.0;
// var cy = 0.0;
// var cz = 0.0;
// var elevation = 0.0;
// var angle = 0.0;

// var lookRadius = 5.0;


// // create vertex shader
// var vs = `#version 300 es
// #define POSITION_LOCATION 0
// #define NORMAL_LOCATION 1
// #define UV_LOCATION 2

// layout(location = POSITION_LOCATION) in vec3 in_pos;
// layout(location = NORMAL_LOCATION) in vec3 in_norm;
// layout(location = UV_LOCATION) in vec2 in_uv;

// uniform mat4 pMatrix;
// uniform mat4 wMatrix;

// out vec3 fs_pos;
// out vec3 fs_norm;
// out vec2 fs_uv;

// void main() {
// 	fs_pos = in_pos;
// 	fs_norm = in_norm;
// 	fs_uv = in_uv;
	
// 	gl_Position = pMatrix * vec4(in_pos, 1);
// }`;

// // create fragment shader
// var fs1 = `#version 300 es
// precision highp float;

// in vec3 fs_pos;
// in vec3 fs_norm;
// in vec2 fs_uv;

// uniform sampler2D u_texture;
// uniform vec3 eyePos;

// uniform vec4 ambientType;
// uniform vec4 diffuseType;
// uniform vec4 specularType;

// uniform vec4 LAlightType;
// uniform vec3 LAPos;
// uniform vec3 LADir;
// uniform float LAConeOut;
// uniform float LAConeIn;
// uniform float LADecay;
// uniform float LATarget;
// uniform vec4 LAlightColor;

// uniform vec4 LBlightType;
// uniform vec3 LBPos;
// uniform vec3 LBDir;
// uniform float LBConeOut;
// uniform float LBConeIn;
// uniform float LBDecay;
// uniform float LBTarget;
// uniform vec4 LBlightColor;

// uniform vec4 LClightType;
// uniform vec3 LCPos;
// uniform vec3 LCDir;
// uniform float LCConeOut;
// uniform float LCConeIn;
// uniform float LCDecay;
// uniform float LCTarget;
// uniform vec4 LClightColor;

// uniform vec4 ambientLightColor;
// uniform vec4 ambientLightLowColor;
// uniform vec3 ADir;
// uniform vec4 diffuseColor;
// uniform float DTexMix;
// uniform vec4 ambientMatColor;

// out vec4 color;

// vec3 compLightDir(vec3 LPos, vec3 LDir, vec4 lightType) {
// 	//lights
// 	// -> Point
// 	vec3 pointLightDir = normalize(LPos - fs_pos);
// 	// -> Direct
// 	vec3 directLightDir = LDir;
// 	// -> Spot
// 	vec3 spotLightDir = normalize(LPos - fs_pos);

// 	return            directLightDir * lightType.x +
// 					  pointLightDir * lightType.y +
// 					  spotLightDir * lightType.z;
// }

// vec4 compLightColor(vec4 lightColor, float LTarget, float LDecay, vec3 LPos, vec3 LDir,
// 					float LConeOut, float LConeIn, vec4 lightType) {
// 	float LCosOut = cos(radians(LConeOut / 2.0));
// 	float LCosIn = cos(radians(LConeOut * LConeIn / 2.0));

// 	//lights
// 	// -> Point
// 	vec4 pointLightCol = lightColor * pow(LTarget / length(LPos - fs_pos), LDecay);
// 	// -> Direct
// 	vec4 directLightCol = lightColor;
// 	// -> Spot
// 	vec3 spotLightDir = normalize(LPos - fs_pos);
// 	float CosAngle = dot(spotLightDir, LDir);
// 	vec4 spotLightCol = lightColor * pow(LTarget / length(LPos - fs_pos), LDecay) *
// 						clamp((CosAngle - LCosOut) / (LCosIn - LCosOut), 0.0, 1.0);
// 	// ----> Select final component
// 	return          directLightCol * lightType.x +
// 					pointLightCol * lightType.y +
// 					spotLightCol * lightType.z;
// }

// vec4 compAmbient(vec3 normalVec) {
// 	// Ambient
// 	// --> Ambient
// 	vec4 ambientAmbient = ambientLightColor;
// 	// --> Hemispheric
// 	float amBlend = (dot(normalVec, ADir) + 1.0) / 2.0;
// 	vec4 ambientHemi = ambientLightColor * amBlend + ambientLightLowColor * (1.0 - amBlend);
// 	// ----> Select final component
// 	return 		   ambientAmbient * ambientType.x +
// 				   ambientHemi    * ambientType.y;
// }




// void main() {
// 	vec4 texcol = texture(u_texture, fs_uv);
// 	vec4 diffColor = diffuseColor * (1.0-DTexMix) + texcol * DTexMix;
// 	vec4 ambColor = ambientMatColor * (1.0-DTexMix) + texcol * DTexMix;
	
// 	vec3 normalVec = normalize(fs_norm);
// 	vec3 eyedirVec = normalize(eyePos - fs_pos);
		
// 	//lights
// 	vec3 lightDirA = compLightDir(LAPos, LADir, LAlightType);
// 	vec4 lightColorA = compLightColor(LAlightColor, LATarget, LADecay, LAPos, LADir,
// 								     LAConeOut, LAConeIn, LAlightType);
	
// 	vec3 lightDirB = compLightDir(LBPos, LBDir, LBlightType);
// 	vec4 lightColorB = compLightColor(LBlightColor, LBTarget, LBDecay, LBPos, LBDir,
// 								     LBConeOut, LBConeIn, LBlightType);
	
// 	vec3 lightDirC = compLightDir(LCPos, LCDir, LClightType);
// 	vec4 lightColorC = compLightColor(LClightColor, LCTarget, LCDecay, LCPos, LCDir,
// 								     LCConeOut, LCConeIn, LClightType);
// 	// Ambient
// 	vec4 ambientLight = compAmbient(normalVec);
	
// 	vec4 out_color = texcol;
// `;
// var S1 = `
// 	vec4 LAcontr = clamp(dot(lightDirA, normalVec),0.0,1.0) * lightColorA;
// 	vec4 LBcontr = clamp(dot(lightDirB, normalVec),0.0,1.0) * lightColorB;
// 	vec4 LCcontr = clamp(dot(lightDirC, normalVec),0.0,1.0) * lightColorC;
// 	out_color = clamp(diffColor * (LAcontr + LBcontr + LCcontr) + ambientLight * ambColor, 0.0, 1.0);
// `;

// var fs2 = `	
// 	color = vec4(out_color.rgb, 1.0);
// }`;

// var perspProjectionMatrix;
// async function main(){
	
// 	canvas.addEventListener("mousedown", doMouseDown, false);
// 	canvas.addEventListener("mouseup", doMouseUp, false);
// 	canvas.addEventListener("mousemove", doMouseMove, false);
// 	canvas.addEventListener("mousewheel", doMouseWheel, false);
	
	
// 	var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, vs);
//     var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, fs1 + S1 + fs2);

//     // create program and attach the vertex and fragment shaders
//     program = utils.createProgram(gl, vertexShader, fragmentShader);

//     gl.useProgram(program);


//     // links mesh attributes to shader attributes
//     program.vertexPositionAttribute = gl.getAttribLocation(program, "in_pos");
//     program.vertexNormalAttribute = gl.getAttribLocation(program, "in_norm");
//     program.textureCoordAttribute = gl.getAttribLocation(program, "in_uv");
//     program.textureUniform = gl.getUniformLocation(program, "u_texture");
//     // program.LDir = gl.getUniformLocation(program, "LDir");
//     // program.ambientLightColor = gl.getUniformLocation(program, "ambientLightColor");
//     // program.ambientMaterial = gl.getUniformLocation(program, "ambientMatColor");
//     // program.lightColor = gl.getUniformLocation(program, 'lightColor');
//     // program.diffuseColor = gl.getUniformLocation(program, 'diffuseColor');
//     program.WVPmatrixUniform = gl.getUniformLocation(program, "pMatrix");
//     // program.DTexMix = gl.getUniformLocation(program, 'DTexMix');
//     // program.lightPos = gl.getUniformLocation(program, 'LPos');

//     // Load all meshes
//     var meshUrls = getMeshes();
//     for(const key of objectKeys) {
//         objstr = await utils.get_objstr(meshUrls[key]);
//         meshes[key] = new OBJ.Mesh(objstr)
//         if(key.includes('frame')){

//         	var texture = utils.getTexture(gl, "assets/frameSurface_Color.png")
//         } else if (key.includes('wheel')){

//         	texture = utils.getTexture(gl, "assets/wheelSurface_Color.png");
//         }

//         OBJ.initMeshBuffers(gl, meshes[key]);
//     }

//  //    // Create a texture.
// 	// var texture = gl.createTexture();
// 	// // use texture unit 0
// 	// gl.activeTexture(gl.TEXTURE0);
// 	// // bind to the TEXTURE_2D bind point of texture unit 0
// 	// gl.bindTexture(gl.TEXTURE_2D, texture);

// 	// // Asynchronously load an image
//  //    var image = new Image();
//  //    image.src = "assets/wheelSurface_Color.png";
//  //    image.onload = function () {
//  //        gl.activeTexture(gl.TEXTURE0+0);
//  //        gl.bindTexture(gl.TEXTURE_2D, texture);
//  //        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
//  //        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
//  //        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
//  //        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
//  //        gl.generateMipmap(gl.TEXTURE_2D);
//  //    };
 	

//     var objModel = [];
//     //Add all meshes 
//     for(const key of objectKeys) {
//         let objModel = meshes[key];
//         let vao = gl.createVertexArray();
//         gl.bindVertexArray(vao);
//         vaos[key] = vao;

        

//         // // // Create Buffer and load vertexData into buffer

//         // // // enable vertex attributes
//         var positionBuffer = gl.createBuffer();
//         gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
//         gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objModel.vertices), gl.STATIC_DRAW);
//         gl.enableVertexAttribArray(program.vertexPositionAttribute);
//         gl.vertexAttribPointer(program.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

//         var uvLocation = gl.getAttribLocation(program, "in_uv");
//         var uvBuffer = gl.createBuffer();
//         gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
//         gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objModel.textures), gl.STATIC_DRAW);
//         gl.enableVertexAttribArray(uvLocation);
//         gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);
    
//         var normalBuffer = gl.createBuffer();
//         gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
//         gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objModel.vertexNormals), gl.STATIC_DRAW);
//         gl.enableVertexAttribArray(program.vertexNormalAttribute);
//         gl.vertexAttribPointer(program.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
    
//         var indexBuffer = gl.createBuffer();
//         gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
//         gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(objModel.indices), gl.STATIC_DRAW);  
//     }

// 	//Load all initial world matrices
//     // worldMatrices = getInitialWorldmatrices();

//     drawScene();
// };

// main();

// // // // draw scences

// function drawScene() {
	
// 	// var canvas = document.getElementById("my-canvas");

// 	//SET Global states (viewport size, viewport background color, Depth test and backface culling)
// 	gl.viewport(0.0, 0.0, gl.canvas.width, gl.canvas.height);
// 	gl.clearColor(0.85, 0.85, 0.85, 1.0);
// 	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
// 	gl.enable(gl.DEPTH_TEST);
// 	gl.enable(gl.CULL_FACE);
// 	gl.cullFace(gl.BACK);


//     // Compute the projection matrix
//     var aspect = gl.canvas.width / gl.canvas.height;
//     perspProjectionMatrix = utils.MakePerspective(100.0, aspect, 0.1, 100.0);
	

//     // update WV matrix
// 	cz = lookRadius * Math.cos(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
// 	cx = lookRadius * Math.sin(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
// 	cy = lookRadius * Math.sin(utils.degToRad(-elevation));
// 	viewMatrix = utils.MakeView(cx, cy, cz, elevation, -angle);
	
// 	var t = utils.degToRad(defShaderParams.LDirTheta);
//     var p = utils.degToRad(defShaderParams.LDirPhi);
    
//     directionalLight = [
        
//         Math.sin(t) * Math.sin(p),
//         Math.cos(t),
//         Math.sin(t) * Math.cos(p)
//     ];
   

// 	for(const key of objectKeys) {
// 		let objModel = meshes[key];
        
//         var projectionMatrix = utils.multiplyMatrices(perspProjectionMatrix, viewMatrix);
//         var lightDirMatrix = utils.sub3x3from4x4(utils.transposeMatrix(worldMatrices[key]));
//         var lightDirectionTransformed = utils.normalize(utils.multiplyMatrix3Vector3(lightDirMatrix, directionalLight));
        
//         if(key.includes('wheel')){
//         	objModel.textures = digitsUV[0];
        	
//             gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(objModel.textures));
//             gl.vertexAttribPointer(program.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
//             gl.activeTexture(gl.TEXTURE0 + 0);
// 			gl.bindTexture(gl.TEXTURE_2D, texture);
// 			gl.uniform1i(program.textureUniform, 0);

//         }
        
        
// 		// draws the request
// 		gl.uniform4fv(program.lightColor, defShaderParams.lightColor);
//         gl.uniform4fv(program.diffuseColor, defShaderParams.diffuseColor);
//         gl.uniform4fv(program.ambientLightColor, defShaderParams.ambientLightColor);
//         gl.uniform4fv(program.ambientMaterial, defShaderParams.ambientMatColor);
//         gl.uniform3fv(program.lightDir, lightDirectionTransformed);
//         gl.uniform1f(program.DTexMix, defShaderParams.DTexMix);
//         gl.uniform3fv(program.lightPos, [defShaderParams.LPosX, defShaderParams.LPosY, defShaderParams.LPosZ]);
//         gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(projectionMatrix));	


		 
		
// 		gl.uniform1i(program.u_textureUniform, 0);
// 		gl.uniform3f(program.eyePosUniform, cx, cy, cz);



//         gl.bindVertexArray(vaos[key]);
//         gl.drawElements(gl.TRIANGLES, objModel.indices.length, gl.UNSIGNED_SHORT, 0); 
//     }
	
// 	window.requestAnimationFrame(drawScene);		
// }

// window.onload = main;