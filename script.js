let currentStream = null;
let useFrontCamera = false;
let audioCtx = null;
let oscillator = null;
let speakerInterval = null;

// --- 1. SEQUENTIAL NETWORK TEST ---
async function runFullNetworkTest() {
    const dlDisplay = document.getElementById('dl-val');
    const ulDisplay = document.getElementById('ul-val');
    const status = document.getElementById('net-status');
    const btn = document.getElementById('net-btn');
    
    btn.disabled = true;
    dlDisplay.innerText = "0.0";
    ulDisplay.innerText = "0.0";

    // A. Download Test First
    status.innerText = "Status: Testing Download...";
    try {
        const start = performance.now();
        // Fetching 5MB high-res image for real data throughput
        const response = await fetch("https://upload.wikimedia.org/wikipedia/commons/3/3e/Tokyo_Sky_Tree_2012.JPG?nocache=" + Date.now());
        const blob = await response.blob();
        const end = performance.now();
        const duration = (end - start) / 1000;
        const mbps = ((blob.size * 8) / (1024 * 1024) / duration).toFixed(2);
        dlDisplay.innerText = mbps;
    } catch (e) { dlDisplay.innerText = "ERR"; }

    // B. Upload Test Second
    status.innerText = "Status: Testing Upload...";
    try {
        const dummyData = new Uint8Array(2 * 1024 * 1024); // 2MB payload
        const start = performance.now();
        await fetch("https://jsonplaceholder.typicode.com/posts", { method: "POST", body: dummyData });
        const end = performance.now();
        const duration = (end - start) / 1000;
        const mbps = ((dummyData.length * 8) / (1024 * 1024) / duration).toFixed(2);
        ulDisplay.innerText = mbps;
    } catch (e) { ulDisplay.innerText = "ERR"; }

    status.innerText = "Status: Test Complete";
    btn.disabled = false;
}

// --- 2. COOLER SPEAKER TEST (30S + STOP) ---
function startSpeaker() {
    const startBtn = document.getElementById('spk-start');
    const stopBtn = document.getElementById('spk-stop');
    const bar = document.getElementById('p-bar');
    
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine'; // Much cleaner, "high-tech" sound
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    startBtn.disabled = true;
    stopBtn.disabled = false;
    
    let time = 0;
    oscillator.start();

    speakerInterval = setInterval(() => {
        time += 0.1;
        bar.style.width = (time / 30 * 100) + "%";

        // Create a "pulsing" cool effect by modulating frequency
        const pulse = 160 + (Math.sin(time * 5) * 20);
        oscillator.frequency.setValueAtTime(pulse, audioCtx.currentTime);

        if (time >= 30) stopSpeaker();
    }, 100);
}

function stopSpeaker() {
    if (oscillator) {
        oscillator.stop();
        audioCtx.close();
    }
    clearInterval(speakerInterval);
    document.getElementById('spk-start').disabled = false;
    document.getElementById('spk-stop').disabled = true;
    document.getElementById('p-bar').style.width = "0%";
}

// --- 3. FRONT & BACK CAMERA TOGGLE ---
function toggleCamera() {
    useFrontCamera = !useFrontCamera;
    startCamera();
}

function startCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    const constraints = {
        video: { facingMode: useFrontCamera ? "user" : "environment" }
    };

    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            currentStream = stream;
            document.getElementById('camera').srcObject = stream;
        })
        .catch(() => alert("Camera access denied or unavailable."));
}
