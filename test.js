var Q = require('q');
//Firebase stuff
var admin = require('firebase-admin');
var serviceAccount = require("./secret.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://hackathons-bee81.firebaseio.com/"
});

// Get a database reference to our posts
var db = admin.database();
var ref = db.ref("AthenaHacks/Applicants");

/*
//can't contain ".", "#", "$", "/", "[", or "]"
ref.set({
	'sangwoon@usc edu': {
		"Name" : "Ben Lee",
		"Team" : "Beanco",
		"Type" : "Mentor"
	},
	'punhani@usc edu':{
		"Name" : "Sagar Punhani",
		"Team" : "Beanco",
		"Type" : "Hacker"
	}
});
*/
var bin = null; 

var check = Q.defer();

ref.on("value", function(snapshot) {

  //console.log("data: ", snapshot.val()["sangwoon@usc edu"] );
  check.resolve(snapshot.val() );
  bin = snapshot.val();

}, function (errorObject) {
  console.log("The read failed: " + errorObject.code);
});

check.promise.done(function(data){
	console.log("data: ",data["sangwoon@usc edu"])
	console.log("bin: ", bin);
});


/*
// Attach an asynchronous callback to read the data at our posts reference
ref.on("child_changed", function(snapshot) {

  if (snapshot.key == "picTaken" && snapshot.val() == 0){
    picReady.resolve(true)
  //call api 
  }
  //console.log(snapshot.key);
  //console.log(snapshot.val());

}, function (errorObject) {
  console.log("The read failed: " + errorObject.code);
});
*/