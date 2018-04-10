// Your code here!

var isRunning = false;
var setSettingsString = 'Set Settings'; 
var pulsed = false;
var closeNow = false;
var generationOn = true;
var winPercentageOn = false;
var pulseOn = false;

window.onload = function () {
    document.getElementById("train").onclick = function (evt) {
        run();
    };
    document.getElementById("terminate").onclick = function (evt) {
        terminate();
    };
    document.getElementById("pulse").onclick = function (evt) {
        togglePulse();
    };
    document.getElementById("displayPercentage").onclick = function (evt) {
        toggleWinPercentage();
    };
    document.getElementById("displayGeneration").onclick = function (evt) {
        toggleGeneration();
    };
};
function run() {
    document.getElementById("output0").innerHTML = 'Training Started!';
    if (!isRunning) {
        isRunning = true;
        oneBatchRun();
    }
    else {
        document.getElementById("output0").innerHTML = 'Game Already Running';
    }
}

function terminate() {
    if (isRunning) {
        closeNow = true;
    }
}



var returns = 0;
var numGamesPerBatch = 10;
var numGamesRunning;
var running = false;
//RUN GMAE
function oneBatchRun() {
    numGamesRunning = numGamesPerBatch;
    returns = 0;
    for (var i = 0; i < numGamesRunning; ++i) {
        runGameSync();
    }
    if (closeNow) {
        isRunning = false;
        closeNow = false;
        document.getElementById("output0").innerHTML = 'Terminated';
        //TO DO any last data collection

    }
    else {
        setTimeout(oneBatchRun, 10);//wait 10 seconds to allow UI to update
    }
}
function runGameSync() {
    executeGame();
    processTrainingData();
    save();
    pulseStuff();
    generationStuff();
    if (winPercentageOn) {
        percentageStuff(0);
    }
    running = false;
}

//TO DO
function executeGame() {
   othello.startNewGame(); 
}
function processTrainingData() {

}
function save() {

}
//END TO DO
var pulseDelay = 100;
var pulseCount = 0;
function pulseStuff() {
    if (pulseOn) {
        if (pulseCount < pulseDelay) {
            ++pulseCount;
        }
        else {
            pulseCount = 0;
            if (pulsed) {
                document.getElementById("pulseOutput").innerHTML = '\n';
            }
            else {
                document.getElementById("pulseOutput").innerHTML = '**********\n';
            }
            pulsed = !pulsed;
        }
    }
}
var generation = 0;
function generationStuff() {
    ++generation;
    if (generationOn) {
        document.getElementById("generationOutput").innerHTML = 'generation:' + generation;
    }
}
function percentageStuff(percentage) {
    document.getElementById("winPercentageOutput").innerHTML = 'Win Percentage:' + percentage;
}
function togglePulse() {
    if (isRunning) {
        if (pulseOn) {
            document.getElementById("output0").innerHTML = 'Pulse Off';
            pulseOn = false;
            document.getElementById("pulseOutput").innerHTML = '\n';
        }
        else {
            pulseOn = true;
            document.getElementById("output0").innerHTML = 'Pulse On';
        }
    }
    else {
        document.getElementById("output0").innerHTML = 'Game not Running';
    }
}

function toggleGeneration() {
    if (isRunning) {
        if (generationOn) {
            document.getElementById("output0").innerHTML = 'Generation Off';
            generationOn = false;
            document.getElementById("generationOutput").innerHTML = '\n';
        }
        else {
            document.getElementById("output0").innerHTML = 'Generation On';
            generationOn = true;
        }
    }
    else {
        document.getElementById("output0").innerHTML = 'Game not Running';
    }
}
function toggleWinPercentage() {
    if (isRunning) {
        if (winPercentageOn) {
            document.getElementById("output0").innerHTML = 'Win Percentage Off';
            winPercentageOn = false;
            document.getElementById("winPercentageOutput").innerHTML = '\n';
        }
        else {
            document.getElementById("output0").innerHTML = 'Win Percentage On';
            winPercentageOn = true;
        }
    }
    else {
        document.getElementById("output0").innerHTML = 'Game not Running';
    }
}
