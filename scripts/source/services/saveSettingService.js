/* -------------------------------------------- 
   Save Settings Service
	- saves setting to local storage
	- retrieves settings from storage
-----------------------------------------------*/

(function (angular, DRUM){

	function settingsService (storage){
		var pageId = parent.window.hasOwnProperty("DRUM") ? parent.window.DRUM.pageId : DRUM.pageId;
			store = {};

		return {
			save: save,
			restore: restore
		};


		// saves settings to local storage when a setting is updated
		function save(data){
			store = Object.assign(data, store);

			storage.set({ id: pageId, data: store });
		}

		// restores local storage object when a user returns to the page
		function restore(){
			return storage.get(pageId);
		}

	}


	settingsService.$inject = ["storage"];


	angular
		.module("metronome")
		.factory("settingsService", settingsService);

}(window.angular, window.DRUM));