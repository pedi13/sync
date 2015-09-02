var oaDate = new Date(1899, 11, 30);
var millisecondsOfaDay = 24 * 60 * 60 * 1000;
var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var init = 0, pieData = [], expenseGridData = [], expenseRangeData = [], initialloading = true, OverallExpense = [], pieParentData = [], pieHomeData = [], pieDailyData = [], pieEntertainmentData = [], pieHealthData = [], pieTransportationData = [], piePersonalData = [];
var categoryData = [], categoryAmount = [], validator = null, expensePieChartLabelColor = "#A6A6A6", expensePieChartLegentVisible = true, expensePieChartLabelPosition = 'inside';

$("#expense_gridadd").attr("data-ej-targetheight", window.innerHeight / 2);

function isMobile() {
    return (ej.isMobile() || window.innerWidth <= 480 || $("#samplefile").length && $("#samplefile").width() < 480);
}

function renderAllExpense() {
    $(document).unbind("viewtransfer", renderAllExpense);
    //Grid add new using Dialog field validator
    //templates
    initialloading = true;
    if ($("#addexpense_template").length)
        $(".expenseaddpage.subpage .dialogcontentwrapper").html($("#addexpense_template")[0].innerHTML);
    if (ej.getRenderMode() == "ios7") {
        $("#expenseaddheader").removeClass("e-m-dark").addClass("e-m-light");
    }
    ej.widget.init($(".expenseaddpage.subpage .dialogcontentwrapper"));
    //bind show dialog event for add icon
    $(".expensepage .addimg").bind("" + ej.endEvent() + " MSPointerUp pointerup", function (evt) {
        if (isMobile()) {
            App.transferPage($(".expenseanalysis"), $("#expenseaddpage"), { parentSubPage: ej.isDesktop });
            validator && validator.resetForm();
            clearfields();
        }
        else {
            $("#expense_gridadd").ejmDialog("open");
            validator && validator.resetForm();
        }
    });

    $(".e-m-tbcontainer .donebtn").bind("tap", function () {
        validation();
        $("#additemform:visible").submit();
    });

    //UpdateGridChart(new Date("3/1/2011").ToOADate(), new Date("5/1/2011").ToOADate());
    OverallExpense = GenerateDB("2013");
    var dataMgr = ej.DataManager(OverallExpense);
    var predicate = ej.Predicate("DateTime", ej.FilterOperators.greaterThan, new Date("3/1/2013"), false);
    predicate = predicate.and("DateTime", ej.FilterOperators.lessThan, new Date("5/1/2013"), false);

    //To return data to render Grid
    var group = ej.Query().from(OverallExpense).where(predicate);
    var expenseGridData = dataMgr.executeLocal(group);
    renderGridData(expenseGridData);

    //To return data to render Chart
    renderExpenseChartData(expenseGridData);
    renderGrid(expenseGridData);
    renderChart(pieData);
    updatePieData();
    renderRangeChartData();
    renderRangeChart(expenseRangeData, "2013");
    ej.listenTouchEvent($(".backbutton"), ej.endEvent(), $.proxy(window.chartBackButtonTap, window), false);
    scrollRefresh();
    initial = false;
}


// To render Grid
function renderGrid(expenseGridData) {
    if (!initialloading) {
        $("#ExpenseGrid").ejmGrid("model.dataSource", expenseGridData);
    }
    else {
        $("#ExpenseGrid").ejmGrid({
            theme: "light",
            dataSource: expenseGridData,
            allowScrolling: true,
            allowFiltering: false,
            enableCaption: false,
            actionComplete: "afterExpenseGridRender",
            scrollSettings: { allowHorizontalScroll: false, height: "300px", allowVerticalScroll: true, enableNativeScrolling: ej.isAndroid() ? false : (ej.isTouchDevice() || (ej.isDevice() && ej.isWindows())) ? true : false },
            columns: [
                { field: "DateTime", headerText: "Date", format: "{0:MMM dd yyyy}" },
                { field: "SubCategory", headerText: "Description" },
                { field: "CategoryName", headerText: "Category" },
                { field: "Amount", headerText: "Expense ($)"}]
        });
    }
    $(".waitingpopup").hide();
    if (ej.getRenderMode() == "windows")
        $("#expense_scroll").ejmScrollPanel("option", "enabeNativeScrolling", true)
    scrollRefresh();
}


