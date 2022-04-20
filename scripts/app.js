// Variables
import * as http from './http.js' //Import http functions
import * as view from './view.js'; //Import view functions

const BIN_ID = "62553299d20ace068f970a55";
const GET_LEADERBOARD = `https://api.jsonbin.io/b/${BIN_ID}/latest`;
const PUT_LEADERBOARD = `https://api.jsonbin.io/b/${BIN_ID}`;

let aimCanvas = new canvas('viewport');
let cursor = new mouse();
var id = null;

const state = {
    topScores: [],
    timeClicks: 0,
    accuracy: 0
};

//Setup
aimCanvas.setSize(1000, 600);

//start app
window.onload = startTrainer();

function canvas(canvasId){

    this.canvas = document.querySelector("#" + canvasId);
    this.ctx = this.canvas.getContext("2d");
    
    //initial view
    this.currentView = "menu";
    this.mode;

    //controls
    this.canvas.addEventListener('mousemove', function(e){
        this.boundingClientRect = this.getBoundingClientRect();
        aimCanvas.cursorX = e.clientX - this.boundingClientRect.left;
        return aimCanvas.cursorY = e.clientY - this.boundingClientRect.top;
    })

    this.canvas.addEventListener('mousedown', function(){
        //control in menu view
        if(aimCanvas.currentView === "menu"){
            //click to start game
            if(aimCanvas.cursorX > aimCanvas.centerX - 75 && aimCanvas.cursorX < aimCanvas.centerX + 75 && aimCanvas.cursorY > aimCanvas.centerY - 50 && aimCanvas.cursorY < aimCanvas.centerY + 100){
                aimCanvas.mode = new game();
                return aimCanvas.currentView = "game";
            }
        }
        //control game view
        if(aimCanvas.currentView === "game"){
            aimCanvas.mode.miss += 1;
            aimCanvas.mode.clicks.push(performance.now());
            aimCanvas.mode.targets.find(function(e, index){
                var dx = aimCanvas.cursorX - e.x;
                var dy = aimCanvas.cursorY - e.y;
                var dist = Math.abs(Math.sqrt(dx * dx + dy * dy));
                if(dist <= e.size){
                    aimCanvas.mode.miss -= 1;
                    aimCanvas.mode.hit -= 1;
                    return aimCanvas.mode.targets.splice(index, 1);
                }
            })
        }
        //don't let user input any more clicks
        if(aimCanvas.currentView === "end"){
            this.canvas.removeEventListener('mousedown', arguments.callee);
        }
    })
    
    //go back to menu by pressing Esc key
    document.addEventListener('keydown', function(e){
        if(e.code === "Escape" && aimCanvas.currentView === "game"){
            return aimCanvas.currentView = "menu";
        }
        //don't let user go back to menu view without refreshing
        if(aimCanvas.currentView === "end"){
            this.canvas.removeEventListener('keydown', arguments.callee);
        }
    })

    this.setSize = function(x, y){
        this.canvas.width = x;
        this.canvas.height = y;
        this.centerX = this.canvas.width / 2;
        return this.centerY = this.canvas.height / 2;
    }

    this.clear = function(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    this.controller = function(){
        if(this.currentView === "game"){
            this.mode.setTarget();
        }
        return this.view(this.currentView);
    }

    this.view = function(type){
        this.clear();

        //user clicks middle of screen to switch to game view and start aim trainer
        if(type === "menu"){
            this.ctx.fillStyle = "#FFFFFF";
            this.ctx.font = "80px Arial";
            this.ctx.fillText('Aim Trainer', this.centerX, this.centerY - 100);
            aimCanvas.ctx.textAlign = "center";
            aimCanvas.ctx.textBaseline = "center";
            aimCanvas.ctx.font = "30px Arial";
            aimCanvas.ctx.fillText("Click here to start!", this.centerX, this.centerY + 40);
        }
        else if(type === "game"){
            //game ends when player hits 30 targets
            if(this.mode.hit === 0){
                aimCanvas.currentView = "end";
            }
            //draw targets while canvas view is on game and display targets remaining out of 30 targets and how many times user has missed
            else{
                this.ctx.fillStyle = "#FFFFFF";
                aimCanvas.ctx.font = "30px Arial";
                aimCanvas.ctx.fillText("Targets Remaining: " + this.mode.hit, this.centerX, this.centerY - 200);
                aimCanvas.ctx.fillText("Miss: " + this.mode.miss, this.centerX, this.centerY - 160);

                this.mode.getTargets();
            }   
        }
        //condition to end game and return accuracy and average time between clicks
        else if(type === "end"){
            var clicksDiff = [];
            for(var i = 1; i < this.mode.clicks.length; i++){
                clicksDiff.push(Math.abs(this.mode.clicks[i] - this.mode.clicks[i - 1]));
            }
            var sum = 0;
            for(var index = 1; index < clicksDiff.length; index++){
                sum += clicksDiff[index];
            }
            var avg = sum / clicksDiff.length;
            state.timeClicks = Math.round(avg);
            state.accuracy = Math.round(30 / (30 + this.mode.miss) * 100);


            aimCanvas.ctx.fillStyle = "#FFFFFF";
            aimCanvas.ctx.font = "30px Arial";
            aimCanvas.ctx.fillText("Targets Hit: 30", this.centerX, this.centerY - 50);
            aimCanvas.ctx.fillText("Misses: " + this.mode.miss, this.centerX, this.centerY - 20);
            aimCanvas.ctx.fillText("Average Time Between Clicks: " + state.timeClicks + " ms", this.centerX, this.centerY + 10);
            aimCanvas.ctx.fillText("Accuracy: " + state.accuracy + "%", this.centerX, this.centerY + 40);
            if(state.accuracy < 86){
                aimCanvas.ctx.fillStyle = "#FFFFFF";
                aimCanvas.ctx.font = "30px Arial";
                aimCanvas.ctx.fillText("Your accuracy was less than 85%!", this.centerX, this.centerY + 100)
            }
            aimCanvas.ctx.fillText("Refresh the page to try again!", this.centerX, this.centerY + 200);
            return state.accuracy, state.timeClicks;
        }
        return cursor.show();
    }
}

function mouse(){
    this.show = function(){
        
    }
}

//game
function game(){

    this.hit = 30;
    this.miss = 0;
    this.targets = [];
    this.targetSize = 15; // Unity : Pixel
    this.clicks = [];

    this.setTarget = function(){
        if(this.targets.length < 3){
            this.targets.push(new target());
        }
    }

    this.getTargets = function(){
        this.targets.forEach(function(value, index){
            return value.draw();
        });
    }
}

function target(){
    this.x = rand(aimCanvas.mode.targetSize, aimCanvas.canvas.width);
    this.y = rand(aimCanvas.mode.targetSize, aimCanvas.canvas.height);
    this.size = 15;

    this.draw = function(){
        aimCanvas.ctx.fillStyle = "red";
        aimCanvas.ctx.beginPath();
        aimCanvas.ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        aimCanvas.ctx.closePath();
        aimCanvas.ctx.fill();
    }
}

//helper function for raqndomly displaying targets on canvas
function rand(min, max){
    return Math.round(Math.random() * (max - min) + min);
}

//function to start program
function startTrainer(){
    aimCanvas.controller();
    id = window.requestAnimationFrame(startTrainer);
    //once user finishes program (hits 30 targets), end the aim trainer and check if score is top 5
    if(state.timeClicks != 0 && state.accuracy != 0){
        stop();
        view.GameoverScene(state);
    }
}

//function to stop animation frame
function stop(){
        window.cancelAnimationFrame(id);
}

//function that adds new score to current top 5 and removes highest
const getTop5 = async (newScore) => {
    let top5 = await http.sendGETRequest(GET_LEADERBOARD);
    top5.push( newScore );
    top5.sort( (a,b) => a.timeClicks - b.timeClicks );
    top5.pop();
    return top5;
}

//global function to update leaderboard on web server
window.updateLeaderboard = async () => {
    const name = document.getElementById('name').value;
    const currentScore = {name: name, timeClicks: state.timeClicks, accuracy: state.accuracy};
    const top5 = await getTop5(currentScore);
    await http.sendPUTRequest(PUT_LEADERBOARD, top5);
    start();
}

//global start function for http request
window.start = async () => { //START function
    state.topScores = await http.sendGETRequest(GET_LEADERBOARD);
    console.log(state.topScores);
    view.StartMenu(state);
}

//run start function when window loads
window.addEventListener("load", start);