var slackTerminal = require('slack-terminalize');
var request = require('request');
var Q = require('q');
var Client = require('node-rest-client').Client;

var token = 'xoxb-151869093908-yHCrJj04kk4YRgWZKKWc6Tjf';
var tokenUser = 'xoxp-17438507472-17439619056-33855016146-12058bcf05';

var Slack = require('@slack/client');  
var RtmClient = Slack.RtmClient;  
var RTM_EVENTS = Slack.RTM_EVENTS;

//Firebase
var admin = require('firebase-admin');
var serviceAccount = require("./secret.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://hackathons-bee81.firebaseio.com/"
});

// Get a database reference to our posts
var db = admin.database();
var ref = db.ref("AthenaHacks/Applicants");

var check = Q.defer();

var storage = null;

ref.on("value", function(snapshot) {

  //console.log("data: ", snapshot.val()["sangwoon@usc edu"] );
  check.resolve(true );
  storage = snapshot.val();

}, function (errorObject) {
  console.log("The read failed: " + errorObject.code);
});

/*
slackTerminal.init('xoxb-151869093908-yHCrJj04kk4YRgWZKKWc6Tjf', {
    // slack rtm client options here
    // more info at: https://github.com/slackhq/node-slack-client/blob/master/lib/clients/rtm/client.js
}, {
    // app configurations to suit your project structure
    // to see the list of all possible config,
    // check this out: https://github.com/ggauravr/slack-terminalize/blob/master/util/config.js
	CONFIG_DIR: __dirname + '/config',
	COMMAND_DIR: __dirname + '/commands'
});
*/



var rtm = new RtmClient(token );  
rtm.start();

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  console.log('Message:', message);

  var user = message.user;

  if (user != 'U4FRK2RSQ'){
  	if (message.subtype != "channel_leave"){
  		//console.log("User: ", user);
  		getUser(user).done(function(userInfo){
  			rtm.sendMessage( "Welcome, " + userInfo.user.real_name + "!" , 'C4GFDCPJT');
  			var email = userInfo.user.profile.email;
  			email = email.replace(".", " ");
  			console.log("WTF: ", email);

  			/*
  			ref.once("value", function(snap) {
			  rtm.sendMessage( "Type: " + snap.val()[email]["Type"] + "." , 'C4GFDCPJT');;
			});
			*/

			check.promise.done(function(data){
				rtm.sendMessage( "Type: " + storage[email]["Type"], 'C4GFDCPJT');
			});
  			
	  		//rtm.sendMessage( "Email: " + userInfo.user.profile.email + "." , 'C4GFDCPJT');
  		});	
  	}
  	
  }

  //rtm.sendMessage( "hello, " + user , 'C4GFDCPJT');

});


function getUser(userID){
	var temp = Q.defer();

	var url = 'https://slack.com/api/users.info?token=' + tokenUser + '&user=' + userID + '&pretty=1';
	//console.log('url: ', url);
	//https://slack.com/api/users.info?token=xoxp-17438507472-17439619056-33855016146-12058bcf05&user=U0HCXJ71N&pretty=1
	
	var client = new Client();

	client.get(url, function (data, response) {
	    // parsed response body as js object 
	    //console.log(data);
		temp.resolve(data);
	});

	return temp.promise;
	
}




