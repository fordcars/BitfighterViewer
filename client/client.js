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
//
//////////////////////////////////////////////////////////////////////////
//
// $ is used to separate cell values, ; is used to separate cells and & is used to separate lines (used to separate level data from item data)

window.onload = main;

var socket = io();

var canvases = [];
var canvasContexts = [];
var canvasContainer;

var mainCanvas;
var mainContext;

var backgroundLayer;
var itemsLayer;
var foregroundLayer;

var d = {}; // Data
var c = {}; // Constants

function definitions()
{
	d.levelDataReceived = false;

	d.level = {};
	d.items = [];
	d.chatMessages = [];
	
	d.level.data; // Zones and all
	d.level.xOffset = 0;
	d.level.yOffset = 0;
	d.level.scalingX = 1;
	d.level.scalingY = 1;

	c.amountOfLayers = 3;

	c.defaultCanvasWidth = 800;
	c.defaultCanvasHeight = 600;
	c.canWidth = c.defaultCanvasWidth;
	c.canHeight = c.defaultCanvasHeight;
	c.hCanWidth = c.defaultCanvasWidth / 2;
	c.hCanHeight = c.defaultCanvasHeight / 2;
	c.canCornerXAT = -c.hCanWidth; // Can corner after translation (center of canvas)
	c.canCornerYAT = -c.hCanHeight; // Can corner after translation (center of canvas)
	c.canCornerXATAS = c.canCornerXAT; // Can corner after translation and scaling
	c.canCornerYATAS = c.canCornerYAT; // Can corner after translation and scaling
	c.canWidthAS = c.defaultCanvasWidth;
	c.canHeightAS = c.defaultCanvasHeight;
	
	c.defaultScalingX = 1; // Useful for resetting
	c.defaultScalingY = 1;

	c.defautLineWidth = 5;
	
	// For socket.io
	c.itemDataName = "itemData";
	c.levelDataName = "levelData";
	c.newLevelDataName = "newLevelData";
	
	c.newline = "&";
	c.valueSeparator = "$";
	c.cellSeparator = ";";

	c.numberOfBackgroundStar = 500;
	c.maxStarWidth = 1;
	c.maxStarHeight = 1;

	c.maxAmountOfChatMessages = 10; // Max amount of messages before they get spliced out. Make sure this is BELOW the levelgen's maxChatMessageId
	c.maxAmountOfDisplayedChatMessages = c.maxAmountOfChatMessages; // Max amount of messages displayed
	c.chatMessagesX = 10;
	c.chatMessagesY = c.canHeight - 10;
	c.chatMessagesSpacing = 15;
	
	//                -2      -1  0 (not used)   1       2
	c.teamColors = ["grey", "white", "white", "blue", "red", "yellow", "rgb(0, 255, 0)", "rgb(255, 114, 224)", "rgb(255, 170, 0)", "rgb(201, 127, 244)", "rgb(144, 224, 255)", "rgb(170, 0, 0)"];
	c.teamColorIndexOffset = 2; // Not weird! This is to make the Bitfighter indexes (-2, -1, 1...) work
	
	Math.TAU = Math.PI * 2;
}

function main()
{
	var currentCanvas;
	var currentCanvasContext;
	
	definitions();
	
	(function() // requestAnimationFrame polyfill by Erik Möller. Fixed by Paul Irish and Tino Zijdel, https://gist.github.com/paulirish/1579671, MIT license
	{
		var lastTime = 0;
		var vendors = ['ms', 'moz', 'webkit', 'o'];
		
		for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
				window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
					|| window[vendors[x]+'CancelRequestAnimationFrame'];
		}

		if (!window.requestAnimationFrame)
			window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
				timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};

		if (!window.cancelAnimationFrame)
			window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
	}());
	
	setupElements(document.body);
	setupGraphics();
	
	socket.on(c.levelDataName, function(data){onLevelDataReceived(data, false);});
	socket.on(c.newLevelDataName, function(data){onLevelDataReceived(data, true);});
	socket.on(c.itemDataName, function(data){onItemDataReceived(data);});
	
	window.requestAnimationFrame(update);
}

function setupElements(parent)
{
	canvasContainer = document.createElement("div");
	canvasContainer.style.width = (c.defaultCanvasWidth) + "px";
	canvasContainer.style.height = (c.defaultCanvasHeight) + "px";
	canvasContainer.style.border = "solid black";
	canvasContainer.style.position = "absolute";
	canvasContainer.style.left = 0;
	canvasContainer.style.top = 0;
	
	for(var i=c.amountOfLayers-1; i>=0; i--)
	{
		currentCanvas = document.createElement("canvas");

		currentCanvas.style.position = "absolute";
		currentCanvas.style.left = 0;
		currentCanvas.style.top = 0;
		currentCanvas.style.zIndex = i;
		
		currentCanvas.width = c.defaultCanvasWidth;
		currentCanvas.height = c.defaultCanvasHeight;
		
		canvases.push(currentCanvas);
		
		currentCanvasContext = currentCanvas.getContext("2d");
		currentCanvasContext.lineWidth = c.defautLineWidth;
		currentCanvasContext.save();
		addGraphicMembers(currentCanvasContext);
		
		canvasContexts.push(currentCanvasContext);
		
		canvasContainer.appendChild(currentCanvas);
	}
	
	mainCanvas = canvases[0];
	mainLayer = canvasContexts[0];
	
	backgroundLayer = canvasContexts[2];
	itemsLayer = canvasContexts[1];
	foregroundLayer = canvasContexts[0];
	
	parent.appendChild(canvasContainer);
}

function onLevelDataReceived(data, isNewLevelData)
{
	if(!d.levelDataReceived || isNewLevelData)
	{	
		if(data=="")
		{
			console.log("Level data missing!");
		} else
		{
			d.levelDataReceived = true;
			
			console.log("Level data received!");
			d.level.data = parseLevelData(data);
			
			d.chatMessages = []; // To make sure the clients and the levelgen are on the same page
			
			resetLevelGraphics();
			backgroundZonesAndScaling();
			
			foregroundLayer.clearLayer(false); // false to ignore translation and scaling
			drawForeground(foregroundLayer);
		}
	}
}

function onItemDataReceived(data)
{
	if(data=="")
	{
		console.log("Item data missing!");
	} else
	{
		d.items = parseItemData(data);
	}
	
	updateChat();
}

function update()
{
	if(d.levelDataReceived)
	{
		itemsLayer.clearLayer();
		drawItemData(itemsLayer);
	}
	
	window.requestAnimationFrame(update);
}
