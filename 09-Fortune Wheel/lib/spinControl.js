let totalScore = 0;
let spinScore = null;
var lastUpdateTime = (new Date).getTime();
var rotationAngle = [];
var speedControl = [];
var px = 1.0;
var py = 1.0;
var pz = 1.0;
var RX = 0.0;
var RY = 0.0;
var RZ = 0.0;
var S = 1.0;

class Frame{
	worldMatrix = null;

	constructor(x, y, z, a1, a2, a3, side){
        this.x = x;
        this.y = y;
        this.z = z;
        this.worldMatrix = utils.MakeWorld(x, y, z, a1, a2, a3, 1.0);
    }

    getWorldMatrix(){
        return this.worldMatrix;
    }
}


// --------------------------------------------------------------------------------------
class Stand{
	worldMatrix = null;

	constructor(x, y, z, a1, a2, a3, side){
        this.x = x;
        this.y = y;
        this.z = z;
        this.worldMatrix = utils.MakeWorld(x, y, z, a1, a2, a3, 1.0);
    }

    getWorldMatrix(){
        return this.worldMatrix;
    }

}

// --------------------------------------------------------------------------------------
class Wheel{
	worldMatrix = null;

	constructor(x, y, z, RX, RY, RZ, S){
        this.x = x;
        this.y = y;
        this.z = z;
        this.RX = RX;
        this.RY = RY;
        this.RZ = RZ;
        this.S = S;
        this.worldMatrix = utils.MakeWorld(x, y, z, RX, RY, RZ, S);
        this.isRotating = false;
        this.hasStopped = true;
        this.lastUpdateTime = (new Date).getTime();
    }
    getWorldMatrix(){

        return this.worldMatrix;

    }

    animate() {
    	if (this.isRotating === true){
    		var currentTime = (new Date).getTime();
			var elapsedTime = (currentTime - lastUpdateTime) / 1000.0;
            var speed = Math.random() * 360;
            
            // Set the maximum time at which the wheel can rotate
            if (elapsedTime >= 10.0){
                this.hasStopped = true;
                this.isRotating = false;
                var spinButton = document.getElementById('spin_wheel');
                spinButton.onclick = function() {
                document.getElementById(BUTTON_ID).removeAttribute('spin_wheel');
                }
                
                let x = rotationAngle.slice(-1);

                // Determine the final score depending on where the wheel will stop
                if (x>0 && x<20){
                    spinScore = -200;
                } else if (x>20 && x<40){
                    spinScore = 800;
                } else if (x>40 && x<60){
                    spinScore = 100;
                } else if (x>60 && x<80){
                    spinScore = -500;
                } else if (x>80 && x<100){
                    spinScore = -1;
                } else if (x>100 && x<120){
                    spinScore = 50;
                } else if (x>120 && x<140){
                    spinScore = 5000;
                } else if (x>140 && x<160){
                    spinScore = 600;
                } else if (x>160 && x<180){
                    spinScore = 800;
                } else if (x>180 && x<200){
                    spinScore = 500;
                } else if (x>200 && x<220){
                    spinScore = 0;
                } else if (x>220 && x<240){
                    spinScore = 300;
                } else if (x>240 && x<260){
                    spinScore = -300;
                } else if (x>260 && x<280){
                    spinScore = 800;
                } else if (x>280 && x<300){
                    spinScore = 50;
                }  else if (x>300 && x<320){
                    spinScore = -1000;
                } else if (x>320 && x<340){
                    spinScore = 1000;
                } else if (x>340 && x<360){
                    spinScore = 500;
                }
                
                var spinResult = document.getElementById("spin_result");
                spinResult.innerHTML = "You won: $" + spinScore;


            }


            // Perform the animation by translating the wheel, rotating around the z-axis, scaling and the translating back
            if (this.hasStopped === false){
                this.worldMatrix = utils.MakeWorld(this.x, this.y, this.z, this.RX, this.RY, elapsedTime, 1.0);

                // if (elapsedTime > 6 && elapsedTime <10){
                //     var ySpeed = speedControl.slice(-1)
                //     console.log(ySpeed);
                //     // if (ySpeed < 0){
                //     //     console.log(ySpeed + 10);
                //     // }
                //     // speed  =  - 10; 
                // }
                // // } else if (elapsedTime > 7 && elapsedTime <8){
                // //     speed = Math.random() * 100;
                // // } else if (elapsedTime > 8 && elapsedTime <9){
                // //     speed = Math.random() * 50;
                // // } else if (elapsedTime > 9 && elapsedTime <10){
                // //     speed = Math.random() * 10;
                // // }
                
                // // console.log(speed - 10);
                var RZ = utils.MakeRotateZMatrix(speed);
                rotationAngle.push(speed);
                speedControl.push(speed);

                var scale = utils.MakeScaleMatrix(1.0);

                var trans = utils.MakeTranslateMatrix(0.0, 0.0, 1.0);
        
                var back = utils.MakeTranslateMatrix(0.504, -0.38, -1.0);
               
                var out = utils.multiplyMatrices(trans,  
                            utils.multiplyMatrices(RZ,
                                utils.multiplyMatrices(scale, back)));
               
                this.worldMatrix = utils.multiplyMatrices(this.worldMatrix, out);
                this.lastUpdateTime = currentTime;

            }
    
     	}
	
    }

}