function renderChart(chartdata) {
    var expensePieChartHeight = "300";
    expensePieChartLegentVisible = true;
    expensePieChartHeight = "300";
    expensePieChartLabelColor = "#FFFFFF";
    if ($("#ExpenseChart").data("ejChart"))
        $("#ExpenseChart").ejChart("destroy");
    $("#ExpenseChart").ejChart({

        series: [{
            type: 'pie',
            name: "ExpenseChart",
            enableAnimation: true,
            labelPosition: "inside",
            border: { width: 1 },
            explode: false,
            pieCoefficient: 0.8,
            marker: {
                dataLabel: {
                    visible: true,
                    connectorLine: { color: '#E1E1E1', width: 1, height: 20 },
                    font: { fontFamily: 'Segoe UI', fontStyle: 'Normal ', fontWeight: 'Regular', size: '12px', color: expensePieChartLabelColor, opacity: 1 }
                }
            },
            dataSource: window.chartDS, xName: "ExpenseCategory", yName: "Amount"
        }],
        marker: { dataLabel: { visible: true, font: { size: '5px'}} },
        margin: { left: 10, top: 0, right: 0, bottom: 0 },
        create: "chartCreate",
        legend: { visible: expensePieChartLegentVisible, font: { color: "#FFFFFF", size: "10px" }, location: { x: 300, y: 600} },
        seriesRendering: 'seriesRender',
        size: { height: expensePieChartHeight },
        canResize: true,
        pointRegionClick: 'chartClick'
    });
    if (!ej.isCssCalc())
    setTimeout(function () {
        $("#ExpenseChart .backbutton").css("left", $("#ExpenseChart").width() / 2 - 27 + "px").css("top", $("#ExpenseChart").height() / 2 - 45 + "px");
    }, 500);
    $(".waitingpopup").hide();
}

// Triggered on year selection
function yearselected(e) {
    $(".backbutton").css("display", "none");
    var year;
    $("#yearMenu").ejmMenu("hide");
    year = e.text;
    window.currentYear = year.split(" ")[1];
    OverallExpense = GenerateDB(year.split(" ")[1]);
    UpdateGridChart(new Date("3/1/" + year.split(" ")[1]), new Date("5/1/" + year.split(" ")[1]));
    renderRangeChartData();
    renderRangeChart(expenseRangeData, year.split(" ")[1]);
    $(".waitingpopup").hide();
}

function menuopen() {
    var e = { currentTarget: this._wrapper };
    if (ej.getRenderMode() == "windows" && !isMobile())
        e = undefined;
    $("#yearMenu").ejmMenu("show", e);
}

$(document).on('touchstart mousedown', function (e) {
    if (e.target && e.target.parentElement && e.target.parentElement.nodeName == "g")
        $('#expense_scroll').ejmScrollPanel("disable");
});

$(document).on('touchend mouseup', function (e) {
    if (e.target && e.target.parentElement && e.target.parentElement.nodeName == "g")
        $('#expense_scroll').ejmScrollPanel("enable");
});


//To clear the input fields
function clearfields() {
    $(".additemform input").val("");
}

function getAddGridData(data, year) {
    var dataMgr = ej.DataManager(data);
    var predicate = ej.Predicate("DateTime", ej.FilterOperators.greaterThan, window.startDate, false);
    predicate = predicate.and("DateTime", ej.FilterOperators.lessThan, window.EndDate, false);
    //To return data to render Grid
    var group = ej.Query().from(data).where(predicate);
    return dataMgr.executeLocal(group);
}

