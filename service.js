$(document).ready(function() {

    var dataObj;

    $("#input").on("change", function() {
        var file = this.files[0],
            reader = new FileReader();

        reader.onload = function (e) {
            var result = e.target.result;
            result = result.split("\n");

            dataObj = new Data(result);
            dataObj.insertBasicData($("#table"));
        };
        reader.readAsText(file);
    });

    $("#buildVarRow").click(function() {
        dataObj.buildVarRow();
        $(".unVisible").removeClass("unVisible");
    });

    $("#buildClasses").click(function () {
        dataObj.buildClasses($("#classes"));
    });

    $("#drawCharts").click(function() {
        dataObj.drawHistogram(document.getElementById("divForHistogram"));
        dataObj.drawCharts(document.getElementById("divForChartVarRow"), "varrow");
        dataObj.drawCharts(document.getElementById("divForChartClasses"), "classes");
    });

    $("#buildCharacterictics").click(function() {
        dataObj.buildCharacterictics($("#characterictics"));

    });
});