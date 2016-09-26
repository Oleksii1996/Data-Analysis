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

        for (var i = 0; i < data.length; i++) {
            data[i] = +data[i];
        }
        data = data.sort(function(a, b) { // По возрастанию
            if (a > b)
                return 1;
            else if (a < b)
                return -1;
            else
                return 0;
        });

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
            // накапливаем в tmp значения относительных частот для подсчета
            // емпирической функции распределения
            tmp += data[i][1] / dimension;
            $("#tr" + i).append("<td>" + data[i][0] + "</td><td>" + data[i][1] + "</td><td>"
                + (data[i][1] / dimension).toFixed(4) + "</td><td>" + tmp.toFixed(4) + "</td>");
        }
    });

    // разбивка вариационного ряда на классы и запись их в таблицу
    window.$("#buildClasses").click(function () {
        var numberClasses = 0, tmp = 0, tmp2 = 0, h;

        if ((dimension % 2) != 0) {
            numberClasses++;
        }
        if (dimension <= 100) {
            numberClasses = Math.trunc(Math.sqrt(dimension));
        } else {
            numberClasses = Math.trunc(Math.cbrt(dimension));
        }

        // h - длинна каждого отрезка
        h = (data[data.length-1][0] - data[0][0]) / numberClasses;

        var j = 0;
        //
        for (var i = 0; i < numberClasses; i++) {
            classes[i] = [];
            while(data[j][0] <= (data[0][0] + (i+1)*h)) {
                classes[i].push(data[j]);
                if (j < data.length-1) {
                    j++;
                } else {
                    break;
                }
            }
        }

        // пишем в таблицу классы, tmp - накапливает частотность класса,
        // tmp2 - накапливает значения для построения емпирической функции распределения
        var table = $("#classes");
        for (i = 0; i < numberClasses; i++) {
            for (j = 0; j < classes[i].length; j++) {
                // сумируем частоты каждого элемента в классе
                tmp += classes[i][j][1];

                tmp2 += classes[i][j][1];
            }

            table.append("<tr><td>" + (i+1) + "</td><td>[" + classes[i][0][0] + ", " + classes[i][classes[i].length-1][0] +
                "]</td><td>" + tmp.toFixed(4) + "</td><td>" + (tmp / dimension).toFixed(4) + "</td><td>" +
                (tmp2 / dimension).toFixed(4) + "</td></tr>");
            // сбрасываем значения tmp для подсчета новой частоты нового класса на следующей итерации
            tmp = 0;
        }
    });

    // рисуем гистограмму и графики
    window.$("#drawCharts").click(function() {
        google.charts.load("current", {packages:['corechart']});
        google.charts.setOnLoadCallback(drawChart);


        var dataForChart = [], tmp = 0;
        dataForChart.push(["Element", "", { role: "style" } ]);
        for (var i = 0; i < classes.length; i++) {
            for (var j = 0; j < classes[i].length; j++) {
                tmp += classes[i][j][1];
            }
            dataForChart.push(["", (tmp / dimension), ""]);
            tmp = 0;
        }

        function drawChart() {
            var data = google.visualization.arrayToDataTable(dataForChart);

            var view = new google.visualization.DataView(data);
            view.setColumns([0, 1,
                {
                    calc: "stringify",
                    sourceColumn: 1,
                    type: "string",
                    role: "annotation"
                },
                2]);

            var options = {
                title: "Гистограмма",
                width: "95%",
                height: 400,
                bar: {groupWidth: "95%"},
                legend: {position: "none"},
            };
            var chart = new google.visualization.ColumnChart(document.getElementById("divForChart"));
            chart.draw(view, options);
        }
    });

})();