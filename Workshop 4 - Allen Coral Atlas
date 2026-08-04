
//****************************************************//
// Google Earth Engine Workshop 4 - Allen Coral Atlas
//****************************************************//


var daydream_island = /* color: #98ff00 */ee.Feature(
        ee.Geometry.Point([148.81419390782045, -20.25111907218827]),
        {
          "Station": "Daydream",
          "system:index": "0"
        }),
    Orpheus_Island = /* color: #0b4a8b */ee.Feature(
        ee.Geometry.Point([146.49818883855832, -18.63382641699783]),
        {
          "Station": "Orpheus",
          "system:index": "0"
        }),
    Lizard_Island = /* color: #ffc82d */ee.Geometry.Point([145.44513430549256, -14.667615484438782]),
    Hamilton_Island = /* color: #00ffff */ee.Feature(
        ee.Geometry.Point([148.96376485743082, -20.347078766517384]),
        {
          "Station": "Hamilton",
          "system:index": "0"
        }),
    Heron_island = /* color: #bf04c2 */ee.Feature(
        ee.Geometry.Point([151.91093958248968, -23.441896893924444]),
        {
          "Station": "Heron",
          "system:index": "0"
        }),
    image = ee.Image("ACA/reef_habitat/v2_0");

//Which has the most coral reef according to the allen coral atlatnis?

//We are trying to design a reef suvrey plan that allows us to cover the most reef as possible
//for as little money as possible.


// Global Variables
var distance = 800 // metres we are allowed to snorkel from the station
Map.setOptions('SATELLITE')


//======================================//
//5.3 Setting Research station locations
//======================================//

//Orpheus Island 
Map.setCenter( 146.49992691, -18.63411616, 17) // zoom

//Daydream island
//Map.setCenter( 148.81555647, -20.25161732, 17)

//Lizard Island
//Map.setCenter( 145.44647541, -14.66767257, 17)

//Hamilton Island
//Map.setCenter( 148.95757924, -20.34639327, 17)

//Heron Island
//Map.setCenter( 151.91400746, -23.44100605, 17)

var field_station = ee.FeatureCollection([Hamilton_Island, Lizard_Island, Orpheus_Island, daydream_island, Heron_island])

print(field_station)


//======================================//
//Import the ACA data and check it out
//======================================//

var ACA = ee.Image("ACA/reef_habitat/v2_0") // import

// print and review
print(ACA, 'coral atlas');
Map.addLayer(ACA, {}, 'ACA');


//======================================//
//The analysis
//======================================//

var benthic = ACA.select('benthic')
// Define the class value for Coral/Algae from the ACA dataset
var CORAL_VALUE = 15;
// Create a binary image: 1 = coral/algae, 0 = everything else
var coralBinary = benthic.eq(CORAL_VALUE);
// Mask all 0 values so only coral/algae remains
var coralMasked = coralBinary.selfMask();

Map.addLayer(benthic,{},'all benthic')
Map.addLayer(coralMasked, {palette: ['yellow', 'orange']}, 'coral Masked')


// Buffer a single station (buffer only works on individual features)
var oneStation = ee.Feature(field_station.first());

// Create a buffer around that station (distance in meters)
var buffered = oneStation.buffer(distance);   // example: 800 m buffer

// Add to map so you can see it
Map.addLayer(buffered, {color: 'red'}, 'Buffered station');

// Function that buffers a single station
var bufferer = function(feature) {
  var buffered = feature.buffer(800);   // 800 m buffer example
  return buffered;
};

// Apply the bufferer function to every station
var bufferedStations = field_station.map(bufferer);

print(bufferedStations,'bufferedStations');
Map.addLayer(bufferedStations, {color: 'blue'}, 'Buffered Stations');


//======================================//
//Calculate area of coral close to all of the research stations
//======================================//

// 1. Convert coral mask to pixel-area image 
var coral_area = coralMasked.multiply(ee.Image.pixelArea());

// 2. Sum coral area inside each buffered station
var coralAreaByStation = coral_area.reduceRegions({
  reducer: ee.Reducer.sum(),
  collection: bufferedStations,
  scale: 5
});

print('Coral area per station:', coralAreaByStation);

// Visualise coral area per station (m²)
var visStations_m2 = coralAreaByStation.style({
  color: '000000',
  fillColor: 'FF880066',   // orange fill with ~40% opacity (66 in hex)
  width: 1
});

// Add to map
Map.addLayer(visStations_m2, {}, 'Stations (coral area m²)');



// Convert m² → km² by dividing by 1,000,000
var coralArea_km2 = coralAreaByStation.map(function(feature) {
  var area_m2 = ee.Number(feature.get('sum'));
  var area_km2 = area_m2.divide(1e6);
  return feature.set('coral_km2', area_km2);
});
print('Coral area per station (km²):', coralArea_km2);


// 4. Sort stations by coral area
var sorted = coralAreaByStation.sort('sum', false);
print('Stations sorted by coral area:', sorted);

var sortedStations = coralArea_km2.sort('coral_km2', false);
print(sortedStations, 'sortedStations')
Map.addLayer(sortedStations, {color: 'green'}, 'Sorted stations');


Export.table.toDrive({
  collection: sortedStations,
  description: 'coral_area_sorted_export',
  fileNamePrefix: 'coral_area_by_station_sorted_km2',
  fileFormat: 'CSV'
});


// Function to export ACA image for each station buffer
// Note: Exports must be called via a client-side loop
var stationList = bufferedStations.getInfo().features;

for (var i = 0; i < stationList.length; i++) {
  var feature = ee.Feature(stationList[i]);
  
  // Get station name (using index as fallback if 'Station' property is missing)
  var stationName = feature.get('Station').getInfo() || 'Station_' + i;
  
  // Clip ACA image to this station's buffer
  var clipped = ACA.clip(feature.geometry());

  // Create an export task
  Export.image.toDrive({
    image: clipped,
    description: stationName + '_ACA_export',
    fileNamePrefix: stationName + '_ACA',
    fileFormat: 'GeoTIFF',
    scale: 5,
    region: feature.geometry(),
    maxPixels: 1e13
  });
}

// Workshop Reflection

/* This workshop helped me understand how spatial analysis can be used to support fieldwork planning. 
I found it useful to see how the same function could be applied to several locations rather than repeating the code for each station. 
The exercise also showed me that the final ranking depends on the assumptions used, such as the 800 m buffer and the coral habitat class selected,
so the results need to be interpreted alongside practical factors such as access, cost, and field conditions. */
