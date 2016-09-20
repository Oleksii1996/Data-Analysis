
var res;

function loadFile(files) {
    var file = files[0],
        reader = new FileReader();

    reader.onload = function (e) {
        res = e.target.result;
        res = res.split("\n");
        for (var i = 0, len = res.length; i < len; i++) {
            $("#table").append("<tr><td>" + (i+1) + "</td><td>" + res[i] + "</td></tr>");
        }
    };
    reader.readAsText(file);
}

$("#buildVarRow").click(function() {
    debugger;
    res = res.sort();
    for (var i = 0, len = res.length; i < len; i++) {
        $("#tr" + i).append("<td>" + res[i] + "</td>");
    }
});