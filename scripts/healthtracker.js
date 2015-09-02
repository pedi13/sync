
/* To change Header */
function isMobile() {
    return ((ej.isMobile() || window.innerWidth <= 480) || ($("#samplefile").length && $("#samplefile").width() < 480)) ? true : false;
}
/* Scroller's */
function refreshHealthScroller() {
    $(".healthTracker.subpage").css("visibility", "");
    if (!window.isCalc) {
        $(".stepcenter").css({ "left": (($("#ChartStep").width() / 2) - $(".stepcenter").width() / 2), "top": (($("#ChartStep").height() / 2) - ($(".stepcenter").height() / 2) - 2) });
        $(".stepfloorcenter").css({ "left": (($("#ChartFloor").width() / 2) - $(".stepfloorcenter").width() / 2), "top": (($("#ChartFloor").height() / 2) - ($(".stepfloorcenter").height() / 2) - 2) });
        $(".calorie").css({ "left": (($(".pievalue").width() / 2) - $(".calorie").width() / 2), "top": (($(".pievalue").height() / 2) - ($(".calorie").height() / 2) - 2) });
    }
    setTimeout(function () {
        $("#healthmainscroll:visible").ejmScrollPanel("refresh");
        $("#gaugeScroll:visible").ejmScrollPanel("refresh");
        $("#healthsubscroll:visible").ejmScrollPanel("refresh");
    });
}
/* Chart is rendered based on the summary collection value in the grid */
var gaugewidth = isMobile() ? 290 : 240;
var scaleradius = isMobile() ? 140 : 120;
var validator;

$(window).bind("resize", function () {
    if (isMobile() && !$("#rotatorguage").data("ejmRotator")) {
        $("#gaugeScrl").empty();
        if ($("#gaugetemplate").length) {
            $("#gaugeScrl").append($("#gaugetemplate")[0].innerHTML);
        }
        setGaugeWidth();
        renderHealthGauge();
        $("#rotatorguage").ejmRotator({ targetId: "todayDetails", targetHeight: 220, targetWidth: "auto" });
    }
    else if (!isMobile() && $("#rotatorguage").data("ejmRotator")) {
        $("#gaugeScrl").empty();
        $("#gaugeScrl").append($("#gaugetemplate")[0].innerHTML);
        renderHealthGauge();
    }
    else if (ej.isWindows() && isMobile() && $("#rotatorguage").data("ejmRotator")) {
        $("#rotatorguage").ejmRotator({ targetWidth: window.innerWidth });
    }
    setGaugeWidth();
    $("#healthchart_svg").height(isMobile() ? 270 : 345);
    if (!window.isCalc) {
        $(".stepcenter").css({ "left": (($("#ChartStep").width() / 2) - $(".stepcenter").width() / 2), "top": (($("#ChartStep").height() / 2) - ($(".stepcenter").height() / 2) - 2) });
        $(".stepfloorcenter").css({ "left": (($("#ChartFloor").width() / 2) - $(".stepfloorcenter").width() / 2), "top": (($("#ChartFloor").height() / 2) - ($(".stepfloorcenter").height() / 2) - 2) });
        $(".calorie").css({ "left": (($(".pievalue").width() / 2) - $(".calorie").width() / 2), "top": (($(".pievalue").height() / 2) - ($(".calorie").height() / 2) - 2) });
    }
});

