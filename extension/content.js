
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if(request.msg==="Start"){
			embed(player_start)
		}else if(request.msg==="Stop"){
			embed(player_stop)
		}else if(request.msg==="HostInject"){
			embedDummyTime(idk)
		}else if(request.msg==="GetTime"){
			embed(timeGetter);
			//wait for a small amount, just in case
			setTimeout(() => {
				var srcTime = document.getElementById("ugotovitevCasa").getAttribute("dolzina");
				chrome.extension.sendMessage({msg: "TimeSkip",timeSrc:srcTime}, function(response) {
				//code to initialize my extension
				});
			  //embedTime(timeSetter,srcTime)
			}, 5);
			
		}else if(request.msg ==="timeSet"){
			embedTime(timeSetter,request.time);
		}else{
			sendResponse("oof")
			return true;
		}
		/*console.log(request)
		embedDummyTime(idk)
		embed(codeToInject)*/
		sendResponse("confirmed")
	 	return true;
});
/*chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(request);      
});*/


function timeChanger(){
	let idk = document.getElementById('ugotovitevCasa');
	const videoPlayer = netflix
	  .appContext
	  .state
	  .playerApp
	  .getAPI()
	  .videoPlayer

	// Getting player id
	const playerSessionId = videoPlayer
	  .getAllPlayerSessionIds()[0]

	const player = videoPlayer
	  .getVideoPlayerBySessionId(playerSessionId)
	var time = player.getCurrentTime()
	idk.setAttribute("dolzina",time);
}

function idk(){

}
function embedDummyTime(fn) {
    const script = document.createElement("script");
    script.text = `(${fn.toString()})();`;
    script.setAttribute("id","ugotovitevCasa");
    script.setAttribute("dolzina","123456");
    document.body.appendChild(script);
}

function embed(fn) {
    const script = document.createElement("script");
    script.text = `(${fn.toString()})();`;
    document.body.appendChild(script);
}

function embedTime(fn,srctime) {
    const script = document.createElement("script");
    script.text = `(${fn.toString()})();`;
    script.text = script.text.replace("TIMETIME",srctime);
    document.body.appendChild(script);
}

function player_start(){
	const videoPlayer = netflix
	  .appContext
	  .state
	  .playerApp
	  .getAPI()
	  .videoPlayer

	// Getting player id
	const playerSessionId = videoPlayer
	  .getAllPlayerSessionIds()[0]

	const player = videoPlayer
	  .getVideoPlayerBySessionId(playerSessionId)
	player.play();
}

function player_stop(){
	const videoPlayer = netflix
	  .appContext
	  .state
	  .playerApp
	  .getAPI()
	  .videoPlayer

	// Getting player id
	const playerSessionId = videoPlayer
	  .getAllPlayerSessionIds()[0]

	const player = videoPlayer
	  .getVideoPlayerBySessionId(playerSessionId)
	player.pause();
}

function timeGetter(){
	const videoPlayer = netflix
	  .appContext
	  .state
	  .playerApp
	  .getAPI()
	  .videoPlayer

	// Getting player id
	const playerSessionId = videoPlayer
	  .getAllPlayerSessionIds()[0]

	const player = videoPlayer
	  .getVideoPlayerBySessionId(playerSessionId)
	var time = player.getCurrentTime();
	var scrTime = document.getElementById("ugotovitevCasa");
	scrTime.setAttribute("dolzina",time);
}

function timeSetter() {
    const videoPlayer = netflix
	  .appContext
	  .state
	  .playerApp
	  .getAPI()
	  .videoPlayer

	// Getting player id
	const playerSessionId = videoPlayer
	  .getAllPlayerSessionIds()[0]

	const player = videoPlayer
	  .getVideoPlayerBySessionId(playerSessionId)
	player.seek(TIMETIME);

	
}