// To get the maximum values
function getmaxvalue(data) {
    dataMgr = ej.DataManager(data);
    var max = dataMgr.executeLocal(ej.Query().from(window.FoodInformation).sortBy("TransactionNo")).pop();
    return max.TransactionNo;
}


function validation() {
    validator = $(".additemform:visible").validate({
        debug: true,
        focusInvalid:false,
        rules: {
            desc: { required: true },
            category: { required: true },
            expense: { required: true }
        },
        messages: {
            desc: { required: "Please enter description" },
            category: { required: "Please enter category" },
            expense: { required: "Please enter valid expense value" }
        },
        submitHandler: function (form) {
            var currentYear = expenseGridData[0].DateTime.getFullYear().toString();
            var database = GenerateDB(currentYear);
            var transNum = getmaxvalue(database) + 1;
            var today = new Date();
            var expenseDate = new Date((window.startDate.getMonth() + 1) + "/" + (window.startDate.getDate() + 1) + "/" + expenseGridData[0].DateTime.getFullYear());
            database.unshift({ "DateTime": expenseDate, "TransactionNo": transNum, "SubCategory": $("input[name='desc']:visible").val(), "CategoryName": $("input[name='category']:visible").val(), "Amount": parseInt($("input[name='transamount']:visible").val()), "AccountType": $("#acctype.acctypeoptions:visible").val() });
            gridvalues = getAddGridData(database, currentYear);
            var tempdata = [];
            $.extend(true, tempdata, gridvalues);
            $("#ExpenseGrid").ejmGrid("model.dataSource", tempdata);
            UpdateGridChart(window.startDate, window.EndDate); 
            if (isMobile()) {
                history.back();
            }
            else
                $("#expense_gridadd").ejmDialog("close");
        }
    });
}

function chartBackButtonTap() {
    $("#ExpenseChart").ejChart("option", { "pie": pieSeries() });
}

// To close the dialog
function closedialog(args) {
    if (args.text == "Add") {
        validation();
        $(".additemform:visible").submit();
        if ($("#expense_gridadd").data("ejmScrollPanel"))
            $("#expense_gridadd").ejmDialog("instance")._scrollWrapper.ejmScrollPanel("refresh");
    }
    else {
        $("#expense_gridadd").ejmDialog("close");
        clearfields();
    }
}

// To take action depending on button or text clicked on add page
function addentryExpenseAnalysis(args) {
    var value = args.value || args.text ? args.text : args.itemname;
    if (value) {
        if (value.toLowerCase() == "done") {
            validation();
            validator.resetForm();
            $(".expenseaddpage.subpage .additemform:visible").submit();
            $("#expenseAddPageScroll").ejmScrollPanel("refresh");
        }
        else if (value.toLowerCase() == "close") {
            clearfields();
            if (validator) validator.resetForm();
            history.back();
        }
    }
}

// To add the data to expense DB
function changeData() {
    $("#ExpenseChart").ejChart("option", {
        "series":
            [{
                type: 'pie',
                name: "ExpenseChart",
                enableAnimation: false,
                labelPosition: expensePieChartLabelPosition,
                border: { width: 1 },
                explode: false,
                marker:
                    {
                        dataLabel: {
                            visible: true,
                            connectorLine: { color: '#E1E1E1', width: 1, height: 20 },
                            font: { fontFamily: 'Segoe UI', fontStyle: 'Normal ', fontWeight: 'Regular', size: '12px', color: expensePieChartLabelColor, opacity: 1 }
                        }
                    },
                dataSource: window.chartDS, xName: "ExpenseCategory", yName: "Amount"
            }],
        loaded: "showexpensecontent"
    });
    $(".waitingpopup").hide();
}

