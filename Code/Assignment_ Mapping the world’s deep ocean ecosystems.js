// ============================================================
// ASSIGNMENT: MAPPING THE WORLD'S DEEP-OCEAN ECOSYSTEMS
// ============================================================

//Assignment Introduction

/* This assignment focused on mapping the world’s major deep-ocean ecosystems using ETOPO1 bathymetry in Google Earth Engine. 
I classified hadal trenches and troughs, abyssal plains, continental and island slopes, and submarine canyons using depth and seafloor slope.
I also added protected areas, EEZ boundaries, and hydrothermal vent locations to provide more context for interpreting the map. */

// ------------------------------------------------------------
// 1. SET UP THE MAP
// ------------------------------------------------------------

Map.setOptions('SATELLITE');
Map.setCenter(0, 0, 2);


// ------------------------------------------------------------
// 2. IMPORT ETOPO1 BATHYMETRY
// ------------------------------------------------------------

// Import the ETOPO1 dataset
var etopo1 = ee.Image('NOAA/NGDC/ETOPO1');

print('Raw ETOPO1 properties:', etopo1);


// Select the bedrock band
var bedrock = etopo1.select('bedrock');

print('Bedrock band:', bedrock);


// ------------------------------------------------------------
// 3. CREATE THE DEEP-OCEAN ECOSYSTEM LAYERS
// ------------------------------------------------------------

// Hadal trenches and troughs deeper than 6000 m
var hadal = bedrock
  .lt(-6000)
  .selfMask();


// Abyssal plains between 3000 m and 6000 m depth
var abyssal = bedrock
  .lt(-3000)
  .and(bedrock.gte(-6000))
  .selfMask();


// Continental and island slopes between 250 m and 3000 m depth
var continentalSlope = bedrock
  .lt(-250)
  .and(bedrock.gte(-3000))
  .selfMask();


// Calculate terrain products from the bedrock layer
var terrain = ee.Terrain.products(bedrock);

print('Terrain products:', terrain);


// Select the slope band
var slope = terrain.select('slope');

print('Slope layer:', slope);


// Submarine canyons deeper than 200 m and slopes greater than 6 degrees
var submarineCanyons = bedrock
  .lt(-200)
  .and(slope.gt(6))
  .selfMask();


// ------------------------------------------------------------
// 4. SET THE MAP COLOURS
// ------------------------------------------------------------

var ecosystemColours = {
  continentalSlope: '2EC4B6',       // turquoise
  abyssal: '3A86FF',                // blue
  hadal: '8338EC',                  // purple
  submarineCanyons: 'FB5607',       // orange-red
  marineProtectedAreas: 'FFD60A',   // yellow
  coastalProtectedAreas: 'FF00FF',  // magenta
  eezBoundaries: 'FFFFFF',          // white
  hydrothermalVents: '7CFC00'       // bright green
};


// ------------------------------------------------------------
// 5. ADD THE ECOSYSTEM LAYERS TO THE MAP
// ------------------------------------------------------------

Map.addLayer(continentalSlope,
    {palette: [ecosystemColours.continentalSlope]},
  'Continental and Island Slopes (250–3000 m)',
  true,
  0.65);


Map.addLayer(abyssal,
  {palette: [ecosystemColours.abyssal]},
  'Abyssal Plains (3000–6000 m)',
  true,
  0.65);


Map.addLayer(hadal,
  {palette: [ecosystemColours.hadal]},
  'Hadal Trenches and Troughs (>6000 m)',
  true,
  0.65);


// Add submarine canyons last so they remain visible
Map.addLayer(submarineCanyons,
  {palette: [ecosystemColours.submarineCanyons]},
  'Submarine Canyons (>200 m deep and >6° slope)',
  true,
  0.75);


// ------------------------------------------------------------
// 6. IMPORT THE WORLD DATABASE ON PROTECTED AREAS
// ------------------------------------------------------------

var wdpa = ee.FeatureCollection(
  'WCMC/WDPA/current/polygons'
);


// Inspect the dataset
//print('WDPA collection:', wdpa);
print('Total number of WDPA polygons:', wdpa.size());
print('First WDPA feature:', wdpa.first());
print('WDPA property names:', wdpa.first().propertyNames());


// ------------------------------------------------------------
// 7. FILTER MARINE AND COASTAL PROTECTED AREAS
// ------------------------------------------------------------

// Keep only features with total-area and marine-area values
var wdpaWithArea = wdpa.filter(
  ee.Filter.notNull([
    'GIS_AREA',
    'GIS_M_AREA']));


// Fully marine protected areas: marine area is greater than zero and equals total area
var marineProtectedAreas = wdpaWithArea
  .filter(ee.Filter.gt('GIS_M_AREA', 0))
  .filter(ee.Filter.equals({
      leftField: 'GIS_M_AREA',
      rightField: 'GIS_AREA'})
  );


// Coastal protected areas
// Marine area is greater than zero but differs from total area
var coastalProtectedAreas = wdpaWithArea
  .filter(ee.Filter.gt('GIS_M_AREA', 0))
  .filter(ee.Filter.notEquals({
      leftField: 'GIS_M_AREA',
      rightField: 'GIS_AREA'})
  );


print(
  'Number of fully marine protected areas:',
  marineProtectedAreas.size());

print(
  'Number of coastal protected areas:',
  coastalProtectedAreas.size());


