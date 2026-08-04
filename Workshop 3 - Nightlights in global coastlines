//****************************************************//
// Google earth engine workshop 3
//****************************************************//

// Introduction

/* Workshop 3 focused on using Google Earth Engine to analyse global changes in coastal areas. 
The workshop used population and nighttime-light datasets to compare conditions between different years.
Coastal grid cells were identified using spatial filtering, and reduceRegions() was used to calculate the average change within each grid cell before preparing the results for export.*/

// Start by exploring the dataset. 

//Creating new vectors 
var grid_2 = ee.FeatureCollection('users/murrnick/mb5370/worldgrid_2deg');
//Map.addLayer(grid_2, {color:'green'}, '2 degree grid', false)

var grid_1 = ee.FeatureCollection('users/murrnick/mb5370/worldgrid_1deg');
//Map.addLayer(grid_1, {color:'blue'}, '1 degree grid')
print(grid_1.first())

//GPWv411: Population Count (Gridded Population of the World Version 4.11)

// Population
var population = ee.ImageCollection("CIESIN/GPWv411/GPW_Population_Count")
print (population)

//Now we extract the data we want - years we are comparing
//import two images for start and end
var population_2000 = ee.Image('CIESIN/GPWv411/GPW_Population_Count/gpw_v4_population_count_rev11_2000_30_sec')
print (population_2000)

var population_2015 = ee.Image('CIESIN/GPWv411/GPW_Population_Count/gpw_v4_population_count_rev11_2015_30_sec')
print (population_2015)

//Visulatise the population data:
var population_vis = {
   min: 0,
  max: 1000,
  palette: [
    'FFFFFF', // no impact
    'FFF5F0',
    'FEE0D2',
    'FCBBA1',
    'FC9272',
    'FB6A4A',
    'DE2D26',
    'A50F15',
    '67000D'  // highest population / impact
  ]
};

//Map.addLayer(population_2000, population_vis, 'population_count_2000');
//Map.addLayer(population_2015, population_vis, 'population_count_2015');


//importing the night light dataset and exploring it

// Nightlights
var nl = ee.ImageCollection("NOAA/DMSP-OLS/NIGHTTIME_LIGHTS")
print (nl)

// get two images for start and end
var nl_2000 = ee.Image ('NOAA/DMSP-OLS/NIGHTTIME_LIGHTS/F142000')
print (nl_2000)

var nl_2013 = ee.Image ('NOAA/DMSP-OLS/NIGHTTIME_LIGHTS/F182013')
print(nl_2013)

//Visulising these images and adjusting band names using select() to change avg_vis to nightlight
//select and rename

var nl_2000 = ee.Image ('NOAA/DMSP-OLS/NIGHTTIME_LIGHTS/F142000').select(['avg_vis'], ['nightlight'])
print ('nightlight 2000 processed', nl_2000)

var nl_2013 = ee.Image ('NOAA/DMSP-OLS/NIGHTTIME_LIGHTS/F182013').select(['avg_vis'], ['nightlight'])
print ('nightlight 2013 processed', nl_2013)

var nighttimeLightsVis = { 
   min: 0,
  max: 63, 
  palette: [
    '000000', // no light
    '1B0C41', // very low light
    '4A0C6B', // low light
    '781C6D', // low–moderate light
    'A52C60', // moderate light
    'CF4446', // moderate–high light
    'ED6925', // high light
    'FB9B06', // very high light
    'F7D13D', // intense light
    'FFFFFF'  // brightest areas
  ]
};


//Map.addLayer(nl_2000, nighttimeLightsVis, 'Nighttime Lights 2000');
//Map.addLayer(nl_2013, nighttimeLightsVis, 'Nighttime Lights 2013');


//Coastline:
var coastline = ee.FeatureCollection('projects/UQ_intertidal/dataMasks/naturalEarthCoastline_v1')
//Map.addLayer(coastline, {color:'yellow'}, 'coastline')


// now using filtering of spatial grids to coastal grid
var coastgrid = grid_1
         .filter(ee.Filter.bounds(coastline));
//Map.addLayer(coastgrid, {color :'red'}, 'coastgrid');


//Checking the data
print('total grid cells', grid_1.size());
//there are 57600 grid covering the map

print('coastal grids', coastgrid.size());
//


//Using Geomtry tool for fine scale analysis - 
// Filter ecoregions to bounds
var coast_ecoregions = grid_1
.filter(ee.Filter.bounds(coastline))
//.filter(ee.Filter.bounds(AKL)) // let's limit it for testing- testing area will delete later
//Map.addLayer(coast_ecoregions, {color:'firebrick'}, 'coastal ecoregions')

//testing to see if code is working for a limited bounds
print('limited bounds akl coast', coast_ecoregions.size()) // 4 grid boxes are inluced in the gemotry



// #4.5 Global change

//Calculates pop. change (2015-2000) clipped to coastal regions. Lime = Growth, Black = No change, Red = Decline.

var pop_change = population_2015
  .subtract(population_2000)
  .clip(coast_ecoregions)
Map.addLayer (pop_change, {palette:  ['red', 'black', 'lime'], min: -500, max: 500}, 'pop_change', true, 0.9)

// Calculates nighttime light change (2013-2000) clipped to coastal regions. Lime = Increased brightness, Black = No change, Red = Dimming.
var nl_change = nl_2013
  .subtract(nl_2000)
  .clip(coast_ecoregions)
print(nl_change,'nl_change')

Map.addLayer (nl_change, {palette:  ['red', 'black', 'lime'], min: -50, max: 50}, 'nl_change', true, 0.9)


// average change in nightlights per ecoregion
var nl_changePerEcoregion = nl_change.reduceRegions({
  collection: coast_ecoregions, 
  reducer: ee.Reducer.mean(), 
  scale: 1000, // note computing at a larger scale for speed
});

print (nl_changePerEcoregion.first()) // look at properties of the first one
//mean change in nightlights per ecoregion within the first box AKL, from 2000 to 2013 was 1.78

var pop_changePerEcoregion = pop_change.reduceRegions({
  collection: coast_ecoregions,
  reducer: ee.Reducer.mean(),
  scale:1000,
});

// Export the result
// Approx 10-20 minute export for scale = 1000.
// Export the result to asset
//Export.table.toAsset({
/*  collection: pop_changePerEcoregion, //
  description: 'export_pop_toAsset',
  assetId:'pop_changePerEcoregion'
});*/

//Export.table.toAsset({
 /* collection: nl_changePerEcoregion, //
  description: 'export_nl_toAsset',
  assetId:'nl_changePerEcoregion'
});*/

// Workshop Reflection

/* This workshop showed me how Earth Engine can be used to analyse large global datasets that would be difficult to process on a normal computer.
I found the use of spatial grids and reducers useful because they turned large raster datasets into smaller summaries that were easier to compare.
It also helped me understand why exporting results is important when an analysis becomes too large to manage directly in the Code Editor. */
