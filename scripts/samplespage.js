$(function () {
    if (location.href.indexOf('dashboard') == -1) {
        var firsample = window.findSampleIndex(location.href.split("#")[1]);
		App.activePage.find("#splitview").ejmSplitPane("loadContent", samples[firsample-1].url, {
            reload: false,
            documenturl: "#"+samples[firsample-1].querystring,
            type: "get",
            title: samples[firsample-1].name,
            transition: "none"
        });
		 App.activePage.find(".e-m-toolbar .e-m-tbcontainer .e-m-backactionbar").bind("click", goback);
		 $(App.activePage.find("#listbox li")[firsample-1]).addClass("e-m-state-active").removeClass("e-m-state-default");
		$(document).delegate(App.activePage,"viewtransfer",transfer);
    }
});