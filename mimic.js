// Mimic Me!
// Fun game where you need to express emojis being displayed

// --- Affectiva setup ---

// The affdex SDK Needs to create video and canvas elements in the DOM
var divRoot = $("#camera")[0];	// div node where we want to add these elements
var width = 640, height = 480;	// camera image size
var faceMode = affdex.FaceDetectorMode.LARGE_FACES;  // face mode parameter

// Initialize an Affectiva CameraDetector object
var detector = new affdex.CameraDetector(divRoot, width, height, faceMode);

// Enable detection of all Expressions, Emotions and Emojis classifiers.
detector.detectAllEmotions();
detector.detectAllExpressions();
detector.detectAllEmojis();
detector.detectAllAppearance();

// --- Utility values and functions ---

// Unicode values for all emojis Affectiva can detect
var emojis = [ 128528, 9786, 128515, 128524, 128527, 128521, 128535, 128539, 128540, 128542, 128545, 128563, 128561 ];

// Update target emoji being displayed by supplying a unicode value
function setTargetEmoji(code) {
	$("#target").html("&#" + code + ";");
}

// Convert a special character to its unicode value (can be 1 or 2 units long)
function toUnicode(c) {
	if(c.length == 1)
		return c.charCodeAt(0);
	return ((((c.charCodeAt(0) - 0xD800) * 0x400) + (c.charCodeAt(1) - 0xDC00) + 0x10000));
}

// Update score being displayed
function setScore(correct, total) {
	$("#score").html("Score: " + correct + " / " + total);
}

// Display log messages and tracking results
function log(node_name, msg) {
	$(node_name).append("<span>" + msg + "</span><br />")
}

// --- Callback functions ---

// Start button
function onStart() {
	if (detector && !detector.isRunning) {
		$("#logs").html("");	// clear out previous log
		detector.start();  // start detector
	}
	log('#logs', "Start button pressed");
}

// Stop button
function onStop() {
	log('#logs', "Stop button pressed");
	if (detector && detector.isRunning) {
		detector.removeEventListener();
		detector.stop();	// stop detector
	}
	resetGame(game)
};

// Reset button
function onReset() {
	log('#logs', "Reset button pressed");
	if (detector && detector.isRunning) {
		detector.reset();
	}
	$('#results').html("");  // clear out results
	$("#logs").html("");	// clear out previous log

	// DONE: You can restart the game as well
	resetGame(game);
};

// Add a callback to notify when camera access is allowed
detector.addEventListener("onWebcamConnectSuccess", function() {
	log('#logs', "Webcam access allowed");
});

// Add a callback to notify when camera access is denied
detector.addEventListener("onWebcamConnectFailure", function() {
	log('#logs', "webcam denied");
	console.log("Webcam access denied");
});

// Add a callback to notify when detector is stopped
detector.addEventListener("onStopSuccess", function() {
	log('#logs', "The detector reports stopped");
	$("#results").html("");
	resetGame(game);
});

// Add a callback to notify when the detector is initialized and ready for running
detector.addEventListener("onInitializeSuccess", function() {
	log('#logs', "The detector reports initialized");
	//Display canvas instead of video feed because we want to draw the feature points on it
	$("#face_video_canvas").css("display", "block");
	$("#face_video").css("display", "none");

	// DONE: Call a function to initialize the game, if needed
	startGame(game, 10, 2);
});

