(function() {

    // data - исходный массив данных(выборка), dimension - размерность выборки
    var data, dimension;

    window.loadFile = function(files) {
        var file = files[0],
            reader = new FileReader();

        reader.onload = function (e) {
            data = e.target.result;
            data = data.split("\n");

            buildTable();
        };
        reader.readAsText(file);
    }

    // перестраиваем исходную выборку в вариационный ряд вида data[варианта][частота варианты]
    // выводим полученные данные в таблицу
    function buildTable() {

        var tmp, tmpArr = [], j;

        // копируем и храним исходную выборку для красивого вывода в таблицу
        for (var i = 0, len = data.length; i < len; i++) {
            tmpArr.push(data[i]);
        }

        dimension = data.length;

        data = data.sort();

        // перестраиваем выборку в вариационный ряд
        for (i = 0; i < data.length; i++) {
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
        // выводим результаты в таблицу
        for (i = 0, len = tmpArr.length; i < len; i++) {
            if (i < data.length) {

                if (i == 0) {
                    tmp = 0;
                } else {
                    tmp += data[i - 1][1] / dimension;
                }

                $("#table").append("<tr><td>" + (i + 1) + "</td><td>" + tmpArr[i] + "</td>"
                    + "<td>" + data[i][0] + "</td>" + "<td>" + data[i][1] + "</td>" + "<td>"
                    + (data[i][1] / dimension).toFixed(4) + "</td><td>" + tmp.toFixed(4) + "</td></tr>");

            } else {
                $("#table").append("<tr><td>" + (i + 1) + "</td><td>" + tmpArr[i] + "</td></tr>");
            }
        }
    }

    //
    window.$("#buildClasses").click(function () { debugger;
        var numberClasses = 0;
        if ((dimension % 2) != 0) {
            numberClasses++;
        }
        if (dimension <= 100) {
            numberClasses = Math.trunc(Math.sqrt(dimension));
        } else {
            numberClasses = Math.trunc(Math.cbrt(dimension));
        }
        alert(numberClasses);
        alert(data);
    });

})();