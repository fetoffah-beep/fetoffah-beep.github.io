
  var standNode = new Node();
  standNode.localMatrix = utils.MakeScaleMatrix(1, 1, 1);  
  standNode.drawInfo = {
    materialColor: [0.6, 0.6, 0.0],
    programInfo: program,
    bufferLength: indexData.length,
    vertexArray: vao,
  };

  var frameNode = new Node();

  frameNode.localMatrix = utils.MakeScaleMatrix(1, 1, 1);  
  frameNode.drawInfo = {
    materialColor: [0.2, 0.5, 0.8],
    programInfo: program,
    bufferLength: indexData.length,
    vertexArray: vao,
  };

  var wheelNode = new Node();
  wheelNode.localMatrix = utils.MakeScaleMatrix(1.0, 1.0, 1.0);
  wheelNode.drawInfo = {
    materialColor: [0.6, 0.6, 0.6],
    programInfo: program,
    bufferLength: indexData.length,
    vertexArray: vao,
  };

  frameNode.setParent(standNode);
  wheelNode.setParent(frameNode);

  var objects = [
    frame,
    stand,
    wheel,
  ];

  
  

    // update the local matrices for wheel object.
    wheelNode.localMatrix = utils.multiplyMatrices(out, wheelNode.localMatrix);

    // Update all world matrices in the scene graph
    standNode.updateWorldMatrix();