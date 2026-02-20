// --- NETWORK TEST LOGIC ---
async function runNetworkTest() {
    const dlVal = document.getElementById("dl-speed");
    const ulVal = document.getElementById("ul-speed");
    const bar = document.getElementById("net-progress");
    const btn = document.getElementById("net-btn");

    btn.disabled = true;
    bar.style.width = "10%";

    // DOWNLOAD
    try {
        const start = performance.now();
        // Fetching a larger asset for better sampling
        const response = await fetch("https://upload.wikimedia.org/wikipedia/commons/f/ff/Piz_Zup%C3%B2_vom_Berninapass.jpg?cb=" + Date.now());
        const blob = await response.blob();
        const end = performance.now();
        const duration = (end - start) / 1000;
        const mbps = ((blob.size * 8) / (1024 * 1024) / duration).toFixed(2);
        dlVal.innerText = mbps;
        bar.style.width = "60%";
    } catch(e) { dlVal.innerText = "ERR"; }

    // UPLOAD (Simulated)
    try {
        const dummyData = new Uint8Array(2 * 1024 * 1024); // 2MB
        const start = performance.now();
        await fetch("https://jsonplaceholder.typicode.com/posts", { method: "POST", body: dummyData });
        const end = performance.now();
        const duration = (end - start) / 1000;
        const mbps = ((dummyData.length * 8) / (1024 * 1024) / duration).toFixed(2);
        ulVal.innerText = mbps;
        bar.style.width = "100%";
    } catch(e) { ulVal.innerText = "ERR"; }

    setTimeout(() => { btn.disabled = false; bar.style.width = "0%"; }, 2000);
}

// --- SPEAKER CLEANER LOGIC (30 SECONDS) ---
function cleanSpeaker() {
    const timer = document.getElementById("audio-timer");
    const btn = document.getElementById("audio-btn");
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    let timeLeft = 30;
    btn.disabled = true;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth'; // Rougher wave for better dust shaking
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();

    const interval = setInterval(() => {
        timeLeft--;
        timer.innerText = timeLeft + "s";
        
        // Sweep frequency between 150 and 250Hz
        osc.frequency.setValueAtTime(150 + (Math.random() * 100), audioCtx.currentTime);

        if (timeLeft <= 0) {
            clearInterval(interval);
            osc.stop();
            audioCtx.close();
            timer.innerText = "30s";
            btn.disabled = false;
        }
    }, 1000);
}

// --- CAMERA LOGIC ---
function startCamera() {
    const video = document.getElementById("camera");
    
    const constraints = {
        video: { 
            facingMode: "environment", // Use back camera
            width: { ideal: 1920 },
            height: { ideal: 1080 }
        }
    };

    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            video.srcObject = stream;
            video.play();
        })
        .catch(err => {
            alert("Security Block: Camera requires HTTPS (GitHub Pages) to function.");
        });
}
