var util 	= require('../util');

module.exports = function (param) {
	var	channel	= param.channel;
	var message = param.args[0];

	util.postMessage(channel, message);


};