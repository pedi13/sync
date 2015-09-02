App.renderEJMControlsByDef = false;
App.preventWindowsAccentColor = true;
ej.support.stableSort = false;
var sampleIndex = null;
window.currentPage = 1;
//For phone layout mapping fields to listbox
window.parentFields = {
    "text": "text",
    "imageClass": "ImageClasses"
}
//Finds the sample given the category or Sample or subchild(true/false) and returns a json of the found sample(s)
var findSample = function (sample, subchild) {
    if (sample) {
        var query = ej.Query().using(ej.DataManager(sampleslist))
        .where("text", "==", sample, true).sortBy("text");
        res = query.executeLocal();
        if (res.length) res = res[0];
        if (subchild)
            res = res.samples;
        return res;
    }

}
//returns current sample index 
var findSampleIndex = function (key) {
    var samplesq = findSample(window.control, true);
    var query = ej.Query().using(ej.DataManager(samplesq))
            .where("Url", "==", key + ".html", true), res;
    res = query.executeLocal();
    return res.length == 0 ? 0 : ($(samplesq).index($(res)));
}
var findControlIndex = function (key) {
    var query = ej.Query().using(ej.DataManager(sampleslist)).where("text", "==", key, true), res;
    res = query.executeLocal();
    return res.length == 0 ? 0 : ($(sampleslist).index($(res)));
}
//To show dashboard samples
function showdashboard(args) {
    switch (args.text) {
        case "Health Tracker":
            App.transferPage(App.activePage, "dashboard/healthtracker/healthtracker.html");
            break;
        case "Expense Analysis":
            App.transferPage(App.activePage, "dashboard/expenseanalysis/expenseanalysis.html");
            break;
        case "Sales Overview":
            App.transferPage(App.activePage, "dashboard/salesdashboard/salesdashboard.html");
            break;
        case "Stock Analysis":
            App.transferPage(App.activePage, "dashboard/stockanalysis/stockanalysis.html", { showWaitingPopup: false });
            break;
    }
}
//Assigning current control name for the usage of state maintanance

//Renders the next page after tile item selection
function showSample(evt) {
    var sample = findSample(evt.text);
    window.control = sample.text.toLowerCase();
    window.samples = sample.samples;
    window.sampleLoading = true;
    App.transferPage(App.activePage, sample.Url);
}

transfer();
function transfer(evt, options) {
    window.control = window.location.pathname.split('/').pop().replace(".html", "");
    if (typeof (window.control) == "undefined" || window.control == "default.htm")
        window.control = "Accordion";

    if (location.href.indexOf('dashboard') == -1)
        window.samples = findSample(control, true);
    if (window.location.hash == "") {
        if (ej.isWindows() && $("#windowsdashboardtemplate").length) {
            var tiles = $("#windowsdashboardtemplate").render(window.dashboardlist);
            var jtiles = $(ej.getClearString(tiles));
            var dashboardtemplate = ej.buildTag("div.group");
            for (var i = 0; i < $(ej.getClearString(tiles)).length; i += 2) {
                var column = ej.buildTag("div.column", jtiles.splice(0, 2));
                dashboardtemplate.append(column);
            }
            $("#controlsgrid").removeClass("group");
            $("#controlsgridscroller").removeClass("column");
        }
        else if ($("#dashboardtemplate").length)
            var dashboardtemplate = $("#dashboardtemplate").render(window.dashboardlist);
        if ($("#dashboardtemplate").length)
            $("#topnavwrapper>div").html(dashboardtemplate);
        if ($("#tiletemplate").length)
            $("#controlsgridscroller").html(ej.isWindows() ? $("#windowstiletemplate").render(window.sampleslist) : $("#tiletemplate").render(window.sampleslist));
        if ($("#showcasetab").length)
            $("#showcasetabwrapper>div").html(ej.getRenderMode() == "ios7" ? $("#iosshowcasetab").render(window.dashboardlist) : $("#showcasetab").render(window.dashboardlist));
    }
}


