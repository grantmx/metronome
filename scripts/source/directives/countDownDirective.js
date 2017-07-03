/* ----------------------------------------- 
    Play Pause Directive
		- start / stop the metronome
-------------------------------------------*/

(function (METRO, angular, $){


	/* ----------------------------------------- 
		Countdown Directive
	-------------------------------------------*/
	function countDownInterval($rootScope, utilityService, countDownService){
		return{
			restrict: "E",
			replace: true,
			template: '<input type="text" class="metronome__input" id="interval">',
			link: function(scope, element){
				var interval, practice = scope.metro.practice,
					msg = {
						interval: "Pause or cancel to update time."
					},

					countDown = {

						apply: function(){
							scope.$parent.$digest();
							return this;
						},


						disable: function(isDisabled){
							$(element).prop("disabled", isDisabled);
						},
						

						// formats the timer model
						setTimer: function(){
							interval = scope.metro.practice.timeInterval;
							interval = interval.toString().split(":");

							// if the format is 00:00 then we pass it in assuming minutes, else if its a single digit then we x 60 to get minutes
							interval = interval.length > 1 ? utilityService.toSeconds( interval[0] +":"+ interval[1] ) : parseInt(interval[0], 10) * 60;

							return this;
						},


						// sets the timer view
						setModel: function(){
							element.val( utilityService.toMMSSFormat(interval) );
							return this;
						},


						// saves the new timer model when the view is updated
						refreshTimer: function(){
							practice.on = false;
							practice.paused = null;
							practice.timeInterval = element.val();

							countDown.apply().setTimer().setModel();

							return countDown;
						},
						

						// stop the countdown timer
						cancelTimer: function(){
							practice.on = false;
							practice.paused = null;

							countDown.disable(false);

							countDown.apply().setTimer().setModel();
							countDownService.timer.reset();

							return this;
						},


						// pause timer
						pauseTimer: function(e){
							if (practice.on) {
								practice.paused = true;

								countDown.disable(false);

								countDownService.timer.pause();
								METRO.remotePause({pause: true}, e);
							}
							
							return this;
						},


						// start the countdown timer
						startTimer: function(){
							practice.on = true;
							practice.paused = false;

							countDown.disable(true);

							countDownService.timer.start({time: interval}, METRO.updateTimer);

							return this;
						}
					};


				// handler for the remote listener to start, cancel or pause the timer
				METRO.timerRemote = function(args, event){
					switch(args.data){
						case "start" : countDown.startTimer(event); break;
						case "cancel" : countDown.cancelTimer(event); break;
						case "pause" : countDown.pauseTimer(event); break;
					}

					return this;
				};


				// restarts the timer and then tells those who are listening that its been restarted
				METRO.timerRestart = function() {
					scope.$emit("timerProgression");
					return this;
				};


				// passed in as a callback to refresh the view
				METRO.updateTimer = function(timeObj){
					element.val( timeObj.minutes + ':' + timeObj.seconds );
					return this;
				};


				// init
				countDown.setTimer().setModel();


				/* Listeners
				----------------------- */
				$(element).on("blur", countDown.refreshTimer);

				$("#tempos, #bpmInterval").on("focus", countDown.pauseTimer);

				// scope.$on("timer", METRO.timerRemote);

			}
		};
	}


	countDownInterval.$inject = ["$rootScope", "utilityService", "countDownService"];
	

	angular
        .module("metronome")
        .directive("countDownInterval", countDownInterval);


}(window.METRO, window.angular, window.jQuery));

