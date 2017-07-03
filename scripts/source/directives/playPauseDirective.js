/* ----------------------------------------- 
    Play Pause Directive
    - start / stop the metronome
-------------------------------------------*/

(function (METRO, angular, $){


    function playPause(countDownService){
        return{
            restrict: 'E',
            repalce: true,
            scope: {
                type: '@'
            },
            template: '<div class="playPause"></div>',

            link: function (scope, $element){
                var metro = scope.$parent.metro,
                    simpleButton = [
                        '<div class="metronome__row--2-10 metronome__row--1-10-xl metronome__buttonCntr" id="simpleButton">',
                            '<a href="" class="metronome__play" play></a>',
                            '<a href="" class="metronome__pause metronome--hide" pause></a>',
                        '</div>'].join(""),

                    startButton = '<a href="" class="btn btn-full-width btn-large transparent green-transparent" startPratice>Start</a>',
                    stopButton = '<a href="" class="btn btn-full-width btn-large transparent red-transparent" cancelPratice>Cancel</a>',
                    pauseButton = '<a href="" class="btn btn-full-width btn-large transparent grey-transparent" pausePratice>Pause</a>',
                    resumeButton = '<a href="" class="btn btn-full-width btn-large transparent green-transparent" startPratice>Resume</a>';


                switch(scope.type){
                    case "simpleButton": html = simpleButton; break;
                    case "stop": html = stopButton; break;
                    case "start": html = startButton; break;
                    case "pause": html = pauseButton; break;
                    case "resume": html = resumeButton; break;
                }


                $element.html(html);

                

                // toggles both button UIs
                function togglePlayPauseControlls(e){
                    $(".metronome__buttonCntr").find("a").toggleClass('metronome--hide');
                    e.preventDefault();
                }


                function toggleDisabledPraticeAssistant(disable){
                    $("a[startPratice]").toggleClass("btn-disabled", disable);
                }


                // throws an error if the time numerator control has no value
                function emptyTimeSigError(e){
                    metro.pitchControlErrorMsg = false;
                    scope.$parent.$digest();
                    e.preventDefault();
                }


                // general play
                function playBeat(e){
                    if(checkTimeSignature()){
                        togglePlayPauseControlls(e);
                        metro.start();

                        toggleDisabledPraticeAssistant(true);

                    }else{
                        emptyTimeSigError(e);
                    }
                }


                // general pause
                function pauseBeat(e){
                    togglePlayPauseControlls(e);

                    if( $(e.target).hasClass("metronome__pause") && metro.practice.on ){
                       cancelPratice(e);
                    }

                    toggleDisabledPraticeAssistant(false);
                    
                    metro.stop();
                    METRO.timerRemote({data: "stop"}, e);
                }



                // Practice Play button handler
                function playPratice(e){
                    if(checkTimeSignature() ){

                        if( !$("a[startPratice]").hasClass("btn-disabled") ){
                            METRO.timerRemote({data: "start"});
                            playBeat(e);
                        }

                        e.preventDefault();

                    }else{
                        emptyTimeSigError(e);
                    }
                }



                // Practice: pauses the timer, but no reset
                function pausePratice(e){
                    METRO.timerRemote({data: "pause"}, e);
                    metro.stop();

                    toggleDisabledPraticeAssistant(false);

                    e.preventDefault();
                }


                // Practice: stops and resets the timer
                function cancelPratice(e){
                    METRO.timerRemote({data: "cancel"}, e);

                    if( !$(".metronome__pause").hasClass("metronome--hide") ){
                        togglePlayPauseControlls(e);
                    }

                    toggleDisabledPraticeAssistant(false);

                    metro.stop();
                    metro.refreshPraticeTempos();
                    
                    e.preventDefault();
                }


                // makes sure that the time numerator control has a value before we start playback
                function checkTimeSignature(){
                    return metro.settings.timeNumerator;
                }


                // handler when a pause is caused remotely
                METRO.remotePause = function(data, event){
                    if(metro.settings.on && data.pause){
                        pauseBeat(event);
                        METRO.timerRemote({data: "pause"}, event);
                    }
                };



                $element
                    .on("click", "a[play]", playBeat)
                    .on("click", "a[pause]", pauseBeat)
                    .on("click", "a[startPratice]", playPratice)
                    .on("click", "a[cancelPratice]", cancelPratice)
                    .on("click", "a[pausePratice]", pausePratice);


                // listens for a pause event to change the UI
                scope.$parent.$on("remoteBeat", METRO.remotePause);
            }
        };
    }


    playPause.$inject = ["countDownService"];


    angular
        .module("metronome")
        .directive("playPause", playPause);

}(window.METRO, window.angular, window.jQuery));
