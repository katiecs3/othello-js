// Your code here!

var isRunning = false;
var isPlaying = false;
var setSettingsString = 'Set Settings';
var pulsed = false;
var closeNow = false;
var model;
var databaseModelName = 'model1';
var numGamesPerBatch = 10;
var db = firebase.firestore();
var numGamesPlayed=0;

model = new NeuralNetLearner();
createOrLoadModel();

window.onload = function () {
    document.getElementById("train").onclick = function (evt) {
        run();
    };
    document.getElementById("terminate").onclick = function (evt) {
	terminate();
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
  isRunning=true;
  isDrawing=false;
  if(currentGameNum==0)document.getElementById("output0").innerHTML='';//resets between games
  prev = document.getElementById("output0").innerHTML;
  document.getElementById("output0").innerHTML = prev + '<br />Training ' + currentGameNum + '...';
  app.startNewGameTrain(model, gameDone);
}

function gameDone() {
  ++numGamesPlayed;
  prev = document.getElementById("output0").innerHTML;
  document.getElementById("output0").innerHTML = prev + " DONE.";
  document.getElementById("gamesTrainedCounter").innerHTML='Number of Games trained--'+numGamesPlayed+'\n';


  currentGameNum++;
  if (currentGameNum < numGamesPerBatch) {
    run();
  } else {
    currentGameNum = 0;
    /*var data = getDataFromDB();
    window.lastTimeSaved = Date.now();
    var features = data.map((d) => d.slice(0,-1));
    var labels = data.map((d) => d[65]);

    model.train(features, labels);

    saveModelToDB();*/
    if(closeNow){
	closeNow=false;
	isRunning=false;
	isDrawing=true;
	return;
    }
    setTimeout(run,10);  
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

  prev = document.getElementById("output0").innerHTML;
  document.getElementById("output0").innerHTML = prev + "<br />Saving model to database... ";

  // console.log(model);
  db.collection(databaseModelName).add({
      model: model.getModelAsJsonString(),
      timestamp: Date.now()
  })
  .then(function(docRef) {
      console.log("Model written with ID: ", docRef.id);
      prev = document.getElementById("output0").innerHTML;
      document.getElementById("output0").innerHTML = prev + "DONE.";
  })
  .catch(function(error) {
      console.error("Error adding document: ", error);
  });
}

function terminate() {
    if(isRunning){
        closeNow=true;
    }
}
