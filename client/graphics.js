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

function setupGraphics()
{
	translateLayersToCenter([itemsLayer, backgroundLayer]); // Always draw after this please!
	
	drawBasicBackground(backgroundLayer);
}

function addGraphicMembers(layer)
{
	layer.clearLayer = function(useTAS) // Translation and scaling
	{
		if(useTAS==false)
		{
			this.clearRect(0, 0, c.canWidth, c.canHeight);
		} else
		{
			this.clearRect(c.canCornerXATAS, c.canCornerYATAS, c.canWidthAS, c.canHeightAS);
		}
	}
	
	layer.fillLayer = function()
	{
		this.fillRect(c.canCornerXATAS, c.canCornerYATAS, c.canWidthAS, c.canHeightAS);
	}
	
	layer.drawCircle = function(x, y, radius, filled)
	{
		this.beginPath();
		this.arc(x, y, radius, 0, Math.TAU, true);
		
		if(filled)
		{
			this.fill();
		} else
		{
			this.stroke();
		}
	}
	
	layer.drawCircleWithOutline = function(x, y, radius)
	{
		this.beginPath();
		this.arc(x, y, radius, 0, Math.TAU, true);
		
		this.fill();
		this.stroke();
	}
	
	layer.drawCenteredString = function(string, x, y)
	{
		var halfStringLength = this.measureText(string).width / 2;
		
		this.fillText(string, x - halfStringLength, y);
	}
	
	layer.drawAngleLine = function(x1, y1, angle, length) // http://stackoverflow.com/questions/22977372/js-canvas-draw-line-at-a-specified-angle
	{
		this.beginPath();
		this.moveTo(x1, y1);
		this.lineTo(x1 + length * Math.cos(angle), y1 + length * Math.sin(angle));
		this.stroke();
	}
	
	layer.changeTranslation = function(x, y)
	{
		this.translate(x, y);
	}
	
	layer.changeScaling = function(x, y)
	{
		this.scale(x, y);
	}
	
	layer.resetLayer = function(x, y)
	{
		this.restore();
		this.save();
	}
}

function translateLayersToCenter(layers)
{
	transformLayers(1,0,0,1,0,0); // Does this help?
	translateLayers(c.hCanWidth, c.hCanHeight, layers); // Sets the layers' point of origin to the center of the screen
}

function drawBasicBackground(layer)
{
	layer.fillStyle = "black";
	layer.fillLayer();
	
	drawStars(layer);
}

function drawStars(layer)
{
	layer.fillStyle = "white";
	
	var starX;
	var starY;
	var starWidth;
	var starHeight;
	
	for(var i=0; i<c.numberOfBackgroundStar; i++)
	{
		starX = randomInt(c.canCornerXATAS, c.canWidthAS + 1);
		starY = randomInt(c.canCornerYATAS, c.canHeightAS + 1);
		starWidth = randomInt(0, c.maxStarWidth + 1);
		starHeight = randomInt(0, c.maxStarHeight + 1);
		
		layer.fillRect(starX, starY, starWidth, starHeight);
	}
}

function resetLevelGraphics()
{
	resetLayers(); // Also clears them
	updateScalingCornerValues(c.defaultScalingX, c.defaultScalingY); // Important for setupGraphics()!
	setupGraphics();
}

function backgroundZonesAndScaling()
{
	var layer = backgroundLayer;
	
	changeLayersToFitLevel([itemsLayer, backgroundLayer]);
	
	drawBackgroundZones(layer); // Draw after scaling
}

function drawBackgroundZones(layer)
{
	layer.fillStyle = "blue";
	
	drawLevelData(layer);
}

function resetLayers(layers)
{
	var currentLayer;
	var layersToReset;
	
	if(layers==undefined)
	{
		layersToReset = canvasContexts;
	} else
	{
		layersToReset = layers;
	}
	
	for(var i=0, length=layersToReset.length; i<length; i++)
	{
		currentLayer = layersToReset[i];
		
		currentLayer.resetLayer();
	}
}

function clearLayers(layers) // Note: this uses translation and scaling for all layers
{
	var currentLayer;
	var layersToClear;
	
	if(layers==undefined)
	{
		layersToClear = canvasContexts;
	} else
	{
		layersToClear = layers;
	}
	
	for(var i=0, length=layersToClear.length; i<length; i++)
	{
		currentLayer = layersToClear[i];
		
		currentLayer.clearLayer();
	}
}

