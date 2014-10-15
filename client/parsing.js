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

function parseLevelData(data)
{
	var parsedData = {};
	var currentChar;
	var currentValue = "";
	var currentLoc = 0;
	
	for(var i=0, length=data.length; i<length; i++)
	{
		currentChar = data[i];
		
		if(currentChar==c.cellSeparator)
		{
			if(currentLoc==0)
			{
				parsedData.name = currentValue;
				currentLoc = 1;
			} else if(currentLoc==1)
			{
				parsedData.gameType = currentValue;
				currentLoc = 2;
			} else if(currentLoc==2)
			{
				parsedData.zones = parseZoneData(currentValue);
			}
			
			currentValue = "";
		} else if(currentChar!=c.newline)
		{
			currentValue += currentChar;
		}
	}
	
	return parsedData;
}

function parseZoneData(data)
{
	var parsedData = []; // Output is going to be a 2d array of points. An array of points in an array of zones.
	var currentChar;
	
	var currentValue = "";
	var currentZone = [];
	var currentPoint;
	var currentPointLoc = 0; // 0: x, 1: y
	
	for(var i=0, length=data.length; i<length; i++)
	{
		currentChar = data[i];
		
		if(currentChar=="{")
		{
			currentZone = [];
		} else if(currentChar=="}")
		{
			parsedData.push(currentZone);
		} else if(currentChar=="[")
		{
			currentPoint = createPoint(0, 0);
		} else if(currentChar==",")
		{
			currentPoint.x = parseFloat(currentValue);
			currentValue = "";
			currentPointLoc = 1;
		} else if(currentChar=="]")
		{
			currentPoint.y = parseFloat(currentValue);
			currentValue = "";
			currentPointLoc = 0;
			
			currentZone.push(currentPoint);
		} else
		{
			currentValue += currentChar;
		}
	}
	
	return parsedData;
}

function parseItemData(data)
{
	var cellLocation = 0;
	var parsedData = [];
	
	var currentChar = "";
	var currentValue = "";
	var currentCellName = "";
	var currentCellData = [];
	
	for(var i=0, length=data.length; i<length; i++)
	{
		currentChar = data[i];
		
		if(currentChar==c.valueSeparator)
		{
			if(cellLocation==0)
			{
				currentCellName = currentValue;
			} else
			{
				currentCellData.push(currentValue);
			}
			
			currentValue = "";
			cellLocation++;
		} else if(currentChar==c.cellSeparator)
		{
			parsedData.push(createCellObject(currentCellName, currentCellData));
			
			// Next cell
			currentValue = "";
			cellLocation = 0;
			currentCellData = [];
		} else if(currentChar!=c.newLine)
		{
			currentValue += currentChar;
		}
	}
	
	return parsedData;
}

function createCellObject(name, value) // Maximum of 1 point per object! (Well, you can have more, but they won't have .x and .y shortcuts to them)
{
	var tempObj = {};
	var currentValue;
	
	tempObj.name = name;
	tempObj.value = value;
	
	for(var i=0, length=value.length; i<length; i++)
	{
		currentValue = value[i];
		
		if(currentValue[0]=="[") // Is a point
		{
			var currentChar;
			var pointLoc = 0;
			var currentPointValue = "";
			
			for(var i=0, length=currentValue.length; i<length; i++)
			{
				currentChar = currentValue[i];
				
				if(currentChar==",")
				{
					tempObj.x = parseFloat(currentPointValue);
					
					currentPointValue = "";
					pointLoc = 1;
				} else if(currentChar=="]")
				{
					tempObj.y = parseFloat(currentPointValue);
				} else if(currentChar!="[")
				{
					currentPointValue += currentChar;
				}
			}
			
			break;
		}
	}
	
	return tempObj;
}