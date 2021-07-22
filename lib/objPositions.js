
var frameLocalMatrix = utils.MakeWorld(1, 1, 1, 0.0, 0.0, 0.0, 1.0);
var standLocalMatrix = utils.MakeWorld(1, 1, 1, 0.0, 0.0, 0.0, 1.0);
var wheelLocalMatrix = utils.MakeWorld(1, 1, 1, 0.0, 0.0, 0.0, 1.0);


var worlds = {
    // Frame
    frame : frameLocalMatrix,
    // Stand
    stand : standLocalMatrix,
    // Wheel
    wheel : wheelLocalMatrix,
    
};

function getInitialWorldmatrices(){
    return worlds;
}