// To update Grid and chart data based on range selected
function UpdateGridChart(startdate, enddate) {
    init = 0, pieData = [], expenseGridData = [], pieParentData = [], pieHomeData = [], pieDailyData = [], pieEntertainmentData = [], pieHealthData = [], pieTransportationData = [], piePersonalData = [];
    var dataMgr = ej.DataManager(OverallExpense);
    var predicate = ej.Predicate("DateTime", ej.FilterOperators.greaterThan, startdate, false);
    predicate = predicate.and("DateTime", ej.FilterOperators.lessThan, enddate, false);
    //To return data to render Grid
    var group = ej.Query().from(OverallExpense).where(predicate);
    expenseGridData = dataMgr.executeLocal(group);
    renderGridData(expenseGridData);
    //To return data to render Chart
    renderExpenseChartData(expenseGridData);
    renderGrid(expenseGridData);
    changeData();
    updatePieData();
}

function updatePieData() {
    //renderChart(pieParentData);
    dataMgr = ej.DataManager(expenseGridData);
    var predicate = ej.Predicate("AccountType", ej.FilterOperators.equal, "Negative", true);
    //To return data to render Grid
    var min = dataMgr.executeLocal(ej.Query().from(expenseGridData).where(predicate).sortByDesc("Amount")).pop();
    var minAmount = min.Amount;
    var minDate = monthNames[min.DateTime.getMonth()] + " " + min.DateTime.getDate();
    var max = dataMgr.executeLocal(ej.Query().from(expenseGridData).where(predicate).sortBy("Amount")).pop();
    var maxAmount = max.Amount;
    var maxDate = monthNames[max.DateTime.getMonth()] + " " + max.DateTime.getDate();
    var avg = ej.dataUtil.avg(expenseGridData, "Amount");
    var negTrans = dataMgr.executeLocal(ej.Query().from(expenseGridData).where(predicate).sortByDesc("Amount")).length;
    var predicate = ej.Predicate("AccountType", ej.FilterOperators.equal, "Positive", true);
    var posTrans = dataMgr.executeLocal(ej.Query().from(expenseGridData).where(predicate).sortByDesc("Amount")).length;
    var posSum = ej.dataUtil.sum(dataMgr.executeLocal(ej.Query().from(expenseGridData).where(predicate).sortByDesc("Amount")), "Amount");
    var predicate = ej.Predicate("AccountType", ej.FilterOperators.equal, "Negative", true);
    var negSum = ej.dataUtil.sum(dataMgr.executeLocal(ej.Query().from(expenseGridData).where(predicate).sortByDesc("Amount")), "Amount");
    $('.dynamic_pos').html(Globalize.format(Math.round(posSum / 1000), "c0"));
    $('.dynamic_neg').html(Globalize.format(Math.round(negSum / 1000), "c0"));
    $('.dynamic_bal').html(Globalize.format(Math.round((posSum - negSum) / 1000), "c0"));
    $('.most-spent-amt').html(Globalize.format(maxAmount, "c0"));
    $('.least-spent-amt').html(Globalize.format(minAmount, "c0"));
    $('.avg-spent-amt').html(Globalize.format(Math.round(avg), "c0"));
    $('.most-spent-day').html(minDate);
    $('.least-spent-day').html(maxDate);
    $('.trans_pos').html(posTrans + " Transactions");
    $('.trans_neg').html(negTrans + " Transactions");
}

// To render Range Chart data
function renderRangeChartData() {
    expenseRangeData = [];
    $.each(OverallExpense, function (index, value) {
        if (value.AccountType == "Negative")
            expenseRangeData.push({ "Date": value.DateTime, "Amount": value.Amount });
    });
}

// To render grid data
function renderGridData(data) {
    expenseGridData = data;
    var dataMgr = ej.DataManager(expenseGridData);
}


