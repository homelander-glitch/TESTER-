// --- NETWORK DIAGNOSTICS (DL & UL) ---
async function runNetworkDiagnostics() {
    const dlDisplay = document.getElementById('dl-val');
    const ulDisplay = document.getElementById('ul-val');
    const btn = document.getElementById('net-btn');
    
    btn.disabled = true;
    
    // DOWNLOAD TEST: Fetching a 5MB image from Wikimedia
    try {
        dlDisplay.innerText = "...";
        const startTime = performance.now();
        const response = await fetch("https://upload.wikimedia.org/wikipedia/commons/2/2d/Snake_River_%287bd60ca1-3810-44ec-96e0-9943c2201b17%29.jpg?nocache=" + Date.now());
        const blob = await response.blob();
        const endTime = performance.now();
        const duration = (endTime - startTime) / 1000;
        const bitsLoaded = blob.size * 8;
        const speedMbps = ((bitsLoaded / duration) / (1024 * 1024)).toFixed(2);
        dlDisplay.innerText = speedMbps;
    } catch (e) { dlDisplay.innerText = "Error"; }

    // UPLOAD TEST: Posting 2MB of dummy data
    try {
        ulDisplay.innerText = "...";
        const dummyData = new Uint8Array(2 * 1024 * 1024); // 2MB
        const startTime = performance.now();
        await fetch("https://jsonplaceholder.typicode.com/posts", {
            method: "POST",
            body: dummyData
        });
        const endTime = performance.now();
        const duration = (endTime - startTime) / 1000;
        const speedMbps = ((dummyData.length * 8 / duration) / (1024 * 1024)).toFixed(2);
        ulDisplay.innerText = speedMbps;
    } catch (e) { ulDisplay.innerText = "Error"; }

    btn.disabled = false;
}

// --- SPEAKER CLEANER (EXACT 30 SECONDS) ---
function deepCleanSpeaker() {
    const btn = document.getElementById('spk-btn');
    const timer = document.getElementById('timer');
    const bar = document.getElementById('p-bar');
    
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sawtooth'; // Aggressive wave for cleaning
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    let secondsLeft = 30;
    btn.disabled = true;
    oscillator.start();

    const countdown = setInterval(() => {
        secondsLeft -= 0.1;
        timer.innerText = secondsLeft.toFixed(1) + "s";
        bar.style.width = ((30 - secondsLeft) / 30 * 100) + "%";

        // Dynamic Frequency Sweep (150Hz to 200Hz)
        const freq = 150 + (Math.sin(Date.now() / 100) * 25);
        oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);

        if (secondsLeft <= 0) {
            clearInterval(countdown);
            oscillator.stop();
            audioCtx.close();
            btn.disabled = false;
            timer.innerText = "30.0s";
            bar.style.width = "0%";
        }
    }, 100);
}

// --- CAMERA (FIXED FOR MOBILE) ---
function startCamera() {
    const video = document.getElementById('camera');
    const constraints = { 
        video: { facingMode: "environment" }, 
        audio: false 
    };

    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            video.srcObject = stream;
            // Needed for iOS Safari
            video.setAttribute("playsinline", true);
            video.play();
        })
        .catch(err => {
            alert("Camera Error: GitHub Pages must be used via HTTPS.");
        });
}
