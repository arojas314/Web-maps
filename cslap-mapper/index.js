/* Part 1: Add a base map to the map container and the geoJSON file of points

        Add a base map to the map container and the geoJSON file of points
        
        Create a variable to hold the map element, then add an OSM layer and the geojson points
        layer of CSLAP lakes
*/

// First, create the style function for the CSLAP data layers

// First, create functions that will be used in the styling of the map elements (style based on cholorphyll-a measure)
var styleFun = function (feature, resolution) {
    var styleRed = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 10,
            fill: new ol.style.Fill({
                color: 'red'
            })
        })
    });

    var styleYellow = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 8,
            fill: new ol.style.Fill({
                color: 'yellow'
            })
        })
    });

    var styleGreen = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 6,
            fill: new ol.style.Fill({
                color: 'green'
            })
        })
    });


    var styleRest = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 4,
            fill: new ol.style.Fill({
                color: 'blue'
            })
        })
    });

    if (feature.get('Chl.a (ug/L)') > 55) {
        return [styleRed];
    } else if (feature.get('Chl.a (ug/L)') > 20 && feature.get('Chl.a (ug/L)') < 56) {
        return [styleYellow];
    } else if (feature.get('Chl.a (ug/L)') > 2.5 && feature.get('Chl.a (ug/L)') < 21) {
        return [styleGreen]
    } else {
        return [styleRest]
    }
}

// CSLAP 2016 and 2016 layers

// Create a new source for vector using the geojson cslap16 points file
var lakeSourceFeature16 = new ol.source.Vector({
    format: new ol.format.GeoJSON(),
    url: './data/cslap16_json.geojson'
    // projection: 'EPSG:4326'
})
// lakeSourceFeature.addFeatures(myObjsYr)
// create a new layer for cslap16, and use the lakeSourceFeature as the soruce
var cslapLayer16 = new ol.layer.Vector({
    source: lakeSourceFeature16,
    visible: true,
    title: 'cslap16',
    style: styleFun
});

// Create a new source for vector using the geojson cslap17 points file
var lakeSourceFeature17 = new ol.source.Vector({
    format: new ol.format.GeoJSON(),
    url: './data/cslap17_json.geojson'
    // projection: 'EPSG:4326'
})
// lakeSourceFeature.addFeatures(myObjsYr)
// create a new layer for cslap16, and use the lakeSourceFeature as the soruce
var cslapLayer17 = new ol.layer.Vector({
    source: lakeSourceFeature17,
    visible: false,
    title: 'cslap17',
    style: styleFun
});


// Initialize the map
var map = new ol.Map({
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([-74.564208984375, 42.63799988907408]),
        zoom: 8
    })
});


/*
 * Elements that make up the popup.
 */


var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

var overlay = new ol.Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
        duration: 250
    }
});
map.addOverlay(overlay);

closer.onclick = function () {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};

/* -- Display information on a popup -- */

// Add a click handler to the map to render the popup.

map.on('singleclick', function (event) {
    if (map.hasFeatureAtPixel(event.pixel) === true) {
        var coordinate = event.coordinate;

        // get feature at pixel, then get all the properties for that feature and save it to a variable called obj
        var feature = map.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
            return feature;
        });
        var obj = feature.getProperties();
        console.log(obj);
        lakeName = obj.LakeNm;
        lakeArea = obj.Area_ac;
        trophicState = obj.Trophic;
        lakeTown = obj.Town;
        // add the watershed name

        // Add the lake name
        content.innerHTML = "<h2>" + lakeName + "</h2><b></b><p>Town: " + lakeTown + "</p>" + "<p>Area (acres): " + lakeArea + "</p>" + "<p>Trophic State: " + trophicState + "</p>";
        // add the link to the right panel, and include the onclick event attribute
        content.innerHTML += "<p><a href='#rightPanel' onclick='rightP_view()'>View Lake </div></p>";

        overlay.setPosition(coordinate);
    } else {
        overlay.setPosition(undefined);
        closer.blur();
    }
});