$(document).bind("viewtransfer", function (evt, options) {
    if (options.initialLoading) {
        $("#abouttab").show();
        if (location.hash != "") {
            loadPane(findSampleIndex(location.hash.replace("#", "")));
            var listbox = $(App.activePage.find("#listbox")).ejmListView("instance");
            if (!listbox.getActiveItem().length) {
                listbox.setActive(findSampleIndex(location.hash.replace("#", "")));
            }
        }
        /* Aligning windows Horizontal layout*/
        if (ej.isWindows() && !ej.isMobile())
            $("#PageScroll").ejmScrollPanel({ "enableHrScroll": true });
        $("#PageScroll").ejmScrollPanel({ "target": "showcasewrapper" });
        $("#PageScroll").ejmScrollPanel("refresh");
        if (ej.isWindows()) {
            var controlstilewidth = (Math.ceil(window.sampleslist.length / 3) * ($("#controlsgrid .e-m-tile-wrapper.e-m-tile-wrapper-medium").outerWidth() + 10)) + 100;
            $("#controlstile").width(controlstilewidth)
            $(".winsamplewrap").width(controlstilewidth + $("#samplestile").outerWidth());
            $("#PageScroll").ejmScrollPanel("refresh");
        }
        else {
            $("#showcasescroll").ejmScrollPanel({ "enableVrScroll": false, "enableHrScroll": true, "targetHeight": 140, "target": "topnavwrapper", "scrollWidth": window.dashboardlist.length * ($($(".e-m-tile-wrapper-wide")[0]).width() + 30) });
            $("#showcasescroll").ejmScrollPanel("refresh");
        }
        App.container.bind("viewpopstate", function (evt, data) {
            if (ej.isWindows() && ej.isLowerResolution()) {
                $('.windrawer').css('display', 'block');
                $("#apitoolbar").show();
            }
        });
        if ($("#showcasetabwrapper").length) {
            setWidth();
        }
        if (ej.isAndroid()) {
            App.activePage.find('#aboutdialog').ejmDialog({
                templateId: "aboutcontent",
                leftButtonCaption: "Close",
                title: "About",
                buttonTap: "dialogclose",
                enableModal: true
            });
        }
        else {
            App.activePage.find('#aboutmenu').ejmMenu({
                templateId: "aboutcontent",
                renderTemplate: true,
                hide: "hidetriangle",
                showScrollbars: false,
                ios7: { title: "About", type: "normal" },
                windows: { type: "popup" },
                showOn: ej.endEvent()
            });
        }
        renderAboutIcon();
    }
    if (!ej.isCssCalc() && $(".windrawer").is(":visible"))
        $(".windrawer").addClass("e-m-safari-content");
});
$(document).bind("subviewtransfer", function (evt, a) {
    if (window.control.toLowerCase() == "grid" && location.hash.toLowerCase() == "#apis" && ej.isLowerResolution())
        $("#mobgridapi").ejmGrid("model.pageSettings.currentPage", window.currentPage);
    if (!ej.isWindows()) {
        $("input.e-m-text-input").bind("focus blur", function () {
            if ($("#healthsubscroll")) {
                window.setTimeout(function () {
                    $("#healthsubscroll").ejmScrollPanel("refresh");
                }, 50);
            }
            if ($("#expenseAddPageScroll")) {
                window.setTimeout(function () {
                    $("#expenseAddPageScroll").ejmScrollPanel("refresh");
                }, 50);
            }
        });
    }
    var hash = location.hash.replace("#", "");
    if (control == "slider" && hash == "properties") {
        ej.widget.init(App.activeSubPage);
        App.activeSubPage.find("#getval").empty();
    }
    else if (control == "rotator" && (hash == "properties")) {
        ej.widget.init(App.activeSubPage);
        $("#apis_scroll").ejmScrollPanel({ "enableVrScroll": false });
        var value = $("#apirotator").ejmRotator("model.currentItemIndex");
        $("#apislid").ejmSlider("model.value", value);
        $('#rotatorindex').html(value + 1);
    }
    if (window.control == "radialmenu") {
        var sampleID = (hash == "default") ? $("#defaultradialmenu") : $("#childradialmenu");
        var existRadial = sampleID.hasClass("e-m-radialmenu");
        if (existRadial) sampleID.ejmRadialMenu("instance")._posCenter();
    }
    if (window.control == "progressbar" && (hash == "events")) {
        App.activeSubPage.find("#value1").empty();
        $("#progressBar_eve").ejmProgress({ "value": 0, "text": "0%" });
    }
    //Expense Analysis Range Navigator Redraw for width setting
    if ($("#rangechart").length && $(a).hasClass("expenseanalysis"))
        $("#rangechart").ejRangeNavigator("redraw");

});

