function Reley(givenData, sigma) {
	this.givenData = givenData, this.sigma = sigma, this.data = [];
	this.buildData();
}

Reley.prototype.buildData = function() {
	var z = function(x) {
		return Math.log(Math.log(1 / (1 - x)));
	}, 
	t = function(x) {
		return Math.log(x);
	};

	for (var i = 0; i < this.givenData.length; i++) {
		this.data.push({"t": t(this.givenData[i]["value"]), "z": z(this.givenData[i]["frequency"])});
	}
};

Reley.prototype.drawChart = function(canvas) {
	var dataForChart = [],
		options = {
			width: "95%",
            height: 400,
            bar: {groupWidth: "100%"},
            legend: "none",
            title: "Вероятностная сетка"
		};
		
	google.charts.load("current", {packages:['corechart']});

	for (var i = 0; i < this.data.length; i++) {
		dataForChart.push([this.data[i]["t"], this.data[i]["z"]]);
	}

	google.charts.setOnLoadCallback(draw);

	function draw() {
		var data = new google.visualization.DataTable();

        data.addColumn("number", "t");
        data.addColumn("number", "z");

        data.addRows(dataForChart);

        var chart = new google.visualization.LineChart(canvas);
        chart.draw(data, options);
	};
};