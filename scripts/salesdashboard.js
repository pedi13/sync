var salesinitialloading = true, gridRowTouched;
var salesOverAllData, salesGridData = [], chartData = [], rangeData = [], gaugeData = [], salesData = [];
var oaDate = new Date(1899, 11, 30);
var rowSelect = false;
var millisecondsOfaDay = 24 * 60 * 60 * 1000;
var colChartColor = ["#E8BD46", "#369E63", "#B73939", "#2BAABF", "#CC793B", "#4586A0", "#7AA542", "#C13870", "#B348E5"];
Date.prototype.ToOADate = function () {
    var result = (Date.parse(this) - Date.parse(oaDate)) / millisecondsOfaDay;
    return result;
};
function clearGridRelatedData() {
    chartData = [], rangeData = [], gaugeData = [], salesData = [];
}
function clearRangeRelatedData() {
    salesGridData = [], chartData = [], gaugeData = [], salesData = [];
}
function clearOverall() {
    salesGridData = [], chartData = [], gaugeData = [], rangeData = [], salesData = [];
}
//Rendering Grid
function renderSalesGrid(salesGridData) {
    if (!salesinitialloading) {
        $("#salesgrid").ejmGrid("model.dataSource", salesGridData);
    }
    else {
        var grid = $("<div class='titletool'><div class='titlediv'>Sales by Country</div></div><div id ='salesgrid' class='margintop'></div>");
        var scrollDiv = $("<div id='ScrollPanel' data-targetid='ScrollContent' data-scrolltype='Vertical' data-targetheight='175'></div>");
        $(".container-fluid .gridchart >div:last").append(grid);
        $(".container-fluid").append(scrollDiv);
        var mapbg = "transparent";
        if (!ej.isMobile()) {
            var minbubble = "20";
            var maxbubble = "50";
            var statecol = 80;
            var salescol = 60;
            var marketcol = 110;
            var zoomfactor = 0.93;
        }
        else {
            var minbubble = "20";
            var maxbubble = "30";
            var statecol = 70;
            var salescol = 60;
            var marketcol = 40;
            var zoomfactor = 0.98;
            if (ej.isIOS())
                mapbg = '#1C1C1C';
            else if (ej.isWindows())
                mapbg = '#0F0F0F';
        }
        $("#salesgrid").ejmGrid({
            dataSource: salesGridData,
            allowPaging: false,
            allowScrolling: true,
            scrollSettings: { allowHorizontalScroll: false, height: "185", allowVerticalScroll: true },
            rowSelected: "gridRowSelected",
            columns: [{ field: "State", width: statecol, headerText: 'Country' }, { field: "Sales", headerText: 'Sales', width: salescol }, { field: "SalesvsTarget", headerText: 'Marketing vs Revenue', width: marketcol}],
            scrolling: { height: 140 },
            actionComplete: "refreshScroller",
            queryCellInfo: function (args) {
                var $element = $(args.Element);
                switch (args.text) {
                    case "Sales":
                        if (!$element.hasClass("templatecell")) {
                            var value = parseInt(parseFloat($element.html()) / 10000);
                            $element.html("$" + value + "M");
                        }
                        break;
                    case "Marketing vs Revenue":
                        var value = parseFloat(parseFloat($element.html()).toFixed(2));
                        $element.html("<div class ='value'>" + value + "%</div>");
                        $element.append($("<div class ='triangle'></div>"));
                        if (parseInt(parseFloat(args.Data.Sales) / 10000) < 45)
                            $element.addClass('target');
                        break;
                }
            }
        });       
        
    }
}
function menuopen() {
    var e = { currentTarget: this._wrapper };
    if (ej.getRenderMode() == "windows" && !isMobile())
        e = undefined;
    $("#yearMenu").ejmMenu("show", e);
}
function refreshScroller() {
    $("#MainScroll").ejmScrollPanel("refresh");
}
//Rendering Chart
function renderSalesChart(chartData) {
    if (!salesinitialloading) {
        $("#chartContent").ejChart("option", {
            series: [{
                dataSource: chartData[0].series, xName: "Category", yName: "SalesPrice",
                type: 'column'
            }],
            canResize: true
        });
    }
    else {
        var chart = $("<div class='titlediv'>Sales by Product Category</div><div id ='chartContent'></div>");
        $(".main .gridchart >div:first").empty();
        $(".main .gridchart >div:first").append(chart);
        $("#chartContent").ejChart({
            primaryXAxis: { majorGridLines: { visible: false }, labelRotation: 35, labelFormat: "MM/dd/yyyy",
                axisLine: { visible: true, width: 0.5, dashArray: "", offset: 0 },
                majorGridLines: { width: 0.2, dashArray: "", visible: true, opacity: 1 },
                font: {color: "#CCCCCC"}
            },
            primaryYAxis: { rangePadding: 'normal', labelFormat: '{value}M',
                axisLine: { visible: true, width: 0.5, dashArray: "", offset: 0 },
                majorGridLines: { width: 0.2, dashArray: "", visible: true, opacity: 1 },
                font: { color: "#CCCCCC" }
            },
            series: [
            {
                dataSource : chartData[0].series, xName: "Category", yName: "SalesPrice",
                type: 'column',
                enableAnimation: false
            }],
            canResize: true,
            size: { height: "250" },
            legend: { visible: false },
            preRender: "beforeChartRender",
            axesLabelRendering: "labelRendering",
            loaded: "hidesalespopup"
        });
    }
}
function showsalescontent() {
    $(".salespage #MainContent").css({ "visibility": "" });
}