$(document).bind("viewbeforetransfer", function (evt, options) {
    sampleIndex = null;
    if ($(options.toPage).hasClass("showcase")) {
        if (!$("#health").data("ejmTile")) {
            transfer();
            ej.widget.init("#showcasewrapper");
            ej.widget.init("#showcasetabwrapper");
            $("#PageScroll").ejmScrollPanel({ "target": "showcasewrapper" });
        }
        $("#abouttab").show();
        if (location.hash != "")
            loadPane(findSampleIndex(location.hash.replace("#", "")));
        /* Aligning windows Horizontal layout*/
        if (ej.isWindows()) {
            var controlstilewidth = (Math.ceil(window.sampleslist.length / 3) * ($("#controlsgrid .e-m-tile-wrapper.e-m-tile-wrapper-medium").outerWidth() + 10)) + 100;
            $("#controlstile").width(controlstilewidth)
            $(".winsamplewrap").width(controlstilewidth + $("#samplestile").outerWidth());
            $("#PageScroll").ejmScrollPanel("refresh");
        }
        else {
            $("#showcasescroll").ejmScrollPanel({ "enableVrScroll": false, "enableHrScroll": true, "targetHeight": 140, "target": "topnavwrapper", "scrollWidth": window.dashboardlist.length * ($($(".e-m-tile-wrapper-wide")[0]).width() + 30) });
            $("#showcasescroll").ejmScrollPanel("refresh");
        }
        App.container.bind("viewpopstate", function (evt, data) {
            if (ej.isWindows() && ej.isLowerResolution()) {
                $('.windrawer').css('display', 'block');
                $("#apitoolbar").show();
            }
        });
        if ($("#showcasetabwrapper").length) {
            setWidth();
        }
    }
    $("#showcasescroll").ejmScrollPanel();
    if (ej.isWindows() && ej.isLowerResolution() && options.toPage.find('#splitview .e-m-header-left').length)
        options.toPage.find('#splitview .e-m-header-left').remove();
    var firstPage = $(options.options.pageContainer).find(".showcase");
    if (options.fromPage[0] == firstPage[0]) {
        //Renders the listbox based on datasource and right content of splitpane 
        if (App.activePage.find("#listbox").length) {
            var listbox = $(App.activePage.find("#listbox")).ejmListView("instance");
            listbox.selectItem(0);
        }
    }
    if (ej.getRenderMode() == "android") {
        if (App.getLocation().indexOf("#properties") != -1) {
            $("#apisettingsnav").css('display', 'none');
            $("#apisettings").css('display', 'none');
        }
        else if (options.options.reverse && ej.getCurrentPage().find('#splitview_toolbar').length && ej.getCurrentPage().find('#splitview_toolbar').ejmToolbar('model.android.title').toLowerCase() == "api's") {
            $("#apisettingsnav").css('display', '');
            $("#apisettings").css('display', 'block');
        }
    }
    if (location.hash == "#apis" && options.options.reverse && window.control.toLowerCase() != "rotator" && window.control.toLowerCase() != "grid" && window.control.toLowerCase() != "navigationdrawer" && window.control.toLowerCase() != "tab")
        $("#splitview").ejmSplitPane("model.enableSwipe", true);
});
function showNavigation() {
    if (App.getLocation().indexOf("#default") != -1)
        App.activeSubPage ? App.activeSubPage.find("#navpane").ejmNavigationDrawer("open") : App.activePage.find("#navpane").ejmNavigationDrawer("open");
    else
        App.activeSubPage ? App.activeSubPage.find("#tempnavpane").ejmNavigationDrawer("open") : App.activePage.find("#tempnavpane").ejmNavigationDrawer("open");
}

