/* -------------------------------- 
    Main Controller
----------------------------------*/
(function (METRO, angular){
    
    function MetronomeCntrl ($scope, $timeout, $document, $rootScope, utilityService, config, audioService, settingsService){
        var n, bar, currentNumerator, files = {}, timeSequence = {}, visibilityChange, wasPlaying, practiceIndex, hasSavedSettings;
        
        this_$scope = $scope;

        this.channels = audioService.createAudio();
        this.beatIntervalTimeout = null;
        this.accentInterval = null;
        this.pitchControlItems = [];


        // application default settings
        this.settings = {
            beatsperminute: 120,
            tempoMark: "Allegro moderato",
            timeNumerator: 4,
            tempo: 1,
            sound: true,
            ext: this.channels[0].canPlayType('audio/ogg') ? "ogg" : "mp3",
            on: false,
            tempoChange: false
        };


        // UI tracker object
        this.timeTracker = {
            bar: "0000",
            beat: "00"
        };


        // Practice Assistant default Settings
        this.practice = {
            on: false,
            tempos: 3,
            timeInterval: 1,
            bpmInterval: 3,
            tempoItems: [],
            tempoIndex: 0,
            paused: true
        };


        files = {
            accent: config.accentFile + this.settings.ext,
            click: config.clickFile + this.settings.ext,
            half: config.halfClickFile + this.settings.ext,
        };





        /* Auto Saves Users settings
        ------------------------------------- */
        function saveSettings(event, data){
            settingsService.save(data);
            hasSavedSettings = false;
        }

        this_$scope.$on("savedSettings", saveSettings);



        // restores users last settings (for a given page)
        this.getSettings = function(){
            var storageData = settingsService.restore();

            if ( storageData ){
                storageData = JSON.parse(storageData);
                this.practice = storageData.practice;
                this.settings = storageData.settings;
            }

            hasSavedSettings = (storageData !== null);
        };

        this.getSettings();



        /* Start & Stop Controls
        ------------------------------------- */
        this.start = function() {
            this.settings.on = true;
            bar = currentNumerator = n = 1;

            this.triggerClick();
        };

        this.stop = function(){
            this.settings.on = wasPlaying = false;

            $timeout.cancel(this.beatIntervalTimeout);
            $timeout.cancel(this.accentInterval);
        };



        /* Utility method to save resources and stop playback 
            if browser tab is changed
        --------------------------------------------------------------- */
        audioService.visibilityChangeSupport();

        this.handleTabChange = function(event, data){
            if (data === "stop" && $scope.metro.settings.on){
                this_$scope.metro.stop();
                wasPlaying = true;

            }else if (data === "play" && wasPlaying){
                this_$scope.metro.start();
            }
        };

        this_$scope.$on("tabVisibilityChange", this.handleTabChange);

        


        /* updates the tempo mark name UI
        ----------------------------------------- */
        this.updateTempo = function(){
            this.settings.beatsperminute = this.settings.beatsperminute < 50 ? 50 : (this.settings.beatsperminute > 300 ? 300 : this.settings.beatsperminute);

            this.settings.tempoMark = audioService.tempo(this.settings.beatsperminute);
            this.settings.tempoChange = true;

            this.createPraticeTempos();
        };




         /* Pitch Controls
        ------------------------------------- */

        // sets the class of the pitch control items
        this.pitchControlClass = function(){
            return this.pitchControlItems.length < 10 ? "metronome__row--1-" + this.pitchControlItems.length : "metronome__row--1-10";
        };



        // creates instances of the pitch controls for the view
        // bound to when the time numerator value is updated
        this.createPitchControls = function(){
            var i, numerator = this.settings.timeNumerator,
                isInRange = (numerator >= 1 && numerator <= 20 || numerator === "");


            if(METRO.hasOwnProperty("remotePause")){
                METRO.remotePause({pause: true});
            }

            this.settings.on = false;


            // before we update the UI need to check if the numerator values are in our range
            if(isInRange){
                this.pitchControlItems = [];

                for (i = 0; i < numerator; i++) {
                    this.pitchControlItems.push({
                        itemIndex: i,
                        state: "active",
                        sound: (this.state === "disabled")
                    });
                }

                // sets the default for UI ~ start
                if(this.pitchControlItems.length){ this.pitchControlItems[0].state = "accented"; }
            }

            // show hide error message if range is exceeded
            this.pitchControlErrorMsg = isInRange;
        };

        // create pitch controls on application instantiation
        this.createPitchControls();





        /* Loop Trigger for beat audio 
        ------------------------------------- */

        // sets the tempo from the directive
        this.tempo = function(newTempo){
            this.settings.tempo = newTempo;

            switch(newTempo){
                // Half
                case "2":
                    n = (currentNumerator * 2) - 1;
                    break;
                // Third
                case "3":
                    n = (currentNumerator * 3) - 1;
                    break;
                // Quarter
                case "4":
                    n = (currentNumerator * 4) - 1;
                    break;
                // Whole
                default:
                    n = currentNumerator;
                    break;
            }
        };



        // determines which audio instance to play ~ Private
        // need to get this into a service or factory with access to controller scope
        // NOTE: because we are playing the audio via JS this wont likely work on iOS devices
        function playAudio(audio) {
            var audioInstance = audioService.preloadAudio(audio),
                channels = $scope.metro.channels;

            if (audioInstance && audioInstance < channels.length) {
                channels[audioInstance].play();
            }
        }



        // triggers on-going clicks based on rate and tempo
        this.triggerClick = function(){
            var settings = this_$scope.metro.settings, rate,
                timeTracker = this_$scope.metro.timeTracker,
                index = currentNumerator - 1,
                pitchControl = $scope.metro.pitchControlItems[index];

            if (settings.on === true) {
                rate = utilityService.setRate(settings);


                // keeps track of the time and updates UI
                timeTracker.bar = utilityService.leadingZero(bar, 4);
                timeTracker.beat = utilityService.leadingZero(currentNumerator, 2);
                
                this_$scope.$apply();

                // determines which file to play
                audioService.playSoundSequence(pitchControl, settings, n);


                // keeps the beat sequence honest while the rhythm may increase
                switch(settings.tempo){
                    case "2":
                        timeSequence.updateBeat(2);
                        break;
                    case "3":
                        timeSequence.updateBeat(3);
                        break;
                    case "4":
                        timeSequence.updateBeat(4);
                        break;
                    default:
                        timeSequence.whole();
                        break;
                }


                // sets the repeat of the clicks based on the specified rate
                this.beatIntervalTimeout = $timeout(this_$scope.metro.triggerClick, 60000 / rate);
            }

            return this;
        };



        // iffy ~ this is ugly need to fix preloadAudio() to not read the arguments
        audioService.preloadAudio(files.accent, files.click, files.half);


        // primarily for the time sequence UI ~ Private 
        // should be re-factored in to a service 
        // but need to update local scope vars used in a lot of places
        timeSequence = {

            // everybody gets reset and ready to run the next bar sequence
            reset: function(){
                bar += 1;
                currentNumerator = n = 1;

                return this;
            },

            // beat is a 1/1 note
            whole: function(){
                if (currentNumerator < $scope.metro.settings.timeNumerator){
                    currentNumerator += 1;
                    n += 1;
                 
                 }else{
                    this.reset();
                 }

                 return this;
            },

            // beat is 1/2, 1/3 or 1/4 a note
            updateBeat: function(noteDivision){
                if(n < this_$scope.metro.settings.timeNumerator * noteDivision){
                    if(n % noteDivision === 0){
                        currentNumerator += 1;
                    }

                    n += 1;

                }else{
                    this.reset();
                }

                return this;
            }
        };





        /* Practice Assistant
         ------------------------------------- */

         // creates the progression tempos
         this.createPraticeTempos = function(){
            var i, currentTempo = this.settings.beatsperminute;

            this.practice.tempoItems = [];

            for (i = 0; i < this.practice.tempos; i++) {
                this.practice.tempoItems.push( currentTempo + (i * (this.practice.bpmInterval === null ? 1 : this.practice.bpmInterval) ));
            }

            this.settings.tempoChange = false;


            // if true switch to false to save new settings
            if ( hasSavedSettings ){
                hasSavedSettings = false;

            }else{
                this_$scope.$broadcast("savedSettings", {practice: this.practice, settings: this.settings});
            }

         };

        this.createPraticeTempos();



        // tracks the tempo progression through the session and updates the models
        this.tempoProgression = function(){
            var settings = this_$scope.metro.settings,
                practice = this_$scope.metro.practice;

            practiceIndex = (practiceIndex === (practice.tempos - 1)) ? 0 : practice.tempoIndex + 1;

            settings.beatsperminute = practice.tempoItems[practiceIndex];
            practice.tempoIndex = (practiceIndex === practice.tempos) ? 0 : practiceIndex;

            this_$scope.metro.updateTempo();
            settings.tempoChange = false;
        };

        this_$scope.$on("timerProgression", this.tempoProgression);



        // reset tempo progression models and update the view with the modified tempo progression
        this.refreshPraticeTempos = function(){
            practiceIndex = undefined;
            this_$scope.metro.practice.tempoIndex = 0;

            this.createPraticeTempos();
        };






    }







    MetronomeCntrl.$inject = ["$scope", "$timeout", "$document", "$rootScope", "utilityService", "config", "audioService", "settingsService"];


    angular
        .module("metronome")
        .controller("MetronomeCntrl", MetronomeCntrl);

}(window.METRO, window.angular));