function labelRendering(args) {
    if (args.data.axis.orientation.toLowerCase() == "vertical") {
        args.data.label.Text = args.data.label.Value / 10000000 + "M";
    }
}
function beforeChartRender(args) {
    $.each(args.model.series[0].points, function (index, value) {
        value.interior = colChartColor[index];
    });
}
//Rendering Range Chart
function renderSalesRangeChart(rangeData) {
    var rangeDiv = $("<div id ='rangeChart'></div>");
    var color = { color: "#FFFFFF" };
    var fontsize = ej.isMobile() ? '12px' : '30px';
    if (ej.isAndroid() || ej.isWindows())
        color = { stroke: 0 };
    var border;
    if (ej.isIOS())
        border = "#999999";
    else if (ej.isAndroid())
        border = "#626262";
    else if (ej.isWindows())
        border = "#878787";

    $(".main .rangecontainer >div:last").empty();
    $(".main .rangecontainer >div:last").append(rangeDiv);
    $("#rangeChart").ejRangeNavigator({
        enableDeferredUpdate: true,
        rangeSettings: {
            start: rangeData[rangeData.length - 8].Date.toString(), end: rangeData[rangeData.length - 6].Date.toString()
        },
        sizeSettings: {
            height: 100
        },
        enableAutoResizing: true,
        selectedRangeSettings: {
            start: rangeData[rangeData.length - 8].Date.toString(), end: rangeData[rangeData.length - 6].Date.toString()
        },
        tooltipSettings: { visible: true, labelFormat: "dd/MM/yyyy", tooltipDisplayMode: "ondemand", backgroundColor: "#FFFFFF", font: { color: '#2d2d2d' } },
        dataSource: rangeData, xName: "Date", yName: "SalesPrice",

        navigatorStyleSettings: {
            selectedRegionColor: [{ color: "black", colorStop: "0%" }, { color: "#d8d8d8", colorStop: "15%" }, { color: "#d8d8d8", colorStop: "85%" }, { color: "black", colorStop: "100%" }],
            unselectedRegionColor: [{ color: "#ffffff", colorStop: "30%" }, { color: "#6e6e6e", colorStop: "100%" }],
            thumbColor: "#e5e5e5",
            background: "transparent",
            border: { color: "transparent" },
            chartBorder: { color: "white", width: 0.5 },
            majorGridLineStyle: { color: "#767676", visible: true },
            minorGridLineStyle: { color: border, visible: true }
        },
        series: [
        {
            name: 'SalesRate',
            enableAnimation: true,
            type: 'line',
            border: { width: "3px", color: 'transparent' }, opacity: 0.5, fill: '#FF0000'
        }],
        seriesSettings: {
            type: 'column', enableAnimation: true
        },
        labelSettings: {
            higherLevel: {
                visible: false,
                style: { font: { color: '#767676', family: 'Segoe UI', style: 'Normal', size: fontsize, opacity: 1, weight: 'regular'} },
                border: { color: "#151515", width: 0 },
                gridLineStyle: { color: "#151515" }
            },
            lowerLevel: {
                intervalType: 'months',
                visible: true,
                style: { font: { color: '#767676', family: 'Segoe UI', style: 'Normal', size: fontsize, opacity: 1, weight: 'regular'} },
                border: { color: "transparent", width: 0 },
                gridLineStyle: { color: "transparent", width: 0 }
            }
        },
        rangeChanged: 'salesRangeDateSelected'
    });
}
//Rendering Gauge
function renderGauge(gaugeData) {
    if (!salesinitialloading) {
        (parseInt($.map(gaugeData, function (value, index) { if (value.Category.toLowerCase() == "books") return value.SalesPrice; })) < 50) ? $('#Books .triangle').addClass('inverted') : $('#Books .triangle').removeClass('inverted');


        (parseInt($.map(gaugeData, function (value, index) { if (value.Category.toLowerCase() == "electronics") return value.SalesPrice; })) < 50) ? $('#Electronics .triangle').addClass('inverted') : $('#Electronics .triangle').removeClass('inverted');
        (parseInt($.map(gaugeData, function (value, index) { if (value.Category.toLowerCase() == "automotive") return value.SalesPrice; })) < 50) ? $('#Automotive .triangle').addClass('inverted') : $('#Automotive .triangle').removeClass('inverted');
        (parseInt($.map(gaugeData, function (value, index) { if (value.Category.toLowerCase() == "clothing") return value.SalesPrice; })) < 50) ? $('#Clothing .triangle').addClass('inverted') : $('#Clothing .triangle').removeClass('inverted');
        $("#Automotive").ejCircularGauge("setPointerValue", 0, 0, $.map(gaugeData, function (value, index) { if (value.Category.toLowerCase() == "automotive") return value.SalesPrice; }));
        $("#Automotive").ejCircularGauge("setCustomLabelValue", 0, 0, parseFloat(($.map(gaugeData, function (value, index) { if (value.Category.toLowerCase() == "automotive") return value.SalesPrice; }))).toFixed(3) + "(" + (($.map(gaugeData, function (value, index) { if (value.Category.toLowerCase() == "automotive") return value.SalesPrice; }) / 150) * 100).toFixed(2) + "%)");

        $("#Books").ejCircularGauge("setPointerValue", 0, 0, $.map(gaugeData, function (value, index) { if (value.Category.toLowerCase() == "books") return value.SalesPrice; }));
        $("#Books").ejCircularGauge("setCustomLabelValue", 0, 0, parseFloat(($.map(gaugeData, function (value, index) { if (value.Category.toLowerCase() == "books") return value.SalesPrice; }))).toFixed(3) + "(" + (($.map(gaugeData, function (value, index) { if (value.Category.toLowerCase() == "books") return value.SalesPrice; }) / 150) * 100).toFixed(2) + "%)");

        $("#Clothing").ejCircularGauge("setPointerValue", 0, 0, $.map(gaugeData, function (value, index) { if (value.Category.toLowerCase() == "clothing") return value.SalesPrice; }));
        $("#Clothing").ejCircularGauge("setCustomLabelValue", 0, 0, parseFloat(($.map(gaugeData, function (value, index) { if (value.Category.toLowerCase() == "clothing") return value.SalesPrice; }))).toFixed(3) + "(" + (($.map(gaugeData, function (value, index) { if (value.Category.toLowerCase() == "clothing") return value.SalesPrice; }) / 150) * 100).toFixed(2) + "%)");

        $("#Electronics").ejCircularGauge("setPointerValue", 0, 0, $.map(gaugeData, function (value, index) { if (value.Category.toLowerCase() == "electronics") return value.SalesPrice; }));
        $("#Electronics").ejCircularGauge("setCustomLabelValue", 0, 0, parseFloat(($.map(gaugeData, function (value, index) { if (value.Category.toLowerCase() == "electronics") return value.SalesPrice; }))).toFixed(3) + "(" + (($.map(gaugeData, function (value, index) { if (value.Category.toLowerCase() == "electronics") return value.SalesPrice; }) / 150) * 100).toFixed(2) + "%)");
    }
    else {
        var automotive = $("<div class='customlabel'>Automotive</div><div id ='Automotive'></div></div>");
        var books = $("<div class='customlabel'>Books</div><div id ='Books'></div></div>");
        var clothing = $("<div class='customlabel'>Clothing</div><div id ='Clothing'></div></div>");
        var electronics = $("<div class='customlabel'>Electronics</div><div id ='Electronics'></div>");
        $(".main .gaugecontainer .automotive,.main .gaugecontainer .books,.main .gaugecontainer .clothing,.main .gaugecontainer .electronics").empty();
        $(".main .gaugecontainer .automotive").append(automotive);
        $(".main .gaugecontainer .books").append(books);
        $(".main .gaugecontainer .clothing").append(clothing);
        $(".main .gaugecontainer .electronics").append(electronics);
        $("#Automotive").ejCircularGauge({
            backgroundColor: "transparent", width: 200, height: 125, enableAnimation: false,
            scales: [{
                showRanges: true,
                startAngle: 170, sweepAngle: 200, radius: 50, showScaleBar: false, size: 1, border: { width: 0.5 }, maximum: 300, majorIntervalValue: 100, minorIntervalValue: 10,
                pointerCap: {
                    radius: 3,
                },
                pointers: [{
                    value: $.map(gaugeData, function (value, index) { if (value.Category.toLowerCase() == "automotive") return value.SalesPrice; }),
                    showBackNeedle: true,
                    backNeedleLength: 10,
                    length: 35,
                    width: 2,
                    backgroundColor: "#898989"
                }],
                labels: [{
                    distanceFromScale: -20,
                    color: "#8c8c8c"
                }],
                ticks: [{
                    type: "major",
                    distanceFromScale: 2,
                    height: 16,
                    width: 1,
                    color: "transparent"
                },
                {
                    type: "minor",
                    height: 8,
                    width: 1,
                    distanceFromScale: 2,
                    color: "transparent"
                }],
                ranges: [{
                    distanceFromScale: -28,
                    startValue: 0,
                    endValue: 95,
                    backgroundColor: "rgba(54,158,99,0.3)",
                    border: { color: "rgba(54,158,99,0.3)" },
                    size: 2
                },
                {
                    distanceFromScale: -28,
                    startValue: 101,
                    endValue: 200,
                    backgroundColor: "rgba(54,158,99,0.6)",
                    border: { color: "rgba(54,158,99,0.6)" },
                    size: 2
                },
                {
                    distanceFromScale: -28,
                    startValue: 208,
                    endValue: 300,
                    backgroundColor: "rgba(54,158,99,1)",
                    border: { color: "rgba(54,158,99,1)" },
                    size: 2
                }]
            }]
        });
        $("#Books").ejCircularGauge({
            backgroundColor: "transparent", width: 200, height: 125, enableAnimation: false,
            scales: [{
                showRanges: true,
                startAngle: 170, sweepAngle: 200, radius: 50, showScaleBar: false, size: 1, border: { width: 0.5 }, maximum: 300, majorIntervalValue: 100, minorIntervalValue: 10,
                pointerCap : {
                    radius: 3,
                },
                pointers: [{
                    value: $.map(gaugeData, function (value, index) { if (value.Category.toLowerCase() == "books") return value.SalesPrice; }),
                    showBackNeedle: true,
                    backNeedleLength: 8,
                    length: 35,
                    width: 2,
                    backgroundColor: "#898989"
                }],
                labels: [{
                    distanceFromScale: -20,
                    color: "#8c8c8c"
                }],
                ticks: [{
                    type: "major",
                    distanceFromScale: 2,
                    height: 16,
                    width: 1,
                    color: "transparent"
                },
                {
                    type: "minor",
                    height: 8,
                    width: 1,
                    distanceFromScale: 2,
                    color: "transparent"
                }],

                ranges: [{
                    distanceFromScale: -28,
                    startValue: 0,
                    endValue: 95,
                    backgroundColor: "rgba(183,57,57,0.3)",
                    border: { color: "rgba(183,57,57,0.3)" },
                    size: 2
                },
                {
                    distanceFromScale: -28,
                    startValue: 101,
                    endValue: 200,
                    backgroundColor: "rgba(183,57,57,0.6)",
                    border: { color: "rgba(183,57,57,0.6)" },
                    size: 2
                },
                {
                    distanceFromScale: -28,
                    startValue: 208,
                    endValue: 300,
                    backgroundColor: "rgba(183,57,57,1)",
                    border: { color: "rgba(183,57,57,1)" },
                    size: 2
                }]
            }]
        });
        $("#Clothing").ejCircularGauge({
            backgroundColor: "transparent", width: 200, height: 125, enableAnimation: false,
            scales: [{
                showRanges: true,
                startAngle: 170, sweepAngle: 200, radius: 50, showScaleBar: false, size: 1, border: { width: 0.5 }, maximum: 300, majorIntervalValue: 100, minorIntervalValue: 10,
                pointerCap: {
                    radius: 3,
                },
                pointers: [{
                    value: $.map(gaugeData, function (value, index) { if (value.Category.toLowerCase() == "clothing") return value.SalesPrice; }),
                    showBackNeedle: true,
                    backNeedleLength: 10,
                    length: 35,
                    width: 2,
                    backgroundColor: "#898989"
                }],
                labels: [{
                    distanceFromScale: -20,
                    color: "#8c8c8c"
                }],
                ticks: [{
                    type: "major",
                    distanceFromScale: 2,
                    height: 16,
                    width: 1,
                    color: "transparent"
                },
                {
                    type: "minor",
                    height: 8,
                    width: 1,
                    distanceFromScale: 2,
                    color: "transparent"
                }],


                ranges: [{
                    distanceFromScale: -28,
                    startValue: 0,
                    endValue: 95,
                    backgroundColor: "rgba(43,170,191,0.3)",
                    border: { color: "rgba(43,170,191,0.3)" },
                    size: 2
                },
                {
                    distanceFromScale: -28,
                    startValue: 101,
                    endValue: 200,
                    backgroundColor: "rgba(43,170,191,0.6)",
                    borderColor: "rgba(43,170,191,0.6)",
                    size: 2
                },
                {
                    distanceFromScale: -28,
                    startValue: 205,
                    endValue: 300,
                    backgroundColor: "rgba(43,170,191,1)",
                    borderColor: "rgba(43,170,191,1)",
                    size: 2
                }]
            }]
        });
        $("#Electronics").ejCircularGauge({
            backgroundColor: "transparent", width: 200, height: 125, enableAnimation: false,
            scales: [{
                showRanges: true,
                startAngle: 170, sweepAngle: 200, radius: 50, showScaleBar: false, size: 1, border: { width: 0.5 }, maximum: 300, majorIntervalValue: 100, minorIntervalValue: 10,
                pointerCap: { 
                    radius: 3,
                },
                pointers: [{
                    value: $.map(gaugeData, function (value, index) { if (value.Category.toLowerCase() == "electronics") return value.SalesPrice; }),
                    showBackNeedle: true,
                    backNeedleLength: 10,
                    length: 35,
                    width: 2,
                    backgroundColor: "#898989"
                }],
                labels: [{
                    distanceFromScale: -20,
                    color: "#8c8c8c"
                }],
                ticks: [{
                    type: "major",
                    distanceFromScale: 2,
                    height: 16,
                    width: 1,
                    color: "transparent"
                },
                {
                    type: "minor",
                    height: 8,
                    width: 1,
                    distanceFromScale: 2,
                    color: "transparent"
                }],
                ranges: [{
                    distanceFromScale: -28,
                    startValue: 0,
                    endValue: 95,
                    backgroundColor: "rgba(232,189,70,0.3)",
                    border: { color: "rgba(232,189,70,0.3)" },
                    size: 2
                },
                {
                    distanceFromScale: -28,
                    startValue: 101,
                    endValue: 200,
                    backgroundColor: "rgba(232,189,70,0.6)",
                    border: { color: "rgba(232,189,70,0.6)" },
                    size: 2
                },
                {
                    distanceFromScale: -28,
                    startValue: 208,
                    endValue: 300,
                    backgroundColor: "rgba(232,189,70,1)",
                    border: { color: "rgba(232,189,70,1)" },
                    size: 2
                }]
            }]
        });
        $(".span3 >div").css('margin-left', ($(".span3").width() - 200) / 2);
    }
}

