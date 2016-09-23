(function() {

    // data - исходный массив данных(выборка), dimension - размерность выборки
    var data, dimension;

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
            $("#tr" + i).append("<td>" + data[i][0] + "</td>" + "<td>" + data[i][1] + "</td>" + "<td>"
                + (data[i][1] / dimension).toFixed(4) + "</td><td>" + tmp.toFixed(4) + "</td>");
        }
    });

    //
    window.$("#buildClasses").click(function () {
        var numberClasses = 0;
        if ((dimension % 2) != 0) {
            numberClasses++;
        }
        if (dimension <= 100) {
            numberClasses = Math.trunc(Math.sqrt(dimension));
        } else {
            numberClasses = Math.trunc(Math.cbrt(dimension));
        }

        var j = 0, classes = [];
        //
        for (var i = 0; i < numberClasses; i++) {
            classes[i] = [];
            tmp = j;
            for (; j < (data.length / numberClasses) + tmp; j++) {
                classes[i].push(data[j]);
            }
        }
        debugger;
        //
        var table = $("#classes");
        for (i = 0; i < numberClasses; i++) {
            table.append("<tr><td>" + (i+1) + "</td><td>[" + classes[i][0][0] + ", " + classes[i][numberClasses-1][0] +
                "]</td><td></td><td></td><td></td></tr>")
        }
    });

})();