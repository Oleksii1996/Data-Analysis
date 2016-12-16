// distributionFunction - функция распределения
function PearsonCriterion(classes, sigma) {
	var dimension = 0;
	this.classes = classes, this.sigma = sigma;

	for (var i = 0; i < this.classes.length; i++) {
		for (var j = 0; j < this.classes[i].length; j++) {
			dimension++;
		}
	}

	this.dimension = dimension;
}

PearsonCriterion.prototype.F = function(x) {
	if (x < 0) {
		return NaN;
	}
	return 1 - Math.exp(-(Math.pow(x, 2)) / (2 * Math.pow(this.sigma, 2)));
};

PearsonCriterion.prototype.n = function(i) {
	var tmp = 0;

	for (var j = 0; j < this.classes[i].length; j++) {
		tmp += this.classes[i][j]["frequency"];
	}

	return this.classes[i].length * (tmp / this.dimension);
};

PearsonCriterion.prototype.nTeorethical = function(i) {
	return this.classes[i].length * (this.F(this.classes[i][this.classes[i].length-1]["value"]) - this.F(this.classes[i][0]["value"]));
};

PearsonCriterion.prototype.chiSquare = function(index) {
	var result = 0;

	for (var i = 0; i < index/*this.classes.length*/; i++) {
		result += Math.pow((this.n(i) - this.nTeorethical(i)), 2) / this.nTeorethical(i);
	}

	return result;
};

PearsonCriterion.prototype.chiSquareQuantile = function(alpha, n) {
	var d;
	if (alpha >= 0.5 && alpha <= 0.999) {
		d = 2.0637 * Math.pow(Math.log(1 / (1 - alpha)) - 0.16, 0.4274) - 1.5774;
	} else if (alpha >= 0.001 && alpha < 0.5) {
		d = -2.0637 * Math.pow(Math.log(1 / alpha) - 0.16, 0.4274) + 1.5774;
	}

	var A = d * Math.sqrt(2),
		B = (2/3) * (Math.pow(d, 2) - 1),
		C = d * ((Math.pow(d, 2) - 7) / (9 * Math.sqrt(2))),
		D = - ((6*Math.pow(d, 4) + 14*Math.pow(d, 2) - 32) / 405),
		E = d * ((9*Math.pow(d, 4) + 256*Math.pow(d, 2) - 433) / (4860*Math.sqrt(2)));

	return n + A*Math.sqrt(n) + B + (C / Math.sqrt(n)) + (D / Math.sqrt(n)) + (E / (n*Math.sqrt(n)));
};

PearsonCriterion.prototype.fillTable = function(alpha, table) {
	var str, tmp;

	for (var i = 0; i < this.classes.length-1; i++) {
		tmp = i + 1;
		table.append("<tr><td>" + this.chiSquare(tmp).toFixed(4) + "</td><td>" + this.chiSquareQuantile(alpha, tmp).toFixed(4) + "</td><td></td></tr>");
	}

	if (this.chiSquare(this.classes.length) > this.chiSquareQuantile(alpha, this.classes.length)) {
		str = "Недостоверное";
	} else {
		str = "Достоверное";
	}

	table.append("<tr><td>" + this.chiSquare(this.classes.length).toFixed(4) +
		"</td><td>" + this.chiSquareQuantile(alpha, this.classes.length).toFixed(4) + "</td><td>" + str + "</td></tr>");
};