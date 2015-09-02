var compName = "google", jsonData, colIndex = 0, initialChartLoad = true;
window.startDate = new Date(2009, 01, 1), window.endDate = new Date(2009, 12, 1);
var targets = [20000, 1800, 800, 20000, 17000, 1000, 500];
$(document).bind("viewbeforetransfer", viewTransferStockUnbind);

function viewTransferStockUnbind(args, data) {
    if (data.fromPage.hasClass("stockpage") && data.toPage.hasClass("showcase")) {
        $(".stockpage").attr("data-appcache", "false");
    }
    else if (data.toPage.hasClass("stockpage")) {
        $(document).bind("viewtransfer", stockInit);
    }
    $(window).unbind(ej.isTouchDevice() ? "resize" : "orientationchange", rangeResize);
}

function stockInit() {
    App.waitingPopUp.show();
    $("#stocknav .stocknav").click(function () {
        App.activePage.find('#stocksptpane').ejmSplitPane('openLeftPane');
    });
    initAll();
    $(document).unbind("viewtransfer", stockInit);
}
function parse(data) {
    return JSON.parse(data, json_deserialize_helper);
}

function showContent(args) {
    App.waitingPopUp.show();
    App.waitingPopUp.css("z-index", ej.getMaxZindex() + 1);
    compName = args.item.attr("id");
    colIndex = args.index;
    window.startDate = new Date(2009, 01, 1), window.endDate = new Date(2009, 12, 1);
    jsonData = parse(window[compName]);
    renderRange(jsonData);
}
function initAll() {
    jsonData = parse(window[compName]);
    var initData = jsonData;
    var ele = ej.getCurrentPage().find('#stocklistbox ul li');
    renderRange(jsonData);
}

function chartInit(data) {
    var chartDiv = $("<div id ='chartcontent'></div>");
    var colChartDiv = $("<div id ='colchartcontent'></div>");
    ej.getCurrentPage().find('.chhilocontent #chartcontent').remove();
    ej.getCurrentPage().find('.chcontent #colchartcontent').remove();
    ej.getCurrentPage().find('.chhilocontent').append(chartDiv);
    ej.getCurrentPage().find('.chcontent').append(colChartDiv);
    var widthPadding = 10, heightPadding = 0, chartHeightDivider = 2, stockChartIntervals = 4;
    if (!ej.isMobile() && !ej.isLowerResolution()) {
        widthPadding = $(".e-m-splitpane .e-m-sp-left").width();
        heightPadding = 50;
        chartHeightDivider = 3;
        stockChartIntervals = 6;
    }
    var chartWidth = (($("#samplefile").length ? $("#samplefile").width() : window.innerWidth) - widthPadding).toString()
    ej.getCurrentPage().find("#chartcontent").ejChart({
        primaryXAxis:
            {
                labelFormat: 'MM/dd/yyyy',
                valueType: 'datetime',
                axisLine: { visible: true, width: 0.5, dashArray: "", offset: 0 },
                majorGridLines: { width: 0.5, dashArray: "", visible: true, opacity: 1 },
                desiredIntervals: stockChartIntervals
            },
        primaryYAxis:
			{
			    rangePadding: 'round',
			    axisLine: { visible: true, lineWidth: 0.5, dashArray: "", offset: 0 },
			    majorGridLines: { lineWidth: 0.5, dashArray: "", visible: true, opacity: 1, fillcolor: "#FF0000" }
			},
        series: [{
            dataSource: data, xName: "XValue", high: "High", open: "Open", low: "Low", close: "Close",
            name: 'Gold', type: 'hiloopenclose',
            enableAnimation: true,
            fill: "#288e56"
        },
        {
            dataSource: data, xName: "XValue", high: "High", open: "Open", low: "Low", close: "Close",
            name: 'Silver', type: 'hiloopenclose',
            enableAnimation: true,
            fill: "#b74e55"
        }],
        size: { height: (window.innerHeight / chartHeightDivider - heightPadding).toString(), width: chartWidth },
        zooming: { enable: false, type: 'x,y', enableMouseWheel: false },
        legend: { visible: false },
        canResize: true,
        loaded: "refreshstockscroll"
    });
    ej.getCurrentPage().find("#colchartcontent").ejChart({
        primaryXAxis:
            {
                range: { min: window.startDate, max: window.endDate, interval: 1 },
                intervalType: 'Years',
                labelFormat: 'yyyy',
                valueType: 'datetime',
                axisLine: { visible: true, width: 0.5, dashArray: "", offset: 0 },
                majorGridLines: { width: 0.5, dashArray: "", visible: true, opacity: 1 }
            },
        primaryYAxis:
			{
			    axisLine: { visible: true, width: 0.5, dashArray: "", offset: 0 },
			    majorGridLines: { width: 0.5, dashArray: "", visible: true, opacity: 1, stroke: "#FF0000" }
			},

        series: [{
            dataSource: data, xName: "XValue", yName: "Open",
            name: 'Gold', type: 'column',
            enableAnimation: true,
            fill: "#288e56"
        },
        {
            dataSource: data, xName: "XValue", yName: "Close",
            name: 'Silver', type: 'column',
            enableAnimation: true,
            fill: "#b74e55"
        }
        ],
        loaded: "refreshstockscroll",
        canResize: true,
        size: { height: (window.innerHeight / chartHeightDivider - heightPadding).toString(), width: chartWidth },
        legend: { visible: false },
        zooming: { enable: false, type: 'x,y', enableMouseWheel: false }
    });
    ej.getCurrentPage().find(".rgcontent #rangecontent").css("display", "block");
    refreshstockscroll();
    $("#scrollright").ejmScrollPanel("option", "scrollEnd", function (evt) {
        if (evt.x == 0 && evt.y == 0) {
            window.scrollTo(0, 0);
        }
    });
    $(".stockpage #rightpane").css({ "visibility": "" });
    App.waitingPopUp.hide();
}

