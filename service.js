(function() {

    var dataObj;

    window.loadFile = function(files) {
        var file = files[0],
            reader = new FileReader();

        reader.onload = function (e) {
            var result = e.target.result;
            result = result.split("\n");

            dataObj = new Data(result);
            dataObj.insertBasicData($("#table"));
        };
        reader.readAsText(file);
    }

    window.$("#buildVarRow").click(function() {
        dataObj.buildVarRow();
    });

    window.$("#buildClasses").click(function () {
        dataObj.buildClasses($("#classes"));
    });

    window.$("#drawCharts").click(function() {
        dataObj.drawCharts();
    });

    //
    window.$("#buildCharacterictics").click(function() {
        var table = $("#characterictics");

    });

})();