// Add a callback to receive the results from processing an image
// NOTE: The faces object contains a list of the faces detected in the image,
//	 probabilities for different expressions, emotions and appearance metrics
detector.addEventListener("onImageResultsSuccess", function(faces, image, timestamp) {
	var canvas = $('#face_video_canvas')[0];
	if (!canvas)
		return;

	// Report how many faces were found
	$('#results').html("");
	log('#results', "Timestamp: " + timestamp.toFixed(2));
	log('#results', "Number of faces found: " + faces.length);
	if (faces.length > 0) {
		// Report desired metrics
		log('#results', "Appearance: " + JSON.stringify(faces[0].appearance));
		log('#results', "Emotions: " + JSON.stringify(faces[0].emotions, function(key, val) {
			return val.toFixed ? Number(val.toFixed(0)) : val;
		}));
		log('#results', "Expressions: " + JSON.stringify(faces[0].expressions, function(key, val) {
			return val.toFixed ? Number(val.toFixed(0)) : val;
		}));
		log('#results', "Emoji: " + faces[0].emojis.dominantEmoji);

		// Call functions to draw feature points and dominant emoji (for the first face only)
		game.face = faces[0];
		drawFeaturePoints(canvas, image, faces[0]);
		drawEmoji(canvas, image, faces[0]);

		// DONE: Call your function to run the game (define it first!)
		// Not necessary, I used a timer
	}
});


// --- Custom functions ---

// Draw the detected facial feature points on the image
function drawFeaturePoints(canvas, img, face) {
	// Obtain a 2D context object to draw on the canvas
	var ctx = canvas.getContext('2d');

	// DONE: Set the stroke and/or fill style you want for each feature point marker
	// See: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D#Fill_and_stroke_styles
	ctx.strokeStyle = "red";
	
	// Loop over each feature point in the face
	for (var id in face.featurePoints) {
		var featurePoint = face.featurePoints[id];
		// DONE: Draw feature point, e.g. as a circle using ctx.arc()
		// See: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/arc
		ctx.beginPath();
		ctx.arc(featurePoint.x, featurePoint.y, 2, 0, 2 * Math.PI);
		ctx.stroke();
	}
}

// Draw the dominant emoji on the image
function drawEmoji(canvas, img, face) {
	// Obtain a 2D context object to draw on the canvas
	var ctx = canvas.getContext('2d');

	// Set the font and style you want for the emoj:
	ctx.font="50px Georgia";
	
	// DONE: Draw it using ctx.strokeText() or fillText()
	// See: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillText
	// TIP: Pick a particular feature point as an anchor so that the emoji sticks to your face
	var anchor = face.featurePoints[4]
	var emoji = face.emojis.dominantEmoji
	ctx.fillText(emoji, anchor.x + 20, anchor.y)
}

// DONE: Define any variables and functions to implement the Mimic Me! game mechanics

// Game object
var game = {
	face: null,
	timer: null,
	correct: 0,
	total: 0,
	tick: 0,
	current: 0,
	target: toUnicode('$')
}

// NOTE:
// - Remember to call your update function from the "onImageResultsSuccess" event handler above
// - You can use setTargetEmoji() and setScore() functions to update the respective elements
// - You will have to pass in emojis as unicode values, e.g. setTargetEmoji(128578) for a simple smiley
// - Unicode values for all emojis recognized by Affectiva are provided above in the list 'emojis'
// - To check for a match, you can convert the dominant emoji to unicode using the toUnicode() function

// Optional:
// - Define an initialization/reset function, and call it from the "onInitializeSuccess" event handler above
// - Define a game reset function (same as init?), and call it from the onReset() function above

function choose(choices) {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

function resetGame(game) {
	game.target = toUnicode('?');
	game.tick = 0;
	game.total = 0;
	game.current = 0;
	if(game.timer) {
		window.clearInterval(game.timer);
		game.timer = null;
	}
}

function startGame(game, period, okCount) {
	console.info("starting game: ", game, period, okCount);
	game.timer = setInterval(function () {
		if(game.face && toUnicode(game.face.emojis.dominantEmoji) == game.target) {
			game.current++;
		};
		if(game.current == okCount) {
			game.correct++;
		};
		if(game.tick % period == 0) {
			game.target = choose(emojis);
			setTargetEmoji(game.target);
			game.tick = 0;
			game.current = 0;
			game.total++;
		};
		game.tick++;
		setScore(game.correct, game.total);
	}, 1000);
}