function transformLayers(m11, m12, m21, m22, dx, dy, layers)
{
	var currentLayer;
	var layersToTransform;
	
	if(layers==undefined)
	{
		layersToTransform = canvasContexts;
	} else
	{
		layersToTransform = layers;
	}
	
	for(var i=0, length=layersToTransform.length; i<length; i++)
	{
		currentLayer = layersToTransform[i];
		
		currentLayer.setTransform(m11, m12, m21, m22, dx, dy);
	}
}

function translateLayers(x, y, layers)
{
	var currentLayer;
	var layersToTranslate;
	
	if(layers==undefined)
	{
		layersToTranslate = canvasContexts;
	} else
	{
		layersToTranslate = layers;
	}
	
	for(var i=0, length=layersToTranslate.length; i<length; i++)
	{
		currentLayer = layersToTranslate[i];
		
		currentLayer.changeTranslation(x, y);
	}
}

function scaleLayers(x, y, layers)
{
	var currentLayer;
	var layersToScale;
	
	if(layers==undefined)
	{
		layersToScale = canvasContexts;
	} else
	{
		layersToScale = layers;
	}
	
	for(var i=0, length=layersToScale.length; i<length; i++)
	{
		currentLayer = layersToScale[i];
		
		currentLayer.changeScaling(x, y);
	}
}

function updateScalingCornerValues(scalingX, scalingY)
{
	c.canCornerXATAS = ((c.canCornerXAT) / scalingX);
	c.canCornerYATAS = ((c.canCornerYAT) / scalingY);
	
	c.canWidthAS = c.canWidth / scalingX;
	c.canHeightAS = c.canHeight / scalingY;
}

function changeLayersToFitLevel(layers)
{
	var levelZonesLength = d.level.data.zones.length;
	var currentZone;
	var currentPoint;
	var maxX = 0;
	var maxY = 0;
	var minX = 0;
	var minY = 0;
	
	var translationX = 0;
	var translationY = 0;
	
	var scalingX = 0;
	var scalingY = 0;
	
	if(levelZonesLength>0)
	{
		for(var i=0; i<levelZonesLength; i++)
		{
			currentZone = d.level.data.zones[i];
			
			for(var j=0, jLength=currentZone.length; j<jLength; j++)
			{
				currentPoint = currentZone[j];
				
				if(i==0 && j==0) // Has to get at least some values
				{
					maxX = currentPoint.x;
					maxY = currentPoint.y;
					minX = currentPoint.x;
					minY = currentPoint.y;
				} else
				{
					if(currentPoint.x>maxX)
					{
						maxX = currentPoint.x;
					}
					
					if(currentPoint.y>maxY)
					{
						maxY = currentPoint.y;
					}
					
					if(currentPoint.x<minX)
					{
						minX = currentPoint.x;
					}
					
					if(currentPoint.y<minY)
					{
						minY = currentPoint.y;
					}
				}
			}
		}
	
		d.level.xOffset = -((maxX + minX) / 2);
		d.level.yOffset = -((maxY + minY) / 2);
		
		scalingX = c.canWidth / (maxX - minX);
		scalingY = c.canHeight / (maxY - minY);
		
		if(scalingX<scalingY)
		{
			scalingY = scalingX;
		} else
		{
			scalingX = scalingY;
		}
		
		d.level.scalingX = scalingX;
		d.level.scalingY = scalingY;
		
		updateScalingCornerValues(scalingX, scalingY);
		
		scaleLayers(scalingY, scalingX, layers);
	}
}

function drawLevelData(layer)
{
	var currentZone;
	var currentPoint;
	var xOffset = d.level.xOffset;
	var yOffset = d.level.yOffset;
	
	for(var i=0, length=d.level.data.zones.length; i<length; i++)
	{
		var currentZone = d.level.data.zones[i];
		
		layer.beginPath();
		
		for(var j=0, jLength=currentZone.length; j<jLength; j++)
		{
			currentPoint = currentZone[j];
			
			if(j==0)
			{
				layer.moveTo(currentPoint.x + xOffset, currentPoint.y + yOffset);
			} else
			{
				layer.lineTo(currentPoint.x + xOffset, currentPoint.y + yOffset);
			}
		}
		
		layer.fill();
	}
}

