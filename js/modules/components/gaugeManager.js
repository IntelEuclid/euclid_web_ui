define([], function(){
	var manager = function(){
		this.config = {
			size: 120,
			label: "",
			min:  0,
			max: 100,
			minorTicks: 5,
			showYellow: true,
			showRed:  true
		};


		this.getYellowZones = function(config){
			return [{ from: config.min + config.range*0.75, to: config.min + config.range*0.9 }]
		};
		this.getRedZones = function(config){
			return [{ from: config.min + config.range*0.9, to: config.max }]
		};

		this.createGauge = function(name, label, min, max, size,showYellow, showRed){
        	config = {
				size: undefined != size ? size : 120,
				label: label,
				min: undefined != min ? min : 0,
				max: undefined != max ? max : 100,
				minorTicks: 5,
				showYellow: undefined != showYellow ? showYellow : true,
				showRed: undefined != showRed ? showRed : true
			}
			config.range = config.max - config.min;
			config.yellowZones = this.getYellowZones(config);
			config.redZones = this.getRedZones(config);
			return new Gauge(name + "GaugeContainer", config);
	 	};

		this.updateGauge = function(gauge, value){
			gauge.redraw(value);
		};

		this.renderGauge = function(gauge){
			gauge.render();
		}

	};

	 return manager;
});
