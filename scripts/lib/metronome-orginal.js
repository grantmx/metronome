/*-------------------------------------------
    Original and inspired by 
        - Metronome - James Stegall
        - http://www.plus-equals.com/metronome/

    Port to AngularJS
--------------------------------------------*/


var Metronome = (function() {
    var i, channels = [],
        canPlayOgg = false,
        canPlayMp3 = false,
        supportedExtension = 'mp3',
        mediaDir = 'assets/',
        accentFile = mediaDir + 'Accent.',
        clickFile = mediaDir + 'Click.',
        halfClickFile = mediaDir + 'Half-Click.',
        timeout, beatsperminute = 120,
        bar, currentNumerator, n, queued = false,
        scriptInitTime = new Date();

    function getScriptRunTime() {
        var current = new Date(),
            diff = current.getTime() - scriptInitTime.getTime();

        return (diff / 1000);
    }

    function leadingZero(number, digits) {
        number += '';
        if (number.length < digits) {
            digits = digits - number.length;
            
            var l = 0,
                prefix = '';

            while (l < digits) {
                prefix += '0';
                l += 1;
            }

            number = prefix + number;
        }
        return number;
    }

    function preloadAudio() {
        var j, k, loaded = 0,
            argumentsLegnth = arguments.length,
            channelsLength = channels.length,
            total = argumentsLegnth - 1,
            success,
            complete = function() {
                loaded += 1;

                if (success && loaded === total) {
                    success.apply(this);
                }
            };

        try {
            
            if (argumentsLegnth > 0 && typeof arguments[argumentsLegnth - 1] === 'function') {
                success = arguments[argumentsLegnth - 1];
            }

            for (j = 0; j < argumentsLegnth; j += 1) {

                if (typeof arguments[j] === 'string') {
                    for (k = 0; k < channelsLength; k += 1) {

                        if (channels[k].networkState === 0 || channels[k].ended === true) {
                            if (channels[k].src === '') {
                                channels[k].src = arguments[j];
                                channels[k].addEventListener('canplaythrough', complete, false);
                                channels[k].load();
                                break;

                            } else if (channels[k].src.indexOf(arguments[j]) !== -1) {
                                break;
                            }
                        }

                    }
                }
            }

        } catch (err) {
            if (Metronome.error && typeof Metronome.error === 'function') {
                Metronome.error.apply(this, [err, getScriptRunTime()]);
            }
        }
        return k;
    }

    function play(audio) {
        var l = preloadAudio(audio);

        if (l && l < channels.length) {
            channels[l].play();
        }
    }

    try {

        
        for (i = 0; i < 25; i += 1) {
            if (typeof Audio !== 'undefined') {
                channels[i] = new Audio();
            } else {
                channels[i] = document.createElement('audio');
            }
        }



        if (channels[0].canPlayType) {
            canPlayOgg = (channels[0].canPlayType('audio/ogg') !== 'no' && channels[0].canPlayType('audio/ogg') !== '');
            canPlayMp3 = (channels[0].canPlayType('audio/mpeg') !== 'no' && channels[0].canPlayType('audio/mpeg') !== '');

            if (canPlayOgg === true) {
                supportedExtension = 'ogg';

            } else if (canPlayMp3 === true) {
                supportedExtension = 'mp3';
            }
        }

        preloadAudio(clickFile + supportedExtension, accentFile + supportedExtension, halfClickFile + supportedExtension, function() {
            Metronome.start();
        });

    } catch (err) {
        channels = [];
        if (Metronome.error && typeof Metronome.error === 'function') {
            Metronome.error.apply(this, [err, getScriptRunTime()]);
        }
    }

    function toggleDoubleTempo() {
        this.doubleTempo = !this.doubleTempo;

        if (this.doubleTempo === true) {
            n = (currentNumerator * 2) - 1;

        } else {
            if (n % 2 === 1) {
                n = currentNumerator;
            } else {
                queued = true;
            }
        }
    }

    function millisecondsToBpm(milliseconds) {
        var bpm = Math.round(60000 / milliseconds);
        return bpm;
    }

    function start() {
        this.on = true;
        bar = currentNumerator = n = 1;
        this.click();
    }

    function stop() {
        this.on = false;
    }

    function toggle() {
        if (this.on === true) {
            this.stop();
        } else {
            this.start();
        }
    }

    function click() {
        try {
            if (Metronome.on === true) {
                var rate = beatsperminute;

                // need to add rates for 3 and 4 tempo speeds
                if (Metronome.doubleTempo === true || queued === true) {
                    rate = rate * 2;
                    queued = false;
                }

                if (Metronome.element) {
                    Metronome.element.innerHTML = leadingZero(bar, 4) + '.' + leadingZero(currentNumerator, 2);
                }

                // determines which file to play in sequence based on input values
                // add other criteria here to play the 3 and 4 tempo speeds
                if (Metronome.sound === true) {
                    if (currentNumerator === 1 && n === 1) {
                        play(accentFile + supportedExtension);

                    } else if (Metronome.doubleTempo === true && n % 2 === 0) {
                        play(halfClickFile + supportedExtension);

                    } else {
                        play(clickFile + supportedExtension);
                    }
                }


                if ((Metronome.doubleTempo === false && currentNumerator < Metronome.timeNumerator) || (Metronome.doubleTempo === true && n < Metronome.timeNumerator * 2)) {
                    if (Metronome.doubleTempo === false || (Metronome.doubleTempo === true && n % 2 === 0)) {
                        currentNumerator += 1;
                    }
                    n += 1;
                } else {
                    bar += 1;
                    currentNumerator = n = 1;
                }

                timeout = setTimeout(Metronome.click, 60000 / rate);
            }



        } catch (err) {
            if (Metronome.error && typeof Metronome.error === 'function') {
                Metronome.error.apply(this, [err, getScriptRunTime()]);
            }
        }
    }

    function bpm(speed) {
        if (speed && typeof speed === 'number') {
            if (b !== beatsperminute) {
                beatsperminute = speed;
                clearTimeout(timeout);
                this.click();
            }
        } else {
            return beatsperminute;
        }
    }

    function tempo() {
        if (beatsperminute <= 20) {
            return 'Larghissimo';
        } else if (beatsperminute <= 40) {
            return 'Grave';
        } else if (beatsperminute <= 60) {
            return 'Lento/Largo';
        } else if (beatsperminute <= 66) {
            return 'Larghetto';
        } else if (beatsperminute <= 76) {
            return 'Adagio';
        } else if (beatsperminute <= 80) {
            return 'Adagietto';
        } else if (beatsperminute <= 108) {
            return 'Andante';
        } else if (beatsperminute <= 110) {
            return 'Moderato';
        } else if (beatsperminute <= 112) {
            return 'Allegretto';
        } else if (beatsperminute <= 124) {
            return 'Allegro moderato';
        } else if (beatsperminute <= 139) {
            return 'Allegro';
        } else if (beatsperminute <= 168) {
            return 'Vivace';
        } else if (beatsperminute <= 200) {
            return 'Presto';
        } else if (beatsperminute > 200) {
            return 'Prestissimo';
        }
    }

    return {
        element: null,
        bpm: bpm,
        millisecondsToBpm: millisecondsToBpm,
        tempo: tempo,
        timeDenominator: 4,
        timeNumerator: 4,
        sound: true,
        doubleTempo: false,
        toggleDoubleTempo: toggleDoubleTempo,
        click: click,
        start: start,
        stop: stop,
        toggle: toggle,
        error: null,
        on: false
    };

}());