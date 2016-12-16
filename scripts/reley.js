function Reley(givenData) {
	this.givenData = givenData, this.sigma = this.sigmaEvaluation(), this.data = [];
	this.buildData();
}

// плотность распределения Релея
Reley.prototype.f = function(x) {
	if (x < 0) {
		return NaN;
	}
	return (x / Math.pow(this.sigma, 2)) * Math.exp(-(Math.pow(x, 2)) / (2 * Math.pow(this.sigma, 2)));
};

// функция распределения 
Reley.prototype.F = function(x) {
	if (x < 0) {
		return NaN;
	}
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
	return this.sigmaEvaluation() * Math.sqrt(2 - (Math.PI / 2));
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

Reley.prototype.drawDistributionEmpiricFunc = function(data, canvas) {
	var dataForChart = [],
		options = {
			width: "95%",
            height: 400,
            bar: {groupWidth: "100%"},
            legend: "none",
            title: "Функция распределения, наложенная на емпирическую функцию вариационного ряда"
		};

	google.charts.load("current", {packages:['corechart']});

	for (var i = 0; i < data.length; i++) {
		dataForChart.push([data[i][0], data[i][1], this.F(data[i][0])]);
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

Reley.prototype.drawDensityOnHistogram = function(classes, canvas) {
	var dataForChart = [], tmp = 0,
		options = {
			width: "95%",
            height: 400,
            bar: {groupWidth: "100%"},
            legend: "none",
            title: "Функция плотности, наложенная на гистограмму"
		};
		
	google.charts.load("current", {packages:['corechart']});

    for (var j = 0; j < classes[0].length; j++) {
        tmp += classes[0][j]["frequency"];
    }
    dataForChart.push([classes[0][0]["value"], 0, this.f(classes[0][0]["value"])]);
    dataForChart.push([classes[0][0]["value"], (tmp / this.givenData.length), this.f(classes[0][0]["value"])]);

    for (var k = 0; k < classes[0].length; k++) {
        dataForChart.push([classes[0][k]["value"], (tmp / this.givenData.length), this.f(classes[0][k]["value"])]);
    }

    dataForChart.push([classes[0][classes[0].length-1]["value"], (tmp / this.givenData.length), this.f(classes[0][classes[0].length-1]["value"])]);
    dataForChart.push([classes[0][classes[0].length-1]["value"], 0, this.f(classes[0][classes[0].length-1]["value"])]);
    tmp = 0;
    
    for (var i = 1; i < classes.length; i++) {
        for (var j = 0; j < classes[i].length; j++) {
            tmp += classes[i][j]["frequency"];
        }
        dataForChart.push([classes[i-1][classes[i-1].length-1]["value"], 0, this.f(classes[i-1][classes[i-1].length-1]["value"])]);
        dataForChart.push([classes[i-1][classes[i-1].length-1]["value"], (tmp / this.givenData.length), this.f(classes[i-1][classes[i-1].length-1]["value"])]);

        for (var k = 0; k < classes[i].length; k++) {
        	dataForChart.push([classes[i][k]["value"], (tmp / this.givenData.length), this.f(classes[i][k]["value"])]);
        }

        dataForChart.push([classes[i][classes[i].length-1]["value"], (tmp / this.givenData.length), this.f(classes[i][classes[i].length-1]["value"])]);
        dataForChart.push([classes[i][classes[i].length-1]["value"], 0, this.f(classes[i][classes[i].length-1]["value"])]);
        tmp = 0;
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

//
Reley.prototype.insertReleyParametr = function(table) {
	table.append("<tr><td>" + this.sigma.toFixed(4) + "</td><td>" + this.sigmaEvaluation().toFixed(4) + "</td><td>" + this.sigmaRms().toFixed(4) + "</td>" +
		"<td>[" + (this.sigma - this.sigmaRms()).toFixed(4) + ", " + (this.sigma + this.sigmaRms()).toFixed(4) + "]</td></tr>");
};