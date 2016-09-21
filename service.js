// data - исходный массив данных(выборка), dimension - размерность выборки
var data, dimension;

function loadFile(files) {
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

    // выводим результаты в таблицу
    for (var i = 0, len = tmpArr.length; i < len; i++) {
        if (i < data.length) {
            $("#table").append("<tr><td>" + (i + 1) + "</td><td>" + tmpArr[i] + "</td>"
            + "<td>" + data[i][0] + "</td>" + "<td>" + data[i][1] + "</td>" + "<td>"
                + (data[i][1] / dimension) + "</td></tr>");
        } else {
            $("#table").append("<tr><td>" + (i + 1) + "</td><td>" + tmpArr[i] + "</td></tr>");
        }
    }
}