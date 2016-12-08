function Reley(givenData, sigma) {
	this.givenData = givenData, this.sigma = sigma, this.data = [];
	this.buildData();
}

// плотность распределения Релея
Reley.prototype.f = function(x) {
	return (x / Math.pow(this.sigma, 2)) * Math.exp(-(Math.pow(x, 2)) / (2 * Math.pow(this.sigma, 2)));
};

// функция распределения 
Reley.prototype.F = function(x) {
	return 1 - Math.exp(-(Math.pow(x, 2)) / (2 * Math.pow(this.sigma, 2)));
};

// оценка параметра сигма
Reley.prototype.sigmaEvaluation = function() {
	var tmp = 0;
	for (var i = 0; i < this.givenData.length; i++) {
		tmp += Math.pow(this.givenData[i]["value"], 2);
	}
	return Math.sqrt(tmp / (2 * this.givenData.length));
};

// среднеквадратическое отклонение параметра сигма
Reley.prototype.sigmaRms = function() {
	return this.sigma * Math.sqrt(2 - (Math.PI / 2));
};

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
		dataForChart.push([this.data[i]["t"], NaN]);
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

Reley.prototype.drawDensityOnHistogram = function(data, canvas) {
	var dataForChart = [],
		options = {
			width: "95%",
            height: 400,
            bar: {groupWidth: "100%"},
            legend: "none",
            title: "Функция плотности"
		};
		
	google.charts.load("current", {packages:['corechart']});

	/*for (var i = 0; i < this.givenData.length; i++) {
		dataForChart.push([this.givenData[i]["value"], this.f(this.givenData[i]["value"])]);
	}*/
	for (i = 0; i < data.length; i++) {
		data[i].push(this.f(data[i][0])*(i+1));
		dataForChart.push(data[i]);
	}

	google.charts.setOnLoadCallback(draw);

	function draw() {
		var data = new google.visualization.DataTable();

        data.addColumn("number", "x");
        data.addColumn("number", "y");
        data.addColumn("number", "y2");

        data.addRows(dataForChart);

        var chart = new google.visualization.LineChart(canvas);
        chart.draw(data, options);
	};
};

// квантиль Up
Reley.prototype.U = function() {
    var c0 = 2.515517,
        c1 = 0.802853,
        c2 = 0.010328,
        d1 = 1.432788,
        d2 = 0.1892659,
        d3 = 0.001308,
        a = 0.05,
        t = Math.sqrt(-2 * Math.log(a));

    return t - (c0 + c1*t + c2*Math.pow(t, 2)) / (1 + d1*t + d2*Math.pow(t, 2) + d3*Math.pow(t, 3));
};

//
Reley.prototype.insertReleyParametr = function(table) {
	table.append("<tr><td>" + this.sigma + "</td><td>" + this.sigmaEvaluation().toFixed(4) + "</td><td>" + this.sigmaRms().toFixed(4) + "</td>" +
		"<td>[" + (this.sigma - this.U()*this.sigmaRms()).toFixed(4) + ", " + (this.sigma + this.U()*this.sigmaRms()).toFixed(4) + "]</td></tr>");
};