function filterPieData() {
    pieParentData = [];
    var dataMgr = ej.DataManager(expenseGridData);
    var subcategoryData, subcategoryAmount;
    $.each(categoryNames, function (index, value) {
        if (index < 5) {
            var piepredicate = ej.Predicate("CategoryName", ej.FilterOperators.equal, Object.keys(value)[0], true);
            //To return data to render Grid
            var group = ej.Query().from(expenseGridData).where(piepredicate);
            categoryData[index] = dataMgr.executeLocal(group);
            categoryAmount[index] = ej.dataUtil.sum(categoryData[index], "Amount");
            if (categoryAmount[index] != 0) {
                pieParentData.push({ "ExpenseCategory": Object.keys(value)[0], "Amount": categoryAmount[index] });
                window.chartDS = pieParentData;
            }
            j = Object.keys(value)[0];
            $.each(categoryNames[index][j], function (index1, value1) {
                if (index1 < 5) {
                    pieData = [];
                    var piesubpredicate = ej.Predicate("SubCategory", ej.FilterOperators.equal, value1, true);
                    //To return data to render Grid
                    var group = ej.Query().from(expenseGridData).where(piesubpredicate);
                    subcategoryData = dataMgr.executeLocal(group);
                    subcategoryAmount = ej.dataUtil.sum(subcategoryData, "Amount");
                    switch (j) {
                        case "Preliminary":
                            if (subcategoryAmount)
                                pieHomeData.push({ "ExpenseCategory": value1, "Amount": subcategoryAmount });
                            window.Preliminary = pieHomeData;
                            break;
                        case "Sales":
                            if (subcategoryAmount)
                                pieDailyData.push({ "ExpenseCategory": value1, "Amount": subcategoryAmount });
                            window.Sales = pieDailyData;
                            break;
                        case "EmployeeBenefit":
                            if (subcategoryAmount)
                                pieEntertainmentData.push({ "ExpenseCategory": value1, "Amount": subcategoryAmount });
                            window.EmployeeBenefit = pieEntertainmentData;
                            break;
                        case "Operating":
                            if (subcategoryAmount)
                                pieHealthData.push({ "ExpenseCategory": value1, "Amount": subcategoryAmount });
                            window.Operating = pieHealthData;
                            break;
                        case "Technical":
                            if (subcategoryAmount)
                                pieTransportationData.push({ "ExpenseCategory": value1, "Amount": subcategoryAmount });
                            window.Technical = pieTransportationData;
                            break;
                        case "Finance":
                            if (subcategoryAmount)
                                piePersonalData.push({ "ExpenseCategory": value1, "Amount": subcategoryAmount });
                            window.Finance = piePersonalData;
                    }
                }
            });
        }
    });
}

// To render Chart data
function renderExpenseChartData(data) {
    filterPieData();
    window.chartDS = pieParentData;
    pieData = [];
    $.each(data, function (index, value) {
        var ExpenseCategory = value.CategoryName;
        var Amount = value.Amount;
        chart = { "ExpenseCategory": ExpenseCategory, "Amount": Amount };
        pieData.push(chart);
    });
    var dataMgr = ej.DataManager(pieData);
}

//Show or hide back button based on the series name
function completeAnimation(sender) {
    if (sender.model.series[0].name != "ExpenseChart")
        $("#btnBack").show();
    else
        $("#btnBack").hide();
}

