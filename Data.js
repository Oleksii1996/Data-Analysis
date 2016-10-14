//
function Data(data) {
    // data - исходный массив данных(выборка), dimension - размерность выборки,
    // classes - разбитый на классы вариационный ряд
    this.data = data, this.dimension = data.length, this.classes = [];
}

// записывает полученные данные в таблицу
Data.prototype.insertBasicData = function(table) {
    for (var i = 0, len = this.data.length; i < len; i++) {
        table.append("<tr id='tr" + i + "'><td>" + (i + 1) + "</td><td>" + this.data[i] + "</td></tr>>");
    }
}

// перестраиваем исходную выборку в вариационный ряд вида data[варианта][частота варианты]
// дописываем полученные данные в таблицу
Data.prototype.buildVarRow = function() {
    var tmp, j;

    for (var i = 0, len = this.data.length; i < len; i++) {
        this.data[i] = +this.data[i];
    }
    // сортировка по возрастанию
    this.data = this.data.sort(function(a, b) {
        if (a > b)
            return 1;
        else if (a < b)
            return -1;
        else
            return 0;
    });

    // перестраиваем выборку в вариационный ряд
    for (var i = 0; i < this.data.length; i++) {
        tmp = this.data[i];
        this.data[i] = [];
        this.data[i].push(tmp);
        this.data[i].push(1);

        // убираем найденные равные значения
        j = i + 1;
        while (j < this.data.length) {
            if (this.data[i][0] == this.data[j]) {
                this.data.splice(j, 1);
                this.data[i][1]++;
                continue;
            } else {
                j++;
            }
        }
    }

    tmp = 0;
    // дописываем таблицу
    for (i = 0, len = this.data.length; i < len; i++) {
        // накапливаем в tmp значения относительных частот для подсчета
        // емпирической функции распределения
        tmp += this.data[i][1] / this.dimension;
        $("#tr" + i).append("<td>" + this.data[i][0] + "</td><td>" + this.data[i][1] + "</td><td>"
            + (this.data[i][1] / this.dimension).toFixed(4) + "</td><td>" + tmp.toFixed(4) + "</td>");
    }
}

// разбивка вариационного ряда на классы и запись их в таблицу
Data.prototype.buildClasses = function(table) {
    var numberClasses = 0, tmp = 0, tmp2 = 0, h;

    if ((this.dimension % 2) != 0) {
        numberClasses++;
    }
    if (this.dimension <= 100) {
        numberClasses = Math.trunc(Math.sqrt(this.dimension));
    } else {
        numberClasses = Math.trunc(Math.cbrt(this.dimension));
    }

    // h - длинна каждого отрезка
    h = (this.data[this.data.length-1][0] - this.data[0][0]) / numberClasses;

    var j = 0;
    // добавление элементов в классы
    for (var i = 0; i < numberClasses; i++) {
        this.classes[i] = [];
        while (this.data[j][0] <= (this.data[0][0] + (i+1)*h)) {
            this.classes[i].push(this.data[j]);
            if (j < this.data.length-1) {
                j++;
            } else {
                break;
            }
        }
    }

    // пишем в таблицу классы, tmp - накапливает частотность класса,
    // tmp2 - накапливает значения для построения емпирической функции распределения
    for (i = 0; i < numberClasses; i++) {
        for (j = 0; j < this.classes[i].length; j++) {
            // сумируем частоты каждого элемента в классе
            tmp += this.classes[i][j][1];

            tmp2 += this.classes[i][j][1];
        }

        table.append("<tr><td>" + (i+1) + "</td><td>[" +
            this.classes[i][0][0] + ", " + this.classes[i][this.classes[i].length-1][0] +
            "]</td><td>" + tmp.toFixed(4) + "</td><td>" + (tmp / this.dimension).toFixed(4) + "</td><td>" +
            (tmp2 / this.dimension).toFixed(4) + "</td></tr>");
        // сбрасываем значения tmp для подсчета новой частоты нового класса на следующей итерации
        tmp = 0;
    }
}

