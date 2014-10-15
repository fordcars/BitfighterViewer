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

function addChatMessage(newChatMessage)
{
	var tempChatMessage = {};
	var allChatMessages = d.chatMessages;
	
	tempChatMessage.name = newChatMessage.name;
	tempChatMessage.value = newChatMessage.value;
	tempChatMessage.id = newChatMessage.id;
	
	tempChatMessage.string = newChatMessage.name + ": " + newChatMessage.value;
	
	if(allChatMessages.length>=c.maxAmountOfChatMessages)
	{
		allChatMessages.splice(0, 1);
	}
	
	allChatMessages.push(tempChatMessage);
}

function chatMessageExists(id)
{
	var currentChatMessage;
	
	for(var i=0, length=d.chatMessages.length; i<length; i++)
	{
		currentChatMessage = d.chatMessages[i];
		
		if(currentChatMessage.id==id)
		{
			return true;
		}
	}
	
	return false;
}

function updateChat()
{
	var currentItem;
	var gotNewChatMessages = false;
	var chatMessages = [];
	
	var currentChatMessageId;
	
	for(var i=0, length=d.items.length; i<length; i++)
	{
		currentItem = d.items[i];
		
		if(currentItem.name=="ChatMessage")
		{
			currentChatMessageName = currentItem.value[0];
			currentChatMessageValue = currentItem.value[1];
			currentChatMessageId = currentItem.value[2];
			
			if(!chatMessageExists(currentChatMessageId)) // If this is a new message, add it!
			{
				gotNewChatMessages = true;
				addChatMessage({name: currentChatMessageName, value: currentChatMessageValue, id: currentChatMessageId});
			}
		}
	}
			
	if(gotNewChatMessages)
	{
		foregroundLayer.clearLayer(false);
		drawForeground(foregroundLayer);
	}
}