// ------------------------------------------------------------
// 8. DISPLAY THE PROTECTED AREAS
// ------------------------------------------------------------

// Paint fully marine protected areas as outlines
var marineOutline = ee.Image()
  .byte()
  .paint({featureCollection: marineProtectedAreas,
    color: 1,
    width: 2})
  .selfMask();


// Paint coastal protected areas as outlines
var coastalOutline = ee.Image()
  .byte()
  .paint({featureCollection: coastalProtectedAreas,
    color: 1,
    width: 2})
  .selfMask();


// Add fully marine protected areas
Map.addLayer(marineOutline,
  {palette: [ecosystemColours.marineProtectedAreas]},
  'Fully Marine Protected Areas',
  true,
  0.8);


// Add coastal protected areas
Map.addLayer(coastalOutline,
  {palette: [ecosystemColours.coastalProtectedAreas]},
  'Coastal Protected Areas',
  true,
  0.8);


// ------------------------------------------------------------
// 9. IMPORT EXCLUSIVE ECONOMIC ZONES
// ------------------------------------------------------------

// Replace this with the exact EEZ asset ID from your Assets panel
var eez = ee.FeatureCollection('projects/mb5370-jcu-project/assets/eez_v12_lowres');


// Inspect the EEZ dataset
//print('EEZ dataset:', eez);
print('Number of EEZ features:', eez.size());
print('First EEZ feature:', eez.first());


// Paint the EEZ polygons as outlines
var eezOutline = ee.Image()
  .byte()
  .paint({featureCollection: eez,
    color: 1,
    width: 1})
  .selfMask();


// Add the EEZ boundaries to the map
Map.addLayer(eezOutline,
  {palette: [ecosystemColours.eezBoundaries]},
  'Exclusive Economic Zone Boundaries',
  true,
  0.6);


// ------------------------------------------------------------
// 10. IMPORT AND DISPLAY HYDROTHERMAL VENT LOCATIONS
// ------------------------------------------------------------

// Import the uploaded hydrothermal vent table
var ventTable = ee.FeatureCollection('projects/mb5370-jcu-project/assets/hydrothermal_vents_global');


// Inspect the original uploaded table
print('Original vent table:', ventTable);

print('First vent properties:', ventTable.first());

print('Number of vent records:',ventTable.size());


// Create point geometry using the Longitude and Latitude fields
var hydrothermalVents = ventTable.map(function(feature) {

  var longitude = ee.Number(
    feature.get('Longitude'));

  var latitude = ee.Number(
    feature.get('Latitude'));

  var ventPoint = ee.Geometry.Point([
    longitude,
    latitude]);

  return ee.Feature(ventPoint,
    feature.toDictionary());
});


// Check that the point geometry was created correctly
print('First corrected vent feature:', hydrothermalVents.first());

print('First corrected vent coordinates:', hydrothermalVents
    .first()
    .geometry()
    .coordinates());


// Style the hydrothermal vent points
var ventPoints = hydrothermalVents.style({
  color: '000000',
  fillColor: ecosystemColours.hydrothermalVents,
  pointSize: 5,
  pointShape: 'circle',
  width: 1});


// Add hydrothermal vents to the map
Map.addLayer(ventPoints,{},
  'Hydrothermal Vents',
  true, 1);

// ------------------------------------------------------------
// 11. CREATE THE LEGEND
// ------------------------------------------------------------

var legend = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '10px 15px'
  }});


var legendTitle = ui.Label({
  value: 'Deep-Ocean Ecosystems and Ocean Features',
  style: {
    fontWeight: 'bold',
    fontSize: '15px',
    margin: '0 0 8px 0'
  }});


legend.add(legendTitle);


// Function to create one legend row
function addLegendRow(colour, label) {

  var colourBox = ui.Label({
    style: {
      backgroundColor: '#' + colour,
      padding: '8px',
      margin: '0 8px 4px 0'
    }
  });


  var legendLabel = ui.Label({
    value: label,
    style: {
      margin: '0 0 4px 0'
    }
  });


  var row = ui.Panel({
    widgets: [
      colourBox,
      legendLabel
    ],
    layout: ui.Panel.Layout.Flow('horizontal')
  });
  
  legend.add(row);}


// Add the map layers to the legend

addLegendRow(ecosystemColours.continentalSlope,
  'Continental and island slopes');

addLegendRow(ecosystemColours.abyssal,
  'Abyssal plains');

addLegendRow(ecosystemColours.hadal,
  'Hadal trenches and troughs');

addLegendRow(ecosystemColours.submarineCanyons,
  'Submarine canyons');

addLegendRow(ecosystemColours.marineProtectedAreas,
  'Fully marine protected areas');

addLegendRow(ecosystemColours.coastalProtectedAreas,
  'Coastal protected areas');

addLegendRow(ecosystemColours.eezBoundaries,
  'Exclusive Economic Zone boundaries');

addLegendRow( ecosystemColours.hydrothermalVents,
  'Hydrothermal vents');


// Add the legend to the map
Map.add(legend);

// Assignment Reflection

/* This assignment brought together the main skills developed throughout the module, including raster classification, terrain analysis, vector data, uploaded assets, and map visualisation.
The submarine canyon layer was the most challenging because it required combining both depth and slope conditions. 
Creating the final map and legend also helped me think more carefully about how multiple global datasets can be presented clearly in one interactive marine mapping tool. */
