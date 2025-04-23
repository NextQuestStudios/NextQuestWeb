const canvas = document.getElementById("spriteCanvas");
const ctx = canvas.getContext("2d");

const animationSelect = document.getElementById("animationSelect");
const directionSelect = document.getElementById("directionSelect");
const playButton = document.getElementById("playButton");
const exportButton = document.getElementById("exportButton");
const form = document.getElementById("spriteForm");

const frameWidth = 64;
const frameHeight = 64;
const totalFrames = 9;

let frame = 0;
let playing = false;
let frameInterval = null;

// Paths to asset categories
const spriteParts = {
  bodySelect: "body/male/",
  headSelect: "head/human/male/",
  hairSelect: "hair/",
  hairColorSelect: "hair/colors/",
  beardSelect: "facialhair/",
  headgearSelect: "headgear/",
  torsoSelect: "armor/torso/",
  glovesSelect: "armor/gloves/",
  pantsSelect: "armor/pants/",
  bootsSelect: "armor/boots/",
  cloakSelect: "cloak/",
  weaponMainSelect: "weapons/main/",
  weaponOffSelect: "weapons/offhand/",
  extraSelect: "accessories/"
};

// Load options dynamically
async function populateDropdowns() {
  for (const [id, path] of Object.entries(spriteParts)) {
    const select = document.getElementById(id);
    if (!select) continue;
    // For now, use hardcoded test files; in production, replace with file system scan via a JSON manifest
    const testOptions = ["none.png", "light.png", "dark.png", "cloth.png", "iron.png"];
    select.innerHTML = `<option value="">None</option>` + testOptions
      .map(file => `<option value="${path}${file}">${file.replace(".png", "")}</option>`)
      .join("");
  }
}

// Load an image
function loadImage(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.src = `../../assets/sprites/${src}`;
    img.onload = () => resolve(img);
  });
}

// Draw a frame from a sheet
async function drawFullSprite(frameIndex = 0, direction = 0) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const id of Object.keys(spriteParts)) {
    const value = document.getElementById(id).value;
    if (value && value !== "") {
      const img = await loadImage(value);
      const sx = frameIndex * frameWidth;
      const sy = direction * frameHeight;
      ctx.drawImage(img, sx, sy, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
    }
  }
}

// Preview on submit
form.addEventListener("submit", async e => {
  e.preventDefault();
  playing = false;
  clearInterval(frameInterval);
  frame = 0;
  const dir = parseInt(directionSelect.value);
  await drawFullSprite(frame, dir);
});

// Play animation
playButton.addEventListener("click", () => {
  playing = !playing;
  if (playing) {
    const dir = parseInt(directionSelect.value);
    frame = 0;
    frameInterval = setInterval(async () => {
      await drawFullSprite(frame, dir);
      frame = (frame + 1) % totalFrames;
    }, 120);
  } else {
    clearInterval(frameInterval);
  }
});

// Export (placeholder logic)
exportButton.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = (document.getElementById("spriteName").value || "sprite") + ".png";
  link.href = canvas.toDataURL();
  link.click();
});

// Init
populateDropdowns();