// function to open the right panel from the pop-up hyperlink 'View Lake'
function rightP_view() {
    var x = document.getElementById("rightPanel");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}


///////////////////////// end code block for pop-ups


/*
 * Base maps and layer switcher
 */

// Basemap layers
const openStreetMapHuman = new ol.layer.Tile({
    source: new ol.source.OSM({
        url: 'https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
    }),
    visible: false,
    title: 'OSMHumanitarian'
});

const openStreetMapStandard = new ol.layer.Tile({
    source: new ol.source.OSM(),
    visible: true,
    title: 'OSMStandard'
});

const stamenTerrain = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: 'http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg',
        attributions: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
    }),
    visibile: false,
    title: 'StamenTerrain'
});

/* Adding the base layers to groups and the data layers to groups, then adding both to the map */

// Base Layer group
const baseLayerGroup = new ol.layer.Group({
    layers: [
        openStreetMapHuman, stamenTerrain, openStreetMapStandard
    ]
});
// add base layer group to map
map.addLayer(baseLayerGroup);

// Data layer group
const dataLayerGroup = new ol.layer.Group({
    layers: [
        cslapLayer16, cslapLayer17
    ]
});
// add data layer group to map
map.addLayer(dataLayerGroup)


/* Layer Switcher Logic for Basemaps */
const baseLayerElements = document.querySelectorAll('.baseLayerSelect > input[type=radio]');
console.log(baseLayerElements);

for (let layerElement of baseLayerElements) {
    // console.log(layerElement)
    layerElement.addEventListener('change', function () {
        // console.log(this.value); // this is the element (just prints out the element value to the console)
        let baseLayerElementValue = this.value; // value for each input element
        baseLayerGroup.getLayers().forEach(function (element, index, array) { // getLayers is a method for layerGroups in OpenLayers (check the OL documentation!)
            // console.log(element.getKeys()); // returns all the keys from each element
            let baseLayerTitle = element.get('title');
            element.setVisible(baseLayerTitle === baseLayerElementValue); // set the visibility of that layer to true
            console.log('baseLayerTitle: ' + baseLayerTitle, 'baseLayerElementValue: ', baseLayerElementValue)
        });
    })
}

/* Layer Switcher Logic for data layers */
const dataLayerElements = document.querySelectorAll('.dataLayerSelect > input[type=radio]');
console.log(dataLayerElements);

for (let layerElement of dataLayerElements) {
    // console.log(layerElement)
    layerElement.addEventListener('change', function () {
        // console.log(this.value); // this is the element (just prints out the element value to the console)
        let dataLayerElementValue = this.value; // value for each input element
        dataLayerGroup.getLayers().forEach(function (element, index, array) { // getLayers is a method for layerGroups in OpenLayers (check the OL documentation!)
            // console.log(element.getKeys()); // returns all the keys from each element
            let dataLayerTitle = element.get('title');
            element.setVisible(dataLayerTitle === dataLayerElementValue); // set the visibility of that layer to true
            console.log('dataLayerTitle: ' + dataLayerTitle, 'dataLayerElementValue: ', dataLayerElementValue)
        });
    })
}


// Function for displaying/hiding the layer switcher using the button
function layerBtn() {
    var x = document.getElementById("layerSwitcherPanel");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}


/////////////////////////////////////////////////////////// End code for base maps and layer switcher


/* 
* Functions for displaying the panels when clicking the Left and Right Panels buttons in Navbar
*/
function leftBtn() {
    var x = document.getElementById("leftPanel");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}


