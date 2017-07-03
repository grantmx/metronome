/* -------------------------------- 
   Audio Service
----------------------------------*/

(function (angular, document){

    function audioService($rootScope, config, utilityService){
        var audioChannels = [], num = null;


        return{
            createAudio: createAudio,
            preloadAudio: preloadAudio,
            playSoundSequence: playSoundSequence,
            visibilityChangeSupport: visibilityChangeSupport,
            tempo: tempo
        };



        // creates our audio instances
        // don't like this because it creates 25 audio instances in memory at a given time
        function createAudio (){
            for (i = 0; i < 25; i += 1) {
                if (typeof Audio !== 'undefined') {
                    audioChannels[i] = new Audio();
                }
            }

            return audioChannels;
        }



        // pre-fetches the audio files
        // the original file calls this on each play - need a better way
        // also need to be more transparent about the 'arguments' and how they are accessed
        function preloadAudio(){
            var j, k, success, loaded = 0,
                argumentsLegnth = arguments.length,
                channelsLength = audioChannels.length,
                total = argumentsLegnth - 1,
                complete = function() {
                    loaded += 1;
                    if (success && loaded === total) { success.apply(this); }
                };


                if (argumentsLegnth > 0 && typeof arguments[argumentsLegnth - 1] === 'function') {
                    success = arguments[argumentsLegnth - 1];
                }

                for (j = 0; j < argumentsLegnth; j += 1) {
                    if (typeof arguments[j] === 'string') {
                        for (k = 0; k < channelsLength; k += 1) {
                            if (audioChannels[k].networkState === 0 || audioChannels[k].ended === true) {
                                if (audioChannels[k].src === '') {
                                    audioChannels[k].src = arguments[j];
                                    audioChannels[k].addEventListener('canplaythrough', complete, false);
                                    audioChannels[k].load();
                                    break;

                                } else if (audioChannels[k].src.indexOf(arguments[j]) !== -1) {
                                    break;
                                }
                            }
                        }
                    }
                }

            return k;
        }



        // determines which audio instance to play ~ Private
        function playAudio (audio) {
            var audioInstance = preloadAudio(audio);

            if (audioInstance && audioInstance < audioChannels.length) {
                audioChannels[audioInstance].play();
            }
        }



        // determines which file to play in sequence based on the current pitch control state
        // add other criteria here to play the 3 and 4 tempo speeds
        // not as DRY as it could be...
        function playSoundSequence (pitchControl, settings, n){
            var canPlayAccent = playAccentTracker(pitchControl);

            settings.tempo = settings.tempo.toString();

            utilityService.triggerPulse(pitchControl.itemIndex);

            if (pitchControl.state !== "disabled") {

                if (pitchControl.state === "accented" && canPlayAccent){
                    playAudio(config.accentFile + settings.ext);
                
                }else{
                    playAudio(config.clickFile + settings.ext);
                }
            }
        }



        // throttle to only play the accent sound once
        // num is tracked globally 
        function playAccentTracker(pitchControl){
             if ( pitchControl.state === "accented" && num === null ){
                num = 1;
                return true;

            }else if ( pitchControl.state !== "accented" ){
                num = null;

            }else{
                return false;
            }
        }



        // PERFORMANCE: when the metronome looses focus from the current browser tab notify the controller
        function visibilityChangeSupport(){
            var hidden, visibilityChange;

            if (typeof document.hidden !== "undefined") {
              hidden = "hidden";
              visibilityChange = "visibilitychange";

            } else if (typeof document.msHidden !== "undefined") {
              hidden = "msHidden";
              visibilityChange = "msvisibilitychange";

            } else if (typeof document.webkitHidden !== "undefined") {
              hidden = "webkitHidden";
              visibilityChange = "webkitvisibilitychange";
            }


            function handleVisibilityChange(){
                var toDo = (document[hidden]) ? "stop" : "play";
                $rootScope.$emit("tabVisibilityChange", toDo);
            }


            // stops the audio when a browser tab receives focus
            if (typeof document.addEventListener !== "undefined" || typeof document[hidden] !== "undefined") {
                document.addEventListener(visibilityChange, handleVisibilityChange, false);
            }
        }


        // updates the tempo UI
        function tempo(beatsperminute) {
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

    }


    audioService.$inject = ["$rootScope", "config", "utilityService"];


    angular
        .module("metronome")
        .factory("audioService", audioService);

}(window.angular, document));
