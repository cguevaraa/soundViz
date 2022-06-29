// Little test
const hello = 'Hello Sound!!';

id="message"
const h1 = document.getElementById(id);
h1.textContent = hello;
h1.style.color = 'blue';

///////////////////////////////

//////////////////
// WEB AUDIO API
//////////////////

// for legacy browsers
const AudioContext = window.AudioContext || window.webkitAudioContext;

const audioContext = new AudioContext();

// get the audio element
const audioElement = document.getElementById('audiofile');

// pass it into the audio context
const track = audioContext.createMediaElementSource(audioElement);

/////////////////
// AUDIO ANALYsER
/////////////////
// Instantiate the audio analyser
const analyser = audioContext.createAnalyser();
analyser.fftSize = 2048;

const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
const dataArrayFloat = new Float32Array(bufferLength);

analyser.getByteTimeDomainData(dataArray);

///////////////
// CONNECTIONS
///////////////
// Connect the source to be analysed
// Connect the output to the context destination
// source.connect(analyser);
track.connect(analyser).connect(audioContext.destination);

/////////////
// VISUALS
/////////////  //https://convertio.co/fr/download/9bbb3dd03cfc7d2da7cf4aa7605dc9e8117217/
// Get a canvas defined with ID "oscilloscope"
const canvas = document.getElementById("oscilloscope");
const canvasCtx = canvas.getContext("2d");

// draw an oscilloscope of the current audio source

function draw() {

  requestAnimationFrame(draw);

  analyser.getByteTimeDomainData(dataArray);
  
  //Get spectrum data
  analyser.getFloatFrequencyData(dataArrayFloat);
  h1.textContent = `${(Math.round(dataArrayFloat[0])) * -1} Hz`;

  canvasCtx.fillStyle = `rgb(${dataArrayFloat[0]*-1}, ${dataArrayFloat[0]*-10}, ${dataArrayFloat[0]*-20})`;


  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

  canvasCtx.lineWidth = 2;
  canvasCtx.strokeStyle = "rgb(0, 0, 0)";

  canvasCtx.beginPath();

  const sliceWidth = canvas.width * 1.0 / bufferLength;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {

    const v = dataArray[i] / 128.0;
    const y = v * canvas.height / 2;

    if (i === 0) {
      canvasCtx.moveTo(x, y);
    } else {
      canvasCtx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  canvasCtx.lineTo(canvas.width, canvas.height / 2);
  canvasCtx.stroke();
}

draw();

// track.connect(audioContext.destination);

//////////////////////////////
// PLAY / PAUSE functionality
//////////////////////////////

// select our play button
const playButton = document.querySelector('button');

playButton.addEventListener('click', function() {

    // check if context is in suspended state (autoplay policy)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    // play or pause track depending on state
    if (this.dataset.playing === 'false') {
        audioElement.play();
        this.dataset.playing = 'true';
    } else if (this.dataset.playing === 'true') {
        audioElement.pause();
        this.dataset.playing = 'false';
    }

}, false);

// When the file finishes
audioElement.addEventListener('ended', () => {
    playButton.dataset.playing = 'false';
}, false);