// строим характеристики выборки и пишем их в таблицу
Data.prototype.buildCharacterictics = function(table) {
    table.append("<tr><td>Среднее арифметическое</td><td>" + this.average().toFixed(4) + "</td>" +
        "<td>" + 0 + "</td>" +
        "<td></td></tr>");

    table.append("<tr><td>Медиана</td><td>" + this.median().toFixed(4) +
        "</td><td>-</td><td>-</td></tr>");

    table.append("<tr><td>Среднеквадратическое</td><td>" + this.rMS().toFixed(4) +
        "</td><td>" + (this.rMS() - this.average()).toFixed(4) + "</td>" +
        "<td></td></tr>");

    table.append("<tr><td>Коэффициент ассиметрии</td><td>" + this.coefAsymmetry().toFixed(4) +
        "</td><td>" + (this.coefAsymmetry() - this.average()).toFixed(4) + "</td><td></td></tr>");

    table.append("<tr><td>Коэффициент эксцесса</td><td>" + this.coefExcess().toFixed(4) +
        "</td><td>" + (this.coefExcess() - this.average()).toFixed(4) + "</td><td></td></tr>");

    table.append("<tr><td>Коэффициент контрэксцесса</td><td>" + this.coefContrExcess().toFixed(4) +
        "</td><td>" + (this.coefContrExcess() - this.average()).toFixed(4) + "</td><td></td></tr>");

    table.append("<tr><td>Коэффициент вариации</td><td>" + this.coefVariation().toFixed(4) +
        "</td><td>" + (this.coefVariation() - this.average()).toFixed(4) + "</td><td></td></tr>");
}

// среднее арифметическое
Data.prototype.average = function() {
    var result = 0;
    for(var i = 0, len = this.data.length; i < len; i++) {
        result += this.data[i][0] * this.data[i][1];
    }
    return (result / this.dimension);
}

// доверительный интервал среднего арифметического
Data.prototype.getAverageSegment = function() {
    return this.rMS() / Math.sqrt(this.dimension);
}

// среднеквадратическое
Data.prototype.rMS = function() {
    var result = 0, average = this.average();
    for (var i = 0, len = this.data.length; i < len; i++) {
        result += Math.pow(this.data[i][0] - average, 2) * this.data[i][1];
    }

    return Math.sqrt(result / this.dimension-1);
}

// доверительный интервал среднеквадратического
Data.prototype.getRmsSegment = function() {
    return this.rMS() / Math.sqrt(2 * this.dimension);
}

// медиана
Data.prototype.median = function() {
    var tmpData = [], i, j;
    for (i = 0, len = this.data.length; i < len; i++) {
        for (j = 0; j < this.data[i][1]; j++) {
            tmpData.push(this.data[i][0]);
        }
    }

    if (this.dimension % 2 == 1) {
        return tmpData[Math.trunc(this.dimension / 2)];
    } else {
        return (tmpData[this.dimension / 2] + tmpData[(this.dimension / 2) + 1]) / 2;
    }
}

// коэффициент ассиметрии
Data.prototype.coefAsymmetry = function() {
    var o = this.sigma(), A = 0, average = this.average(), i;

    for (i = 0, len = this.data.length; i < len; i++) {
        A += Math.pow(this.data[i][0] - average, 3) * this.data[i][1];
    }
    A = A / (this.dimension * Math.pow(o, 3));
    A = Math.sqrt(this.dimension * (this.dimension - 1)) / (this.dimension - 2) * A;
    return A;
}

// коэффициент эксцесса
Data.prototype.coefExcess = function() {
    var result = 0, average = this.average();
    for (var i = 0, len = this.data.length; i < len; i++) {
        result += Math.pow(this.data[i][0] - average, 4) * this.data[i][1];
    }
    result = result / (this.dimension * Math.pow(this.sigma(), 4));
    result = ((Math.pow(this.dimension, 2) - 1)/((this.dimension-2) * (this.dimension - 3))) * (result - 3 + 6 * (this.dimension + 1));
    return result;
}

// коэффициент контрэксцесса
Data.prototype.coefContrExcess = function() {
    return 1 / Math.sqrt(Math.abs(this.coefExcess()));
}

// коэффициент вариации Пирсона
Data.prototype.coefVariation = function() {
    return this.rMS() / this.average();
}

// среднеквадратичное смещенное отклонение
Data.prototype.sigma = function() {
    var o = 0, average = this.average(), i;
    for (i = 0, len = this.data.length; i < len; i++) {
        o += Math.pow(this.data[i][0], 2) * this.data[i][1] - Math.pow(average, 2);
    }
    o = Math.sqrt(o / this.dimension);
    return o;
}

// формируем данные для графика из вариационного ряда
Data.prototype.varRowForChart = function() {
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
}

// формируем данные для графика из классов
Data.prototype.classesForChart = function() {
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
}

// рисуем гистограмму
Data.prototype.drawHistogram = function(canvas) {
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
}

// рисуем график емпирической функции распределения
Data.prototype.drawCharts = function(canvas, type) {
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
}