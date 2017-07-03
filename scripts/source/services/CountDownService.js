/* ------------------------------------------------------------------------- 
   Countdown Service
		- Inspired by JQUERY: STOPWATCH & COUNTDOWN ~ marc.fuehnen
		- re-factored and rewritten to fit the needs for drumchannel.com
--------------------------------------------------------------------------- */

(function (METRO, angular){

	function countDownService (utilityService){

		var timer = {

				start: function(argsObj, callback){

					// global assign countdown time
					this.setTime = argsObj.time;

					// global assign our passed in callback
					if( typeof callback === "function"){
						this.callback = callback;
					}

					// set time to countdown from
					this.currentDate = new Date();

					if( this.state === "paused" ){
						this.startTime = this.currentDate.getTime() - this.pastTime;

					}else{
						this.startTime = this.currentDate.getTime();
						this.startTime += parseInt( this.setTime, 10 ) * 1000;
					}

					this.state = "on";

					this.loop();

					return this;
				},


				pause: function(){
					this.pauseDate = new Date();
					this.pauseTime = this.pauseDate.getTime();
					this.pastTime = this.pauseTime - this.startTime;
					this.state = "paused";

					return this;
				},


				reset: function(){
					this.state = "reset";
					return this;
				},


				// loops to form the updated time and track the countdown
				loop: function(){
					var ms, sec, min, hr, timeObj = {},
						date = new Date(), timeNow = date.getTime(), tickTime;

					ms = sec = min = hr = 0;

					if( timer.state === "on" ){
						
						tickTime = timer.startTime - timeNow;

						// restart countdown
						if( tickTime <= 0 ){

							// notify parent app that we've restarted
							// would typically do some sort of generic pub/sub but its too slow for our app
							METRO.timerRestart();

							// take our saved globals and start again
							timer.start({time: timer.setTime}, timer.callback);
						}

						// console.log(ms +":"+ sec +":"+ min +":"+ hr)

						// build and format time object
						timeObj = timer.parse({
							tickTime: tickTime,
							ms: ms,
							sec: sec,
							min: min,
							hr: hr
						});


						// notify the global callback fn with the updated time object
						if( timer.callback ){
							timer.callback.call(this, timeObj);
						}

						// restart loop
						timer.timeLoop = setTimeout(timer.loop, 1);

					}else{
						clearTimeout( timer.timeLoop );
						return;
					}

					return this;

				},


				// format and set time values
				parse: function(args){
					args.ms = parseInt((args.tickTime / 1000), 10);
					args.sec = parseInt((args.ms % 60), 10);
					args.min = parseInt((args.ms / 60), 10);
					args.hr = Math.floor(parseInt(args.ms, 10) / 3600);

					return {
						milliseconds: utilityService.formatTime(args.ms),
						seconds: utilityService.formatTime(args.sec),
						minutes: utilityService.formatTime(args.min),
						hours: utilityService.formatTime(args.hr)
					};
				}
			};



		return {
			timer: timer
		};

	}


	countDownService.$inject = ["utilityService"];


	angular
        .module("metronome")
        .factory("countDownService", countDownService);


}(window.METRO, window.angular));



/* ----------------------------------------- 
		Countdown Module ~ taken from and slightly modified to fit DrumChannel:
			- http://stackoverflow.com/questions/20618355/the-simplest-possible-javascript-countdown-timer
	
	function CountDownTimer(duration, granularity) {
		this.duration = duration;
		this.granularity = granularity || 1000;
		this.tickFtns = [];
		this.running = false;
	}

	// timer start
	CountDownTimer.prototype.start = function() {
		var that = this, obj,
			start = Boolean(this.newStart) ? this.newStart : Date.now();

		if (this.running) { return; }

		this.running = true;
		this.newStart = null;
		
		(function timer() {
			that.diff = that.duration - (parseInt(((Date.now() - start) / 1000), 10));

			if (that.diff > 0) {
				that.timerRefresh = setTimeout(timer, that.granularity);

			} else {
				that.diff = 0;
				that.running = false;
			}

			obj = CountDownTimer.parse(that.diff);
	
			that.tickFtns.forEach(function(ftn) {
				ftn.call(this, obj.hours, obj.minutes, obj.seconds);
			}, that);
		
		}());
	};



	CountDownTimer.prototype.stop = function(){
		this.expired();
		clearTimeout(this.timerRefresh);

		return this;
	};


	CountDownTimer.prototype.pause = function(){
		this.expired();
		clearTimeout(this.timerRefresh);

		this.newStart = Date.now();
	};



	CountDownTimer.prototype.onTick = function(ftn) {
		if (typeof ftn === 'function') {
			this.tickFtns.push(ftn);
		}
		return this;
	};

	CountDownTimer.prototype.expired = function() {
		return !this.running;
	};

	CountDownTimer.parse = function(seconds) {
		return {
			// 'hours': Math.floor(parseInt(seconds, 10) / 3600),
			'minutes': parseInt((seconds / 60), 10),
			'seconds': parseInt((seconds % 60), 10)
		};
	};

------------------------------------------- */