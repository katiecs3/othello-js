// Your code here!

var isRunning = false;
var isPlaying = false;
var setSettingsString = 'Set Settings';
var pulsed = false;
var closeNow = false;
var generationOn = false;
var winPercentageOn = false;
var pulseOn = false;
var closePlayNow = false;
var model;
var databaseModelName = 'model1';
var numGamesPerBatch = 10;
var db = firebase.firestore();

model = new NeuralNetLearner();
createOrLoadModel();

window.onload = function () {
    document.getElementById("train").onclick = function (evt) {
        run();
    };
};

function createOrLoadModel() {
    db.collection(databaseModelName).orderBy('timestamp', 'desc').limit(1).get().then((querySnapshot) => {
      if (querySnapshot.empty)
        // parameters: input, output, hidden layers, activation function, learning rate
        model.createModel(65, 1, [65, 65], 'sigmoid', 0.3);
      else {
        model.loadModelFromJsonString(querySnapshot.docs[0].data().model);
      }
    });
}

var currentGameNum = 0;

function run() {
  prev = document.getElementById("output0").innerHTML;
  document.getElementById("output0").innerHTML = prev + '<br />Training ' + currentGameNum;
  app.startNewGameTrain(model, gameDone);
}

function gameDone() {

  prev = document.getElementById("output0").innerHTML;
  document.getElementById("output0").innerHTML = prev + " DONE.";

  currentGameNum++;
  if (currentGameNum < numGamesPerBatch) {
    run();
  } else {
    currentGameNum = 0;
    var data = getDataFromDB();
    window.lastTimeSaved = Date.now();
    var features = data.map((d) => d.slice(0,-1));
    var labels = data.map((d) => d[65]);

    model.train(features, labels);

    saveModelToDB();
  }
}

function getDataFromDB() {
  var db = firebase.firestore();
  var data = [];

  if (typeof window.lastTimeSaved !== 'undefined'){
    db.collection(window.databaseName).where('timestamp', '>', window.lastTimeSaved).get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        data.push(doc.data().state);
      });
    });
  } else {
    db.collection(window.databaseName).get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        data.push(doc.data().state);
      });
    });
  }

  return data;
}

function saveModelToDB() {

  // console.log(model);
  db.collection(databaseModelName).add({
      model: model.getModelAsJsonString(),
      timestamp: Date.now()
  })
  .then(function(docRef) {
      console.log("Model written with ID: ", docRef.id);
  })
  .catch(function(error) {
      console.error("Error adding document: ", error);
  });
}

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