//Rendering LineChart, Gauge and RangeChart while selecting Grid items
function gridRowSelected(args) {
    clearGridRelatedData();
    salesinitialloading = true;
    var currentState = args.data.State;
    var dataMgr = ej.DataManager(salesOverAllData);
    var group;
    var chartgauge, range;
    //To return data to render Chart and Gauge
    group = ej.Query().from(salesOverAllData).where("State", ej.FilterOperators.equal, currentState).sortBy("CategoryName").group("CategoryName");
    chartgauge = dataMgr.executeLocal(group);
    renderSalesChartData(chartgauge);
    renderGaugeData(chartgauge);
    dataMgr = ej.DataManager(gaugeData);
    var gaugeSort = dataMgr.executeLocal(ej.Query().from(gaugeData).sortByDesc("SalesPrice"));
    salesData = { "MaxValue": salesGridData[0].Sales, "MinValue": salesGridData[salesGridData.length-1].Sales, "MaxSalesPrice": gaugeSort[0].SalesPrice };
    //Chart
    renderSalesChart(chartData);
    salesinitialloading = false;
    //Gauge
    if (!ej.isMobile())
        renderGauge(gaugeData);
    gridRowTouched = false;
    //$(".waitingpopup").hide()
}
//To set id for grid inner element for scroll panel usage
function afterRender(args) {

    $(this.getGridContentTable().parents()[1]).attr('id', 'ScrollContent');
    $('#ScrollPanel').attr('data-targetwidth', $('.span6').width() - 4);
    var t = setTimeout(function () {
        gridRowTouched = false;
        var grid = $("#salesgrid").ejmGrid("instance");
        rowSelect = true;
        grid.selectRows(0);
        $(".gridchart >.span6, .gaugecontainer").removeClass("addbackground");
        $('#ScrollPanel').mScrollPanel();
        $('#MainContent').css('visibility', 'visible');
    }, 0);
}