function afterLoadSuccess(args) {
    if (typeof (ChartLoad) == "function")
        ChartLoad();
    if (typeof (createMap) == "function")
        createMap();
    if (ej.isAndroid()) {
        header = args.toolbar.find('.e-m-tbcontainer');
        title = trimString(location.hash.replace("#", ""));
    }
    else if ((ej.isIOS() || ej.isWindows()) || !ej.isDevice()) {
        header = args.rightPaneHeader.find(".e-m-header-content");
        title = trimString(args.rightPaneHeader.ejmHeader("model.title"));
    }
    if (!header.find('#apisettingsnav').length && title !== undefined && title != "properties" && !ej.isWindows())
        header.append(ej.buildTag("div#apisettingsnav", ej.buildTag("div.settingsapinav")));
    $("#apisettingsnav .settingsapinav, .windrawer").click(function () {
        App.activePage.find('#splitview').ejmSplitPane('openLeftPane');
    });
    if (header && title !== undefined && title == "apis" && !header.find("#apisettings").length) {
        if (ej.isAndroid()) {
            args.toPage.find('#apidialog').ejmDialog({
                templateId: (window.control == "listview") ? "mobiletemplate" : "template",
                leftButtonCaption: "Close",
                title: "Properties",
                buttonTap: "dialogclose",
                enableModal: true
            });
        }
        else {
            args.toPage.find('#settings').ejmMenu({
                templateId: "tablettemplate",
                renderTemplate: true,
                hide: "hidetriangle",
                showScrollbars: false,
                ios7: { title: "Properties", type: "normal" },
                windows: { type: "popup" },
                showOn: ej.endEvent()
            });
        }
        renderApiIcon(header, title);
    }
    window.setTimeout(function () {
        var refreshScroll = App.activePage.find('#splitview').ejmSplitPane('instance')._rightScroller;
        if (refreshScroll)
            refreshScroll.ejmScrollPanel("refresh");
        if ($("#listbox_scroll").length)
            $("#listbox_scroll").ejmScrollPanel("refresh");
    }, 400);
}
function hidetriangle() {
    if (ej.isWindows())
        $(".triangleopen").hide();
}
/* To close the dialog */
function dialogclose() {
    $('#apidialog').ejmDialog('close');
    $('#aboutdialog').ejmDialog('close');
}
//Loads the right content on list selection
function listItemSelect(args) {
    var currentText = trimString(args.text);
    if (!args.hasChild && sampleIndex != args.index) {
        loadPane(args.index);
        sampleIndex = args.index;
    }
    if ($('.e-m-nb-container .e-m-nb-opened').length)
        $('.e-m-nb-container .e-m-nb-opened').ejmNavigationDrawer('close');
    else if ($('.e-m-nb.e-m-nb-opened').length)
        $('.e-m-nb.e-m-nb-opened').ejmNavigationDrawer('close');
    if (ej.isWindows())
        (!isMobile()) ? $('#apisettings').css('display', currentText == "apis" ? 'block' : 'none') : $('#apitoolbar').css('display', currentText == "apis" ? 'block' : 'none');
    $('#apisettings').css('display', currentText == "apis" ? 'block' : 'none');
}
//Render the API icon for the api page
function renderApiIcon(header, title) {
    if (ej.isAndroid()) {
        header.append(ej.buildTag("div#apisettings", ej.buildTag("div.settingsapi")));
    }
    else if (ej.isWindows()) {
        var winapi = ej.buildTag("div#apisettings", ej.buildTag("div.settingsapi"));
        $("#windowssampleheader").find("#headertemplate").append(winapi).append(ej.buildTag("div.triangleopen"));
    }
    else
        header.append(ej.buildTag("div#apisettings", ej.buildTag("div.settingsapi")));
    $('.settingsapi').click(function (e) {
        if ((ej.getRenderMode() == "ios7" || ej.getRenderMode() == "windows" || (ej.getRenderMode() == "ios7" && !ej.isMobile())) && (!ej.isMobile() && !ej.isLowerResolution()))
            $("#settings").ejmMenu('show', e);
        else if (ej.getRenderMode() == "android" && (!ej.isMobile() && !ej.isLowerResolution()))
            $('#apidialog').ejmDialog('open');
        else
            showsettings(e);
        if (ej.getRenderMode() == "windows")
            $(".triangleopen").show();
        if (!ej.isLowerResolution()) {
            var hash = location.hash.replace("#", "");
            if (control == "slider")
                App.activePage.find("#getval").empty();
            else if (control == "rotator") {
                var value = $("#apirotator").ejmRotator("model.currentItemIndex");
                $("#apislid").ejmSlider("model.value", value);
                $('#rotatorindex').html(value + 1);
            }
        }
    });

}
//Render the API icon for the api page
function renderAboutIcon() {
    header = App.activePage.find(ej.isAndroid() ? "#androidheader" : (ej.isWindows() ? "#windowsheader" : "#showcaseheader"));
    if (ej.isAndroid()) {
        header.append(ej.buildTag("div#aboutpageicon", ej.buildTag("div.e-m-icon-about aboutpageicon")));
    }
    else if (ej.isWindows()) {
        var winabt = ej.buildTag("div#aboutpageicon", ej.buildTag("div.e-m-icon-about aboutpageicon"));
        $("#windowsheader").find("#headertemplate").append(winabt).append(ej.buildTag("div.triangleopen"));
    }
    else
        header.append(ej.buildTag("div#aboutpageicon", ej.buildTag("div.e-m-icon-about aboutpageicon")));
    if (ej.isIOSWebView())
        $("#aboutpageicon").css("margin-top", "20px");
    $('.aboutpageicon').click(function (e) {
        if ((ej.getRenderMode() == "ios7" || ej.getRenderMode() == "windows" || (ej.getRenderMode() == "ios7" && !ej.isMobile())) && (!ej.isMobile() && !ej.isLowerResolution()))
            $("#aboutmenu").ejmMenu('show', e);
        else if (ej.getRenderMode() == "android" && (!ej.isMobile() && !ej.isLowerResolution()))
            $('#aboutdialog').ejmDialog('open');

        if (ej.getRenderMode() == "windows")
            $(".triangleopen").show();
    });

}
//Navigation pane changing title
function navListClick(e) {
    var temp = e.text.toLowerCase();
    $("#navpane").ejmNavigationDrawer("close");
    $('.navsubpage').hide();
    $('#' + temp).show();
    ej.getCurrentPage().find("#default_rightscroller .e-m-scroll").ejmScrollPanel("refresh");
}
//Event handler to update the header title while selecting the tab
function tabselect(args) {
    $("#showcaseheader_phone").ejmHeader("model.title", args.text == "Showcase" ? "Showcase" : args.text == "All Controls" ? "All Controls" : "About");
}

