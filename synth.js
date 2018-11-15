
/**
 * https://medium.com/@mautayro/creating-a-basic-computer-keyboard-controlled-synthesizer-with-the-web-audio-api-8a3d0ab1d65e
 */

/**
 * The keys Z through M are one octave of white keys with the row above
 * assigned to black keys, and Q through U are assigned to a second octave.
 */
const keyboardFrequencyMap = {
    '90': 261.6256, // C
    '83': 277.1826, // C#
    '88': 293.6648, // D
    '68': 311.1270, // D#
    '67': 329.6276, // E
    '86': 349.2282, // F
    '71': 369.9944, // F#
    '66': 391.9954, // G
    '72': 415.3047, // G#
    '78': 440.0000, // A
    '74': 466.1638, // A#
    '77': 493.8833, // B
    '81': 523.2511, // C
    '50': 554.3653, // C#
    '87': 587.3295, // D
    '51': 622.2540, // D#
    '69': 659.2551, // E
    '82': 698.4565, // F
    '53': 739.9888, // F#
    '84': 783.9909, // G
    '54': 830.6094, // G#
    '89': 880.0000, // A
    '55': 932.3275, // A#
    '85': 987.7666, // B
}

document.addEventListener("DOMContentLoaded", function(event) {
    // SET UP AUDIO CONTEXT
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // PROCESSING CHAIN
    const masterGain = audioCtx.createGain(); // node
    const filter = audioCtx.createBiquadFilter(); // node

    // CURRENT WAVEFORM
    let waveform = 'sine';

    let numHarmonics = 1;

    // OBJECT FOR STORING ACTIVE NOTES
    const activeOscillators = {};

    // CONNECTIONS
    masterGain.connect(audioCtx.destination);
    // masterGain.connect(filter);
    // filter.connect(audioCtx.destination);

    // EVENT LISTENERS FOR SYNTH PARAM INTERFACE
    const waveformControl = document.getElementById('waveform');
    waveformControl.addEventListener('change', function(event) {
        waveform = event.target.value;
    });

    const harmonicsControl = document.getElementById('harmonics');
    harmonicsControl.addEventListener('change', function(event) {
        numHarmonics = event.target.value;
    });

    const gainControl = document.getElementById('gain');
    gainControl.addEventListener('change', function(event) {
        masterGain.gain.setValueAtTime(event.target.value, audioCtx.currentTime);
    });

    // const filterTypeControl = document.getElementById('filterType');
    // filterTypeControl.addEventListener('change', function(event) {
    //     filter.type= event.target.value;
    // });

    const filterFrequencyControl = document.getElementById('filterFrequency');
    filterFrequencyControl.addEventListener('change', function(event) {
        filter.frequency.setValueAtTime(event.target.value, audioCtx.currentTime);
    });

    // EVENT LISTENERS FOR KEYBOARD NOTES
    window.addEventListener('keydown', keyDown, false);
    window.addEventListener('keyup', keyUp, false);

    // CALLED ON KEYDOWN EVENT - CALLS PLAYNOTE IF KEY PRESSED IS ON MUSICAL
    // KEYBOARD AND THAT KEY IS NOT CURRENTLY ACTIVE
    function keyDown(event) {
        const key = (event.detail || event.which).toString();
        const fund = keyboardFrequencyMap[key];

        playNoteWithTamber(key, fund);
    }

    // STOPS AND DELETES OSCILLATOR ON KEY RELEASE IF KEY RELEASED IS ON MUSICAL
    // KEYBOARD AND THAT KEY IS CURRENTLY ACTIVE
    function keyUp(event) {
        const key = (event.detail || event.which).toString();
        const freq = keyboardFrequencyMap[key];
        stopNote(key, freq);
    }

    function stopNote(key, freq) {
        var offset, freq;
        tamberMode.map( harm => {
            offset = Math.floor(freq*harm['harmonic']*1000);
            if(keyboardFrequencyMap[key] && activeOscillators[offset]) {
                activeOscillators[offset].stop();
                delete activeOscillators[offset];
            }
        });
    }

    function playNote(freq, offset, gain) {
        osc = audioCtx.createOscillator();
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        osc.type = waveform;
        activeOscillators[offset] = osc;
        const harmGain = audioCtx.createGain(); // node
        harmGain.gain.setValueAtTime(gain, audioCtx.currentTime);
        activeOscillators[offset].connect(harmGain);
        harmGain.connect(masterGain);
        activeOscillators[offset].start();
    }

    const tamberMode = [ // square wave
        {'harmonic': 1, 'gain': 1},
        {'harmonic': 3, 'gain': .5},
        {'harmonic': 5, 'gain': .25},
        {'harmonic': 7, 'gain': .125},
        {'harmonic': 8, 'gain': .065},
    ];

    function playNoteWithTamber(key, fund) {
        var offset, freq;
        tamberMode.map( harm => {
            freq = fund*harm['harmonic'];
            offset = Math.floor(freq*1000);
            if(keyboardFrequencyMap[key] && !activeOscillators[offset]) {
                playNote(freq, offset, harm['gain']);
            }
        });
    }

});