//Rendering Grid, LineChart and Gauge while selecting the Range Date
function updateElements() {
    var dataMgr = ej.DataManager(salesOverAllData);
    var group;
    var grid, chartgauge, range;
    var predicate = ej.Predicate("ShipDate", ej.FilterOperators.greaterThan, window.startDate, false);
    predicate = predicate.and("ShipDate", ej.FilterOperators.lessThan, window.endDate, false);
    //To return data to render Grid
    group = ej.Query().from(salesOverAllData).where(predicate).group("State");
    grid = dataMgr.executeLocal(group);
    if (grid.length > 0) {
        renderSalesGridData(grid);
        //To return data to render Chart and Gauge
        group = ej.Query().from(salesOverAllData).where(predicate).sortBy("CategoryName").group("CategoryName");
        chartgauge = dataMgr.executeLocal(group);
        renderSalesChartData(chartgauge);
        renderGaugeData(chartgauge, true);
        dataMgr = ej.DataManager(salesGridData);
        var gridSort = dataMgr.executeLocal(ej.Query().from(salesGridData).sortByDesc("Sales"));
        dataMgr = ej.DataManager(gaugeData);
        var gaugeSort = dataMgr.executeLocal(ej.Query().from(gaugeData).sortByDesc("SalesPrice"));
        salesData = { "MaxValue": gridSort[0].Sales, "MinValue": gridSort.pop().Sales, "MaxSalesPrice": gaugeSort[0].SalesPrice };
        //Grid
        renderSalesGrid(salesGridData);
        renderSalesChart(chartData);
        //Gauge
        if (!ej.isMobile())
            renderGauge(gaugeData);
    }
    else
        ej.getCurrentPage().find("[data-layout='pane'].ui-page-active #chartContent").ejChart("option", { "initSeriesRender": false });
}
//Rendering Grid, LineChart and Gauge while selecting the Range Date
function salesRangeDateSelected(args) {
    if (!salesinitialloading) {
        clearRangeRelatedData();
        $(".gridchart >.span6, .gaugecontainer").addClass("addbackground");
        window.startDate = args.selectedRangeSettings.start;
        window.endDate = args.selectedRangeSettings.end;
        updateElements();        
    }
    //$(".waitingpopup").hide();
}

