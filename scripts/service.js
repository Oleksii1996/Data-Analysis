$(document).ready(function() {

    var dataObj,
        releyObj,
        tableForVarRow,
        tableForClasses = $("#classes").html(),
        tableForCharacteristics = $("#characterictics").html();

    $("#input").on("change", function() {
        var file = this.files[0],
            reader = new FileReader();

        reader.onload = function (e) {
            var result = e.target.result;
            result = result.split("\n");

            dataObj = new Helper(result);
            dataObj.insertBasicData($("#table"));
            tableForVarRow = $("#table").html();
        };
        reader.readAsText(file);
    });

    $("#buildVarRow").click(function() {
        $("#table").html(tableForVarRow);
        dataObj.insertVarRow($("#table"));
        $(".unVisible").removeClass("unVisible");
    });

    $("#buildClasses").click(function () {
        $("#classes").html(tableForClasses);
        dataObj.insertClasses($("#classes"), $("#numberClasses").val());
        $("#numberClasses").val("");
    });

    $("#drawCharts").click(function() {
        $("#divForHistogram").html("");
        $("#divForChartVarRow").html("");
        $("#divForChartClasses").html("");
        dataObj.drawCharts(document.getElementById("divForHistogram"), "histogram");
        dataObj.drawCharts(document.getElementById("divForChartVarRow"), "varrow");
        dataObj.drawCharts(document.getElementById("divForChartClasses"), "classes");
    });

    $("#buildCharacterictics").click(function() {
        $("#characterictics").html(tableForCharacteristics);
        dataObj.insertCharacterictics($("#characterictics"));
    });

    $("#removeAnomalies").click(function() {
        dataObj.removeAnomalies();
        $("#buildVarRow").click();
        $("#buildClasses").click();
        $("#drawCharts").click();
        $("#buildCharacterictics").click();
        window.scrollTo(0, 0);
    });

    $("#drawProbabilisticGrid").click(function() {
        if (releyObj == undefined) {
            releyObj = new Reley(dataObj.buildDataForReley(), 0.01);
        }
        releyObj.drawChart(document.getElementById("divForProbabilisticGrid"));
    });

    $("#buildReleyParametr").click(function() {
        if (releyObj == undefined) {
            releyObj = new Reley(dataObj.buildDataForReley(), 20);
        }
        releyObj.insertReleyParametr($("#releyParametr"));
    });

    $("#drawReleyDensity").click(function() {
        if (releyObj == undefined) {
            releyObj = new Reley(dataObj.buildDataForReley(), 20);
        }
        releyObj.drawDensityOnHistogram(dataObj.histogramForChart(), document.getElementById("releyDensity"));
    });
});