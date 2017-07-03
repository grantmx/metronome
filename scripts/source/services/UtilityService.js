/* -------------------------------- 
   Generic Utility Service
----------------------------------*/

(function (angular){

    function utilityService(){

        return{
            leadingZero: leadingZero,
            setRate: setRate,
            toHMSFormat: toHMSFormat,
            toSeconds: toSeconds,
            toMMSSFormat: toMMSSFormat,
            triggerPulse: triggerPulse,
            formatTime: formatTime
        };


        // utility to concatenate 000 to the UI
        function leadingZero (number, digits) {
            var l = 0, prefix = '';

            number += '';

            if (number.length < digits) {
                digits = digits - number.length;
            
                while (l < digits) {
                    prefix += '0';
                    l += 1;
                }

                number = prefix + number;
            }

            return number;
        }



        // determines the rate for the current beat
        function setRate (settings){
            var rate = settings.beatsperminute;

            // controls the speed of the time out
            switch(settings.tempo){
                case "2":
                    rate = rate * 2;
                    break;
                case "3":
                    rate = rate * 3;
                    break;
                case "4":
                    rate = rate * 4;
                    break;
            }

            return rate;
        }


        // formats seconds to 00:00 format ISO Time
        function toHMSFormat(sec) {
            var date = new Date(null);
            date.setSeconds(sec);
            return date.toISOString().substr(14, 5);
        }


        // formats minutes to 000:00 custom time
        function toMMSSFormat(time){
            var sec, min;

            sec = parseInt((time % 60), 10);
            sec = formatTime(sec);

            min = parseInt((time / 60), 10);
            min = formatTime(min);

            return min +":"+ sec;
        }


        // converts format 00:00:00 to seconds
        function toSeconds(hms){
            var sec = 0, min = 1,
                time = hms.toString().split(":");

            while (time.length > 0){
                sec += min * parseInt( time.pop(), 10);
                min *= 60;
            }

            return sec;
        }


        // adds 0 if time digit is a single digit
        function formatTime (digit){
            return (digit < 10) ? "0" + digit : digit.toString();
        }


        /* Pitch Control UI
            - performs faster if it goes in to a service
         */
        function triggerPulse(id){
            $("#pitchControl_" + id).addClass('metronome__pitchControlCheckbox--animate');

            setTimeout(function(){
                cleanUp(id);
            }, 800);
        }

        function cleanUp(id){
            $("#pitchControl_" + id).removeClass('metronome__pitchControlCheckbox--animate');
        }

    }


    angular
        .module("metronome")
        .factory("utilityService", utilityService);


}(window.angular));