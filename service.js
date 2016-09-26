(function() {

    // data - исходный массив данных(выборка), dimension - размерность выборки,
    // classes - разбитый на классы вариационный ряд
    var data, dimension, classes = [];

    window.loadFile = function(files) {
        var file = files[0],
            reader = new FileReader();

        reader.onload = function (e) {
            data = e.target.result;
            data = data.split("\n");

            insertGivenData();
        };
        reader.readAsText(file);
    }

    // вставляем исходную выборку в таблицу
    function insertGivenData() {
        dimension = data.length;
        var table = $("#table");
        for (var i = 0, len = data.length; i < len; i++) {
            table.append("<tr id='tr" + i + "'><td>" + (i + 1) + "</td><td>" + data[i] + "</td></tr>>");
        }
    }

    // перестраиваем исходную выборку в вариационный ряд вида data[варианта][частота варианты]
    // дописываем полученные данные в таблицу
    window.$("#buildVarRow").click(function() {
        var tmp, j;

        data = data.sort();

        // перестраиваем выборку в вариационный ряд
        for (var i = 0; i < data.length; i++) {
            tmp = data[i];
            data[i] = [];
            data[i].push(tmp);
            data[i].push(1);

            // убираем найденные равные значения
            j = i + 1;
            while (j < data.length) {
                if (data[i][0] == data[j]) {
                    data.splice(j, 1);
                    data[i][1]++;
                    continue;
                } else {
                    j++;
                }
            }
        }

        tmp = 0;
        var table = $("#table");

        // дописываем таблицу
        for (i = 0, len = data.length; i < len; i++) {
            if (i == 0) {
                tmp = 0;
            } else {
                tmp += data[i - 1][1] / dimension;
            }
            $("#tr" + i).append("<td>" + data[i][0] + "</td><td>" + data[i][1] + "</td><td>"
                + (data[i][1] / dimension).toFixed(4) + "</td><td>" + tmp.toFixed(4) + "</td>");
        }
    });

    //
    window.$("#buildClasses").click(function () {
        var numberClasses = 0, tmp = 0;//, h = 0;
        if ((dimension % 2) != 0) {
            numberClasses++;
        }
        if (dimension <= 100) {
            numberClasses = Math.trunc(Math.sqrt(dimension));
        } else {
            numberClasses = Math.trunc(Math.cbrt(dimension));
        }
        //h = (data[0][0] - data[data.length-1][0]) / numberClasses;

        var j = 0;
        //
        for (var i = 0; i < numberClasses; i++) {
            classes[i] = [];
            tmp = j;
            for (; j < (data.length / numberClasses) + tmp; j++) {
                classes[i].push(data[j]);
            }
        }

        //
        tmp = 0;
        var table = $("#classes"), tmp2 = 0;
        for (i = 0; i < numberClasses; i++) {
            // сумируем частоты каждого элемента в классе
            for (j = 0; j < numberClasses; j++) {
                tmp += classes[i][j][1];
                if (i != 0) {
                    tmp2 += classes[i][j][1];
                }
            }
            table.append("<tr><td>" + (i+1) + "</td><td>[" + classes[i][0][0] + ", " + classes[i][numberClasses-1][0] +
                "]</td><td>" + tmp + "</td><td>" + (tmp / dimension) + "</td><td>" + (tmp2 / dimension) + "</td></tr>");
            tmp = 0;
        }
    });

    //
    window.$("#drawCharts").click(function() {
        google.charts.load("current", {packages:['corechart']});
        google.charts.setOnLoadCallback(drawChart);


        var d = [], tmp = 0;
        d.push(["Element", "", { role: "style" } ]);
        for (var i = 0; i < classes.length; i++) {
            for (var j = 0; j < classes.length; j++) {
                tmp += classes[i][j][1];
            }
            d.push(["", (tmp / dimension), ""]);
            tmp = 0;
        }

        function drawChart() {
            var data2 = google.visualization.arrayToDataTable(/*[
                ["Element", "", { role: "style" } ],
                ["", +data[0][0], ""],
                ["", +data[1][0], ""],
                ["", +data[2][0], ""],
                ["", +data[3][0], ""]*/d
            /*]*/);

            var view = new google.visualization.DataView(data2);
            view.setColumns([0, 1,
                {
                    calc: "stringify",
                    sourceColumn: 1,
                    type: "string",
                    role: "annotation"
                },
                2]);

            var options = {
                title: "Density of Precious Metals, in g/cm^3",
                width: "95%",
                height: 400,
                bar: {groupWidth: "95%"},
                legend: {position: "none"},
            };
            var chart = new google.visualization.ColumnChart(document.getElementById("chart_div"));
            chart.draw(view, options);
        }
    });

})();