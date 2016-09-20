
function loadFile(files) {
    alert('Alex LOH');
    var file = files[0];
    var reader = new FileReader();

    reader.onload = function (e) {
        var p = document.createElement("p");
        p.textContent = e.target.result;
        document.body.appendChild(p);
    };
    reader.readAsText(file);
}