/* Loads the Right Pane*/
function loadPane(index, enableNativeScrolling) {
    var showLeftButton = true;
    if (ej.getRenderMode() == "windows" && ej.isLowerResolution())
        showLeftButton = false;
    if (ej.getRenderMode() == "ios7" || ej.getRenderMode() == "android") {
        renderTemplate = (samples[index].text == "Toggle Button") ? false : true;
        //Fix for orubase launcher page native scrolling false
        if ((window.control == "textbox" || window.control == "autocomplete" || window.control == "slider" || window.control == "tileview") && ej.isDevice()) {
            enableNativeScrolling = true;
        }
        else {
            enableNativeScrolling = false;
        }
    }
    var pageID = trimString(samples[index].text);
    if (!isNaN(parseInt(pageID[0]))) {
        pageID = window.control + "_" + pageID;
    }
    var enableRightPaneScroll = (samples[index].text.toLowerCase() == "rotator" && (window.control.toLowerCase() == "angularjs" || window.control.toLowerCase() == "knockout")) || (window.control.toLowerCase() == "rotator" || window.control.toLowerCase() == "radialmenu" || (window.control.toLowerCase() == "listview" && samples[index].ChildrenId == "pulltorefresh")) ? false : true;
    App.activePage.find("#splitview").ejmSplitPane("loadContent", samples[index].Url, {
        reload: false,
        pageId: pageID,
        type: "get",
        rightHeaderSettings: { title: samples[index].text, showLeftButton: showLeftButton },
        toolbarSettings: { android: { title: samples[index].text } },
        transition: "none",
        rightPaneScrollSettings: { enableNativeScrolling: enableNativeScrolling },
        allowRightPaneScrolling: enableRightPaneScroll
    });
    if (ej.isWindows() && ej.isLowerResolution() && samples[index].Url.replace(".html", "") == "apis")
        $("#apitoolbar").show();
    else
        $("#apitoolbar").hide();
}
//To replace the space and special characters in a string
function trimString(text) {
    return text.replace(/ /g, "").replace("'", "").toLowerCase();
}
function showsettings(evt) {
    var listtemp = (window.control == "listview") ? "mobiletemplate" : "template";
    $("#splitview").ejmSplitPane({ enableSwipe: false });
    if ((ej.getRenderMode() == "windows" && evt.itemname == "settings") || ej.getRenderMode() != "windows")
        App.activePage.find("#splitview").ejmSplitPane("loadContent", "#" + listtemp, {
            pageId: "properties",
            type: "get",
            rightHeaderSettings: { title: "Properties", showLeftButton: ej.getRenderMode() == "windows" && ej.isLowerResolution() ? false : true },
            title: "Properties",
            isHigherLevel: true,
            allowRightPaneScrolling: true
        });
}

