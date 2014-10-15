// BitfighterViewer
// Copyright © 2014 Carl Hewett

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

var fs = require("fs");
var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);

var numberOfConnectedClients = 0;

var levelData = {};
var c = {}; // Constants

c.transferFilePath = "C:/Users/Carl/AppData/Roaming/Bitfighter/screenshots/serverTransferFile.txt";
c.clientFileName = "client/client.html";
c.serverPort = 3000;
c.newline = "&";

// For socket.io
c.itemDataName = "itemData";
c.levelDataName = "levelData";
c.newLevelDataName = "newLevelData";

c.updateClientsDelay = 100;
c.maxNumberOfConnectedClients = 4;

levelData.isNewData = true;
levelData.data = "";
levelData.lastCharIndex = 0;

function main()
{
	fs.readFile(c.transferFilePath, {encoding: "UTF8", flag: "r"}, function (err, data) {
		levelData = getLevelDataObject(data);
	});

	setInterval(sendData, c.updateClientsDelay);
}

function getLevelDataObject(fileData)
{
	var currentValue = "";
	var tempLevelData = {};
	
	for(var i=0, length=fileData.length; i<length; i++)
	{
		currentChar = fileData[i];
		
		if(currentChar==c.newline)
		{
			if(currentValue==levelData.data) // Old data
			{
				tempLevelData.isNewData = false;
			} else
			{
				tempLevelData.isNewData = true;
			}
			
			tempLevelData.data = currentValue;
			tempLevelData.lastCharIndex = i;
			
			return tempLevelData;
		} else
		{
			currentValue += currentChar;
		}
	}
	
	return false;
}

app.get('/*', function(req, res){
	if(req.params[0])
	{
		res.sendfile(req.params[0]);
	} else
	{
		res.sendfile(c.clientFileName);
	}
});

io.on('connection', function(socket){
	if(connectUser())
	{
		socket.on("disconnect", userDisconnected);
	} else
	{
		socket.disconnect();
		console.log("Client disconnected; max number of clients reached! [" + c.maxNumberOfConnectedClients + "]");
	}
});

http.listen(c.serverPort, function(){
	console.log("listening on port " + c.serverPort);
});

function connectUser()
{
	if(numberOfConnectedClients>=c.maxNumberOfConnectedClients)
	{
		return false;
	} else
	{
		numberOfConnectedClients++;
		console.log("User connected [" + numberOfConnectedClients + "]");
		io.emit(c.levelDataName, levelData.data);
		
		return true;
	}
}

function userDisconnected()
{
	numberOfConnectedClients--;
	console.log("User disconnected [" + numberOfConnectedClients + "]");
}

function sendData()
{
	fs.readFile(c.transferFilePath, {encoding: "UTF8", flag: "r"}, function (err, data) {
		var latestData = "";
		var currentChar;
		var currentLevelData;
		
		if (err)
		{
			console.log("Error reading data file! Is it's path '" + c.transferFilePath + "'? If not, please modify it in server.js. The file should be in the screenshots directory of Bitfighter.");
			return;
		}
		
		currentLevelData = getLevelDataObject(data);
		
		if(currentLevelData!=false)
		{
			levelData = currentLevelData;
		}
		
		if(levelData.isNewData)
		{
			io.emit(c.newLevelDataName, levelData.data);
			console.log("Sent new level data!");
		}
		
		if(levelData.lastCharIndex!=0) // To make sure we don't mess up the clients. This makes sure we don't give the whole data
		{
			for(var i=levelData.lastCharIndex+1; i<data.length; i++) // +1 for start of itemData
			{
				if(data[i]!=c.newline)
				{
					latestData = latestData + data[i];
				}
			}
			
			io.emit(c.itemDataName, latestData);
		}
	});
}

main();