function drawForeground(layer)
{
	drawLevelStrings(layer);
	drawChat(layer);
}

function drawChat(layer)
{
	var currentChatMessage;
	var displayedChatMessages = 0;
	
	layer.fillStyle = "white";
	layer.font = "12px Arial";

	for(var i=d.chatMessages.length-1; i>=0; i--)
	{
		if(displayedChatMessages<c.maxAmountOfDisplayedChatMessages)
		{
			currentChatMessage = d.chatMessages[i];
			
			layer.fillText(currentChatMessage.string, c.chatMessagesX, (displayedChatMessages * -c.chatMessagesSpacing) + c.chatMessagesY);
			displayedChatMessages++;
		} else
		{
			break;
		}
	}
}

function drawLevelStrings(layer)
{
	layer.font = "30px Arial";
	layer.fillStyle = "rgb(200, 200, 200)";
	
	layer.drawCenteredString(d.level.data.name, c.hCanWidth, 40);
	
	layer.font = "20px Arial";
	layer.drawCenteredString(d.level.data.gameType, c.hCanWidth, 60);
}

function drawItemData(layer) // Also adds new chat messages
{
	var currentItem;
	var currentItemX;
	var currentItemY;
	var xOffset = d.level.xOffset;
	var yOffset = d.level.yOffset;
	
	for(var i=0, length=d.items.length; i<length; i++)
	{
		currentItem = d.items[i];
		currentItemX = currentItem.x + xOffset;
		currentItemY = currentItem.y + yOffset;
		
		switch(currentItem.name)
		{
			case "Ship": // value[0]: ship name, value[1]: team index (1-based), value[2]: ship angle
				layer.fillStyle = getTeamColor(currentItem.value[1]);
				layer.drawCircle(currentItemX, currentItemY, 25, true);
				
				layer.strokeStyle = "rgb(150, 150, 150)";
				layer.drawAngleLine(currentItemX, currentItemY, currentItem.value[2], 40);
				
				// Ship name
				layer.font = "30px Arial";
				layer.fillStyle = "white";
				layer.drawCenteredString(currentItem.value[0], currentItemX, currentItemY + 50); // currentItem.value[0] is the ship's name
			break;
				
			case "Bullet":
				layer.fillStyle = "purple";
				
				layer.drawCircle(currentItemX, currentItemY, 8, true);
			break;
			
			case "Burst":
				layer.fillStyle = "yellow";
				layer.strokeStyle = "white";
				
				layer.drawCircleWithOutline(currentItemX, currentItemY, 8, true);
			break;
			
			case "Mine":
				layer.fillStyle = "red";
				layer.strokeStyle = "white";
				
				layer.drawCircleWithOutline(currentItemX, currentItemY, 8, true);
				layer.drawCircle(currentItemX, currentItemY, 45, false);
			break;
			
			case "Flag": // value[0]: team index (1-based)
				layer.strokeStyle = getTeamColor(currentItem.value[0]);
				
				layer.beginPath();
				layer.moveTo(currentItemX, currentItemY);
				layer.lineTo(currentItemX, currentItemY - 30);
				layer.lineTo(currentItemX + 25, currentItemY - 20);
				layer.lineTo(currentItemX, currentItemY - 10);
				layer.stroke();
			break;
			
			case "SoccerBall":
				layer.strokeStyle = "white";
				
				layer.drawCircle(currentItemX, currentItemY, 25, false);
			break;
			
			case "Seeker":
				layer.strokeStyle = "red";
				
				layer.drawCircle(currentItemX, currentItemY, 9, false);
			break;
			
			case "TestItem":
				layer.strokeStyle = "yellow";
				
				layer.drawCircle(currentItemX, currentItemY, 55, false);
			break;
			
			case "ResourceItem":
				layer.fillStyle = "white";
				
				layer.drawCircle(currentItemX, currentItemY, 20, true);
			break;
			
			default:
				layer.fillStroke = "red";
				
				layer.drawCircle(currentItemX, currentItemY, 15, false);
			break;
		}
	}
}