const resultEl = document.getElementById('results');
const statusEl = document.getElementById('status');
const permissionBtn = document.getElementById('permissionBtn');

let prevOpt = 1;

const options = [
  {
    jp: "起死回生",
    furigana: "きしかいせい",
    en: "Coming back from the brink of death, recovering from a hopeless situation"
  },
  {
    jp: "奇想天外",
    furigana: "きそうてんがい",
    en: "bizarre, fantastic, incredible"
  },
  {
    jp: "本末転倒",
    furigana: "ほんまつてんとう",
    en: "Putting the cart before the horse, having one's priorities backwards"
  },
  {
    jp: "切磋琢磨",
    furigana: "せっさたくま",
    en: "cultivating one's character by working hard"
  },
  {
    jp: "有名無実",
    furigana: "ゆうめいむじつ",
    en: "In name but not in truth/reality"
  }
];

function updateResults(opt) {
  let selOpt = options[opt];

  if ("content" in document.createElement("template")) {
    const template = document.querySelector("#cardtemplate");
    const clone = document.importNode(template.content, true);
    let jpyContainer = clone.querySelector(".jp");
    let enContainer = clone.querySelector(".en");

    jpyContainer.innerHTML = `<ruby><rt>${selOpt.furigana}</rt>${selOpt.jp}</ruby>`;
    enContainer.textContent = selOpt.en;

    results.textContent = "";
    results.appendChild(clone);
  }
}

// Shake threshold configuration
let lastX = null, lastY = null, lastZ = null;
let lastUpdate = 0;
const SHAKE_THRESHOLD = 1500; // Increase to make it less sensitive, decrease for more sensitive

// 1. Check if the user is on a mobile device
function isMobile() {
  const hasMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  return hasMobileUA || hasTouch;
}

// 2. The randomization logic
function randomize() {
  let randomIndex = Math.floor(Math.random() * options.length);

  while(randomIndex === prevOpt) {
    randomIndex = Math.floor(Math.random() * options.length);
  }

  prevOpt = randomIndex;
  updateResults(randomIndex);

  // Optional: Provide physical haptic feedback on supporting devices
  if (navigator.vibrate) {
    navigator.vibrate(100);
  }
}

// 3. Handle device motion logic
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

// 4. Request permissions (Crucial for iOS 13+)
function initShake() {
  // Check if DeviceMotionEvent requires permission (iOS)
  if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
    permissionBtn.classList.remove = 'hidden';
    statusEl.innerText = "iOSでは、シェイク機能を使用するために許可が必要です。";

    permissionBtn.addEventListener('click', () => {
      DeviceMotionEvent.requestPermission()
        .then(response => {
          console.log("response", response);
          if (response === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
            permissionBtn.classList.add = 'hidden';
            statusEl.innerHTML = "ランダム四時熟語を見るために、シェイク！<br/>(ボタンを押すこともいい)";
            randomize();
          } else {
            statusEl.innerText = "権限が拒否されました。シェイク機能は動作しません。";
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

// 5. Run checks on load
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