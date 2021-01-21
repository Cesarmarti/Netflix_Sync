let ws;
var roomCode = "";
var userType = "";
chrome.storage.local.set({ "roomCode": roomCode });
chrome.storage.local.set({ "userType": userType });
/*chrome.browserAction.onClicked.addListener(function(tab) {
  // Send a message to the active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
  });
});*/
var host_url = "";
var should_redirect = false;

chrome.runtime.onMessage.addListener( function(request,sender,sendResponse){
    if( request.msg === "CreateRoom" ){
    	var netflix_url = ""
    	chrome.tabs.query({}, function(tabs) {
		    var tab_id = tabs[0].id;
			for(var i = 0;i<tabs.length;i++){
				if(tabs[i].title=="Netflix"){
					tab_id=tabs[i].id;
					var netflix_url = tabs[i].url;
				}
			}
			host_url = netflix_url.split("&")[0]
			init("","host");
		    chrome.tabs.sendMessage(tab_id, {"msg":'HostInject'}, function(response) {
			 
			});
		});
    	sendResponse("Created");        
    }else if(request.msg ==="Start"){
    	//transmit over socket to start 
    	ws.send(JSON.stringify({"message":"","meta":"start","room":roomCode}))
		sendResponse("Start")
    }else if(request.msg === "Stop"){
    	ws.send(JSON.stringify({"message":"","meta":"stop","room":roomCode}))
    	sendResponse("Stop")
    }else if(request.msg ==="Join"){
    	should_redirect = request.redirectJ;
    	init(request.room,"client");
    	sendResponse("Joining")
    }else if(request.msg === "Sync"){
    	//send to content, in callback send to server i guess
    	chrome.tabs.query({}, function(tabs) {
		    var tab_id;
			for(var i = 0;i<tabs.length;i++)
				if(tabs[i].title=="Netflix")
					tab_id=tabs[i].id;
		    chrome.tabs.sendMessage(tab_id, {"msg":'GetTime'}, function(response) {
			 	console.log(response);
			});
		});
    	sendResponse("Syncing")
    }else if(request.msg==="TimeSkip"){
    	ws.send(JSON.stringify({"message":request.timeSrc,"meta":"timeSync","room":roomCode}))
    	sendResponse("TimeSkip")
    }else if(request.msg==="DisconnectUser"){
    	//console.log("disconnect")
    	ws.send(JSON.stringify({"message":"","meta":"disconnectUser","room":roomCode}));
    	resetInfo();
		//ta del mogoce mal problematicen
		ws.close();
		sendResponse("UserDisconnect")
    }else if(request.msg==="DisconnectHost"){
    	ws.send(JSON.stringify({"message":"","meta":"disconnectHost","room":roomCode}));
    	//resetInfo();
    	//ws.close();
    	host_url="";
    	sendResponse("HostDisconnected")
    }else{
    	sendResponse("idk")
    }
   	return true;
});

function resetInfo(){
	roomCode = "";
	userType = "";
	chrome.storage.local.set({ "roomCode": "" });
	chrome.storage.local.set({ "userType": "" });
}
//init socket connection and listeners for host
function init(data,type) {
	ws = new WebSocket('ws://localhost:6969');
	if (ws) {
		ws.onerror = ws.onopen = ws.onclose = null;
		//ws.close();
	}
	ws.onopen = () => {
		console.log('Connection opened!');
		if(type==="host")
			ws.send(JSON.stringify({"message":host_url,"meta":"create","room":""}))
		else if(type=="client")
			ws.send(JSON.stringify({"message":"","meta":"join","room":data}))
	}
	ws.onmessage = ({ data }) => {
		var serData = JSON.parse(data);
		const { message, meta, room } = serData;
		switch(meta){
			case "setRoomNumber":
					roomCode = room;
					var genRoomCode = room;
			        chrome.storage.local.set({"roomCode": genRoomCode}, function() {
					  //console.log('Value is set to ' + value);
					});
					chrome.storage.local.set({"userType": "host"}, function() {
					  //console.log('Value is set to ' + value);
					});
			        //msg popup to change stuff
			        chrome.runtime.sendMessage({
					    msg: "roomCreated", 
					    data: genRoomCode,
					});
					break;
			case "start":
					start();
					break;
			case "stop":
					stop();
					break;
			case "NoRoom":
					ws.close()
					error_room(message);
					break;
			case "Connected":
					joined_room(message,room);
					//checks global variable if it should redirect
					if(should_redirect){
						chrome.tabs.query({}, function(tabs) {
						    var tab_id;
						    var exists = false;
							for(var i = 0;i<tabs.length;i++)
								if(tabs[i].title=="Netflix"){
									tab_id=tabs[i].id;
									exists = true;
								}
						    //if tab doesnt exits create it else redirect netflix tab to video
						    if(!exists)
						    	chrome.tabs.create({ url: message });
						    else
						    	chrome.tabs.update(tab_id, {url: message});
						});
					}
					break;
			case "timeSync":
					time_Sync(message);
					break;
			case "roomDeleted":
					userDisconnectUI(message);
					break
			default:
		}
	}
	ws.onclose = function() {
		ws = null;
	}
}


function start(){
	chrome.tabs.query({}, function(tabs) {
	    var tab_id;
		for(var i = 0;i<tabs.length;i++)
			if(tabs[i].title=="Netflix")
				tab_id=tabs[i].id;
	    chrome.tabs.sendMessage(tab_id, {"msg":'Start'}, function(response) {
		    console.log('Start action sent');
		});

	});
}

function stop(){
	chrome.tabs.query({}, function(tabs) {
	    var tab_id;
		for(var i = 0;i<tabs.length;i++)
			if(tabs[i].title=="Netflix")
				tab_id=tabs[i].id;
	    chrome.tabs.sendMessage(tab_id, {"msg":'Stop'}, function(response) {
		    console.log('Stop action sent');
		});
	});
}

function error_room(msg){
    chrome.runtime.sendMessage({
	    msg: "error_room", 
	    data: msg,
	});
}

function joined_room(msg,room){
	roomCode = room;
	userType = "client"
	chrome.storage.local.set({"roomCode": room}, function() {
	  //console.log('Value is set to ' + value);
	});
	chrome.storage.local.set({"userType": "client"}, function() {
	  //console.log('Value is set to ' + value);
	});
    //msg popup to change stuff
    chrome.runtime.sendMessage({
	    msg: "connected", 
	    data: room,
	});
}
function time_Sync(timeSrc){
	chrome.tabs.query({}, function(tabs) {
	    var tab_id;
		for(var i = 0;i<tabs.length;i++)
			if(tabs[i].title=="Netflix")
				tab_id=tabs[i].id;
	    chrome.tabs.sendMessage(tab_id, {"msg":'timeSet',"time":timeSrc}, function(response) {
		    console.log('Time action sent');
		});
	});
}

function userDisconnectUI(type){
	//clear type and roomcode
	resetInfo();
	ws.close();
	if(!type){
		chrome.runtime.sendMessage({
			msg: "roomDeleted", 
			data: "",
		});
	}
}

function strip_netflix_url(url){
	console.log(url)
}