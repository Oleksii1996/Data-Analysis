$(document).ready(function() {

    var dataObj;

    $("#input").on("change", function() {
        var file = this.files[0],
            reader = new FileReader();

        reader.onload = function (e) {
            var result = e.target.result;
            result = result.split("\n");

            dataObj = new Helper(result);
            dataObj.insertBasicData($("#table"));
        };
        reader.readAsText(file);
    });

    $("#buildVarRow").click(function() {
        dataObj.insertVarRow($("#table"));
        $(".unVisible").removeClass("unVisible");
    });

    $("#buildClasses").click(function () {
        dataObj.insertClasses($("#classes"), $("#numberClasses").val());
    });

    $("#drawCharts").click(function() {
        dataObj.drawHistogram(document.getElementById("divForHistogram"));
        dataObj.drawCharts(document.getElementById("divForChartVarRow"), "varrow");
        dataObj.drawCharts(document.getElementById("divForChartClasses"), "classes");
    });

    $("#buildCharacterictics").click(function() {
        dataObj.insertCharacterictics($("#characterictics"));
    });
});