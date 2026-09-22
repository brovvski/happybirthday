// ================================
// MARGHERITA'S BIRTHDAY ❤️
// ================================

const opening = document.getElementById("opening");
const openBtn = document.getElementById("openBtn");
const mainContent = document.getElementById("mainContent");

const musicControl = document.getElementById("musicControl");
const musicIcon = document.getElementById("musicIcon");
const bgMusic = document.getElementById("bgMusic");

const cakeElement = document.getElementById("cake");
const blowInstruction = document.getElementById("blowInstruction");
const blownMessage = document.getElementById("blownMessage");
const replay = document.getElementById("replay");

let musicPlaying = false;
let candlesBlown = false;
let candles = [];

let audioContext = null;
let analyser = null;
let microphone = null;
let micStream = null;
let isListening = false;


// ================================
// OPEN THE SURPRISE
// ================================

openBtn.addEventListener("click", () => {
  opening.classList.add("hidden");
  mainContent.classList.add("active");
  musicControl.style.display = "flex";

  bgMusic.currentTime = 0;

  bgMusic.play()
    .then(() => {
      musicPlaying = true;
      musicIcon.textContent = "♫";
    })
    .catch(() => {
      musicPlaying = false;
      musicIcon.textContent = "♪";
    });

  startAnimations();
  startSoftConfetti();
});


// ================================
// MUSIC BUTTON
// ================================

musicControl.addEventListener("click", () => {
  if (musicPlaying) {
    bgMusic.pause();
    musicPlaying = false;
    musicIcon.textContent = "♪";
  } else {
    bgMusic.play();
    musicPlaying = true;
    musicIcon.textContent = "♫";
  }
});


// ================================
// PAGE ANIMATIONS
// ================================

function startAnimations() {

  gsap.from(".intro-section .eyebrow", {
    opacity: 0,
    y: 15,
    duration: 1,
    delay: 0.3
  });

  gsap.from(".intro-section h2", {
    opacity: 0,
    y: 40,
    duration: 1.2,
    delay: 0.5,
    ease: "power3.out"
  });

  gsap.from(".scroll-hint", {
    opacity: 0,
    y: -10,
    duration: 1,
    delay: 1.4
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {

        if (!entry.isIntersecting) return;

        const element = entry.target;

        gsap.fromTo(
          element,
          {
            opacity: 0,
            y: 45
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out"
          }
        );

        observer.unobserve(element);
      });
    },
    {
      threshold: 0.15
    }
  );

  document.querySelectorAll(
    ".section-heading, .photo-card, .letter, .wish-intro > *, .cake-title, .cake-subtitle"
  ).forEach((element) => {
    observer.observe(element);
  });
}


// ================================
// CREATE CANDLES
// ================================

function createCandles() {

  if (candles.length > 0) return;

  const positions = [
    { left: 75, top: -20 },
    { left: 120, top: -20 },
    { left: 165, top: -20 }
  ];

  positions.forEach((position) => {

    const candle = document.createElement("div");
    candle.className = "candle";

    candle.style.left = position.left + "px";
    candle.style.top = position.top + "px";

    const flame = document.createElement("div");
    flame.className = "flame";

    candle.appendChild(flame);
    cakeElement.appendChild(candle);

    candles.push(candle);
  });
}


// ================================
// START CAKE WHEN VISIBLE
// ================================

const cakeObserver = new IntersectionObserver(
  (entries) => {

    entries.forEach((entry) => {

      if (entry.isIntersecting && !candlesBlown) {
        createCandles();
        prepareMicrophone();
      }

    });

  },
  {
    threshold: 0.45
  }
);

cakeObserver.observe(document.querySelector(".section-cake"));


// ================================
// MICROPHONE
// ================================

function prepareMicrophone() {

  if (isListening || candlesBlown) return;

  blowInstruction.textContent =
    "Tap here to enable your microphone 🎤";

  blowInstruction.onclick = requestMicrophone;
}


async function requestMicrophone() {

  if (isListening || candlesBlown) return;

  blowInstruction.textContent =
    "Allow microphone access...";

  if (!navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia) {

    setupClickFallback();
    return;
  }

  try {

    const stream =
      await navigator.mediaDevices.getUserMedia({
        audio: true
      });

    micStream = stream;

    setupAudioAnalysis(stream);

  } catch (error) {

    console.log("Microphone unavailable:", error);

    setupClickFallback();
  }
}


function setupAudioAnalysis(stream) {

  try {

    audioContext =
      new (window.AudioContext ||
           window.webkitAudioContext)();

    analyser = audioContext.createAnalyser();

    microphone =
      audioContext.createMediaStreamSource(stream);

    analyser.smoothingTimeConstant = 0.75;
    analyser.fftSize = 512;

    microphone.connect(analyser);

    const dataArray =
      new Uint8Array(analyser.frequencyBinCount);

    isListening = true;

    blowInstruction.textContent =
      "Now blow out your candles 🌬️";

    function detectBlow() {

      if (!isListening || candlesBlown) return;

      analyser.getByteFrequencyData(dataArray);

      let sum = 0;

      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }

      const average = sum / dataArray.length;

      if (average > 35) {
        blowCandles();
        return;
      }

      requestAnimationFrame(detectBlow);
    }

    detectBlow();

  } catch (error) {

    console.log("Audio detection failed:", error);

    setupClickFallback();
  }
}


