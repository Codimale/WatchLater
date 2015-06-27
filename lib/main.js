var { ToggleButton } = require('sdk/ui/button/toggle');

var { setInterval } = require("sdk/timers");
var { setTimeout } = require("sdk/timers");

var { viewFor } = require("sdk/view/core");
var window = viewFor(require("sdk/windows").browserWindows[0]);

var pageworker = require ("sdk/page-worker");

var ss = require("sdk/simple-storage");

var notifications = require("sdk/notifications");

var tabs = require("sdk/tabs");

var started = true;

var notSound = './notsound.wav';

var panel = require("sdk/panel").Panel({
  width: 165,
  height: 180,
  contentURL: "./panel.html",
  contentScriptFile: "./js.js",
  onHide: handleHide
});

var url;
var time;

var tempSave;

if(started){
  try{
    tempSave = ss.storage.mainArray;
  }
  finally{
    //nothing for now
  }
    checkTime();
  //setInterval(checkTime, 60000);
  setInterval(checkTime, 1000); //for testing
  started = false;
};

panel.port.on('Stuff', function(stuff){
  var tempDate = new Date();
  var time = tempDate.getTime();
  switch (stuff[2]){
    case 0:
      time += stuff[1] * 60000; //ms in minutes
      break;
    case 1:
      time += stuff[1] * 3600000; //ms in hours
      break;
    case 2:
      time += stuff[1] * 86400000; //ms in days
      break;
    case 3:
      time += stuff[1] * 86400000 * 30;  //ms in months
      break;
    case 4:
      time += stuff[1] * 86400000 * 30 * 12;  //ms in years
      break;
  }
  var tempArray = [stuff[0], time];
  if(typeof(tempSave) == 'undefined'){
    tempSave = [tempArray];
  } else {
    tempSave.push(tempArray);
  }
  panel.hide();
  ss.storage.mainArray = tempSave;
});

panel.port.on('close', function(e){
  panel.hide();
});

var self = require("sdk/self");
var tabs = require("sdk/tabs");

var button = ToggleButton({
  id: "Watch-Later",
  label: "Watch Later",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  onChange: handleChange
});

function handleChange(state) {
  if (state.checked) {
    panel.show({
      position: button
    });
    panel.port.emit("Message", tabs.activeTab.url);
  };
};

function handleHide() {
  button.state('window', {checked: false});
};

function checkTime() {
  var CurrentDate = new Date();
  if(tempSave !== undefined){
    for(var i = 0; i < tempSave.length; i++){
      if (tempSave[i][1] <= CurrentDate.getTime()){
        tempSave[i][1] += 300000;   //remind 5 minutes later
        play(notSound); // play notification sound
        notifications.notify({
          title: "Watch Later",
          text: "Reminder! Click to open " + tempSave[i][0],
          iconURL: "./icon-64.png",
          data: tempSave[i][0],
          onClick: function (data) {
            tempSave.splice(i-1, 1);
            tabs.open(data);
          }
        });
      ss.storage.mainArray = tempSave;
      };
    };
  } else {
    // do nothing
  }
};

function play(audio){
  var soundPlayer = pageworker.Page({
    contentURL: "./blank.html",
    contentScript: "new Audio('" + audio + "').play();"
  });
  setTimeout(function(){soundPlayer.destroy();},5000);
};