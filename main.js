/* Vienna Sightseeing Beispiel */

// Stephansdom Objekt
let stephansdom = {
    lat: 48.208493,
    lng: 16.373118,
    title: "Stephansdom"
};

// Karte initialisieren
let map = L.map("map").setView([
    stephansdom.lat, stephansdom.lng
], 15);
map.addControl(new L.Control.Fullscreen ())

//thematische Layer
let themaLayer = {
    stops: L.featureGroup(),
    lines: L.featureGroup(),
    zones: L.featureGroup(),
    sights: L.featureGroup(). addTo(map),
}

// Hintergrundlayer
let layerControl = L.control.layers({
    "BasemapAT Grau": L.tileLayer.provider("BasemapAT.grau").addTo(map),
    "BasemapAT Standard": L.tileLayer.provider("BasemapAT.basemap"),
    "BasemapAT High-DPI": L.tileLayer.provider("BasemapAT.highdpi"),
    "BasemapAT Gelände": L.tileLayer.provider("BasemapAT.terrain"),
    "BasemapAT Oberfläche": L.tileLayer.provider("BasemapAT.surface"),
    "BasemapAT Orthofoto": L.tileLayer.provider("BasemapAT.orthofoto"),
    "BasemapAT Beschriftung": L.tileLayer.provider("BasemapAT.overlay")
}, {
    "Vienna Sightseeing Haltestellen": themaLayer.stops,
    "Vienna Sightseeing Linien": themaLayer.lines,
    "Fußgängerzonen": themaLayer.zones,
    "Sehenswürdigkeiten": themaLayer.sights
}).addTo(map);

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

//Haltestellen
async function showStops(url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    L.geoJSON(jsondata, {
        onEachFeature: function (feature, layer) {
            let prop = feature.properties;
            layer.bindPopup(`
            <h4><i class="fa-solid fa-bus"></i>&nbsp;${prop.LINE_NAME}</h4>
            <i class="fa-regular fa-circle-stop"></i>&nbsp;${prop.STAT_NAME}
            `);
            //console.log(feature.properties);
        }
    }).addTo(themaLayer.stops);
}
//Linien
async function showLines(url) { 
    let response = await fetch(url);
    let jsondata = await response.json();
    let lineNames = {};
    let lineColors = { 
        "1": "#FF4136", //red
        "2": "#FFDC00", //yellow
        "3": "#0074D9", //blue
        "4": "#2ECC40", //green
        "5": "#AAAAAA", //grey
        "6": "#FF851B", //orange
    }
    L.geoJSON(jsondata, {
        style: function (feature) {
        return {
            color: lineColors[feature.properties.LINE_ID],
            weight:3,
            dashArray: [10, 6]};
    },
        onEachFeature: function (feature, layer) {
            let prop = feature.properties;
            layer.bindPopup(`
            <h4><i class="fa-solid fa-bus"></i>&nbsp;${prop.LINE_NAME}</h4>
            <i class="fa-regular fa-circle-stop"></i>&nbsp;${prop.FROM_NAME}<br>
            <i class="fa-solid fa-arrow-down"></i><br>
            <i class="fa-regular fa-circle-stop"></i>&nbsp;${prop.TO_NAME}
            `);
            lineNames[prop.LINE_ID] = prop.LINE_NAME;
            //console.log(lineNames)
        }
    }).addTo(themaLayer.lines);
}
//Sehenswürdigkeiten
async function showSights(url) { 
    let response = await fetch(url);
    let jsondata = await response.json();
    L.geoJSON(jsondata, {
        pointToLayer: function(feature, latlng) {
            return L.marker(latlng, {
                    icon: L.icon({
                        iconUrl: 'icons/photo1.png',
                        iconSize: [32, 37],
                        iconAnchor: [16, 37], //Positionierung vom Icon
                        popupAnchor: [0, -37], //popup versetzen
                })
            });
        },
        onEachFeature: function (feature, layer) {
            let prop = feature.properties;
            layer.bindPopup(`
            <img src="${prop.THUMBNAIL}" alt="*">
            <h4><a href="${prop.WEITERE_INF}" target="Wien">${prop.NAME}</a></h4> 
            <adress>${prop.ADRESSE}</adress>
            `);
            //console.log(feature.properties, prop.NAME);
        }
    }).addTo(themaLayer.sights);
}
//Fußgängerzonen
async function showZones(url) { 
    let response = await fetch(url);
    let jsondata = await response.json();
    L.geoJSON(jsondata, {
        style: function (feature) {
        return {
            color: "#F012BE",
            opacity: 0.4,
            weight: 1,
            fillOpacity: 0.1
            };
        },
        onEachFeature: function (feature, layer) {
            let prop = feature.properties;
            layer.bindPopup(`
            <h4>Fußgängerzone&nbsp;${prop.ADRESSE}</h4>
            <i class="fa-regular fa-clock"></i>&nbsp;${prop.ZEITRAUM || "dauerhaft"}<br><br>
            <i class="fa-solid fa-circle-info"></i>&nbsp;${prop.AUSN_TEXT || "keine Ausnahmen"}
            `);
            //console.log(feature.properties);
        }
    }).addTo(themaLayer.zones);
}

showStops("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:TOURISTIKHTSVSLOGD&srsName=EPSG:4326&outputFormat=json");
showLines("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:TOURISTIKLINIEVSLOGD&srsName=EPSG:4326&outputFormat=json");
showZones("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:FUSSGEHERZONEOGD&srsName=EPSG:4326&outputFormat=json");
showSights("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:SEHENSWUERDIGOGD&srsName=EPSG:4326&outputFormat=json");
