const resultEl = document.getElementById('results');
const statusEl = document.getElementById('status');
const permissionBtn = document.getElementById('permissionBtn');

let prevOpt = 1;
// const options = fetch("https://skelliebunnie.github.io/yojijukugo-shake/yojijukugo.json").then(r => r.json()).then(data => { return data });
let options = getData();

async function getData() {
  const url = "https://skelliebunnie.github.io/yojijukugo-shake/yojijukugo.json";
  
  try {
    const response = await fetch(url);
    
    if(!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    
    options = await response.json().then(data => { return data });
    updateResults(0);

  } catch(error) {
    console.error(error.message);
    
  }
}

function randomize() {
  let randomIndex = Math.floor(Math.random() * options.length);

  while(randomIndex === prevOpt) {
    randomIndex = Math.floor(Math.random() * options.length);
  }

  prevOpt = randomIndex;
  updateResults(randomIndex);

  // Provide physical haptic feedback on supporting devices
  if (navigator.vibrate) {
    navigator.vibrate(100);
  }
}

function updateResults(opt) {
  let selOpt = options[opt];

  if ("content" in document.createElement("template")) {
    const template = document.querySelector("#cardtemplate");
    const clone = document.importNode(template.content, true);
    let idiomContainer = clone.querySelector(".idiom");
    let jpContainer = clone.querySelector(".jp");
    let enContainer = clone.querySelector(".en");

    idiomContainer.innerHTML = `<ruby><rt>${selOpt.furigana}</rt>${selOpt.idiom}</ruby>`;
    jpContainer.innerHTML = selOpt.jp;
    enContainer.textContent = selOpt.en;

    results.textContent = "";
    results.appendChild(clone);
  }
}

// MOBILE DEVICES

// Shake threshold configuration
let lastX = null, lastY = null, lastZ = null;
let lastUpdate = 0;
const SHAKE_THRESHOLD = 1500; // Increase to make it less sensitive, decrease for more sensitive

function isMobile() {
  // Checks if the device supports touch or matches a mobile screen width
  const hasTouch = window.navigator.maxTouchPoints > 1;
  const isSmallScreen = window.matchMedia("(max-width: 768px)").matches;
  
  return hasTouch && isSmallScreen;
}

function handleMotion(event) {
  const acceleration = event.accelerationIncludingGravity;
  if (!acceleration) return;

  const currentTime = Date.now();
  if ((currentTime - lastUpdate) > 100) {
    const diffTime = currentTime - lastUpdate;
    lastUpdate = currentTime;

    const x = acceleration.x;
    const y = acceleration.y;
    const z = acceleration.z;

    if (lastX !== null && lastY !== null && lastZ !== null) {
      const speed = Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime * 10000;

      if (speed > SHAKE_THRESHOLD) {
        randomize();
      }
    }

    lastX = x;
    lastY = y;
    lastZ = z;
  }
}

// Request permissions (Crucial for iOS 13+)
function initShake() {
  // Check if DeviceMotionEvent requires permission (iOS)
  if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
    permissionBtn.classList.remove = 'hidden';
    statusEl.innerText = "iOSでは、シェイク機能を使用するために許可が必要です。";

    permissionBtn.addEventListener('click', () => {
      DeviceMotionEvent.requestPermission()
        .then(response => {
          if (response === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
            permissionBtn.classList.add = 'hidden';
            statusEl.innerHTML = "ランダム四時熟語を見るために、シェイク！<br/>(ボタンを押すこともいい)";
            randomize();
          } else {
            statusEl.innerText = "権限が拒否されました。シェイク機能は動作しません。ボタンを押してください。";
          }
        }
        )
        .catch(console.error);
    });
  } else {
    // Android or older devices that don't need explicit pop-up permissions
    window.addEventListener('devicemotion', handleMotion);
    statusEl.innerText = "ランダム四時熟語を見るために、シェイク！";
    randomize();
  }
}

// Run checks on load
window.addEventListener('DOMContentLoaded', () => {
  if (!isMobile()) {
      statusEl.innerText = "パソコンがある。代わりにボタンを押してください。";
      permissionBtn.innerText = "ランダム";
      permissionBtn.classList.remove = 'hidden';
      permissionBtn.addEventListener('click', randomize);
    } else {
      initShake();
    }
});