function refreshstockscroll() {
    window.scrollTo(0, 0);
    $("#scrollright").ejmScrollPanel("refresh");
    $('#stocklistbox_scroll').ejmScrollPanel('refresh');
}
function renderRange(data) {
    var rangeDiv = $("<div id ='rangecontent'></div>");
    ej.getCurrentPage().find('.rgcontent #rangecontent').remove();
    ej.getCurrentPage().find('.rgcontent').append(rangeDiv);
    var colorSelected = "#F2F2F2", colorUnSelected = "#D1D1D1", chartHeightDivider = 4, stockRangeThumbColor = "#262626";
    if (ej.isMobile() && ej.isAndroid()) {
        colorSelected = [{ color: "black", colorStop: "0%" }, { color: "#d8d8d8", colorStop: "15%" }, { color: "#d8d8d8", colorStop: "85%" }, { color: "black", colorStop: "100%" }];
        colorUnSelected = [{ color: "#ffffff", colorStop: "30%" }, { color: "#6e6e6e", colorStop: "100%" }];
    }
    var widthPadding = 10, seriesInnerLineColor = "#FF0000";
    var tooltipVisible = false;
    if (!ej.isMobile() && !ej.isLowerResolution()) {
        widthPadding = $(".e-m-splitpane .e-m-sp-left").width();
        tooltipVisible = true;
        seriesInnerLineColor = "#288E56";
        chartHeightDivider = 8;
        stockRangeThumbColor = "#B74255";
    }
    var chartWidth = (($("#samplefile").length ? $("#samplefile").width() : window.innerWidth) - widthPadding).toString();
    ej.getCurrentPage().find("#rangecontent").ejRangeNavigator({
        enableDeferredUpdate: true,
        padding: "20",
        enableAutoResizing: true,
        selectedRangeSettings: {
            start: new Date(2009, 01, 1).toString(), end: new Date(2010, 12, 1).toString()
        },
        tooltipSettings: {
            visible: tooltipVisible, labelFormat: "dd/MM/yyyy", backgroundColor: "#565d5d", tooltipDisplayMode: "ondemand",
            labelstyles: { font: { color: 'white', fontFamily: 'Segoe UI', fontStyle: 'Normal ', size: '10px', opacity: 1, fontWeight: 'regular' } }
        },

        navigatorStyleSettings: {
            selectedRegionColor: colorSelected,
            unselectedRegionColor: colorUnSelected,
            thumbColor: stockRangeThumbColor,
            background: "transparent",
            border: { color: "transparent" },
            chartBorder: { color: "white", width: 0.5 },
            majorGridLineStyle: { color: "#868989", visible: true },
            minorGridLineStyle: { color: "#868989", visible: true }
        },
        series: [
            {
                name: 'SalesRate',
                enableAnimation: false,
                type: 'line',
                border: { color: 'transparent', width: 2 }, opacity: 1, fill: seriesInnerLineColor,
                dataSource: data, xName: "XValue", yName: "High"
            }
        ],
        seriesSettings: {
            type: 'column', enableAnimation: true
        },
        labelSettings: {
            higherLevel: {
                visible: false,
                labelstyles: { font: { color: '#4F4F4F', fontFamily: 'Segoe UI', fontStyle: 'Normal ', size: '10px', opacity: 1, fontWeight: 'regular' } },
                border: { color: "#FFFFFF", width: 0 },
                gridLineStyle: { color: "#868989" }
            },
            lowerLevel: {
                intervalType: 'years',
                visible: true,
                labelstyles: { font: { color: '#4F4F4F', fontFamily: 'Segoe UI', fontStyle: 'Normal ', size: '10px', opacity: 1, fontWeight: 'regular' } },
                border: { color: "#FFFFFF", width: 0 },
                gridLineStyle: { color: "#868989", width: 0 }
            }
        },
        rangeChanged: 'stockRangeDateSelected',
        sizeSettings: { height: window.innerHeight / chartHeightDivider, width: chartWidth },
        zooming: { enabled: false, type: 'x,y', enableMouseWheel: true },

    });
    if (initialChartLoad) {
        ej.getCurrentPage().find(".rgcontent #rangecontent").css("display", "none");
        initialChartLoad = false;
    }
    $(window).on(ej.isTouchDevice() ? "resize" : "orientationchange", rangeResize);
}
function filterData(data) {
    var dataMgr = ej.DataManager(data);
    var predicate = ej.Predicate("XValue", ej.FilterOperators.greaterThan, window.startDate, false);
    predicate = predicate.and("XValue", ej.FilterOperators.lessThan, window.endDate, false);
    return dataMgr.executeLocal(ej.Query().from(data).where(predicate));
}
function updateStockElements() {
    var data = filterData(jsonData);
    stockData(data, colIndex);
    // For listview items selection on device change
    if ($("#stocklistbox").ejmListView("selectedItemIndex") != colIndex)
        $("#stocklistbox").ejmListView({ "selectedItemIndex": colIndex });
    chartInit(data);
    $("#stocksptpane").ejmSplitPane("loadContent", "#rightpane", { pageId: "stockanalysis" })
    $(".chhilocontent , .chcontent").removeClass("addbackground");
    refreshstockscroll();
    App.waitingPopUp.hide();
}
function stockRangeDateSelected(args) {
    App.waitingPopUp.show();
    $(".chhilocontent , .chcontent").addClass("addbackground");
    if (ej.isIOSWebView())
        $("#stocknav").css("margin-top", "20px");
    window.startDate = args.selectedRangeSettings.start;
    window.endDate = args.selectedRangeSettings.end;
    if (window.startDate.toDateString() != window.endDate.toDateString()) {
        if (!window.isUpdated) {
            window.isUpdated = true;
            window.timeoutCallback = setTimeout(updateStockElements, 700);
        }
        else {
            clearTimeout(window.timeoutCallback);
            window.timeoutCallback = setTimeout(updateStockElements, 700);
            window.isUpdated = true;
        }
    }
}
function stockData(val, index) {
    var ele = $(ej.getCurrentPage().find("#stocklistbox ul li")[index]);
    var tar = (ej.dataUtil.sum(val, "Close") / targets[index]) * 100;

    if (tar > 50) {
        tar = tar - 50;
        ele.find(".target").removeClass("inverted");
    }
    else {
        tar = 50 - tar;
        ele.find(".target").addClass("inverted");
    }

    ele.find('.value').html("");
    ele.find('.value').html(tar.toFixed(2));
    ej.getCurrentPage().find(".chcontent .valuetitle").html(tar.toFixed(2));
    ej.getCurrentPage().find(".chhilocontent .valuetitle").html(tar.toFixed(2));
    ele.find('.openvalue').html(val[val.length - 1].Open);
    ele.find(".closevalue").html(val[val.length - 1].Close);
}
function setHiloRangeAxis(rnge) {
    switch (rnge) {
        case "google":
            return { min: 0, max: 800, interval: 200 };
            break;
        case "nokia":
            return { min: 0, max: 50, interval: 10 };
            break;
        case "microsoft":
            return { min: 10, max: 40, interval: 10 };
            break;
        case "apple":
            return { min: 0, max: 800, interval: 200 };
            break;
        case "ibm":
            return { min: 0, max: 800, interval: 200 };
            break;
        case "sne":
            return { min: 10, max: 40, interval: 10 };
            break;
        case "intc":
            return { min: 0, max: 50, interval: 10 };
            break;
    }
}
function json_deserialize_helper(key, value) {
    if (typeof value === 'string') {
        var regexp;
        regexp = value.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
        if (regexp) {
            return new Date(value);
        }
    }
    return value;
}

function beforetransfer(args) {
    refreshstockscroll();
}


function rangeResize() {
    var widthPadding
    if (!ej.isMobile() && !ej.isLowerResolution())
        widthPadding = $(".e-m-splitpane .e-m-sp-left").width();
    else
        widthPadding = 10;
    ej.getCurrentPage().find("#rangecontent").ejRangeNavigator({
        sizeSettings: { width: (($("#samplefile").length ? $("#samplefile").width() : window.innerWidth) - widthPadding).toString() },
    })
}