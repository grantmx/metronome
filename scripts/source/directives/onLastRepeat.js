/* ----------------------------------------- 
    Tempo Item Directive
		- controls the view for each tempo 
		item in the Practice Assistant
-------------------------------------------*/

(function (angular, $){

	function onLastRepeat($timeout){
		return {
			restrict: 'A',
			link: function(scope, element){

				//debugger;
				if ( scope.$last ){

					// if we are inside of our specified frame, resize me because we grown more or less 
					if ( window.parent.document.getElementById('practiceAssistant') ){
						$timeout(function(){
							var newHeight = $("body").height();
							$("#practiceAssistant", window.parent.document).height(newHeight);
						}, 1);
					}

				}


			}
		};
	}


	onLastRepeat.$inject = ["$timeout"];


	angular
        .module("metronome")
        .directive("onLastRepeat", onLastRepeat);

}(window.angular, window.jQuery));
