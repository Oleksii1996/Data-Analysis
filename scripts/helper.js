//
function Helper(data) {
    Data.call(this, data);
}

Helper.prototype = Object.create(Data.prototype);
Helper.prototype.constructor = Helper;

// записывает полученные данные в таблицу
Helper.prototype.insertBasicData = function(table) {
    for (var i = 0, len = this.data.length; i < len; i++) {
        table.append("<tr id='tr" + i + "'><td>" + (i + 1) + "</td><td>" + this.data[i] + "</td></tr>>");
    }

    this.buildVarRow();
};

// дописываем полученные данные в таблицу
Helper.prototype.insertVarRow = function(table) {
    //this.buildVarRow();

    var tmp = 0;

    // дописываем таблицу
    for (var i = 0, len = this.data.length; i < len; i++) {
        // накапливаем в tmp значения относительных частот для подсчета
        // емпирической функции распределения
        tmp += this.data[i]["frequency"] / this.dimension;
        table.children($("#tr" + i).append("<td>" + this.data[i]["value"] + "</td><td>" + this.data[i]["frequency"] + "</td><td>"
            + (this.data[i]["frequency"] / this.dimension).toFixed(4) + "</td><td>" + tmp.toFixed(4) + "</td>"));
    }
};

// запись вариационного ряда, разбитого на классы, в таблицу
Helper.prototype.insertClasses = function(table, n) {
    this.buildClasses(n);
    var tmp = 0, tmp2 = 0;

    // пишем в таблицу классы, tmp - накапливает частотность класса,
    // tmp2 - накапливает значения для построения емпирической функции распределения
    for (var i = 0; i < this.classes.length; i++) {
        for (var j = 0; j < this.classes[i].length; j++) {
            // сумируем частоты каждого элемента в классе
            tmp += this.classes[i][j]["frequency"];

            tmp2 += this.classes[i][j]["frequency"];
        }

        table.append("<tr><td>" + (i+1) + "</td>" +
            "<td>[" + this.classes[i][0]["value"] + ", " + this.classes[i][this.classes[i].length-1]["value"] + "]</td>" +
            "<td>" + tmp.toFixed(4) + "</td>" +
            "<td>" + (tmp / this.dimension).toFixed(4) + "</td>" +
            "<td>" + (tmp2 / this.dimension).toFixed(4) + "</td></tr>");
        // сбрасываем значения tmp для подсчета новой частоты нового класса на следующей итерации
        tmp = 0;
    }
};

// формируем данные для графика из вариационного ряда
Helper.prototype.varRowForChart = function() {
    var dataForChart = [], tmp = 0, i;

    dataForChart.push([this.data[0]["value"]-1,0]);
    dataForChart.push([this.data[0]["value"], 0]);
    dataForChart.push([this.data[0]["value"], NaN]);

    for (i = 0, len = this.data.length-1; i < len; i++) {
        tmp += this.data[i]["frequency"];

        dataForChart.push([this.data[i]["value"], (tmp / this.dimension)]);
        dataForChart.push([this.data[i+1]["value"], (tmp / this.dimension)]);
        dataForChart.push([this.data[i+1]["value"], NaN]);
    }

    dataForChart.push([this.data[this.data.length-1]["value"], NaN]);
    dataForChart.push([this.data[this.data.length-1]["value"], 1]);
    dataForChart.push([this.data[this.data.length-1]["value"]+1, 1]);

    return dataForChart;
};

// формируем данные для графика из классов
Helper.prototype.classesForChart = function() {
    var dataForChart = [], tmp = 0, i, j;

    dataForChart.push([this.classes[0][0]["value"]-1,0]);
    dataForChart.push([this.classes[0][0]["value"], 0]);
    dataForChart.push([this.classes[0][0]["value"], NaN]);

    for (i = 0, len = this.classes.length-1; i < len; i++) {
        for (j = 0; j < this.classes[i].length; j++) {
            tmp += this.classes[i][j]["frequency"];
        }
        dataForChart.push([this.classes[i][0]["value"], (tmp / this.dimension)]);
        dataForChart.push([this.classes[i+1][0]["value"], (tmp / this.dimension)]);
        dataForChart.push([this.classes[i+1][0]["value"], NaN]);
    }

    dataForChart.push([this.classes[this.classes.length-1][0]["value"], NaN]);
    dataForChart.push([this.classes[this.classes.length-1][0]["value"], 1]);
    dataForChart.push([this.classes[this.classes.length-1][this.classes[this.classes.length-1].length-1]["value"], 1]);

    return dataForChart;
};

