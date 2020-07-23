const Discord = require('discord.js');
var http = require('http');

const { prefix, token, streamid, clientid, authToken } = require('./config.json');
const client = new Discord.Client();
let streamStatus = "TestVar";


var server = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    var message = 'discordBot Server version 0.4.9\n',
        version = 'Running NodeJS v' + process.versions.node + '\n',
        status = 'Stream status: ' + streamStatus + '\n',
        response = [message, version, status].join('\n');
    res.end(response);
});

var request = require('request');
var options = {
  'method': 'GET',
  'url': `https://api.twitch.tv/helix/streams?user_id=${streamid}`, //https://api.twitch.tv/helix/users/follows?to_id=126682067
  'headers': {
    'client-id': `${clientid}`,
    'Authorization': `${authToken}`
  }
};

client.once('ready', () => {
	console.log(`Logged in as ${client.user.tag}`);
	intervalFunc();
});

function intervalFunc() {
	request(options, function (error, response) {
		if (error) throw new Error(error);
		//console.log(response.body)
		var info = JSON.parse(response.body);
		//console.log(info.data);
		if (isEmpty(info.data)){
			client.user.setActivity("Stream Offline");
			client.user.setStatus("dnd");
			streamStatus = "Offline";
		  	console.log("Offline");
		}
		else{
			//client.user.setActivity(`LIVE! with ${info.data[0].viewer_count} viewers.`);
			client.user.setPresence({ game: { name: `LIVE! with ${info.data[0].viewer_count} viewers.`, type: "streaming", url: "https://www.twitch.tv/fragbombshell"}});
			streamStatus = "Online";
		  	console.log("Online");
		}
	  });
	  return streamStatus;
  }
  setInterval(intervalFunc, 150000);

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

	switch (command) {
		case 'ping':
			message.channel.send('Pong.');
			break;
		case 'twitch':
			message.channel.send('http://twitch.tv/fragbombshell/');
			break;
		case 'twitter':
			message.channel.send('http://twitter.com/charlottesderry/');
			break;
		case 'instagram':
			message.channel.send('http://instagram.com/charlottesderry/');
			break;
		case 'server':
			message.channel.send(`Server name: ${message.guild.name}\nTotal members: ${message.guild.memberCount}`);
			break;
		case 'user-info':
			message.channel.send(`Your username: ${message.author.username}\nYour ID: ${message.author.id}`);
			break;
		case 'status':
			request(options, function (error, response) {
				if (error) throw new Error(error);
				//console.log(response.body)
				var info = JSON.parse(response.body);
				//console.log(info.data);
				if (isEmpty(info.data)){
					message.channel.send('FragBombshell is currently offline :tired_face:');
				}
				else{
					const exampleEmbed = {
						color: 0x0099ff,
						title: 'Click HERE To Join The Stream!',
						url: 'http://twitch.tv/fragbombshell/',
						author: {
							name: 'TrF_Hom',
							icon_url: 'https://tahobson.com/wp-content/uploads/2020/04/th-icon-1.png',
							url: 'https://tahobson.com/',
						},
						description: `${info.data[0].title}`,
						thumbnail: {
							url: 'https://static-cdn.jtvnw.net/jtv_user_pictures/bf9299c8-3d9f-45bc-81fb-759df86edd69-profile_image-70x70.png',
						},
						fields: [
							{
								name: `${info.data[0].user_name} current viewer count`,
								value: `${info.data[0].viewer_count} viewers`,
							}
						],
						timestamp: new Date(),
						footer: {
							text: 'FragBOT, developed by TrF_Hom',
							icon_url: 'https://cdn.discordapp.com/avatars/729277073939628093/449a79f0e42c418291d39519ce895316.png?size=512',
						},
					};
					message.channel.send({ embed: exampleEmbed });
				}
			  });
			  break;
	}
});

function isEmpty(obj) {
  for(var key in obj) {
      if(obj.hasOwnProperty(key))
          return false;
  }
  return true;
}

client.login(token);
server.listen();