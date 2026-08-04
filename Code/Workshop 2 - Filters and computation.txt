//****************************************************//
// Google earth engine workshop 2
//****************************************************//

// Introduction

/* Workshop 2 focused on filtering and analysing spatial data in Google Earth Engine. 
The workshop covered metadata and spatial filters, image calculations, thresholding, terrain analysis, and the use of reducers to summarise raster values within selected areas.
It also introduced working with ImageCollections to calculate annual climate averages and create a median Landsat composite. */

//using the elvation dataset from the first workshop:

//Importing an image dataset:
// Import SRTM data
var dataset = ee.Image("CGIAR/SRTM90_V4")
//this created a image , time to customise the layer using:
Map.setCenter(174.0638, -39.298, 11);// set map centre on tarnaki 

//add layer to map using assest id
////map.addlayer(dataset)
print (dataset) // Look at the data properties

//doing the same thing but with colour codes instead of actual names:
// Set up visualisation parameters
var elevationVis = {
  min: 0,
  max: 2500,
  palette: ['0000ff', '00ffff', 'ffff00', 'ff0000', 'ffffff']
};
// Add the data layer to the map
//map.addlayer(dataset, elevationVis, 'Elevation');


//Features:

// Add the protected planet data
var protected_areas = ee.FeatureCollection("WCMC/WDPA/current/polygons")
//map.addlayer(protected_areas) // adds layer without colours or gradients.

//add colurs and name the layer:
//map.addlayer(protected_areas, {color: 'darkgreen'}, 'Protected Areas')

print ('No of protected areas:', protected_areas.size())
//this printed the number of protected areas all over the world = 307004\



//3.3.1 Metadata filters
print ('total PAs', protected_areas.size()); 
print ('first PAs', protected_areas.limit(5)); //can add .limit() to restrict the number of rows outputted by console
print ('first 5 PAs', protected_areas.first()); // looking just at the first feature is much faster.



// feature is apart of the ICUN cat IV so we will filter the for this.
// Filter only for level IV protected areas
var iucn_pa = protected_areas.filter(ee.Filter.eq('IUCN_CAT', 'IV'));
//map.addlayer(iucn_pa, {color: 'yellow'}, 'National Parks')


// filter data by date
var iucn_pre19080 = protected_areas.filter(ee.Filter.lte('STATUS_YR', 1980));
//map.addlayer(iucn_pa, {color: 'white'}, 'PAs in 1980');
//this produces polygon filter by date - before 1980

//want to filter this by coutnries as well to identify all the PAs in NZ
// Import countries
var countries = ee.FeatureCollection("USDOS/LSIB_SIMPLE/2017")

print (countries) // look at it. // how to find a country name? - inspect the features and look at properties
// country_na is the country type - will need to filter for this
//map.addlayer(countries) // look at it.


// New Zealand only
var nz = countries.filter(ee.Filter.equals('country_na', 'New Zealand'))
print (nz)
//map.addlayer(nz) // look at it.
//this now idenifes all nz features - whole of nz outlined

//now we want to apply a spatail filter against the protected area data
// Spatial filter PAs only in NZ
var nz_pas = protected_areas.filter(ee.Filter.bounds(nz))
print ('Number of PAs in NZ:', nz_pas.size())

//New Zealand has 10120 protected areas.
//map.addlayer(nz_pas, {color:'purple'}, 'NZ PAs only') // add layer with only the PAs from nz


// Link them all into one statement, similiar to piping in R
var nz_national_parks = protected_areas
    .filter(ee.Filter.eq('IUCN_CAT', 'IV')) // filter only NPs
    .filter(ee.Filter.bounds(nz)) // filter to NZ

print ('Number of National Parks in NZ:', nz_national_parks.size()) // NZ has 5585 national park under cat IV




// COMPUTATION IN EARTH ENGINE

//commented all map.addlayer from preovious code to have tidy layers.
// Change opacity
Map.addLayer(dataset, elevationVis, 'Elevation', true, 0.6);
print (dataset)//  common value = elevation at top pixel 2457m

//Computation
print (dataset) 
var srtm_fixed = dataset.add(100) // this add 100 to all features in the datset
Map.addLayer(srtm_fixed, {min: 0, max: 2600, palette: ['black', 'lime', 'yellow']}, 'fixed srtm') //e.g. top pixel incraesed by 100 = 2584

//3.5.3 Thresholding images
//
var elevGt1500 = dataset; ee.Filter.greaterThan(1500); 
//Map.addLayer(elevGt1500, {min: 0, max: 2600, palette: ['black','white']}, 'elevGt1500') // Binary white == true

var elevGt1500 = dataset.gt(1500).selfMask() 
Map.addLayer(elevGt1500)

//next we want to find any pixels above 1500m:
Map.addLayer(elevGt1500.selfMask(), {palette:'fuchsia'}, 'gt 1500m', true, 0.7) 
//this isolates any pixels above 1500m


// apply complex algorithm
// Use terrain, an algorithm that returns several topographic variables from an elevation image
var terrain = ee.Terrain.products(dataset);
print ('terrain', terrain ) // print it to see what's inside

// make images from the bands we are interested in
var slope = terrain.select(['slope']) 
var hillshade = terrain.select(['hillshade'])
Map.addLayer (hillshade)
Map.addLayer (slope, {palette: ['white', 'darkred', 'black'], min:0, max:45}, 'slope')


