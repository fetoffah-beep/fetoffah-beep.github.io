var frameLocalMatrix = utils.MakeWorld(-0.30053, 8.5335, -5.9728, 0.0, 0.0, 0.0, 1.0);
var standLocalMatrix = utils.MakeWorld(0.4366, 12.789-1.29, 4.1852+0.61, 0.0, -101.0, 0.0, 1.0);
var wheelLocalMatrix = utils.MakeWorld(0.713, 12.789-1.29, 4.1852+0.61, 0.0, -101.0, 0.0, 1.0);


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
