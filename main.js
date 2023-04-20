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
], 12);
//thematische Layer
let themaLayer ={
    stops: L.featureGroup(),
    lines: L.featureGroup(),
    zones: L.featureGroup(),
    sights: L.featureGroup().addTo(map)
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
    "Fußgängerzonen": themaLayer. zones,
    "Sehenswürdigkeiten": themaLayer. sights
}).addTo(map);

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

//Vienna Sightseeing: Haltestellen, Sights, Linien, Fußgängerzonen
async function showStops (url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    L.geoJSON(jsondata).addTo(themaLayer.stops);
}
async function showLines (url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    L.geoJSON(jsondata).addTo(themaLayer.lines);
}
async function showSights (url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    L.geoJSON(jsondata,{
        onEachFeature: function(feature, layer){
            let prop = feature.properties;
            layer.bindPopup(`
            <img src="${prop.THUMBNAIL}" alt="*">
            <h4><a href="${prop.WEITERE_INF}" target="Wien">${prop.NAME}</a></h4> 
            <adress>${prop.ADRESSE}</adress>
            `);
            console.log(feature.properties, prop.NAME);
        }
    }).addTo(themaLayer.sights);
}
async function showZones (url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    L.geoJSON(jsondata).addTo(themaLayer.zones);
}

showStops("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:TOURISTIKHTSVSLOGD&srsName=EPSG:4326&outputFormat=json");
showLines("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:TOURISTIKLINIEVSLOGD&srsName=EPSG:4326&outputFormat=json");
showZones("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:FUSSGEHERZONEOGD&srsName=EPSG:4326&outputFormat=json");
showSights("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:SEHENSWUERDIGOGD&srsName=EPSG:4326&outputFormat=json");
