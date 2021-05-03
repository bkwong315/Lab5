// script.js

const img = new Image(); // used to load image from <input> and draw to canvas
const browseBtn = document.getElementById("image-input");
// Grab the generate button from within the "generate-meme" form. Our generate button is 
// a direct descendant so we can use > and the button type of submit to find it.
const generateBtn = document.querySelector('#generate-meme > button[type="submit"]')
const clearBtn = document.querySelector('#button-group > button[type="reset"]')
const readTextBtn = document.querySelector('#button-group > button[type="button"]')
const voiceSelector = document.querySelector('#voice-selection');
const form = document.querySelector('#generate-meme');
const volSlider = document.querySelector('#volume-group > input[type="range"]');
const volIcon = document.querySelector('#volume-group > img');

// Grab the text from the TopText box and the BottomText box.
const textTop = document.getElementById("text-top");
const textBottom = document.getElementById("text-bottom");

let voices;
const canvas = document.getElementById("user-image");
const ctx = canvas.getContext("2d");

/* 
 ############################################################################################
 Code below was from the MDN documentation for SpeechSynthesis.getVoices() with some editting
 ############################################################################################
*/
function populateVoiceList() {
  if(typeof speechSynthesis === 'undefined') {
    return;
  }

  voices = speechSynthesis.getVoices();
}

populateVoiceList();
if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}
/* 
 ############################################################################################
 Code above was from the MDN documentation for SpeechSynthesis.getVoices() with some editting
 ############################################################################################
*/

function getTheVoices() {
  voices = speechSynthesis.getVoices();
}

// Resets the form elements back to default when the page is refreshed. We're using 
// window.onload instead of document.onload because window.onload waits for all the 
// elements to load before running the function.
// Also loads the list of voices
window.onload = () => {
  form.reset();
  clearBtn.disabled = true;
  readTextBtn.disabled = true;
  voiceSelector.disabled = true;
  voices = speechSynthesis.getVoices();

  // We're waiting 3 seconds to give speechSynthesis.getVoices() time to work.
  setTimeout(()=> {
    // If there is at least 1 voice, then the default value will be the first voice from
    // the getVoices() method call.
    if(voices.length > 0) {
      voiceSelector.remove(0);
      const newVoice = document.createElement("option");
        newVoice.text = voices[0].name + " (" + voices[0].lang + ")" + " -- DEFAULT";
        newVoice.value = 0;
        voiceSelector.add(newVoice);
        console.log(newVoice);
    }
  }, 3000)
}

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if(img.width !== img.height) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  let dimensions = getDimmensions(canvas.width, canvas.height, img.width, img.height);

  ctx.drawImage(img, dimensions['startX'], dimensions['startY'], dimensions['width'], dimensions['height']);
  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
});

// In this case the Change event occurs after we hit the browse button and select our image. 
// Then the change even happens once the user hits Open.
browseBtn.addEventListener('change', () => {
  const url = URL.createObjectURL(browseBtn.files[0]);
  img.src = url;
  img.alt = browseBtn.files[0].name;
  canvas.alt = browseBtn.files[0].name;
})

clearBtn.addEventListener('click', () => {
  clearBtn.disabled = true;
  readTextBtn.disabled = true;
  generateBtn.disabled = false;
  voiceSelector.disabled = true;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
})

// Add a listener for when we click on the Generate button.
generateBtn.addEventListener('click', (event) => {
  // Disable the refresh on click that would happen by default.
  event.preventDefault();
  // Enable Clear button, Read-Text button, and voice selector dropdown
  clearBtn.disabled = false;
  readTextBtn.disabled = false;
  voiceSelector.disabled = false;
  // Disable the Generate button
  generateBtn.disabled = true;

  const textTopValue = textTop.value.toUpperCase();
  const textBottomValue = textBottom.value.toUpperCase();

  ctx.font = "bold 48px sans-serif";
  ctx.fillStyle = "white";
  ctx.lineWidth = "2"
  ctx.textAlign = "center";

  const halfWidth = canvas.width/2;

  ctx.fillText(textTopValue, halfWidth, 50);
  ctx.fillText(textBottomValue, halfWidth, 375);

  ctx.strokeText(textTopValue, halfWidth, 50);
  ctx.strokeText(textBottomValue, halfWidth, 375);
  
  if(voices.length !== 0) {
    for(let i = 1; i < voices.length; i++) {
      const newVoice = document.createElement("option");

      if(voices[i].default) {
        newVoice.textContent += voices[i].lang;
        newVoice.textContent += " -- DEFAULT";
      }

      newVoice.text = voices[i].name + " (" + voices[i].lang + ")";
      newVoice.value = i;
      voiceSelector.add(newVoice);
    }
  }
})

readTextBtn.addEventListener('click', () => {
  // Makes the top text and bottom text into one string so that the
  // speechsynthesis can read it.
  let textToSpeak = textTop.value + " " + textBottom.value;

  // The code that makes the thing speak.
  let utterance = new SpeechSynthesisUtterance(textToSpeak);
  utterance.volume = (volSlider.value/100);
  utterance.voice = voices[voiceSelector.value];
  speechSynthesis.speak(utterance);
})

volSlider.addEventListener('input', () => {
  // As the slider is moved update the icon accordingly.
  if(volSlider.value >= 67) {
    volIcon.src = "icons/volume-level-3.svg"
  }
  else if(volSlider.value >= 34) {
    volIcon.src = "icons/volume-level-2.svg"
  }
  else if(volSlider.value >= 1) {
    volIcon.src = "icons/volume-level-1.svg"
  }
  else {
    // When muted change the icon to the mute.
    volIcon.src = "icons/volume-level-0.svg"
  }
})

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