//First, let’s calculate the average slope of the national park.
//Last, we’ll work out how much area above 1500m occurs inside the national park
// Find Taranaki NP
var taranaki = protected_areas.filter(ee.Filter.eq('NAME', 'Egmont National Park'));
Map.addLayer(taranaki, {color: 'orange'}, 'Mt Taranaki')

// Apply a spatial reducer to estimate mean slope
var slopeOutput = slope.reduceRegion({
  reducer: ee.Reducer.mean(), // we compute the mean of all slope pixel values in the national park
  geometry: taranaki,
  scale:90 // pixel size in metres - get this from the metadata (ie. search for it)
})
print ('slopeOutput', slopeOutput)
//the output of slope is 10.036m

// Try clipping to see if it's any different.
var taranakiSlope = slope.clip(taranaki)
Map.addLayer (taranakiSlope, {palette: ['white', 'darkred', 'black'], min:0, max:45}, 'taranaki slope')

var slopeOutput2 = taranakiSlope.reduceRegion({
  reducer: ee.Reducer.mean(), // we compute the mean of all slope pixel values in the national park
  geometry: taranaki,
  scale:90 // pixel size in metres - get this from the metadata (ie. search for it)
})
print ('slopeOutput2', slopeOutput2) // same answer


//Then, we’ll calculate the maximum and minimum elevation of the park.

// Use reduce regions with a different reducer (Max)
var elevOutput_Max = dataset.reduceRegion({
  reducer: ee.Reducer.max(), // we compute the max of all pixel values in the national park
  geometry: taranaki,
  scale:90 // pixel size in metres - get this from the metadata (ie. search for it)
})
print ('elevOutput_Max', elevOutput_Max)// max elevation is 2484m

// Use reduce regions with a different reducer (min)
var elevOutput_Min = dataset.reduceRegion({
  reducer: ee.Reducer.min(), // we compute the min of all slope pixel values in the national park
  geometry: taranaki,
  scale:90 // pixel size in metres - get this from the metadata (ie. search for it)
})
print ('elevOutput_Min', elevOutput_Min) // 108m is the min elevation

// Use reduce regions with a different reducer - using both max and min in one cdoe
var elevOutput_MinMax = dataset.reduceRegion({
  reducer: ee.Reducer.minMax(), // we compute the mean of all slope pixel values in the national park
  geometry: taranaki,
  scale:90 // pixel size in metres - get this from the metadata (ie. search for it)
})
print ('elevOutput_MinMax', elevOutput_MinMax)


// Get area of >1500m
var areaGt1500m = elevGt1500 // binary 1 == yes
  .multiply (ee.Image.pixelArea()) // get the area of each pixel
  .reduceRegion({
  reducer: ee.Reducer.sum(), // sum all pixel areas together
  geometry: taranaki,
  scale:90 
})
print ('The area of Taranaki above 1500m (m2)', areaGt1500m) // in square metres =  11474443.34
print ('The area of Taranaki above 1500m (km2)', ee.Number(areaGt1500m.get('elevation')).divide(1000 * 1000)) // in square metres
//= 11.47 km^2

//  Image Reducers
var dataset = ee.ImageCollection('WORLDCLIM/V1/MONTHLY');
print (dataset) // 12 images where each one is a month


// Get two months
var jan_climate = ee.Image ("WORLDCLIM/V1/MONTHLY/01")
var july_climate = ee.Image ("WORLDCLIM/V1/MONTHLY/07")


// Select their average temperature bands
var jan_climate_avg = jan_climate.select('tavg') // get average band
var july_climate_avg = july_climate.select('tavg')


// Set vis parameters
var meanTemperatureVis = {
  min: -40,
  max: 20,
  palette: ['blue', 'purple', 'cyan', 'green', 'yellow', 'red'],
};

Map.addLayer(jan_climate_avg, meanTemperatureVis, 'janClimate')
Map.addLayer(july_climate_avg, meanTemperatureVis, 'julyClimate')
// Inspect them!

// Note the pixel scaling error and fix it
// Need to divide all pixel values by 10, or multiply by .1 (.multiply(0.1)


// We want to reduce to get the yearly average
var annualMeanTemperature = dataset
  .select('tavg')
  .mean() // this is the reducer
  .multiply(0.1); // scale pixels to real values

Map.setCenter(71.7, 52.4, 3);
Map.addLayer(annualMeanTemperature, meanTemperatureVis, 'Mean Annual Temperature');


//using image collection now

var dataset = ee.ImageCollection('LANDSAT/LC08/C02/T1_TOA')
  .filterDate('2017-01-01', '2017-12-31'); // only images from 2017
var trueColour = dataset.select(['B4', 'B3', 'B2']);
var trueColourVis = {
  min: 0.0,
  max: 0.4,
};
Map.setCenter(146.746, -19.529, 9);
Map.addLayer(trueColour, trueColourVis, 'True Colour Landsat');


// Let's use reduce these
var LandsatMedian = trueColour.median()
Map.addLayer(LandsatMedian, trueColourVis, 'True Color Median');

// Workshop Reflection

/* This workshop helped me better understand how Earth Engine can be used to move from simply displaying data to carrying out actual spatial analysis.
I found the difference between filtering feature collections and thresholding image pixels especially important, as they use different functions.
The exercises also showed me how reducers can turn large raster datasets into useful summary values for specific locations, which will be valuable for larger marine and environmental analyses. */
