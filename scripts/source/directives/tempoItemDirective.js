/* ----------------------------------------- 
    Tempo Item Directive
		- controls the view for each tempo 
		item in the Practice Assistant
-------------------------------------------*/

(function (angular, $){

	function tempoItem($rootScope){
		return {
			restrict: 'A',
			link: function(scope, element, attr){

				function updateTempoItem(){
					element.removeClass("metronome__tempoItem--active");

					if( scope.metro.settings.beatsperminute.toString() === attr.tempo ){
						element.addClass("metronome__tempoItem--active");
					}
				}

				updateTempoItem();


				$rootScope.$on("timerProgression", updateTempoItem);
			}
		};
	}

	tempoItem.$inject = ["$rootScope"];

	angular
        .module("metronome")
        .directive("tempoItem", tempoItem);

}(window.angular, window.jQuery));
