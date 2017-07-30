# Report

## Display Feature Points

* Used stroke style to set a red drawing color. (line: 153)
* Draw the points using beginPath, arc, stroke. (line: 160)
* Experimented having beginPath and stroke outsie the loop, but this resulted in lines connecting the dots. I consider it to be too noisy.

## Display Dominant Emoji

* Set the font family and size. (line: 172)
* Chose an anchor point using the featurePoints property (line: 177)
* Got the dominant emoji using the emojis.dominantEmoji property (line: 178)
* Used fillText to show the emoji 20 pixels to the right of the anchor point. (line: 179)

## Mimic Game

### Show Random Emoji

* Added a global object to keep track of the state of the game (line: 185)
* Wrote a function to select a random element from an array (line: 206)
* Wrote a function triggered by a timer (line: 222)
* At a given interval (line: 231)
	* The target emoji in game state is changed (line: 233)
	* And then shown to the user (line: 234)

### Match Players Expression

* Every second (line: 240)
	* If the API has returned a matching face, compare the unicode value of the dominant emoji with the target one (line: 225)
		* If they match increment the matching counter
	* If the player has matched the target expression the required number of times (line: 228)
		* Accrue one point to the player (line: 229)
	* Show the current score (line: 239)

### Reset and Show New Emoji

* Every second increment the counter (line: 238)
* When a period ends, change the target emoji and reset/increment the relevant counters (line: 231)
* Wrote a reset function to support restarting the game (line: 211)
	* Call the reset function in the stop and reset button listeners (line: 65, 78) 
