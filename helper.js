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
};

// дописываем полученные данные в таблицу
Helper.prototype.insertVarRow = function(table) {
    this.buildVarRow();

    var tmp = 0;

    // дописываем таблицу
    for (var i = 0, len = this.data.length; i < len; i++) {
        // накапливаем в tmp значения относительных частот для подсчета
        // емпирической функции распределения
        tmp += this.data[i][1] / this.dimension;
        table.children($("#tr" + i).append("<td>" + this.data[i][0] + "</td><td>" + this.data[i][1] + "</td><td>"
            + (this.data[i][1] / this.dimension).toFixed(4) + "</td><td>" + tmp.toFixed(4) + "</td>"));
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
            tmp += this.classes[i][j][1];

            tmp2 += this.classes[i][j][1];
        }

        table.append("<tr><td>" + (i+1) + "</td>" +
            "<td>[" + this.classes[i][0][0] + ", " + this.classes[i][this.classes[i].length-1][0] + "]</td>" +
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

    dataForChart.push([this.data[0][0]-1,0]);
    dataForChart.push([this.data[0][0], 0]);
    dataForChart.push([this.data[0][0], NaN]);

    for (i = 0, len = this.data.length-1; i < len; i++) {
        tmp += this.data[i][1];

        dataForChart.push([this.data[i][0], (tmp / this.dimension)]);
        dataForChart.push([this.data[i+1][0], (tmp / this.dimension)]);
        dataForChart.push([this.data[i+1][0], NaN]);
    }

    dataForChart.push([this.data[this.data.length-1][0], NaN]);
    dataForChart.push([this.data[this.data.length-1][0], 1]);
    dataForChart.push([this.data[this.data.length-1][0]+1, 1]);

    return dataForChart;
};

// формируем данные для графика из классов
Helper.prototype.classesForChart = function() {
    var dataForChart = [], tmp = 0, i, j;

    dataForChart.push([this.classes[0][0][0]-1,0]);
    dataForChart.push([this.classes[0][0][0], 0]);
    dataForChart.push([this.classes[0][0][0], NaN]);

    for (i = 0, len = this.classes.length-1; i < len; i++) {
        for (j = 0; j < this.classes[i].length; j++) {
            tmp += this.classes[i][j][1];
        }
        dataForChart.push([this.classes[i][0][0], (tmp / this.dimension)]);
        dataForChart.push([this.classes[i+1][0][0], (tmp / this.dimension)]);
        dataForChart.push([this.classes[i+1][0][0], NaN]);
    }

    dataForChart.push([this.classes[this.classes.length-1][0][0], NaN]);
    dataForChart.push([this.classes[this.classes.length-1][0][0], 1]);
    var t = this.classes[this.classes.length-1], t2 = t[t.length-1][0];
    dataForChart.push([t2 + 1, 1]);

    return dataForChart;
};

// рисуем гистограмму
Helper.prototype.drawHistogram = function(canvas) {
    google.charts.load("current", {packages:['corechart']});
    google.charts.setOnLoadCallback(drawH);


    var dataForChart = [], tmp = 0;
    dataForChart.push(["Element", "", { role: "annotation" } ]);
    for (var i = 0; i < this.classes.length; i++) {
        for (var j = 0; j < this.classes[i].length; j++) {
            tmp += this.classes[i][j][1];
        }
        dataForChart.push(["[" + this.classes[i][0][0] + ", " + this.classes[i][this.classes[i].length-1][0] + "]",
            (tmp / this.dimension), (tmp / this.dimension)]);
        tmp = 0;
    }

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
    google.charts.setOnLoadCallback(drawChart);

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
        "<td></td></tr>");

    table.append("<tr><td>Медиана</td><td>" + this.median().toFixed(4) +
        "</td><td>-</td><td>-</td></tr>");

    table.append("<tr><td>Среднеквадратическое</td><td>" + this.rMS().toFixed(4) +
        "</td><td>" + this.rMsRMS().toFixed(4) + "</td>" +
        "<td></td></tr>");

    table.append("<tr><td>Коэффициент ассиметрии</td><td>" + this.coefAsymmetry().toFixed(4) +
        "</td><td>" + this.rMsCoefAsymmetry().toFixed(4) + "</td><td></td></tr>");

    table.append("<tr><td>Коэффициент эксцесса</td><td>" + this.coefExcess().toFixed(4) +
        "</td><td>" + this.rMsCoefExcess().toFixed(4) + "</td><td></td></tr>");

    table.append("<tr><td>Коэффициент контрэксцесса</td><td>" + this.coefContrExcess().toFixed(4) +
        "</td><td>" + this.rMsCoefContrExcess().toFixed(4) + "</td><td></td></tr>");

    table.append("<tr><td>Коэффициент вариации</td><td>" + this.coefVariation().toFixed(4) +
        "</td><td>" + this.rMsCoefVariation().toFixed(4) + "</td><td></td></tr>");
};