//Adding text to the series points to chart
function seriesRender(e) {
    $.each(e.data.series.points, function () {
        var seriesAmt = "$" + formatNumber(Math.round(parseInt((this.YValues)) / 1000))
        this.text = seriesAmt;
        this.text.color = "#FFFFFF";
    });
    if (isMobile()) {
        var yOffset = ((e.model.text) ? e.model._titleLocation.Y : 0) + e.model.margin.top + e.model.LegendBounds.Height;
        actualHeight = e.model.size.height - yOffset;
        centerY = actualHeight * 0.5 + ((e.model.text) ? (e.model._titleLocation.Y) : 0);
        var arrowContainer = ej.isDesktop ? $("#samplefile") : $(window);
    }
}
//Rendering Range Chart
function renderRangeChart(expenseRangeData, year) {
    $(".expense_rangeparent").empty();
    $(".expense_rangeparent").append("<div id='rangechart'></div>");
    var fontSize = '16px';
    var labelFontColor = "#CCCCCC", expenseRangeChartInteriorColor = "#FF0000";
    if (ej.isAndroid()) labelFontColor = "#A6A6A6";
    else if (ej.isWindows()) labelFontColor = "#9E9E9E";
    if (!isMobile()) expenseRangeChartInteriorColor = "#EB9318";
    $("#rangechart").ejRangeNavigator({
        deferredUpdate: true,
        tooltipSettings: { visible: true, labelFormat: "dd/MM/yyyy", tooltipDisplayMode: "ondemand", backgroundColor: "#FFFFFF", font: { color: '#2d2d2d'} },
        selectedRangeSettings: {
            start: "3/1/" + year, end: "5/1/" + year
        },
        enableAutoResizing: true,
        navigatorStyleSettings: getNavigatorStyle(),
        series: [
            {
                name: 'SalesRate',
                enableAnimation: false,
                type: 'line',
                style: { borderColor: 'transparent', opacity: 0.5, interior: expenseRangeChartInteriorColor, borderWidth: 2 },
                dataSource: expenseRangeData, xName: "Date", yName: "Amount"
            }
        ],
        seriesSettings: {
            enableAnimation: true
        },
        labelSettings: {
            higherLevel: {
                visible: false,
                style: { font: { color: '#767676', family: 'Segoe UI', style: 'Normal', size: fontSize, opacity: 1, weight: 'regular'} },
                border: { color: "#FFFFFF", width: 0 },
                gridLineStyle: { color: "#FFFFFF" }
            },
            lowerLevel: {
                intervalType: 'months',
                visible: true,
                style: { font: { color: '#767676', family: 'Segoe UI', style: 'Normal', size: fontSize, opacity: 1, weight: 'regular'} },
                border: { color: "transparent", width: 0 },
                gridLineStyle: { color: "transparent", width: 0 }
            }
        },
        rangeChanged: 'expenseRangeDateSelected'
    });
    scrollRefresh();
}

//To set id for grid inner element for scroll panel usage
function afterExpenseGridRender(args) {
    initialloading = false;
    var t = setTimeout(function () {
        var grid = $("#ExpenseGrid").ejmGrid("instance");
        grid.selectedRowIndex(0);
    }, 500);
    $(".expenseanalysis").css("visibility", "");
    $(".waitingpopup").hide();
}
function formatNumber(number) {
    return Globalize.format(number, "n0"); //formating numbers  for spent amounts
}


function updateExpenseElements() {
	if(startDate.toDateString() != EndDate.toDateString())
		UpdateGridChart(startDate, EndDate);
    $(".waitingpopup").hide();
}

//Rendering Grid, LineChart and Gauge while selecting the Range Date
function expenseRangeDateSelected(args) {
    $(".backbutton").css("display", "none");
    window.startDate = args.selectedRangeSettings.start;
    window.EndDate = args.selectedRangeSettings.end;
    if (!window.isUpdated) {
        window.isUpdated = true;
        window.timeoutCallback = setTimeout(updateExpenseElements, 700);
    }
    else {
        clearTimeout(window.timeoutCallback);
        window.timeoutCallback = setTimeout(updateExpenseElements, 700);
        window.isUpdated = true;
    }

}


Date.prototype.ToOADate = function () {
    var result = (Date.parse(this) - Date.parse(oaDate)) / millisecondsOfaDay;
    return reMlt;
};

