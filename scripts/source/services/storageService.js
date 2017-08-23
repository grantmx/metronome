/* -------------------------------------------- 
   Storage Service
	- local storage getter and setter
-----------------------------------------------*/

(function (angular){

	function storage ($window){

		return {
			set: set,
			get: get
		};


		function set(args){
			var data = angular.toJson(args.data),
				id = angular.toJson(args.id);

			if( $window.localStorage ){
				$window.localStorage.setItem(id, data);
			}
			
			return;
		}


		function get(itemId){
			var value = $window.localStorage.getItem(angular.toJson(itemId));
			return value !== null ? value : null;
		}

	}

	storage.$inject = ["$window"];

	angular
		.module("metronome")
		.factory("storage", storage);

}(window.angular));