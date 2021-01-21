//checks if we are already connected to a lobby
chrome.storage.local.get(['userType'], function(resultType) {
	chrome.storage.local.get(['roomCode'],function(resultRoom){
		if(resultType.userType=="host"){
			alreadyConnectedHost(resultRoom.roomCode);
		}else if(resultType.userType=="client"){
			alreadyConnectedClient(resultRoom.roomCode);
		}	
	})
	
});

//clears all tabs-- mostly tab menu related stuff
function clearAll(){
	var tabcontent = document.getElementsByClassName("tabcontent");
	for (i = 0; i < tabcontent.length; i++) {
	tabcontent[i].style.display = "none";
	}
	var tablinks = document.getElementsByClassName("tablinks");
	for (i = 0; i < tablinks.length; i++) {
	tablinks[i].className = tablinks[i].className.replace(" active", "");
	}
}


//logic
/*Sends msg to background.js where it starts a socket connection and requests
	a room creation from server. Then in background.js save room number. From
	background.js send to popup.js the room code. Send to content.js msg for time div
	creation.
*/
let starthost = document.getElementById('stHost');
starthost.onclick = function(element) {
    chrome.extension.sendMessage({msg: "CreateRoom"}, function(resp) {   
    	console.log(resp);
    });
};

//if already connected as a host,make that tab active and disable the other
function alreadyConnectedHost(number){
	let hostbutton = document.getElementById('stHost');
    hostbutton.style.display = "none"
    let discbutton = document.getElementById('discbutton');
    discbutton.style.display = "block"

    let labelRoom = document.getElementById('room_number');
    labelRoom.textContent = number;
    //flip div visible (contains start/stop)
    let hostControls = document.getElementById('buttonAndInfo');
    hostControls.style.display ="block";
	
	document.getElementById("profile-tab").classList.add("disabled");
}

//if already connected as a client
function alreadyConnectedClient(number){
	document.getElementById("home").classList.remove("active");
	document.getElementById("profile").classList.add("active");

	document.getElementById("home-tab").classList.remove("active");
	document.getElementById("profile-tab").classList.add("active");

	var joiningStuff = document.getElementById("joinedRoomNumber");
	joiningStuff.style.display="block";

	let labelError2 = document.getElementById('joinInput');
	labelError2.style.display="none";

	var msg = number;
    let labelRoom = document.getElementById('gotNumber');
    labelRoom.textContent=msg;

    let joinButtonUser = document.getElementById('JoinButton');
    joinButtonUser.style.display = "none";

    let checkBoxB = document.getElementById('checkboxJoin');
    checkBoxB.style.display="none";

    let discButton = document.getElementById('disconnectUser');
    discButton.style.display = "block";

	document.getElementById("home-tab").classList.add("disabled");
}

//start button
let start = document.getElementById('start');
start.onclick = function(element) {
    chrome.extension.sendMessage({msg: "Start"}, function(resp) {
    	console.log(resp)
    });      
};
//stop
let stop = document.getElementById('stop');
stop.onclick = function(element) {
    chrome.extension.sendMessage({msg: "Stop"}, function(resp) {
    	console.log(resp)
    });      
};
//sync
let sync = document.getElementById('sync');
sync.onclick = function(element) {
    chrome.extension.sendMessage({msg: "Sync"}, function(resp) {
    	console.log(resp)
    });      
};

//disconnect Host
let discH = document.getElementById('discbutton');
discH.onclick = function(element) {
    //reset ui, reset when user closes popup
    chrome.extension.sendMessage({msg: "DisconnectHost",room:""}, function(resp) {
    	resetUIhost();
    }); 
};
function resetUIhost(){
	let hostbutton = document.getElementById('stHost');
    hostbutton.style.display = "block"

    let stopButton = document.getElementById('discbutton');
    stopButton.style.display = "none"

    let labelRoom = document.getElementById('room_number');
	labelRoom.textContent = "";
    //flip div visible (contains start/stop)
    document.getElementById("buttonAndInfo").style.display="none";

    document.getElementById("profile-tab").classList.remove("disabled");
}

//join
let join = document.getElementById('JoinButton');
join.onclick = function(element) {
    let checkBoxBJoin = document.getElementById('joinRedirectCheck');  
            //get checkBoxB value and redirect if true
    var shouldRedirect = checkBoxBJoin.checked;
	var code = document.getElementById('roomCode').value;
    chrome.extension.sendMessage({msg: "Join",room:code,redirectJ:shouldRedirect}, function(resp) {
    	console.log(resp)
    });      
};

//disconnect User
let discU = document.getElementById('disconnectUser');
discU.onclick = function(element) {
    chrome.extension.sendMessage({msg: "DisconnectUser",room:""}, function(resp) {
    	resetUIuser();
    }); 
};
function resetUIuser(){
	var joiningStuff = document.getElementById("joinInput");
	joiningStuff.style.display="block";

    let labelError = document.getElementById('joinedRoomNumber');
    labelError.style.display="none";

    let joinBtn = document.getElementById('JoinButton');
    joinBtn.style.display="block";

    let checkBoxB = document.getElementById('checkboxJoin');
    checkBoxB.style.display="block";

  	let discButton = document.getElementById('disconnectUser');
	discButton.style.display = "none";

	document.getElementById("home-tab").classList.remove("disabled");
}


//listens for room created
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
    	console.log(request)
        if (request.msg === "roomCreated") {
            //  To do something
            var code = request.data;
            let hostbutton = document.getElementById('stHost');
		    hostbutton.style.display = "none"

		    let labelRoom = document.getElementById('room_number');
		    labelRoom.textContent = code;
		    //flip div visible (contains start/stop)
		    document.getElementById("buttonAndInfo").style.display="block";
		    let discbutton = document.getElementById('discbutton');
		    discbutton.style.display = "block"

		    document.getElementById("profile-tab").classList.add("disabled");

            console.log(request.data)

        }else if(request.msg === "error_room"){
        	var msg = request.data;
		    let labelError = document.getElementById('invalidNumber');
		    labelError.style.display="block";
        }else if(request.msg === "connected"){
        	let labelError2 = document.getElementById('joinInput');
		    labelError2.style.display="none";
		    document.getElementById('invalidNumber').style.display="none";
		    var joiningStuff = document.getElementById("joinedRoomNumber");
			joiningStuff.style.display="block";

			var msg = request.data;
		    let labelRoom = document.getElementById('gotNumber');
		    labelRoom.textContent=msg;

		    let joinButtonUser = document.getElementById('JoinButton');
		    joinButtonUser.style.display = "none";

            let checkBoxB = document.getElementById('checkboxJoin');
            checkBoxB.style.display = "none";            

		    let discButton = document.getElementById('disconnectUser');
		    discButton.style.display = "block";

		    document.getElementById("home-tab").classList.add("disabled");


        }else if(request.msg === "roomDeleted"){
        	resetUIuser();
        }
    }
);