// рисуем гистограмму
Helper.prototype.drawHistogram = function(canvas) {
    google.charts.load("current", {packages:['corechart']});

    var dataForChart = [], tmp = 0;
    dataForChart.push(["Element", "", { role: "annotation" } ]);
    for (var i = 0; i < this.classes.length; i++) {
        for (var j = 0; j < this.classes[i].length; j++) {
            tmp += this.classes[i][j]["frequency"];
        }
        dataForChart.push(["[" + this.classes[i][0]["value"] + ", " + this.classes[i][this.classes[i].length-1]["value"] + "]",
            (tmp / this.dimension), (tmp / this.dimension)]);
        tmp = 0;
    }

    google.charts.setOnLoadCallback(drawH);

    function drawH() {
        var data = google.visualization.arrayToDataTable(dataForChart);

        var options = {
            title: "Гистограмма",
            width: "95%",
            height: 400,
            bar: {groupWidth: "100%"},
            legend: "none"
        };
        var chart = new google.visualization.ColumnChart(canvas);
        chart.draw(data, options);
    }
};

// рисуем график емпирической функции распределения
Helper.prototype.drawCharts = function(canvas, type) {
    google.charts.load("current", {packages:['corechart']});

    var dataForChart,
        options = {
            width: "95%",
            height: 400,
            bar: {groupWidth: "100%"},
            legend: "none"
        };

    if (type.search( /varRow/i ) >= 0) {
        dataForChart = this.varRowForChart();
        options.title = "Емпирическая функция распеределения, построенная по вариационному ряду";
    } else if (type.search( /classes/i ) >= 0) {
        dataForChart = this.classesForChart();
        options.title = "Емпирическая функция распределения, построенная по классам";
    }

    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
        var data = new google.visualization.DataTable();

        data.addColumn("number", "x");
        data.addColumn("number", "y");

        data.addRows(dataForChart);

        var chart = new google.visualization.LineChart(canvas);
        chart.draw(data, options);
    }
};

// пишем характеристики выборки в таблицу
Helper.prototype.insertCharacterictics = function(table) {
    table.append("<tr><td>Среднее арифметическое</td><td>" + this.average().toFixed(4) + "</td>" +
        "<td>" + this.rMsAverage().toFixed(4) + "</td>" +
        "<td>" + "[" + (this.average() - this.U()*this.rMsAverage()).toFixed(4) + ", " +
        + (this.average() + this.U()*this.rMsAverage()).toFixed(4) + "]" + "</td></tr>");

    table.append("<tr><td>Медиана</td><td>" + this.median().toFixed(4) +
        "</td><td>-</td><td>-</td></tr>");

    table.append("<tr><td>Среднеквадратическое</td><td>" + this.rMS().toFixed(4) +
        "</td><td>" + this.rMsRMS().toFixed(4) + "</td>" +
        "<td>" + "[" + (this.rMS() - this.U()*this.rMsRMS()).toFixed(4) + ", " +
        + (this.rMS() + this.U()*this.rMsRMS()).toFixed(4) + "]" + "</td></tr>");

    table.append("<tr><td>Коэффициент ассиметрии</td><td>" + this.coefAsymmetry().toFixed(4) +
        "</td><td>" + this.rMsCoefAsymmetry().toFixed(4) + "</td>" +
        "<td>" + "[" + (this.coefAsymmetry() - this.U()*this.rMsCoefAsymmetry()).toFixed(4) + ", " +
        + (this.coefAsymmetry() + this.U()*this.rMsCoefAsymmetry()).toFixed(4) + "]" + "</td></tr>");

    table.append("<tr><td>Коэффициент эксцесса</td><td>" + this.coefExcess().toFixed(4) +
        "</td><td>" + this.rMsCoefExcess().toFixed(4) + "</td>" +
        "<td>" + "[" + (this.coefExcess() - this.U()*this.rMsCoefExcess()).toFixed(4) + ", " +
        + (this.coefExcess() + this.U()*this.rMsCoefExcess()).toFixed(4) + "]" + "</td></tr>");

    table.append("<tr><td>Коэффициент контрэксцесса</td><td>" + this.coefContrExcess().toFixed(4) +
        "</td><td>" + this.rMsCoefContrExcess().toFixed(4) + "</td>" +
        "<td>" + "[" + (this.coefContrExcess() - this.U()*this.rMsCoefContrExcess()).toFixed(4) + ", " +
        + (this.coefContrExcess() + this.U()*this.rMsCoefContrExcess()).toFixed(4) + "]" + "</td></tr>");

    table.append("<tr><td>Коэффициент вариации</td><td>" + this.coefVariation().toFixed(4) +
        "</td><td>" + this.rMsCoefVariation().toFixed(4) + "</td>" +
        "<td>" + "[" + (this.coefVariation() - this.U()*this.rMsCoefVariation()).toFixed(4) + ", " +
        + (this.coefVariation() + this.U()*this.rMsCoefVariation()).toFixed(4) + "]" + "</td></tr>");
};