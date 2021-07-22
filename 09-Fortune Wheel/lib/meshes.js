var baseDirDark = "assets/";

var urls = {
    // Frame
    frame: baseDirDark + "frame.obj",
    // Stand
    stand: baseDirDark + "stand.obj",
    // Wheel
    wheel: baseDirDark + "wheel.obj",
}

function getMeshes(){
    return urls;
}

var textureUrls = {
    // Frame
    frame: baseDirDark + "frameSurface_Color.png",
    
    // Wheel
    wheel: baseDirDark + "wheelSurface_Color.png",

    // Frame ambient
    frameAmb: baseDirDark + "frameAmbient_Occlusion.png",
    
    // Wheel ambient
    wheelAmb: baseDirDark + "wheelAmbient_Occlusion.png",

}

function getTextures(){
    return textureUrls;
}