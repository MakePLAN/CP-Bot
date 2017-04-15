var slackTerminal = require('slack-terminalize');
var Client = require('node-rest-client').Client;
var restify = require('restify');
var util  = require('./util');
var express = require('express');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var request = require('request');
var Q = require('q');

var Slack = require('@slack/client');  
var RtmClient = Slack.RtmClient;  
var RTM_EVENTS = Slack.RTM_EVENTS;

var client = new Client();

var workMap = {};

//key 
var key = require('./key.json');

//slack init
slackTerminal.init( key["token"], {
    // slack rtm client options here
    // more info at: https://github.com/slackhq/node-slack-client/blob/master/lib/clients/rtm/client.js
}, {
    // app configurations to suit your project structure
    // to see the list of all possible config,
    // check this out: https://github.com/ggauravr/slack-terminalize/blob/master/util/config.js
  CONFIG_DIR: __dirname + '/config',
  COMMAND_DIR: __dirname + '/commands'
});

/*
var rtm = new RtmClient( key["botToken"] );  
rtm.start();
*/

//server init
var app = express();

//listening for request
app.post('/request', urlencodedParser, (req, res) =>{
    res.status(200).end(); // best practice to respond with empty 200 status code
    var reqBody = req.body;
    var responseURL = reqBody.response_url;
    
    if (reqBody.token != key["verToken1"] ){
        res.status(403).end("Access forbidden");
    }
   else {
        sendButton("request", reqBody, responseURL);
    }
});

function sendButton(type, reqBody, responseURL){
  if (type == "request"){
    var userName = reqBody.user_name;
    var issue = reqBody.text;
    var studentID = reqBody.user_id;

    //console.log(reqBody);
    var msg = userName + " = " + issue;

    var message = {
        "response_type": "in_channel",
        "text": "",
        "attachments": [
            {
                "text": "Help needed -> " + msg ,
                "fallback": "Buttons aren't supported~",
                "callback_id": "CP_request",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": [
                    {
                        "name": userName,
                        "text": "HELP",
                        "type": "button",
                        "value": studentID,
                        "style": "danger"
                    }
                ]
            }
        ]
    };
    sendMessageToSlackResponseURL(responseURL, message);
  }
  else if (type == "done"){

    var message = {
        "text": "button",
        "attachments": [
            {
                "text": "Click DONE button when you finish helping!" ,
                "fallback": "Buttons aren't supported~",
                "callback_id": "CP_done",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": [
                    {
                        "name": "",
                        "text": "DONE",
                        "type": "button",
                        "value": ""
                    }
                ]
            }
        ]
    };


    var text = "Done button";
    var attachments = [
            {
                "text": "Click DONE button when you finish helping!" ,
                "fallback": "Buttons aren't supported~",
                "callback_id": "CP_done",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": [
                    {
                        "name": "finish",
                        "text": "DONE",
                        "type": "button",
                        "value": true
                    }
                ]
            }
        ];

    var url = 'https://slack.com/api/chat.postMessage?token=' + key["legacyToken1"] + '&channel=' + '' + '&text=' + text + '&attachments=' + attachments + '&username=' + 'CP-bot-test' +'&as_user=' + 'false' +'&pretty=1';
  //console.log('url: ', url);

  client.get(url, function (data, response) {
      // parsed response body as js object 

  });
    //rtm.sendMessage( "hello" , 'G50ALNM7Y');
    //sendMessageToSlackResponseURL(responseURL, message);
  }
}

function sendMessageToSlackResponseURL(responseURL, JSONmessage){
    var postOptions = {
        uri: responseURL,
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        json: JSONmessage
    };
    request(postOptions, (error, response, body) => {
        if (error){
            // handle errors as you see fit
        }
    });
}

//listening when someone accepts it 
app.post('/accepted', urlencodedParser, (req, res) =>{
    res.status(200).end(); // best practice to respond with 200 status
    var actionJSONPayload = JSON.parse(req.body.payload); // parse URL-encoded payload JSON string
    
    var sherpa = actionJSONPayload.user.name;
    var sherpaID = actionJSONPayload.user.id;
    var student = actionJSONPayload.actions[0].name;
    var studentID = actionJSONPayload.actions[0].value;
    
    //console.log(sherpaID);
    //console.log(studentID);

    var message; 
    if (workMap[sherpa] == undefined ){
      //record in workmap
      


      message = {
          "response_type": "in_channel",
          "text": sherpa + " is helping -> " + student,
          "replace_original": true
      };

      createGroup('U4Z0UJS8H', sherpa, sherpaID, studentID );
    }
    else{

      message = {
          "response_type": "ephemeral",
          "text": "@" + sherpa +" Make sure to click DONE in: " + workMap[sherpa]["GroupName"],
          "replace_original": false
      };
    }
    

    sendMessageToSlackResponseURL(actionJSONPayload.response_url, message);
});

app.listen(process.env.PORT || 8080);

/*
//bot listening
rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  console.log('Message:', message);

  var user = message.user;

  
  //U4Z0UJS8H
  rtm.sendMessage( "hello" , 'C4ZL2N0US');

});
*/


/*

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


			check.promise.done(function(data){
				rtm.sendMessage( "Type: " + storage[email]["Type"], 'C4GFDCPJT');
			});
  			
	  		//rtm.sendMessage( "Email: " + userInfo.user.profile.email + "." , 'C4GFDCPJT');
  		});	
  	}
  	
  }

  //rtm.sendMessage( "hello, " + user , 'C4GFDCPJT');

});

*/

function createGroup(botID, sherpa, sherpaID, studentID ){
  
  var url = 'https://slack.com/api/mpim.open?token=' + key["legacyToken1"] + '&users=' + botID + '%2C' + sherpaID + '%2C%20' + studentID + '&pretty=1';
  //console.log('url: ', url);

  client.get(url, function (data, response) {
      // parsed response body as js object 
      //console.log(data.group);
      //console.log(data.group.purpose.value);
      var groupName = data.group.purpose.value.split(" ");
      groupName.splice(0, groupName.length - 3);

      var groupTitle = "";

      for (var i = 0; i < groupName.length; i++){
        groupName[i] = groupName[i].replace("@", "");
        groupName[i] = groupName[i].replace(" ", "");
        if (i  == groupName.length - 1){
          groupTitle += groupName[i];
        }
        else{
          groupTitle += (groupName[i] + ', ' );
        }
        
      }
      workMap[sherpa] = {
        "GroupName": groupTitle,
        "GroupID": data.group.id
      };
      sendButton("done", "", "");
      //console.log(workMap[sherpa] );
  });

}

function CloseGroup(groupID){
  var url = 'https://slack.com/api/mpim.open?token=' + key["legacyToken1"] + '&channel=' + groupID + '&pretty=1';
  //console.log('url: ', url);

  client.get(url, function (data, response) {
      // parsed response body as js object 

  });
}


function getUser(userID){
	var temp = Q.defer();

	var url = 'https://slack.com/api/users.info?token=' + key["tokenUser"] + '&user=' + userID + '&pretty=1';
	//console.log('url: ', url);
	//https://slack.com/api/users.info?token=xoxp-17438507472-17439619056-33855016146-12058bcf05&user=U0HCXJ71N&pretty=1
	
	

	client.get(url, function (data, response) {
	    // parsed response body as js object 
	    //console.log(data);
		temp.resolve(data);
	});

	return temp.promise;
	
}




