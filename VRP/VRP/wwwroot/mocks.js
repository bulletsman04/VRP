window.addEventListener('load', Initialize);

function Initialize() {
    for (var i = 0; i < 10; i++) {
    //AddMockPackage();

    }
}


function AddMockPackage() {

    var item = new Object;
    item.id = 1;
    item.name = "paczka1";
    item.x = 5;
    item.y = 10;

    var clone = $("#package-template").clone();
    var content = clone.prop('content');
    var pack = $(content).find("#package");
    pack.attr("id", "package" + item.id);
    $(content).find("#package-name").html(item.name);
    $(content).find("#package-x").html(item.x);
    $(content).find("#package-y").html(item.y);
    //$(content).find("#center").click(packageManager.editItem.bind(packageManager, item.id));
    $(content).find("#center").attr("id", "center" + item.id);
    //$(content).find("#remove").click(packageManager.removeItem.bind(packageManager, item.id));
    $(content).find("#remove").attr("id", "remove" + item.id);
    $("#packages").append(pack);

}