function stopMicrophone() {

  isListening = false;

  if (micStream) {
    micStream.getTracks().forEach(track => track.stop());
    micStream = null;
  }

  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}


// ================================
// FALLBACK
// ================================

function setupClickFallback() {

  stopMicrophone();

  blowInstruction.textContent =
    "Tap the cake to blow out the candles ✨";

  cakeElement.onclick = blowCandles;
}


// ================================
// BLOW CANDLES
// ================================

function blowCandles() {

  if (candlesBlown) return;

  candlesBlown = true;

  stopMicrophone();

  candles.forEach((candle, index) => {

    setTimeout(() => {
      candle.classList.add("out");
    }, index * 220);

  });

  setTimeout(() => {

    blowInstruction.style.display = "none";

    blownMessage.classList.add("show");

    celebration();

  }, 900);


  // Move to finale after celebration
  setTimeout(() => {

    document.querySelector(".final-section")
      .scrollIntoView({
        behavior: "smooth"
      });

  }, 4200);
}


// ================================
// CELEBRATION
// ================================

function celebration() {

  for (let i = 0; i < 9; i++) {

    setTimeout(() => {

      createFirework(
        Math.random() * window.innerWidth,
        Math.random() * window.innerHeight * 0.55
      );

    }, i * 250);

  }

  createConfettiBurst();
}


// ================================
// CONFETTI BURST
// ================================

function createConfettiBurst() {

  const colors = [
    "#9d1f36",
    "#d6a06e",
    "#f0c6cc",
    "#ffffff"
  ];

  for (let i = 0; i < 90; i++) {

    const piece = document.createElement("div");

    piece.className = "confetti";

    piece.style.left =
      Math.random() * 100 + "%";

    piece.style.backgroundColor =
      colors[Math.floor(
        Math.random() * colors.length
      )];

    piece.style.animationDuration =
      2.5 + Math.random() * 2.5 + "s";

    document.body.appendChild(piece);

    setTimeout(() => {
      piece.remove();
    }, 5500);
  }
}


// ================================
// LIGHT CONFETTI AT START
// ================================

function startSoftConfetti() {

  const colors = [
    "#9d1f36",
    "#d6a06e",
    "#e7c4c9"
  ];

  let amount = 0;

  const interval = setInterval(() => {

    const piece = document.createElement("div");

    piece.className = "confetti";

    piece.style.left =
      Math.random() * 100 + "%";

    piece.style.backgroundColor =
      colors[Math.floor(
        Math.random() * colors.length
      )];

    piece.style.animationDuration =
      4 + Math.random() * 2 + "s";

    document.body.appendChild(piece);

    setTimeout(() => {
      piece.remove();
    }, 6500);

    amount++;

    if (amount >= 25) {
      clearInterval(interval);
    }

  }, 180);
}


// ================================
// FIREWORKS
// ================================

function createFirework(x, y) {

  const colors = [
    "#9d1f36",
    "#f0c6cc",
    "#f5d58c",
    "#ffffff"
  ];

  for (let i = 0; i < 35; i++) {

    const particle =
      document.createElement("div");

    particle.className = "firework";

    particle.style.left = x + "px";
    particle.style.top = y + "px";

    particle.style.backgroundColor =
      colors[Math.floor(
        Math.random() * colors.length
      )];

    document.body.appendChild(particle);

    const angle =
      (Math.PI * 2 * i) / 35;

    const speed =
      2 + Math.random() * 3;

    let posX = x;
    let posY = y;

    let velocityX =
      Math.cos(angle) * speed;

    let velocityY =
      Math.sin(angle) * speed;

    const animation =
      setInterval(() => {

        velocityY += 0.08;

        posX += velocityX;
        posY += velocityY;

        particle.style.left =
          posX + "px";

        particle.style.top =
          posY + "px";

        if (
          posY > window.innerHeight ||
          posX < 0 ||
          posX > window.innerWidth
        ) {

          clearInterval(animation);
          particle.remove();

        }

      }, 16);


    setTimeout(() => {

      clearInterval(animation);
      particle.remove();

    }, 2500);
  }
}


// ================================
// REPLAY
// ================================

replay.addEventListener("click", () => {

  stopMicrophone();

  candlesBlown = false;

  candles.forEach(candle => {
    candle.classList.remove("out");
  });

  blowInstruction.style.display = "block";

  blowInstruction.textContent =
    "Tap here to enable your microphone 🎤";

  blownMessage.classList.remove("show");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  setTimeout(() => {

    opening.classList.remove("hidden");

    mainContent.classList.remove("active");

    musicControl.style.display = "none";

    bgMusic.pause();
    bgMusic.currentTime = 0;

    musicPlaying = false;

  }, 700);
});