function initSales() {
    salesinitialloading = true,
	salesOverAllData, salesGridData = [], chartData = [], rangeData = [], gaugeData = [], salesData = [];
    salesOverAllData = JSON.parse(JSON.stringify(salesOverAllData2012), json_deserialize_helper);
    oaDate = new Date(1899, 11, 30);
    rowSelect = false;
    millisecondsOfaDay = 24 * 60 * 60 * 1000;
    colChartColor = ["#E8BD46", "#369E63", "#B73939", "#2BAABF", "#CC793B", "#4586A0", "#7AA542", "#C13870", "#B348E5"];
    renderDatasource();
    //Grid
    renderSalesGrid(salesGridData);
    //Chart
    renderSalesChart(chartData);
    //Gauge
    if (!ej.isMobile())
        renderGauge(gaugeData);
    salesinitialloading = false;
    $("#headertemplate .e-m-header-left").bind("tap", function () {
        history.back();
    });
    $(document).unbind("viewtransfer", initSales);
}
$(document).bind("viewbeforetransfer", viewTransferSalesUnbind);
function viewTransferSalesUnbind(args, data) {
    if (data.fromPage.hasClass("salespage") && data.toPage.hasClass("showcase")) {
        $(".salespage").attr("data-appcache", "false");
    }
    else if (data.toPage.hasClass("salespage")) {
        $(document).bind("viewtransfer", initSales);
    }
    $(".salespage #MainContent").css({ "visibility": "hidden" });
}
function renderDatasource() {
    var dataMgr = ej.DataManager(salesOverAllData);
    var group;
    var grid, chartgauge, range;
    //To return data to render Grid
    group = ej.Query().from(salesOverAllData).group("State");
    grid = dataMgr.executeLocal(group);
    renderSalesGridData(grid);
    //To return data to render Chart and Gauge
    var singleDataMgr = ej.DataManager(grid[0].items);

    group = ej.Query().from(grid[0].items).sortBy("CategoryName").group("CategoryName");
    chartgauge = singleDataMgr.executeLocal(group);
    renderSalesChartData(chartgauge);
    renderGaugeData(chartgauge);
    //To return data to render Range Chart
    group = ej.Query().from(grid[0].items).group("ShipDate");
    range = singleDataMgr.executeLocal(group);
    renderSalesRangeData(range);
    dataMgr = ej.DataManager(gaugeData);
    var gaugeSort = dataMgr.executeLocal(ej.Query().from(gaugeData).sortByDesc("SalesPrice"));
    salesData = { "MaxValue": salesGridData[0].Sales, "MinValue": salesGridData[salesGridData.length - 1].Sales, "MaxSalesPrice": gaugeSort[0].SalesPrice };
    //RangeChart
    renderSalesRangeChart(rangeData);
}
function renderSalesGridData(data) {
    $.each(data, function (index, value) {
        var state = value.key;
        var sales = ej.dataUtil.sum(value.items, "SalesAmount");
        var SalesvsTargetval = window.targetData[value.key] ? (window.targetData[value.key] / 100) : 0;
        grid = { "State": state, "Sales": sales, "SalesvsTarget": SalesvsTargetval };
        salesGridData.push(grid);
    });
    var dataMgr = ej.DataManager(salesGridData);
}
function renderSalesChartData(data) {
    var cData = [];
    var dataMgr;
    $.each(data, function (index, value) {
        var category = value.key;
        dataMgr = ej.DataManager(value.items);
        var sales = ej.dataUtil.sum(value.items, "SalesAmount");
        dataVal = { "SalesPrice": sales, "Category": category };
        cData.push(dataVal);

    });
    chartData.push({ "series": cData });
}
function renderGaugeData(data, rangeChart) {
    $.each(data, function (index, value) {
        gauge = { "Category": value.key, "SalesPrice": ej.dataUtil.sum(value.items, "SalesAmount") / (rangeChart ? 100000 : 10000) };
        gaugeData.push(gauge);
    });
}
function renderSalesRangeData(data) {
    var rangeAmount = 0;
    $.each(data, function (index, value) {
        $.each(value.items, function (index, value) {
            rangeAmount = rangeAmount + value.SalesAmount;
        });
        range = { "Date": value.key, "SalesPrice": rangeAmount };
        rangeAmount = 0;
        rangeData.push(range);
    });
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
function changeRecord(year) {
    year.value = year.text.toLowerCase();
    $("#yearMenu").ejmMenu("hide");
    clearOverall();
    if (year.value.toLowerCase() == "year 2011 report") {
        salesOverAllData = JSON.parse(JSON.stringify(salesOverAllData2011), json_deserialize_helper);
    }
    else if (year.value.toLowerCase() == "year 2010 report") {
        salesOverAllData = JSON.parse(JSON.stringify(salesOverAllData2010), json_deserialize_helper);
    }
    else if (year.value.toLowerCase() == "year 2009 report") {
        salesOverAllData = JSON.parse(JSON.stringify(salesOverAllData2009), json_deserialize_helper);
    }
    else if (year.value.toLowerCase() == "year 2008 report") {
        salesOverAllData = JSON.parse(JSON.stringify(salesOverAllData2008), json_deserialize_helper);
    }
    else if (year.value.toLowerCase() == "year 2012 report") {
        salesOverAllData = JSON.parse(JSON.stringify(salesOverAllData2012), json_deserialize_helper);
    }
    renderDatasource();
}
function hidesalespopup() {
    $(".waitingpopup").hide()
    showsalescontent();
}
scrollDistY = 0, scrollDistX = 0, scrollY = 0, scrollX = 0, pageScroll = false;
function onScrollStart(args, data) {
    scrollY = args.y;
    scrollX = args.x;
    pageScroll = false;
}
function onScrollMove(args, data) {
    scrollDistY = args.y - scrollY;
    scrollDistX = args.x - scrollX;
    if (Math.abs(scrollDistY) > 0 || Math.abs(scrollDistX) > 0) {
        pageScroll = true;
    }
}
function onScrollEnd(args) {
    pageScroll = false;
}