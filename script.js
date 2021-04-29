// script.js

const img = new Image(); // used to load image from <input> and draw to canvas
const browseBtn = document.getElementById("image-input");
// Grab the generate button from within the "generate-meme" form. Our generate button is 
// a direct descendant so we can use > and the button type of submit to find it.
const generateBtn = document.querySelector('#generate-meme > button[type="submit"]')
const clearBtn = document.querySelector('#button-group > button[type="reset"]')
const readTextBtn = document.querySelector('#button-group > button[type="button"]')

const canvas = document.getElementById("user-image");
const ctx = canvas.getContext("2d");

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
  img.src = "images/" + browseBtn.files[0].name;
  img.alt = browseBtn.files[0].name;
  canvas.alt = browseBtn.files[0].name;
})

clearBtn.addEventListener('click', () => {
  clearBtn.disabled = true;
  readTextBtn.disabled = true;
  generateBtn.disabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
})

// Add a listener for when we click on the Generate button.
generateBtn.addEventListener('click', () => {
  // Enable Clear and Read-Text buttons
  clearBtn.disabled = false;
  readTextBtn.disabled = false;
  // Disable the Generate button
  generateBtn.disabled = true;
  // Disable the refresh on click that would happen by default.
  event.preventDefault();

  // Grab the text from the TopText box and the BottomText box.
  let textTop = document.getElementById("text-top");
  let textBottom = document.getElementById("text-bottom");

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