/* Render All Elements */
function renderHealthElements() {
    $(document).unbind("viewbeforetransfer", renderHealthElements);
    $("#healthmainscroll").attr("data-ej-enablenativescrolling", ej.isAndroid() ? false : (ej.isTouchDevice() || ej.isWindows()) ? true : false);
    $("#gridadd").attr("data-ej-targetheight", window.innerHeight / 2);
    $("#gaugeScrl").append($("#gaugetemplate")[0].innerHTML);
    if ((ej.isAndroid() || ej.isWindows()) && isMobile())
        $("#healthsampleheader").attr("data-ej-theme", "light");
    setGaugeWidth();
    // To get and initialize the HTML elements
    $("#formwrapper").html($("#addpageform")[0].innerHTML);
    ej.widget.init($("#formwrapper"));
    //To hide Pending labels in mobile mode
    if (isMobile())
        $("#rotatorguage").ejmRotator({ targetId: "todayDetails", targetHeight: 220, targetWidth: "auto" });
    // To render gauge, grid and chart
    renderHealthGauge();        
    renderHealthGrid();
    renderHealthChart();
    renderDialog();
    // To open / show addmeal section 
    $(".addmealimg").bind("" + ej.endEvent() + " MSPointerUp pointerup", function () {
        if (isMobile()) {
            App.transferPage($(".healthTracker"), $("#addpage"), { parentSubPage: ej.isDesktop });
            validator && validator.resetForm();
            clearFields();
        }
        else {
            $("#gridadd").ejmDialog("open");
            setHealthFormValidation();
            clearFields();
            validator.resetForm();
        }
    });
    // To call submit function in Mobile mode
    if (isMobile()) {
        $(".healthpage .e-m-tbcontainer .donebtn").bind("click", function () {
            setHealthFormValidation();
            validator.resetForm();
            $(".additemform:visible").submit();
            $("#healthsubscroll").ejmScrollPanel("refresh");
        });
    }
    // To navigate back through History
    $("#mobheadertemplate .e-m-header-left").bind("click", function () {
        history.back();
    });
}
/* To render grid */
function renderHealthGrid() {
    var healthgridheight = "285";
    if (isMobile())
        healthgridheight = "225";
    var columnmap = [
                { field: "FoodId", key: true, visible: false, type: "Int32" },
                { field: "FoodName", headerText: "FOOD", width: 120, type: "String" },
                { field: "Fat", headerText: "FAT", width: 60, type: "Int32" },
                { field: "Carbohydrate", headerText: "CARB", width: 60, type: "Int32" },
                { field: "Protein", headerText: "PROTEIN", width: 60, type: "Int32" }
    ];

    //grid is loaded with food information
    $("#healthgrid").ejmGrid({
        theme: "light",
        dataSource: window.FoodInformation,
        allowScrolling: true,
        allowPaging: false,
        enableCaption: false,
        width: "100%",
        actionComplete: "selectInitial",
        rowSelected: "healthGridRowSelected",
        scrollSettings: { allowHorizontalScroll: true, enableNativeScrolling: ej.isAndroid() ? false : ((ej.isTouchDevice() || $.support.hasPointer) && ej.isWindows() && !ej.isDesktop) ? true : false, height: healthgridheight, allowVerticalScroll: true },
        columns: columnmap
    });
}
/* To render gauge */
function renderHealthGauge() {
    $("#GaugeRDI").ejCircularGauge({
        frame: {
            frameType: "halfcircle"
        },
        width: gaugewidth, height: 140, radius: 70,
        drawLabels: "LabelRDIDraw",
        enableAnimation: false,
        backgroundColor: "Transparent",
        scales: [{
            startAngle: 183.3,
            sweepAngle: 173,
            showRanges: true,
            showLabels: false,
            radius: scaleradius,
            minimum: 0,
            maximum: 1000,
            majorIntervalValue: 100,
            pointerCap: {
                radius: 12,
                backgroundColor: "#56C1A5",
                borderColor: "#56C1A5"
            },
            pointers: [{ border: { color: "#8C9B97" }, needleStyle: "rectangle", width: 1, value: 325, length: 90 }],
            ticks: [{
                color: "Transparent",
                height: 16,
                width: 3
            }, {
                color: "Transparent",
                height: 7,
                width: 1
            }],
            labels: [{
                color: "#56C1A5", distanceFromScale: -3
            }],
            ranges: [{
                size: 7,
                startValue: 0,
                endValue: 325,
                backgroundColor: "#56C1A5",
                border: { color: "#56C1A5" }
            }, {
                size: 7,
                startValue: 326,
                endValue: 1000,
                backgroundColor: "#AED1C6",
                border: { color: "#AED1C6" }
            }]
        }]
    });
    $("#ChartCalValue").text(325 + "cal");
    $(".rdilabel").text("RDI - " + 325 + "/" + 1000);
    $(".rdipenlabel").text(1000 - 325 + " calories pending");
    $("#callabel").text("Cal To Burn- " + 465 + "/" + 1000);
    $("#callabelpending").text((1000 - 465) + " calories pending");

    // render the gauge
    $("#GaugeBurnt").ejCircularGauge({

        frame: {
            frameType: "halfcircle"
        },
        width: gaugewidth, height: 140, radius: 70,
        drawLabels: "LabelRDIDraw",
        enableAnimation: false,
        backgroundColor: "Transparent",
        scales: [{
            startAngle: 183.3,
            sweepAngle: 173,
            showRanges: true,
            showLabels: false,
            radius: scaleradius,
            minimum: 0,
            maximum: 1000,
            majorIntervalValue: 100,
            pointerCap: {
                radius: 12,
                backgroundColor: "#B24949",
                borderColor: "#B24949"
            },
            pointers: [{ border: { color: "#998C8C" }, needleStyle: "rectangle", width: 1, value: 325, length: 90 }],
            ticks: [{
                color: "Transparent",
                height: 16,
                width: 3
            }, {
                color: "Transparent",
                height: 7,
                width: 1
            }],
            labels: [{
                color: "#B24949", distanceFromScale: -3
            }],
            ranges: [{
                size: 7,
                startValue: 0,
                endValue: 465,
                backgroundColor: "#B24949",
                border: { color: "#B24949" }
            }, {
                size: 7,
                startValue: 466,
                endValue: 1000,
                backgroundColor: "#C6A5A5",
                border: { color: "#C9A5A6" }
            }]
        }]
    });
    //number of steps pending chart is rendered 
    $("#ChartStep").ejChart(
    {
        series: [
        {
            points: [
                { x: 'Carbohydrate', y: 35, text: "", visible: true, fill: "#D3C1D2" },
                { x: 'Fat', y: 65, text: "", visible: true, fill: "#B26BAB" }
            ],
            type: 'pie', enableAnimation: false,
            opacity: 0.8, border: { width: 1, color: "#D3C1D4" }
        }
        ],
        margin: { top: 0, bottom: 0, left: 10, right: 10 },
        size: { height: "160", width: "160" },
        legend: { visible: false, font: { size: '12px', color: 'black' }, position: 'bottom' }

    });
    //number of floors pending chart is rendered 
    $("#ChartFloor").ejChart(
        {
            series: [
            {
                points: [
                    { x: 'Carbohydrate', y: 7, text: "", visible: true, fill: "#C1BFD8" },
                    { x: 'Fat', y: 3, text: "", visible: true, fill: "#7C6FB2" }
                ],
                type: 'pie', enableAnimation: false,
                opacity: 0.8, border: { width: 1, color: "#BFBED9" }
            },
            ],
            margin: { top: 0, bottom: 0, left: 10, right: 10 },
            size: { height: "160", width: "160" },
            legend: { visible: false, font: { size: '12px', color: "black" }, position: 'bottom' },
            loaded: "floorChartRendered",
            loaded: "refreshHealthScroller"
        });
}
/* To render chart */
function renderHealthChart() { 
    $("#healthchart").ejChart({
        series: [
        {
            points: [
                { x: 'Carb', y: 84, fill: "#D3B062", text: " Carb" },
                { x: 'Protein', y: 222, fill: "#B24949", text: " Protein" },
                { x: 'Fat', y: 113, fill: "#56B2C1", text: " Fat" }
            ],
            marker: {
                dataLabel: { visible: true, connectorLine: { color: "#6D6D6D", width: 2, height: 10 }, margin: { left: 50, top: 50, right: 50, bottom: 50 }, font: { color: "#878787", size: '15px', fontWeight: 'lighter' } }
            },
            name: 'Newyork', type: 'pie', labelPosition: "inside", explode: false, enableAnimation: true
        }
        ],
        explode: false,
        margin: { left: 10, top: 0, right: 0, bottom: 0 },
        create: "chartCreate",
        loaded: "refreshHealthScroller",
        size: isMobile() ? { "width": "270", "height": "270"} : { "height": "345", "width":"345" },
        canResize: true,
        legend: { visible: false}
    });
}
/* To select initial value in Grid */
function selectInitial() {
    $('#healthgrid').ejmGrid("model.selectedRowIndex", 0);
    refreshHealthScroller();
}
/* To add entry in Grid */
function addEntry(args) {
    var value = args.value ? args.value : (args.text ? args.text : args.itemname);
    if (value) {
        if (value.toLowerCase() == "done") {
            setHealthFormValidation();
            validator.resetForm();
            $(".additemform:visible").submit();
            App.activePage.find("#healthsubscroll").ejmScrollPanel("refresh");
        }
        else if (value.toLowerCase() == "close")
            history.back();
    }
}
/* To clear the input entries */
function clearFields() {
    $(".dialogcontentwrapper input").val("");
}
/* Form Validation */
function setHealthFormValidation() {
    validator = $(".additemform:visible").validate({
        rules: {
            food: { required: true },
            fat: {
                required: true,
                range: [1, 1000]
            },
            carb: {
                required: true,
                range: [1, 1000]
            },
            protein: {
                required: true,
                range: [1, 1000]
            },
            calorie:
                {
                    required: true,
                    range: [1, 1000]
                },
            calorieburnt:
                {
                    required: true,
                    range: [1, 1000]
                }
        },
        messages: {
            food: { required: "Please enter food name" },
            fat: {
                required: "Please enter fat value",
                range: "Please enter in range of [1-1000]"
            },
            carb: {
                required: "Please enter carbohydrate value",
                range: "Please enter in range of [1-1000]"
            },
            protein: {
                required: "Please enter protein value",
                range: "Please enter in range of [1-1000]"
            },
            calorie:
                {
                    required: "Please enter the calorie value",
                    range: "Please enter in range of [1-1000]"
                },
            calorieburnt:
                {
                    required: "Please enter burnt calories",
                    range: "Please enter in range of [1-1000]"
                }
        },
        submitHandler: function (form) {
            window.FoodInformation.unshift({ "FoodId": getHealthMaxValue() + 1, "FoodName": $("input[name='food']:visible").val(), "CalBurnt": Number($("input[name='calorieburnt']:visible").val()), "Calorie": Number($("input[name='calorie']:visible").val()), "Protein": Number($("input[name='protein']:visible").val()), "Fat": Number($("input[name='fat']:visible").val()), "Carbohydrate": Number($("input[name='carb']:visible").val()) });
            var tempdata = [];
            $.extend(true, tempdata, window.FoodInformation);
            $("#healthgrid").ejmGrid("model.dataSource", tempdata);
            $("#gridadd").ejmDialog("close");
            $("input").blur();
            refreshHealthScroller();
            if (isMobile())
                window.history.back();
            return false;
        }
    });
}
/* To close and submit entries in AddItem dialog */
function closeHealthDialog(args) {
    if (args.text.toLowerCase() == "add") {
        $(".additemform:visible").submit();
        $("#gridadd_scroll").ejmScrollPanel("refresh");
    }
    else
        $("#gridadd").ejmDialog("close");
}
/* To get grid data */
function getHealthMaxValue() {
    dataMgr = ej.DataManager(window.FoodInformation);
    var max = dataMgr.executeLocal(ej.Query().from(window.FoodInformation).sortBy("FoodId")).pop();
    return max.FoodId;
}
/* To update gauge and piechart based on selected entries  */
function healthGridRowSelected(args) {
    updateGauge(args.data.Calorie, args.data.CalBurnt);
    if (!isMobile())
        updatePiechart(args.data);
}
/* To update PieChart */
function updatePiechart(selctedvalues) {
    if (isMobile())
        $(".chartdata").css({ "visibility": "hidden", "display": "block" });
    var carbtemp = isMobile() ? selctedvalues.Carbohydrate + "g" : selctedvalues.Carbohydrate + "g" + " Carb";
    var protemp = isMobile() ? selctedvalues.Protein + "g" : selctedvalues.Protein + "g" + " Protein";
    var fattemp = isMobile() ? selctedvalues.Fat + "g" : selctedvalues.Fat + "g" + " Fat";
    $("#ChartCalValue").text(selctedvalues.Calorie + "cal");
    $("#healthchart").ejChart("option", {
        "model": {
            series: [{
                "type": "pie", "points": [
                    { x: 'Carb', y: selctedvalues.Carbohydrate, text: carbtemp },
                    { x: 'Protein', y: selctedvalues.Protein, text: protemp },
                    { x: 'Fat', y: selctedvalues.Fat, text: fattemp }
                ]
            }]
        }
    });
    $("#healthmainscroll").ejmScrollPanel("refresh");
}
/* To update calories burnt gauge */
function updateGauge(caloriesValue, caloriesBurnt) {
    gaugeRdi = $("#GaugeRDI").data("ejCircularGauge");
    gaugeburnt = $("#GaugeBurnt").data("ejCircularGauge");
    updateCircularGauge(gaugeRdi, caloriesValue);
    updateCircularGauge(gaugeburnt, caloriesBurnt);
    $(".rdilabel").text("RDI  - " + caloriesValue + "/1000");
    $(".rdipenlabel").text(1000 - caloriesValue + " calories pending");
    $("#callabel").text("Cal To Burn - " + caloriesBurnt + "/1000");
    $("#callabelpending").text(1000 - caloriesBurnt + " calories pending");
    $(".waitingpopup").hide();
    refreshHealthScroller();
}
/* To update CircularGauge */
function updateCircularGauge(gaugeObj, calburntValue) {
    gaugeObj.setRangeEndValue(0, 0, calburntValue);
    gaugeObj.setRangeStartValue(0, 1, calburntValue + 1);
    gaugeObj.setRangeStartValue(0, 0, 0);
    gaugeObj.setPointerValue(0, 0, calburntValue);
}
/* To set label Font */
function LabelRDIDraw(args) {
    if (args.labelValue == 0 || args.labelValue == 500 || args.labelValue == 1000) {
        args.style.textValue = args.labelValue;
        args.style.font = "Normal 15px Segoe UI";
    }
    else {
        args.style.textValue = "";
    }
}
/* To set gauge width */
function setGaugeWidth() { 
    if ((isMobile() || (window.innerWidth >= 320 && window.innerWidth <= 480)) || ($("#samplefile").length && $("#samplefile").width() < 480))
        $(".gauge,.e-m-rot-item").css("width", ($("#samplefile").length ? $("#samplefile").width() : window.innerWidth));
    else if (window.innerWidth < 800 && window.innerWidth > 480) {
        $(".gauge").css("width", (($("#samplefile").length ? $("#samplefile").width() : window.innerWidth) - (ej.getRenderMode() == "windows" ? 20 : 0)) / 2);
    }
    else  
        $(".gauge").css("width", (($("#samplefile").length ? $("#samplefile").width() : window.innerWidth) - (ej.getRenderMode() == "windows" ? 20 : 0)) / 4);
    
    if (isMobile()) {
        $("#todayDetails .gauge").removeClass("gauge");
        if (!$("#rotatorguage").data("ejmRotator"))
            $("#todayDetails .wrap").find("label:last").remove();
    }
}

/* To render Dialog */
function renderDialog() {
    $("#gridadd").ejmDialog({
        "checkDomChanges": true, "allowScrolling": true, "enableModal": true, close: "clearfields", "mode": "confirm", "targetHeight": window.innerHeight / 2,
        "rightButtonCaption": "Add", buttonTap: "closeHealthDialog", "title": "Add Meal", "templateId": "addpageform", "enableNativeScrolling": false
    });
}
$(function () {
    window.isCalc = ej.isCssCalc();
});