//Step 1: Importing the data and switching to satellite view
var dataset = ee.Image('NOAA/NGDC/ETOPO1');
var elevation = dataset.select('bedrock');
var elevationVis = {
  min: -11000.0,
  max: 3000.0,
  palette: ['011de2', 'afafaf', '3603ff', 'fff477', 'b42109'],
};
Map.addLayer(elevation, elevationVis, 'Elevation');
Map.setOptions('SATELLITE'); 
Map.setCenter(152.775, -37.46, 4);
//print(elevation)
//Step 2: Build a raster map of each of the following major ecosystem types
// Set parameters for continental & island slopes (less/greater than or equal to functuions)
var contIsland_slope = elevation.lte(-250).and(elevation.gte(-3000));
Map.addLayer(contIsland_slope.selfMask(), {palette:'yellow'}, '250m to 3000m', true, 0.5);

// Set parameters for the Abyssal Plain 
var Abyss = elevation.lte(-3000).and(elevation.gte(-6000));
Map.addLayer(Abyss.selfMask(), {palette:'purple'}, '3000m to 6000m', true, 0.5); 

// Set parameters for Hadal Trenches and Troughs 
var Abyss = elevation.lte(-6000);
Map.addLayer(Abyss.selfMask(), {palette:'black'}, '6000m', true, 0.5); 

// Set parameters for submarine canyons (less/greater than or equal to functuions)
var terrain = ee.Terrain.products(elevation); 
var slope = terrain.select(['slope']) 
var subCanyons = elevation.lte(-200).and(slope.gte(6));
print(subCanyons)
Map.addLayer(subCanyons.selfMask(), {palette:'orange'}, '200m with slope > 6', true, 0.6);
//Part 3. Add at least one vector dataset to your map (I chose to add and compare different marine protected areas MPAs)
var protected_areas = ee.FeatureCollection("WCMC/WDPA/current/polygons");

// Marine Protected Areas (partial or heavy restrictions on exploitation)
var someFishingMPA = protected_areas.filter(
  ee.Filter.and(
    ee.Filter.neq('MARINE', '0'),          // is marine or coastal
    ee.Filter.inList('NO_TAKE', ['Part', 'None'])  // partial or no take restriction
  )
);

// No Take Marine Protected Areas (fully no-take)
var noTakeMarine = protected_areas.filter(
  ee.Filter.and(
    ee.Filter.neq('MARINE', '0'),      // is marine or coastal
    ee.Filter.eq('NO_TAKE', 'All')     // fully no-take
  )
);

Map.addLayer(someFishingMPA, {color: 'green'}, 'MPAs Allowing Some Fishing', true, 0.8);
Map.addLayer(noTakeMarine, {color: 'darkblue'}, 'No Take MPAs', true, 0.8);
