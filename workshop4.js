// The following code is used to select a research station to conduct a field survey of a fringe reef on the GBR 
// The reef selected must have the highest coral cover within snorkeling distance of a research station and then will be shared as a class dataset
//Pregiven code by Nick
Map.setOptions('SATELLITE')
Map.setCenter( 145.971444, -16.758762, 17) 

// IMPORT DATA


// Add in coral dataset
var ACA = ee.Image("ACA/reef_habitat/v2_0")

// RESEARCH STATION LOCATIONS

// Use .setCenter to go to research station locations and mark w/point markers

// Map.setCenter( 151.914, -23.441, 17) // Heron Island

// Map.setCenter( 148.95757924, -20.34639327, 17) // Hamilton Island 

// Map.setCenter( 145.44647541, -14.66767257, 17) // Lizard Island

// Map.setCenter( 148.81555647, -20.25161732, 17) // Daydream Island

// Map.setCenter( 146.49992691, -18.63411616, 17) // Orpheus Island 

// Map.setCenter( 146.57608, -18.735504, 17) // Palm Island 

// Map.setCenter( 146.500166, -18.633932, 17) // Orpheus Resort 

// Map.setCenter( 152.09149, -23.50711, 17) // One Tree Island 

// Map.setCenter( 145.971444, -16.758762, 17) // Green Island

// Map.setCenter( 145.988432, -16.931477, 17) // Fitzroy Island
// Add in stations by stitching together as feature collection (can set as feature collection w/stations as properties in future when making points)
var field_stations = ee.FeatureCollection([greenIsland, hamiltonIsland, lizardIsland, greenIsland])

// ADDING BUFFER TO STATIONS 

// Add buffer varriable and apply to one staion
var buffered = ee.Feature(field_stations.first())

// Create function to apply a buffer
var bufferer = function (heronIsland) {
  var buffered = heronIsland.buffer(800)
  return buffered;
}

// Use .map to apply buffer to all stations
var bufferedStations = field_stations.map(bufferer) 
Map.addLayer(bufferedStations, {color:'lightblue'}, 'Buffer', true, 0.9) 

// CORAL OPERATIONS 

// Display only benthic data
var benthic = ACA.select('benthic').selfMask(); 
//Map.addLayer(benthic, {palette: ['red']}, 'benthic', true, 0.8);  

// Specify only corals
var Coral = benthic.eq(15).selfMask();
Map.addLayer(Coral, {palette:'fuchsia'}, 'Coral', true, 0.7) 

// Compute area of coral within buffer
var coral_area = Coral 
  .multiply (ee.Image.pixelArea()) // get the area of each pixel
  .selfMask()
  .reduceRegions({
  reducer: ee.Reducer.sum(), // sum all pixel areas together
  collection: bufferedStations,
  scale:5 
})
print(coral_area, 'coral area')
Map.addLayer(coral_area, {color:'lightgreen'}, 'Coral within Snorkeling Distance', true, 0.7 )
var coral_area = Coral // binary 1 == coral
  .multiply (ee.Image.pixelArea()) // get the area of each pixel
.reduceRegions({
  reducer: ee.Reducer.sum(), // sum all pixel areas together
  collection: bufferedStations,
    scale:5 
})

// Use .sort to easily bring up the best suited station
var bestStation = coral_area.sort('sum', false).first()
print(bestStation, 'Best station for survey') 

// EXPORTS/RESULTS

// Export table showing coral area for all research stations
//Export.table.toDrive({collection: coral_area, description: 'exportToDrive', fileNamePrefix: 'research_stations', fileFormat:'CSV'})

// Export image showing selected research station with benthic data to send to collegue to work on in GIS for other project
Export.table.toDrive({
  collection: coral_area, //FYI - type: featureCollection
  description: 'exportToDrive',
  fileNamePrefix: 'research_stations',
  fileFormat:'CSV'
})
//Couldn't get it to export and the last step with the .aca did not work either but all other code is good to go