function updateToolbar(args) {
    if (ej.isWindows() && args.toPage.find(".e-m-header").ejmHeader("model.title").toLowerCase() == "properties") {
        $('.windrawer').css('display', 'none');
        $("#apitoolbar").hide();
    }
    if (ej.isWindows() && ej.isMobile() && $('#menuitems').length)
        $('#menuitems').attr('data-ej-theme', 'light');
    if (window.control && window.control.toLowerCase() == "navigationdrawer") {
        if ($(".swipebutton").length)
            $(".swipebutton").remove();
        $(".e-m-sp-right.subpage").append(ej.buildTag("div.swipebutton", {}, {}, { onclick: "showNavigation()" }));
        if (!ej.isCssCalc()) {
            $(".swipebutton").css("top", ((window.innerHeight - $(".swipebutton").height()) / 2) - $("#splitview_toolbar").height());
        }
    }
    if (window.control && window.control.toLowerCase() == "chart")
        $(".e-datavisualization-chart.e-js:visible").ejChart("redraw");
    var splitpane = App.activePage.find("#splitview");
    if (splitpane.length > 0 && splitpane.find(".e-m-sp-rightwrapper:visible .e-m-scroll").length > 0)
        splitpane.ejmSplitPane("refreshRightScroller");
    if (control == "rotator")
        $(".e-m-rotator:visible").length > 0 ? $(".e-m-rotator:visible").ejmRotator("instance")._refresh() : '';
}


//Resize event
$(window).resize(function () {
    if ($('#settings').length && $('#settings').is(':visible') && ej.isLowerResolution())
        $('#settings').ejmMenu('hide');
    if ($("#showcasetabwrapper").length) {
        setWidth();
    }
    //Orubase launcher page two api occurs on resize
    var listbox = $(App.activePage.find("#listbox")).ejmListView("instance");
    if (location.hash == "#properties" && !ej.isLowerResolution())
        window.history.back();
    if (ej.isLowerResolution() && $('#apidialog').is(":visible"))
        $('#apidialog').ejmDialog('close');
    if (ej.isWindows()) {
        if (samples != undefined && samples[listbox.selectedItemIndex()].Url.replace(".html", "") == "apis") {
            if (ej.isLowerResolution())
                $("#apitoolbar").show();
            else
                $("#apitoolbar").hide();
        }
    }
    if (window.control && window.control.toLowerCase() == "navigationdrawer")
        if (!ej.isCssCalc())
            $(".swipebutton").css("top", ((window.innerHeight - $(".swipebutton").height()) / 2) - $("#splitview_toolbar").height());
    //For Subpage in dashboard samples not scrolling
    if ($("#healthsubscroll")) {
        window.setTimeout(function () {
            $("#healthsubscroll").ejmScrollPanel("refresh");
        }, 250);
    }
    if ($("#expenseAddPageScroll")) {
        window.setTimeout(function () {
            $("#expenseAddPageScroll").ejmScrollPanel("refresh");
        }, 250);
    }
});

//Document Ready
$(function () {
    if ($("#showcasetabwrapper").length) {
        setWidth();
    }
    if (ej.isWindows()) {
        var controlstilewidth = (Math.ceil(window.sampleslist.length / 3) * ($("#controlsgrid .e-m-tile-wrapper.e-m-tile-wrapper-medium").outerWidth() + 10)) + 100;
        $("#controlstile").width(controlstilewidth)
        $(".winsamplewrap").width(controlstilewidth + $("#samplestile").outerWidth());
    }

    $(window).bind("scrollstop", function (e) {
        window.scrollTo(0, 0);
    })
});

function setWidth() {
    $("#showcasetabwrapper").height(window.innerHeight - $("#tabitem").height() - $("#showcaseheader_phone").height());
    $("#showcasetabwrapper").width(window.innerWidth);
}

if (ej.isWindows() && ej.isDevice() && ej.isMobile()) {
    $('head').attr('data-ej-theme', 'dark');
}