//Choosing the series points based on the series name to drilldown chart
function pieSeries(seriesName) {
    switch (seriesName) {
        case "Preliminary":
            {
                return {
                    series: [{
                        dataSource: window.Preliminary, xName: "ExpenseCategory", yName: "Amount", type: 'pie',
                        labelPosition: expensePieChartLabelPosition,
                        enableAnimation: true,
                        explode: false,
                        marker: {
                            dataLabel: {
                                visible: true,
                                connectorLine: { color: '#E1E1E1', width: 1, height: 20 },
                                font: { fontFamily: 'Segoe UI', fontStyle: 'Normal ', fontWeight: 'Regular', size: '12px', color: expensePieChartLabelColor, opacity: 1 }
                            }
                        }
                    }],
                    legend: { visible: expensePieChartLegentVisible },
                    seriesRendering: 'seriesRender'
                };
            }
            break;
        case "Sales":
            {
                return {
                    series: [{
                        dataSource: window.Sales, xName: "ExpenseCategory", yName: "Amount", type: 'pie',
                        labelPosition: expensePieChartLabelPosition,
                        enableAnimation: true,
                        explode: false,
                        marker: {
                            dataLabel: {
                                visible: true,
                                connectorLine: { color: '#E1E1E1', width: 1, height: 20 },
                                font: { fontFamily: 'Segoe UI', fontStyle: 'Normal ', fontWeight: 'Regular', size: '12px', color: expensePieChartLabelColor, opacity: 1 }
                            }
                        }
                    }],
                    marker: { connectorLine: { height: 30} },
                    legend: { visible: expensePieChartLegentVisible },
                    seriesRendering: 'seriesRender'
                };
            }
            break;
        case "EmployeeBenefit":
            {
                return {
                    series: [{
                        dataSource: window.EmployeeBenefit, xName: "ExpenseCategory", yName: "Amount", type: 'pie',
                        labelPosition: expensePieChartLabelPosition,
                        explode: false,
                        enableAnimation: true,
                        marker: {
                            dataLabel: {
                                visible: true,
                                connectorLine: { color: '#E1E1E1', width: 1, height: 20 },
                                font: { fontFamily: 'Segoe UI', fontStyle: 'Normal ', fontWeight: 'Regular', size: '12px', color: expensePieChartLabelColor, opacity: 1 }
                            }
                        }
                    }],
                    marker: { connectorLine: { height: 30} },
                    legend: { visible: expensePieChartLegentVisible },
                    seriesRendering: 'seriesRender'
                };
            }
            break;
        case "Operating":
            {
                return {
                    series: [{
                        dataSource: window.Operating, xName: "ExpenseCategory", yName: "Amount", type: 'pie',
                        labelPosition: expensePieChartLabelPosition,
                        explode: false,
                        enableAnimation: true,
                        marker: {
                            dataLabel: {
                                visible: true,
                                connectorLine: { color: '#E1E1E1', width: 1, height: 20 },
                                font: { fontFamily: 'Segoe UI', fontStyle: 'Normal ', fontWeight: 'Regular', size: '12px', color: expensePieChartLabelColor, opacity: 1 }
                            }
                        }
                    }],
                    legend: { visible: expensePieChartLegentVisible },
                    marker: { connectorLine: { height: 30} },
                    seriesRendering: 'seriesRender'
                };
            }
            break;
        case "Technical":
            {
                return {
                    series: [{
                        dataSource: window.Technical, xName: "ExpenseCategory", yName: "Amount", type: 'pie',
                        labelPosition: expensePieChartLabelPosition,
                        explode: false,
                        enableAnimation: true,
                        marker: {
                            dataLabel: {
                                visible: true,
                                connectorLine: { color: '#E1E1E1', width: 1, height: 20 },
                                font: { fontFamily: 'Segoe UI', fontStyle: 'Normal ', fontWeight: 'Regular', size: '12px', color: expensePieChartLabelColor, opacity: 1 }
                            }
                        }
                    }],
                    legend: { visible: expensePieChartLegentVisible },
                    marker: { connectorLine: { height: 30} },
                    seriesRendering: 'seriesRender'
                };
            }
            break;
        case "Finance":
            {
                return {
                    series: [{
                        dataSource: window.Finance, xName: "ExpenseCategory", yName: "Amount", type: 'pie',
                        labelPosition: expensePieChartLabelPosition,
                        explode: false,
                        enableAnimation: true,
                        marker: {
                            dataLabel: {
                                visible: true,
                                connectorLine: { color: '#E1E1E1', width: 1, height: 20 },
                                font: { fontFamily: 'Segoe UI', fontStyle: 'Normal ', fontWeight: 'Regular', size: '12px', color: expensePieChartLabelColor, opacity: 1 }
                            }
                        }
                    }],
                    legend: { visible: expensePieChartLegentVisible },
                    seriesRendering: 'seriesRender'
                };
            }
            break;
        default:
            {
                return {
                    series: [{
                        name: "ExpenseChart",
                        dataSource: pieParentData, xName: "ExpenseCategory", yName: "Amount", type: 'pie',
                        labelPosition: expensePieChartLabelPosition,
                        explode: false,
                        enableAnimation: true,
						AnimationComplete: false,
                        marker: {
                            dataLabel: {
                                visible: true,
                                connectorLine: { color: '#E1E1E1', width: 1, height: 20 },
                                font: { fontFamily: 'Segoe UI', fontStyle: 'Normal ', fontWeight: 'Regular', size: '12px', color: expensePieChartLabelColor, opacity: 1 }
                            }
                        }
                    }],
                    legend: { visible: expensePieChartLegentVisible },
                    seriesRendering: 'seriesRender',
                    pieAnimationComplete: false
                };
            }
    }

}

