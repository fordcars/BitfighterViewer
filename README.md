BitfighterViewer
================

A server-web app that displays a live feed of a game using this game's Lua API.

The game in question is Bitfighter: http://bitfighter.org

Note: You need Bitfighter and node.js to use this. You also need to download the node modules using npm (npm command).

- To use, simply drop bitfighterViewer.levelgen (levelgen/bitfighterViewer.levelgen) in the scrips or levels directory of Bitfighter (in Application Support on Mac, app data on Windows, .bitfighter in Linux). You can change the bitfighterViewerUrl variable in the levelgen to the Ip or Url of the http server you'll be running if you want it to be displayed in the begginning of the level.

- Then, add the levelgen in a Bitfighter level, by opening the level in the editor, and typing "bitfighterViewer" in the script section). You can also add the script in the bitfighter.ini to have it run in all the levels.

- Then, change the c.transferFilePath in server.js to the path of the txt file that will be created once you run the level. This should be something like "C:/Users/Fordcars/AppData/Roaming/Bitfighter/screenshots/serverTransferFile.txt" (on Windows, but Mac and Linux should be similar).

- I would recommend you run the level with the levegen to make sure the .txt is created.

- Then open a terminal (command line, cmd, what ever you want to call it :P) and cd to the BitfighterViewer directory. Now type node (or nodejs) server/server.js. Now if you connect to http://localhost:3000, you will see a live feed of the game! You can change the port in server.js.

Troubleshooting: If node is not a recgnized command, try searching for "node.js command prompt". You will be able to use node-related stuff here. You can make node work in the normal command prompt by addind node to your path.
