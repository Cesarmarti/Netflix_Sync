const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const port = 6969;
const server = http.createServer(express);
const wss = new WebSocket.Server({ server })

const urlsForRooms = []
const rooms = []
rooms[12345] = []
var roomCodes = []
roomCodes.push(12345);

wss.on('connection', function connection(ws) {
	console.log("User connected!")
	ws.on('message', function incoming(data) {
		var serData = JSON.parse(data);
		const { message, meta, room } = serData;
		//switch to determine what to do with the info
		switch(meta){
			case "create":
				var code = genRoomCode();
				urlsForRooms[code] = message;
				rooms[code] = [];
				rooms[code].push(ws);
				ws.send(JSON.stringify({"message":"","meta":"setRoomNumber","room":code}));
				break;
			case "start":
				Object.entries(rooms[room]).forEach(([, sock]) => sock.send(JSON.stringify({"message":"","meta":"start","room":room})));
				break;
			case "stop":
				Object.entries(rooms[room]).forEach(([, sock]) => sock.send(JSON.stringify({"message":"","meta":"stop","room":room})));
				break;
			case "join":
				if(rooms[room]==null){
					ws.send(JSON.stringify({"message":"No such room exists.","meta":"NoRoom","room":""}));
				}else{
					rooms[room].push(ws);
					ws.send(JSON.stringify({"message":urlsForRooms[room],"meta":"Connected","room":room}));
				}
				break;
			case "timeSync":
				Object.entries(rooms[room]).forEach(([, sock]) => sock.send(JSON.stringify({"message":message,"meta":"timeSync","room":room})));
				break;
			case "disconnectUser":
				var tempRooms = rooms[room];
				const index = tempRooms.indexOf(ws);
				if (index > -1) {
				  tempRooms.splice(index, 1);
				}
				rooms[room] = tempRooms;
				break;
			case "disconnectHost":
				//send to all member to "locally" disconnect
				Object.entries(rooms[room]).forEach(([, sock]) => {
					var ajeHost=false;
					if(sock==ws)
						ajeHost=true
					sock.send(JSON.stringify({"message":ajeHost,"meta":"roomDeleted","room":room}))
				})//clear room
				rooms[room]=[]
				urlsForRooms[room] = ""
				//make room number available
				var ind = roomCodes.indexOf(room);
				if (ind > -1) {
				  roomCodes.splice(ind, 1);
				}
				break;
			default:
		}
		/*wss.clients.forEach(function each(client) { 
		  if (client !== ws && client.readyState === WebSocket.OPEN) {
		    client.send(data);
		  }
		})*/
	});
	ws.on('close', function () {
    	console.log("User disconnected.")
	});
})

server.listen(process.env.PORT, function() {
  	console.log(`Server is listening on ${process.env.PORT}!`)
})


function genRoomCode(){
	var code;
	var good;
	while(!good){
		good = false;
		code = Math.floor(Math.random()*90000)+10000;
		if(!roomCodes.includes(code))
			good = true;
	}
	console.log("Created room code: "+code);
	roomCodes.push(code);
	return code;
}