//
function Data(data) {
    // data - исходный массив данных(выборка), dimension - размерность выборки,
    // classes - разбитый на классы вариационный ряд
    this.data = data, this.dimension = data.length, this.classes = [];
}

// перестраиваем исходную выборку в вариационный ряд вида data[варианта][частота варианты]
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

};

// разбивка вариационного ряда на классы
Data.prototype.buildClasses = function(n) {
    var numberClasses = 0, h;

    if (n != undefined && (Number(n))) {
        numberClasses = arguments[0];
    } else {
        if ((this.dimension % 2) != 0) {
            numberClasses++;
        }
        if (this.dimension <= 100) {
            numberClasses = Math.trunc(Math.sqrt(this.dimension));
        } else {
            numberClasses = Math.trunc(Math.cbrt(this.dimension));
        }
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

};

// среднее арифметическое
Data.prototype.average = function() {
    var result = 0;
    for(var i = 0, len = this.data.length; i < len; i++) {
        result += this.data[i][0] * this.data[i][1];
    }
    return (result / this.dimension);
};

// среднеквадратическое отклонеие среднего арифметического
Data.prototype.rMsAverage = function() {
    return this.rMS() / Math.sqrt(this.dimension);
};

// среднеквадратическое
Data.prototype.rMS = function() {
    var result = 0, average = this.average();
    for (var i = 0, len = this.data.length; i < len; i++) {
        result += Math.pow(this.data[i][0] - average, 2) * this.data[i][1];
    }

    return Math.sqrt(result / this.dimension-1);
};

// среднеквадратическое отклонение среднеквадратического
Data.prototype.rMsRMS = function() {
    return this.rMS() / Math.sqrt(2 * this.dimension);
};

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
};

// коэффициент ассиметрии
Data.prototype.coefAsymmetry = function() {
    var o = this.sigma(), A = 0, average = this.average(), i;

    for (i = 0, len = this.data.length; i < len; i++) {
        A += Math.pow(this.data[i][0] - average, 3) * this.data[i][1];
    }
    A = A / (this.dimension * Math.pow(o, 3));
    A = Math.sqrt(this.dimension * (this.dimension - 1)) / (this.dimension - 2) * A;
    return A;
};

// среднеквадратическое отклонение коэффициента ассиметрии
Data.prototype.rMsCoefAsymmetry = function() {
    return Math.sqrt((6 * (this.dimension - 2)) / ((this.dimension + 1) * (this.dimension + 3)));
};

// смещенный коэффициент эксцесса
Data.prototype.E = function() {
    var result = 0, average = this.average();
    for (var i = 0, len = this.data.length; i < len; i++) {
        result += Math.pow(this.data[i][0] - average, 4) * this.data[i][1];
    }
    result /= this.dimension * Math.pow(this.sigma(), 4);
    return result;
};

// несмещенный коэффициент эксцесса
Data.prototype.coefExcess = function() {
    return ((Math.pow(this.dimension, 2) - 1)/((this.dimension-2) * (this.dimension - 3))) * (this.E() - 3 + 6 / (this.dimension + 1));
};

// среднеквадратическое отклонение коэффициента эксцесса
Data.prototype.rMsCoefExcess = function() {
    var numerator = 24 * this.dimension * (this.dimension - 2) * (this.dimension - 3);
    var denominator = Math.pow(this.dimension + 1, 2) * (this.dimension + 3) * (this.dimension + 5);
    return Math.sqrt(numerator / denominator);
};

// коэффициент контрэксцесса
Data.prototype.coefContrExcess = function() {
    return 1 / Math.sqrt(Math.abs(this.coefExcess()));
};

// среднеквадратическое отклонение коэффициента контрэксцесса
Data.prototype.rMsCoefContrExcess = function() {
    return Math.sqrt(Math.abs(this.E()) / (29 * this.dimension)) * Math.pow(Math.pow(Math.abs(Math.pow(this.E(), 2) - 1), 3), .25);
};

// коэффициент вариации Пирсона
Data.prototype.coefVariation = function() {
    return this.rMS() / this.average();
};

//  среднеквадратическое отклонение коэффициента вариации Пирсона
Data.prototype.rMsCoefVariation = function() {
    return this.coefVariation() * Math.sqrt((1 + 2 * Math.pow(this.coefVariation(), 2)) / (2 * this.dimension));
};

// среднеквадратичное смещенное отклонение
Data.prototype.sigma = function() {
    var o = 0, average = this.average(), i;
    for (i = 0, len = this.data.length; i < len; i++) {
        o += Math.pow(this.data[i][0], 2) * this.data[i][1] - Math.pow(average, 2);
    }
    o = Math.sqrt(o / this.dimension);
    return o;
};

// квантиль t
Data.prototype.T = function() {
    var u = this.U(),
        v = 0.99,
        g1 = 0.25 * (Math.pow(u, 3) + u),
        g2 = (1 / 96) * (5*Math.pow(u, 5) + 16*Math.pow(u, 3) + 3*u),
        g3 =  (1 / 384) * (3*Math.pow(u, 7) + 19*Math.pow(u, 5) + 17*Math.pow(u, 3) - 15*u),
        g4 = (1/92160) * (79*Math.pow(u, 9) + 779*Math.pow(u, 7) + 1482*Math.pow(u, 5) - 1920*Math.pow(u, 3) - 945*u);
    return u + 1/v * g1 + 1/Math.pow(v,2) * g2 + 1/Math.pow(v,3) * g3 + 1/Math.pow(v,4)*g4;
};

// квантиль Up
Data.prototype.U = function() {
    var c0 = 2.515517,
        c1 = 0.802853,
        c2 = 0.010328,
        d1 = 1.432788,
        d2 = 0.1892659,
        d3 = 0.001308,
        a = 0.05,
        t = Math.sqrt(-2 * Math.log(a));

    return (-t + (c0 + c1*t + c2*Math.pow(t, 2)) / (1 + d1*t + d2*Math.pow(t, 2) + d3*Math.pow(t, 3)));
};