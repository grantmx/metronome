/*

JQUERY: STOPWATCH & COUNtimeDateOWN

This is a basic stopwatch & countimeDateown plugin to run with jquery. Start timer, pause it, stop it or reset it. Same behaviour with the countimeDateown besides you need to input the countimeDateown value in seconds first. At the end of the countimeDateown a callback function is invoked.

Any questions, suggestions? marc.fuehnen(at)gmail.com

*/


var timmer = {
	formatTimer: function(digit){
		return (digit < 10) ? "0" + digit : digit;
	};

	start: function(){
		var 
	}
}




$(document).ready(function() {

	(function($) {

		$.extend({

			APP: {

				formatTimer: function(a) {
					if (a < 10) {
						a = '0' + a;
					}
					return a;
				},

				startTimer: function(dir) {

					var a;

					// save type
					$.APP.dir = dir;

					// get current date
					$.APP.dateOne = new Date();

					switch ($.APP.state) {

						case 'pause':

							// resume timer
							// get current timestamp (for calculations) and
							// substract time difference between pause and now
							$.APP.timeOne = $.APP.dateOne.getTime() - $.APP.timeDate;

							break;

						default:

							// get current timestamp (for calculations)
							$.APP.timeOne = $.APP.dateOne.getTime();

							// if countdown add ms based on seconds in textfield
							if ($.APP.dir === 'cd') {
								$.APP.timeOne += parseInt($('#cd_seconds').val()) * 1000;
							}

							break;

					}

					// reset state
					$.APP.state = 'alive';
					$('#' + $.APP.dir + '_status').html('Running');

					// start loop
					$.APP.loopTimer();

				},

				pauseTimer: function() {

					// save timestamp of pause
					$.APP.dp = new Date();
					$.APP.tp = $.APP.dp.getTime();

					// save elapsed time (until pause)
					$.APP.timeDate = $.APP.tp - $.APP.timeOne;

					// change button value
					// $('#' + $.APP.dir + '_start').val('Resume');

					// set state
					// $.APP.state = '/pause';
					// $('#' + $.APP.dir + '_status').html('Paused');

				},

				stopTimer: function() {

					// change button value
					$('#' + $.APP.dir + '_start').val('Restart');

					// set state
					$.APP.state = 'stop';
					$('#' + $.APP.dir + '_status').html('Stopped');

				},

				resetTimer: function() {

					// reset display
					$('#' + $.APP.dir + '_ms,#' + $.APP.dir + '_s,#' + $.APP.dir + '_m,#' + $.APP.dir + '_h').html('00');

					// change button value
					$('#' + $.APP.dir + '_start').val('Start');

					// set state
					$.APP.state = 'reset';
					$('#' + $.APP.dir + '_status').html('Reset & Idle again');

				},

				endTimer: function(callback) {

					// change button value
					$('#' + $.APP.dir + '_start').val('Restart');

					// set state
					$.APP.state = 'end';

					// invoke callback
					if (typeof callback === 'function') {
						callback();
					}

				},

				loopTimer: function() {

					var timeDate;
					var d2, t2;

					var ms = 0;
					var s = 0;
					var m = 0;
					var h = 0;

					if ($.APP.state === 'alive') {

						// get current date and convert it into 
						// timestamp for calculations
						d2 = new Date();
						t2 = d2.getTime();

						// calculate time difference between
						// initial and current timestamp
						if ($.APP.dir === 'sw') {
							timeDate = t2 - $.APP.timeOne;
							// reversed if countimeDateown
						} else {
							timeDate = $.APP.timeOne - t2;
							if (timeDate <= 0) {
								// if time difference is 0 end countimeDateown
								$.APP.endTimer(function() {
									$.APP.resetTimer();
									$('#' + $.APP.dir + '_status').html('Ended & Reset');
								});
							}
						}

						// calculate milliseconds
						ms = timeDate % 1000;
						if (ms < 1) {
							ms = 0;
						} else {
							// calculate seconds
							s = (timeDate - ms) / 1000;
							if (s < 1) {
								s = 0;
							} else {
								// calculate minutes   
								var m = (s - (s % 60)) / 60;
								if (m < 1) {
									m = 0;
								} else {
									// calculate hours
									var h = (m - (m % 60)) / 60;
									if (h < 1) {
										h = 0;
									}
								}
							}
						}

						// substract elapsed minutes & hours
						ms = Math.round(ms / 100);
						s = s - (m * 60);
						m = m - (h * 60);

						// update display
						$('#' + $.APP.dir + '_ms').html($.APP.formatTimer(ms));
						$('#' + $.APP.dir + '_s').html($.APP.formatTimer(s));
						$('#' + $.APP.dir + '_m').html($.APP.formatTimer(m));
						$('#' + $.APP.dir + '_h').html($.APP.formatTimer(h));

						// loop
						$.APP.t = setTimeout($.APP.loopTimer, 1);

					} else {

						// kill loop
						clearTimeout($.APP.t);
						return true;

					}

				}

			}

		});

		$('#sw_start').live('click', function() {
			$.APP.startTimer('sw');
		});

		$('#cd_start').live('click', function() {
			$.APP.startTimer('cd');
		});

		$('#sw_stop,#cd_stop').live('click', function() {
			$.APP.stopTimer();
		});

		$('#sw_reset,#cd_reset').live('click', function() {
			$.APP.resetTimer();
		});

		$('#sw_pause,#cd_pause').live('click', function() {
			$.APP.pauseTimer();
		});

	})(jQuery);

});