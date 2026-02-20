function testSpeed() {
    const speedText = document.getElementById("speed-display");
    speedText.innerText = "> Initializing Request...";

    const startTime = performance.now();
    // Using a slightly larger image for a better sample
    const cacheBuster = "?nn=" + Math.random();
    
    fetch("https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png" + cacheBuster)
        .then(response => {
            return response.blob();
        })
        .then(blob => {
            const endTime = performance.now();
            const duration = (endTime - startTime) / 1000;
            const sizeInBits = blob.size * 8;
            const speedBps = sizeInBits / duration;
            const speedMbps = (speedBps / (1024 * 1024)).toFixed(2);

            speedText.innerText = `> Download: ${speedMbps} Mbps`;
        })
        .catch(() => {
            speedText.innerText = "> Error: Check Connection";
        });
}

function cleanSpeaker() {
    const status = document.getElementById("audio-status");
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = "sine";
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start();
    status.innerText = "Running: 165Hz Sweep";

    // Frequency sweep 150Hz to 250Hz for 5 seconds
    oscillator.frequency.setValueAtTime(150, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(250, context.currentTime + 5);

    setTimeout(() => {
        oscillator.stop();
        context.close();
        status.innerText = "Cleaning Complete";
    }, 5000);
}

function startCamera() {
    const video = document.getElementById("camera");
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => {
            alert("Camera Access Denied: " + err.message);
        });
}
