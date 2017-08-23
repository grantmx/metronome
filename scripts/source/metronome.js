/*---------------------------------------------------
    Inspired by 
        - Metronome by James Stegall
        - http://www.plus-equals.com/metronome/

    Port to AngularJS, optimized and 
    functionality enhanced by Sevengage, Inc.
-----------------------------------------------------*/

var METRO = METRO || {},
    DRUM = DRUM || {};
    
// global module declaration and constants
angular
    .module("metronome", ["ngTouch"])
    .constant("config", {
        accentFile: 'assets/Accent.',
        clickFile: 'assets/Click.',
        halfClickFile: 'assets/Half-Click.',
    });

// @codekit-prepend "../lib/jquery-1.10.2.min.js";
// @codekit-prepend "../lib/angular.min.js";
// @codekit-prepend "../lib/angular-touch.min.js";

// @codekit-append "controllers/MetronomeCntrl.js";

// @codekit-append "services/UtilityService.js";
// @codekit-append "services/AudioService.js";
// @codekit-append "services/CountDownService.js";
// @codekit-append "services/storageService.js";
// @codekit-append "services/saveSettingService.js";


// @codekit-append "directives/playPauseDirective.js";
// @codekit-append "directives/subDivisionNotesDirective.js";
// @codekit-append "directives/pitchControlDirective.js";
// @codekit-append "directives/countDownDirective.js";
// @codekit-append "directives/tempoItemDirective.js";
// @codekit-append "directives/onLastRepeat.js";