let currentStream = null;
let audioCtx, osc, lfo, gainNode;
let spkInterval;

// NAVIGATION
function showTool(tool) {
    document.getElementById('main-menu').classList.add('hidden');
    document.querySelectorAll('.tool-card').forEach(card => card.classList.add('hidden'));
    document.getElementById('tool-' + tool).classList.remove('hidden');
}

function showMenu() {
    document.getElementById('main-menu').classList.remove('hidden');
    document.querySelectorAll('.tool-card').forEach(card => card.classList.add('hidden'));
    if(currentStream) currentStream.getTracks().forEach(t => t.stop());
    stopSpeaker();
}

// INTERNET TEST (Sequential)
async function runNetTest() {
    const btn = document.getElementById('net-btn');
    btn.disabled = true;
    btn.innerText = "TESTING DOWNLOAD...";

    try {
        const start = performance.now();
        const res = await fetch("https://upload.wikimedia.org/wikipedia/commons/4/4e/Pleiades_large.jpg?cache=" + Date.now());
        const blob = await res.blob();
        const duration = (performance.now() - start) / 1000;
        document.getElementById('dl').innerText = ((blob.size * 8) / (1024 * 1024) / duration).toFixed(2);
    } catch(e) { alert("Download test failed"); }

    btn.innerText = "TESTING UPLOAD...";
    try {
        const data = new Uint8Array(1024 * 1024 * 2); // 2MB
        const start = performance.now();
        await fetch("https://jsonplaceholder.typicode.com/posts", { method: "POST", body: data });
        const duration = (performance.now() - start) / 1000;
        document.getElementById('ul').innerText = ((data.length * 8) / (1024 * 1024) / duration).toFixed(2);
    } catch(e) { alert("Upload test failed"); }

    btn.disabled = false;
    btn.innerText = "RE-RUN TEST";
}

// SPEAKER TEST (Improved Sound)
function startSpeaker() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    osc = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();
    lfo = audioCtx.createOscillator(); // Low Frequency Oscillator for pulsing

    osc.type = 'sine';
    osc.frequency.setValueAtTime(165, audioCtx.currentTime); // Deep Bass
    
    // Create Pulsing Effect
    lfo.frequency.setValueAtTime(2, audioCtx.currentTime); // 2 pulses per second
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(50, audioCtx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    lfo.start();
    
    document.getElementById('spk-start').disabled = true;
    document.getElementById('spk-stop').disabled = false;

    let countdown = 30;
    spkInterval = setInterval(() => {
        countdown--;
        if(countdown <= 0) stopSpeaker();
    }, 1000);
}

function stopSpeaker() {
    if(osc) { osc.stop(); lfo.stop(); audioCtx.close(); }
    clearInterval(spkInterval);
    document.getElementById('spk-start').disabled = false;
    document.getElementById('spk-stop').disabled = true;
}

// CAMERA TEST (Front & Back)
function initCam(mode) {
    if(currentStream) currentStream.getTracks().forEach(t => t.stop());
    navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } })
    .then(stream => {
        currentStream = stream;
        document.getElementById('vid').srcObject = stream;
    }).catch(() => alert("Camera denied"));
}
