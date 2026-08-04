//****************************************************//
// Start of module 4 - google earth engine workshop 1
//****************************************************//

// Introduction

/* Workshop 1 introduced Google Earth Engine and the basics of using JavaScript for environmental analysis. 
The workshop covered variables, lists, objects, functions, Earth Engine data types, and the difference between client-side JavaScript and server-side Earth Engine operations.
It also introduced how to import, inspect, and visualise raster and vector datasets using map layers and custom colour palettes.*/


//****************************************************//
// Use two forward slashes for writing comments.

/* You can also use slashes and 
stars to write multi comment lines if you like */
//****************************************************//


//****************************************************//
//Learning Javascript
//****************************************************//

print ('Hello, World!');

//1.
var the_answer = 42 // numeric, intger
print(the_answer);
// "var" asigns variables as objects, e.g the_answer is asigned to a new variable.


//2.
var city = 'San Francisco';
print(city);
//creating a new object called San Francisco

//3.
var population = 873965 ;//nuumeric 
print(population);
//asiginging varaible popualtion a numeric value.

//4.
print('The value for the', city, 'population is:', population);
// print out a sting a text and the object asigned as population.
// = The value for the San Francisco population is: 873965


//5. lists
var cities = ['San Francisco', 'Los Angeles', 'New York', 'Atlanta'];
print (cities);
// creating a list of cities, this asigns index number to each of the variables in the list e.g:
//0: San Francisco
//1: Los Angeles
//2: New York
//3: Atlanta


//6. Dictionaries - key values pairs
var citydata = {
  'city': 'San Francisco',
  'coord': [122.2, 37.77],
  'pop': 87396
};
print(citydata);

//create a structured object in a feature collection. outpute of coord has a list embedded within the object.


//7. functions
var my_hello_function = function(string) {
  return 'Hello ' + string + '!';
};
print(my_hello_function('world'));
// Functions can be defined as a way to reuse code and make it easier to read

var greet = function(name) {
    return 'Hello ' + name;
};
print(greet('World'));
print(greet('Readers'));
/*functions help by grouping operations together, carrying out a computation, 
and returning the result back to the code editor. */ 


//****************************************************//
//Earth Engine Basics
//****************************************************//

//start by creating 2 varaibles and combining them
var a = 1;
var b = 2;
//
var a = 1;
var b = 2;
print (a)
var result = a + b
print (result, 'javascript way')

/*this way of working things out is the javascript way, this way will eventully,
run into errors as we are not using the computational power of earthengine*/

//Earth engine way:
var result = ee.Number(a).add(b);
print (result, 'Earth Engine way');
// this use the docs function, ustilising the ee.numbers .add function


//Creating lists in earth engine using docs:
var yearList = ee.List.sequence(1980, 2020, 5);
print(yearList);
/*create a ee.List of numbers representing years from 1980 to 2020, 
counting by 5, by calling this function with the following values: start = 1980, end = 2020, and step = 5.*/



//section 2.10 Visualising data in Earth Engine
Map.setOptions('SATELLITE')
// this change the outlook of the map, e.g swapped from map view to satellite view.

//trying out snazzy maps:
var snazzy = require("users/aazuspan/snazzy:styles");
snazzy.addStyle("https://snazzymaps.com/style/72543/assassins-creed-iv", "Assassin's Creed IV");
//this create a new base layer onto the map panel. using the snazzy the style from the web

//trying it in a specficed area Taranaki, New Zealand

Map.setCenter(174.0638, -39.298, 11);
//when this code is run it recentres the map window onto Taranaki, New Zealand the coordinates above



//Importing an image dataset:
// Import SRTM data
var dataset = ee.Image("CGIAR/SRTM90_V4")
//this created a image , time to customise the layer using:

//add layer to map using assest id
Map.addLayer(dataset)
print (dataset) // Look at the data properties

/*provide some parameters to the Map.addLayer() call. The second parameter of this function is the visParams. 
It let’s you set the minimum pixel value and the maximum pixel values to display.*/

Map.addLayer(dataset, {min: 0, max: 2500}, 'custom visualization'); // including palette you can create colour gradientin the form of a list

//first argument is the dataset(assinged object), min and max are asigned as objects and the last is the new layer name
/*visualisation parameter is an object, with properties specifying the minimum and maximum value. 
You can spot this because it’s surrounded by curly brackets.
The third parameter here is the name of the layer, 
which you can see in the top right of the map window under Layers*/


//now assing custome colours using palette:
Map.addLayer(image, {min: 0, max: 2500, palette: ['blue', 'green', 'red']},'custom palette');


//doing the same thing but with colour codes instead of actual names:
// Set up visualisation parameters
var elevationVis = {
  min: 0,
  max: 2500,
  palette: ['0000ff', '00ffff', 'ffff00', 'ff0000', 'ffffff']
};
// Add the data layer to the map
Map.addLayer(dataset, elevationVis, 'Elevation');


//Use the inspector tab:
/*How high is Mt Taranaki? 
2464 metres 
What type of object is the SRTM data?
this is an image type*/

//Features:

// Add the protected planet data
var protected_areas = ee.FeatureCollection("WCMC/WDPA/current/polygons")
Map.addLayer(protected_areas) // adds layer without colours or gradients.

//add colurs and name the layer:
Map.addLayer(protected_areas, {color: 'darkgreen'}, 'Protected Areas')


// Workshop Reflection

/* This workshop helped me become more comfortable using JavaScript and navigating the Earth Engine Code Editor. 
I found that many of the basic programming ideas were similar to R, although the syntax and way Earth Engine processes data were different. 
Learning how to print objects, inspect datasets, and regularly run the script was especially useful for finding errors and understanding how each part of the code worked. */
