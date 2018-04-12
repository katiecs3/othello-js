﻿// Your code here!

var isRunning = false;
var isPlaying = false;
var setSettingsString = 'Set Settings';
var pulsed = false;
var closeNow = false;
var model = new NeuralNetLearner();
var databaseModelName = 'model2';
var numGamesPerBatch = 10;
var db = firebase.firestore();
// var numGamesPlayed=0;

createOrLoadModel();

window.onload = function () {
    document.getElementById("train").onclick = function (evt) {
        run();
    };
  //   document.getElementById("terminate").onclick = function (evt) {
	// terminate();
  //   };
};

function createOrLoadModel() {
    db.collection(databaseModelName).orderBy('timestamp', 'desc').limit(1).get().then((querySnapshot) => {
      if (querySnapshot.empty) {
        console.log("Creating new model...");
        // parameters: in, out, layers, activation, learning rate
        model.createModel(65, 1, [65, 65], 'sigmoid', 0.3);
      }
     else {
        console.log("Loading model...");
        model.loadModelFromJsonString(querySnapshot.docs[0].data().model);
        console.log("done.");
      }
    });
}

var currentGameNum = 0;

function run() {
  // isRunning=true;
  // isDrawing=false;
  // if(currentGameNum==0) document.getElementById("output0").innerHTML='';//resets between games
  prev = document.getElementById("output0").innerHTML;
  document.getElementById("output0").innerHTML = prev + '<br />Training ' + currentGameNum + '...';

  app.startNewGameTrain(model, gameDone);
}

function coordStringToInt(coord) {
	let bits = coord.split("-");
	let num = 0;
	num = (int(bits[0]) - 1) * 8 + (int(bits[1] - 1));
	return num;
}


async function gameDone() {
  // ++numGamesPlayed;
  prev = document.getElementById("output0").innerHTML;
  document.getElementById("output0").innerHTML = prev + " DONE.";
  // document.getElementById("gamesTrainedCounter").innerHTML='Number of Games trained--'+numGamesPlayed+'\n';


  currentGameNum++;
  if (currentGameNum < numGamesPerBatch) {
    run();
  } else {
    currentGameNum = 0;
    var data = await getDataFromDB();
    window.lastTimeSaved = Date.now();
    var features = data.map((d) => d.slice(0,-1));
    var labels = data.map((d) => d[65]);

	console.log("WE ARE HERE");
	console.log(features);
	console.log(labels);
	for (let f = 0; f < features.length; f++) {
		console.log("what");
		features[f][64] = this.coordStringToInt(features[f][64]);
	}
	
    model.train(features, labels);

    saveModelToDB();
    // if(closeNow){
    // 	closeNow=false;
    // 	isRunning=false;
    // 	isDrawing=true;
    // 	return;
    // }
    //   setTimeout(run,10);
    // }
  }
}

function getDataFromDB() {
  var db = firebase.firestore();
  var data = [];

  if (typeof window.lastTimeSaved !== 'undefined'){
    return db.collection(window.databaseName).where('timestamp', '>', window.lastTimeSaved).get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        data.push(doc.data().state);
      })
      return data;
    });

  } else {
    return db.collection(window.databaseName).limit(100).get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        data.push(doc.data().state);
      })
      return data;
    });

  }

}

function saveModelToDB() {

  prev = document.getElementById("output0").innerHTML;
  document.getElementById("output0").innerHTML = prev + "<br />Saving model to database... ";

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

// function terminate() {
//     if(isRunning){
//         closeNow=true;
//     }
// }
