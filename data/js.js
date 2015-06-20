var confirm = document.getElementById("confirm");
var cancel = document.getElementById("cancel");
var timeDict = new Array();

timeDict[0] = "Minutes";
timeDict[1] = "Hours";
timeDict[2] = "Days";
timeDict[3] = "Months";
timeDict[4] = "Years";

self.port.on('Message', function(mes){
	document.getElementById("url").value = mes;
});

confirm.addEventListener("click", confirmPush, false);
cancel.addEventListener("click", cancelW, false);

function cancelW(){
	self.port.emit('close', '');
};

function confirmPush() {
	var url = document.getElementById("url").value;
	var input = document.getElementById("input").value;
	var time = document.getElementById("select").selectedIndex;

	if(input == "" || isNaN(input)) {
		inputError();
	} else {

		var stuff = new Array();
		stuff[0] = url;
		stuff[1] = input;
		stuff[2] = time;

		self.port.emit('Stuff', stuff);
	}
};

function inputError(){
	document.getElementById("input").style.border = "1px solid red";
};