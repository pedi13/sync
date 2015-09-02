$(function () {
    var canvas = document.createElement('canvas');
    var errMsg = "<div class='err-msg'><h1 class='err-heading'>Essential JavaScript Mobile</h1><br /> <p class='err-info'>Please use a web-kit based browser to view the mobile samples. All our controls have been tested to work properly on Windows Phone, Windows RT, iOS and Android devices but there are some problems emulating mobile screens within Internet explorer so the defects that you see within the emulators are due to issues with Internet explorer and not in the controls themselves.</p></div>";
    if (!canvas.getContext || (ej.browserInfo()["name"] == "msie" && parseInt(ej.browserInfo()["version"]) < 9.0)) {
        $(document.body).children("div").css("display", "none");
        $(document.body).prepend(errMsg);
        $(document.body).css("background-color", "white");
    }
});