function rightBtn() {
    var x = document.getElementById("rightPanel");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

///////////////////////////////////

/*
Functions for left and right panels
*/


// use the getJSON function to fetch the local geojson data
$.getJSON("./data/cslap_proj.geojson", function (data) {

    console.log(data.features); // print json output

    // Filter for the water samlping data for 2016
    var cslap16 = data.features.filter(function (row) {
        if (row.properties.Year == 2016) {
            return row
        }
    });

    console.log(cslap16)

    // Filter for the water samlping data for 2017
    var cslap17 = data.features.filter(function (row) {
        if (row.properties.Year == 2017) {
            return row
        }
    });

    console.log(cslap17)

    /* Data Switcher Logic for data year in left panel */
    const dataSelectLP = document.querySelectorAll('#dataRadioBtnLP > input[type=radio]');
    console.log(dataSelectLP);
    // debugger

    var selectedDataYear = cslap16;
    for (let dataElement of dataSelectLP) {
        // debugger
        // console.log(layerElement)
        dataElement.addEventListener('change', function () {
            // console.log(this.value); // this is the element (just prints out the element value to the console)
            let dataElementValue = this.value; // value for each input element
            // debugger
            if (dataElementValue === 'cslap16') {
                selectedDataYear = cslap16
            } else if (dataElementValue === 'cslap17') {
                selectedDataYear = cslap17

            }
            console.log('Selected year for LP: ', selectedDataYear);

            var dataAgg = d3.nest()
                .key(function (d) {
                    // debugger
                    return d.properties.CSLAPNo;
                })
                .rollup(function (v) {
                    // debugger
                    return {
                        count: v.length,
                        avgCHLA: d3.mean(v, function (d) { return d.properties['Chl.a (ug/']; }),
                        avgCAL: d3.mean(v, function (d) { return d.properties['Ca (mg/L)']; }),
                        avgChl: d3.mean(v, function (d) { return d.properties['Cl (mg/L)']; }),
                        avgPhos: d3.mean(v, function (d) { return d.properties['TP (mg/L)']; }),
                        avgCond25: d3.mean(v, function (d) { return d.properties['Cond25 (uS']; }),
                        Elev_m: d3.mean(v, function (d) { return d.properties['Elev_m']; }),
                        avgNH4: d3.mean(v, function (d) { return d.properties['NH4 (mg/L)']; }),
                        avgNO3: d3.mean(v, function (d) { return d.properties['NO3 (mg/L)']; }),
                        // avg: d3.mean(v, function(d) { return d.amount; })
                    };
                })
                .entries(selectedDataYear);

            // Get the selected options text from both the variable select elements
            var xVar = document.getElementById("x-var");
            xVarTxt = xVar.options[xVar.selectedIndex].text;
            console.log(xVarTxt);

            var yVar = document.getElementById("y-var");
            yVarTxt = yVar.options[yVar.selectedIndex].text;
            console.log(yVarTxt);

            // return a list for x-var
            var avgXvar = dataAgg.map(function (a) {
                // debugger
                return a.value[`${xVarTxt}`]
            });

            // return a list for y-var
            var avgYvar = dataAgg.map(function (a) {
                return a.value[`${yVarTxt}`]
            });

            var tempArr = [];
            for (var i = 0; i < avgXvar.length; i++) {
                x = avgXvar[i];
                y = avgYvar[i];
                var json = { x: x, y: y };
                tempArr.push(json);
            };

            console.log(tempArr);

            scatterChart.data.datasets[0].data = tempArr;
            scatterChart.data.datasets[0].label = `${xVarTxt} vs ${yVarTxt}`;
            // debugger
            scatterChart.options.scales.xAxes[0].scaleLabel.labelString = xVarTxt; // rename the x axis
            scatterChart.update();


        })
    };
    /////////////////////////////////////// end logic for data year switch

    // Use d3 library to aggregate cslap data by the CSLAPno property (CSLAP lake number)
    var dataAgg = d3.nest()
        .key(function (d) {
            // debugger
            return d.properties.CSLAPNo;
        })
        .rollup(function (v) {
            // debugger
            return {
                count: v.length,
                avgCHLA: d3.mean(v, function (d) { return d.properties['Chl.a (ug/']; }),
                avgCAL: d3.mean(v, function (d) { return d.properties['Ca (mg/L)']; }),
                avgChl: d3.mean(v, function (d) { return d.properties['Cl (mg/L)']; }),
                avgPhos: d3.mean(v, function (d) { return d.properties['TP (mg/L)']; }),
                avgCond25: d3.mean(v, function (d) { return d.properties['Cond25 (uS']; }),
                Elev_m: d3.mean(v, function (d) { return d.properties['Elev_m']; }),
                avgNH4: d3.mean(v, function (d) { return d.properties['NH4 (mg/L)']; }),
                avgNO3: d3.mean(v, function (d) { return d.properties['NO3 (mg/L)']; }),
                // avg: d3.mean(v, function(d) { return d.amount; })
            };
        })
        .entries(selectedDataYear);



    // debugger

    console.log(dataAgg)


    /* Create a chart with menu to select which variables are displayed along the x and y axes */

    // return a list for phsophorous
    var avgPHOSarr = dataAgg.map(function (a) {
        // debugger
        return a.value['avgPhos']
    });

    // return a list for chlorphyl a
    var avgCHLAarr = dataAgg.map(function (a) {
        return a.value['avgCHLA']
    });

    // get the vales into the required format for scatterplots on chart.js e.g. {x: value, y: value}
    var storage = [];
    for (var i = 0; i < avgPHOSarr.length; i++) {
        x = avgPHOSarr[i];
        y = avgCHLAarr[i];
        var json = { x: x, y: y };
        storage.push(json);
    }

    console.log(storage)

    var ctx = document.getElementById("myChart").getContext('2d');
    var scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'TP vs Chl-a',
                fill: true,
                pointBackgroundColor: '#7002c4',
                // showLine: true,
                data: storage
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom',
                    scaleLabel: {
                        display: true,
                        labelString: 'Average Total Phosphorous (mg/l)'
                    }
                }],
                yAxes: [{
                    type: 'linear',
                    scaleLabel: {
                        display: true,
                        labelString: 'Average Chlorophyll-a (ug/l)'
                    }
                }]
            }
        }
    });

    /* Functions for updating xvar in chart */
    changeXVar = () => {

        // Get the selected options text from both the variable select elements
        var xVar = document.getElementById("x-var");
        xVarTxt = xVar.options[xVar.selectedIndex].text;
        console.log(xVarTxt);

        var yVar = document.getElementById("y-var");
        yVarTxt = yVar.options[yVar.selectedIndex].text;
        console.log(yVarTxt);

        // return a list for x-var
        var avgXvar = dataAgg.map(function (a) {
            // debugger
            return a.value[`${xVarTxt}`]
        });

        // return a list for y-var
        var avgYvar = dataAgg.map(function (a) {
            return a.value[`${yVarTxt}`]
        });

        var tempArr = [];
        for (var i = 0; i < avgXvar.length; i++) {
            x = avgXvar[i];
            y = avgYvar[i];
            var json = { x: x, y: y };
            tempArr.push(json);
        };

        console.log(tempArr);

        scatterChart.data.datasets[0].data = tempArr;
        scatterChart.data.datasets[0].label = `${xVarTxt} vs ${yVarTxt}`;
        // debugger
        scatterChart.options.scales.xAxes[0].scaleLabel.labelString = xVarTxt; // rename the x axis
        scatterChart.update();

    };

    // Include the variables in the dropdown
    Object.keys(dataAgg[0].value).forEach(function (val) {
        var selectObj = document.getElementById("x-var");
        var option = document.createElement("option");
        option.text = val;
        selectObj.add(option);
    });

    /* Functions for updating y var in chart */
    changeYVar = () => {

        // Get the selected options text from both the variable select elements
        var xVar = document.getElementById("x-var");
        xVarTxt = xVar.options[xVar.selectedIndex].text;
        console.log(xVarTxt);

        var yVar = document.getElementById("y-var");
        var yVarTxt = yVar.options[yVar.selectedIndex].text;
        console.log(yVarTxt);

        // return a list for x-var
        var avgXvar = dataAgg.map(function (a) {
            // debugger
            return a.value[`${xVarTxt}`]
        });

        // return a list for y-var
        var avgYvar = dataAgg.map(function (a) {
            return a.value[`${yVarTxt}`]
        });

        var tempArr = [];
        for (var i = 0; i < avgXvar.length; i++) {
            x = avgXvar[i];
            y = avgYvar[i];
            var json = { x: x, y: y };
            tempArr.push(json);
        };

        console.log(tempArr);

        scatterChart.data.datasets[0].data = tempArr;
        scatterChart.data.datasets[0].label = `${xVarTxt} vs ${yVarTxt}`;
        scatterChart.options.scales.yAxes[0].scaleLabel.labelString = yVarTxt; // rename the y-axis
        scatterChart.update();

    };

    // Include the variables in the dropdown
    Object.keys(dataAgg[0].value).forEach(function (val) {
        var selectObj = document.getElementById("y-var");
        var option = document.createElement("option");
        option.text = val;
        selectObj.add(option);
    });
    // debugger

}); //////////////////////////////////////// close getJSON for first chart