function ChartPreRender(sender) {
    for (var i = 0; i < sender.model.series[0].points.length; i++) {
        sender.model.series[0].points[i].interior = getInterior(i % 5);
    }
}
function getInterior(index) {
    var interiorValue = [[{ color: "#e49644", colorStop: "0%" }, { color: "#a86e29", colorStop: "20%"}], [{ color: "#49dadf", colorStop: "0%" }, { color: "#33999d", colorStop: "20%"}], [{ color: "#e65435", colorStop: "0%" }, { color: "#ba3e24", colorStop: "20%"}], [{ color: "#3ed492", colorStop: "0%" }, { color: "#34b57c", colorStop: "20%"}], [{ color: "#fb5259", colorStop: "0%" }, { color: "#aa3539", colorStop: "20%"}]];
    return interiorValue[index];
}

function chartClick(sender) {
    if (!($(".backbutton").is(":visible"))) {
        var index = sender.data.region.Region.PointIndex;
        var name = sender.model.series[0].points[index].x;
        if (sender.model.series[0].name == "ExpenseChart") {
            $(".backbutton").css("display", "block");
            $("#ExpenseChart").ejChart("option", { "drilldown": pieSeries(name) });
        }
    }
    else if (sender.model.series[0].name == "ExpenseChart")
        $(".backbutton").css("display", "none");
}

function getNavigatorStyle() {
    if (ej.isAndroid()) {
        return {
            selectedRegionColor: [{ color: "#222222", colorStop: "0%" }, { color: "#5c5c5c", colorStop: "15%" }, { color: "#5c5c5c", colorStop: "85%" }, { color: "#222222", colorStop: "100%"}],
            unselectedRegionColor: [{ color: "#515151", colorStop: "50%" }, { color: "#0c0c0c", colorStop: "100%"}],
            thumbColor: "#e5e5e5",
            background: "#000000",
            border: { color: "transparent" },
            majorGridLineStyle: { color: "#767676", visible: true },
            minorGridLineStyle: { color: "#767676", visible: true }
        }
    }
    else {
        return {
            selectedRegionColor: "#212121",
            unselectedRegionColor: "#2e2e2e",
            thumbColor: "#e5e5e5",
            background: "#1a1a1b",
            border: { color: "transparent" },
            majorGridLineStyle: { color: "#767676", visible: true },
            minorGridLineStyle: { color: "#767676", visible: true }
        }
    }
}

function scrollRefresh() {
    $("#expense_scroll").ejmScrollPanel("refresh");
}