// Use the geJSON function to fetch the local geojson data for the second chart (time series)
$.getJSON("./data/cslap_proj.geojson", function (data) {


    // Filter for the water sample data for 2016
    var cslap16 = data.features.filter(function (row) {
        if (row.properties.Year == 2016) {
            return row
        }
    });

    console.log(cslap16)

    // Filter for the water sample data for 2017
    var cslap17 = data.features.filter(function (row) {
        if (row.properties.Year == 2017) {
            return row
        }
    });

    console.log(cslap17)

    /* Data Switcher Logic for data year in left panel */

    const dataSelectRP = document.querySelectorAll('#dataRadioBtnRP > input[type=radio]');
    console.log(dataSelectRP);
    // debugger

    var selectedDataYear = cslap16; // start with selected data year as cslap16

    for (let dataElement of dataSelectRP) {
        // debugger
        // console.log(layerElement)
        dataElement.addEventListener('change', function () {
            // console.log(this.value); // this is the element (just prints out the element value to the console)
            let dataElementValue = this.value; // value for each input element
            // debugger
            if (dataElementValue === 'cslap16') {
                selectedDataYear = cslap16
            } else if (dataElementValue === 'cslap17') {
                selectedDataYear = cslap17

            }
            // print the selected data year
            console.log('Selected year for RP: ', selectedDataYear);

            var dataAgg = d3.nest()
                .key(function (d) {
                    // debugger
                    return d.properties.LakeNm;
                })
                .entries(selectedDataYear);

            // Get the selected options text from the y-variable for the time chart
            var yVar = document.getElementById("timeYvar");
            yVarTxt = yVar.options[yVar.selectedIndex].text;
            console.log(yVarTxt);

            // return a list for y-var
            var timeYvar = dataAgg[0].values.map(function (a) {
                // debugger
                return a.properties[`${yVarTxt}`]
            });

            var tempArr = [];
            for (var i = 0; i < dataAgg[0].values.length; i++) {
                x = new Date(dataAgg[0].values[i].properties['Date']);
                y = timeYvar[i];
                var json = { x: x, y: y };
                tempArr.push(json);
            }

            console.log(tempArr);


            timeChart.data.datasets[0].data = tempArr;
            timeChart.data.datasets[0].label = `${yVarTxt}`;
            timeChart.options.scales.yAxes[0].scaleLabel.labelString = yVarTxt; // rename the y axis
            timeChart.update();

        })
    };
    /////////////////////////////////////// end logic for data year switch

    var dataAgg = d3.nest()
        .key(function (d) {
            // debugger
            return d.properties.LakeNm;
        })
        .entries(selectedDataYear);

    console.log("time series data agg", dataAgg); // must select for a lake!! Fix this before including in mapper
    // debugger

    // Include the variables in the dropdown (skip those that are not a number)
    Object.keys(dataAgg[0].values[0].properties).forEach(function (val) {
        // if (isNaN(val)) {
        //     return;
        // }
        var selectObj = document.getElementById("timeYvar");
        var option = document.createElement("option");
        option.text = val;
        // debugger
        selectObj.add(option);
    });
    // debugger

    // Include the lake names in a dropdown
    dataAgg.forEach(function (val) {

        var selectObj = document.getElementById("lakeSelectRP");
        var option = document.createElement("option");
        option.text = val.key;
        // debugger
        selectObj.add(option);
    });

    // get the values into the required format for scatterplots on chart.js e.g. {x: value, y: value}
    var storage = [];
    for (var i = 0; i < dataAgg[0].values.length; i++) {
        x = new Date(dataAgg[0].values[i].properties['Date']);
        y = dataAgg[0].values[i].properties['Chl.a (ug/'];
        var json = { x: x, y: y };
        storage.push(json);
    }

    console.log(storage)

    /* Initalize time series */
    var ctx = document.getElementById("timeChart").getContext('2d');
    // debugger
    var timeChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                // borderColor: 'rgba(135, 99, 225, 1)',
                // borderColor: 'black',
                borderWidth: 1,
                // showLine: true,
                pointBackgroundColor: '#236ede',
                data: storage
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    type: 'time',
                    distribution: 'linear',
                    time: {
                        unit: 'day'
                    }
                }],
                yAxes: [{
                    type: 'linear',
                    scaleLabel: {
                        display: true,
                        labelString: 'Average Chlorophyll-a (ug/l)'
                    }
                }]
            }
        }
    });

    // console.log(timeChart)

    /* Functions for updating y var in time chart */
    changeTimeVar = () => {

        // Get the selected lake from the dropdown list
        var selectedLakeEl = document.getElementById("lakeSelectRP");
        var lakeTxt = selectedLakeEl.options[selectedLakeEl.selectedIndex].text;
        console.log("Selected Lake", lakeTxt);

        // return an object for the selected lake
        var selectedLake = dataAgg.find(obj => {
            return obj.key === `${lakeTxt}`
        });

        // Get the selected options text from the y-variable select elements
        var yVar = document.getElementById("timeYvar");
        var yVarTxt = yVar.options[yVar.selectedIndex].text;
        console.log("time y-var", yVarTxt);


        // return a list for y-var
        var timeYvar = selectedLake.values.map(function (a) {
            // debugger
            return a.properties[`${yVarTxt}`]
        });

        // debugger

        var tempArr = [];
        for (var i = 0; i < timeYvar.length; i++) {
            x = new Date(selectedLake.values[i].properties['Date']);
            y = timeYvar[i];
            var json = { x: x, y: y };
            tempArr.push(json);
        };

        console.log(tempArr);

        timeChart.data.datasets[0].data = tempArr;
        timeChart.data.datasets[0].label = `${yVarTxt}`;
        timeChart.options.scales.yAxes[0].scaleLabel.labelString = yVarTxt; // rename the x axis
        timeChart.update();

    };

    /* Functions for updating y var in time chart */
    changeLake = () => {

        // Get the selected lake from the dropdown list
        var selectedLakeEl = document.getElementById("lakeSelectRP");
        var lakeTxt = selectedLakeEl.options[selectedLakeEl.selectedIndex].text;
        console.log("Selected Lake", lakeTxt);

        // return an object for the selected lake
        var selectedLake = dataAgg.find(obj => {
            return obj.key === `${lakeTxt}`
        });

        // Get the selected options text from the y-variable select elements
        var yVar = document.getElementById("timeYvar");
        var yVarTxt = yVar.options[yVar.selectedIndex].text;
        console.log("time y-var", yVarTxt);


        // return a list for y-var
        var timeYvar = selectedLake.values.map(function (a) {
            // debugger
            return a.properties[`${yVarTxt}`]
        });

        // debugger

        var tempArr = [];
        for (var i = 0; i < timeYvar.length; i++) {
            x = new Date(selectedLake.values[i].properties['Date']);
            y = timeYvar[i];
            var json = { x: x, y: y };
            tempArr.push(json);
        };

        console.log(tempArr);

        timeChart.data.datasets[0].data = tempArr;
        timeChart.data.datasets[0].label = `${yVarTxt}`;
        timeChart.update();

    };

});




