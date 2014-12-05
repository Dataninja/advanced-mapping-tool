advanced-mapping-tool
=====================

A quite advanced mapping tool by Dataninja, enhancement of the [original Confiscati Bene choropleth](https://github.com/Dataninja/confiscatibene-choropleth), based on [Leafletjs](http://leafletjs.com/), [d3js](http://d3js.org/), and many more libraries.


# Installation

## For normal use

``` bash
git clone https://github.com/Dataninja/advanced-mapping-tool.git
# or download https://github.com/Dataninja/advanced-mapping-tool/archive/master.zip and unzip it
cd advanced-mapping-tool/
cp dataninja-advanced-mapping-tool.conf.sample.js dataninja-advanced-mapping-tool.conf.js
cp dataninja-advanced-mapping-tool.custom.sample.css dataninja-advanced-mapping-tool.custom.css
cp index.sample.html index.html
```

Edit the configuration file dataninja-advanced-mapping-tool.conf.js accordingly to your needs.

View the map browsing to index.html.

You can download the final application to work offline zipping it: `zip -r map.zip . -x \*demo\* -x \*.git\*`.

## For development

``` bash
git clone https://github.com/Dataninja/advanced-mapping-tool.git
cd advanced-mapping-tool/
npm install
bower install
grunt
cp dataninja-advanced-mapping-tool.conf.sample.js dataninja-advanced-mapping-tool.conf.js
cp dataninja-advanced-mapping-tool.custom.sample.css dataninja-advanced-mapping-tool.custom.css
cp index.sample.html index.html
cp debug.sample.html debug.html
```

Debug file simply loads not minified versions of js and css files.


# The configuration file

The *dataninja-advanced-mapping-tool.conf.js* is a simple js file that defines the *mapConfig* global object used for the customization of the map. In the *sample* version every parameters are commented, but here is a summary of possible configurations.

## Debug mode

A simple boolean variable to activate / disactivate logging feature for browser development tools and a control on the map with useful information such as mouse position, map center, bounds coordinates and zoom level.

## Language

A string parameter for language codes in ISO 639-1:2002 format (ie. *it* or *en*) for default numbers and datetimes formatting. It acts only on the output format, not on the input when reading a file, for example.

## Google Analytics

The map already contains the [Google Universal Analytics tracking code](https://support.google.com/analytics/answer/2817075?hl=en), to activate it simply set *activate* to *true* and *ua* to the [tracking id of a valid property](https://support.google.com/analytics/answer/1042508).

## URL shortening service

The map generates a lot of URLs, ie. for social sharing buttons with proper GET parameters. You can use an external URL shortener, at the moment only the [self-hosted Yourls service](http://yourls.org/) is supported.

## Global map settings

The appearance of the map on loading. Here you can define many initial options passed to the [leaflet map on creation](http://leafletjs.com/reference.html#map-class).

The *bounds.init* object is used only if *zoom.init* is not set. If center is not set, the *bounds.init* geometric center will be used. The *bounds.max* object and zoom min and max values limit user's panning and zooming actions.

Be aware of correct attributions to sources! You can list them in the *attribution* array of strings, using also simple html for links.

## Summary

If you want to publish a quite long text to explain map data, you can use a nice column on the left or on the right of the map. It can be always visible (or always closed, not so useful), toggled by the user clicking on a top-right icon, or shown (or hidden) when a boolean *summary* GET parameter is present in the URL (useful when the map is published also into an iframe element).

The content can be an html string, you can concatenate more strings with *+* to have a more readable code.

## Tooltip

If you want to show a simple tooltip when user move the mouse pointer into a region of a geo layer, you can activate the tooltip. At the moment its content is fixed: "[REGION NAME] \n [key]: [value]", where [key] is the name of the variable joined to the region, [value] is its value, [REGION NAME] comes from the label column of the geo layer (not from joined data).

## Legend

Legend is the control where the mapping between data and colors is shown after a binning process (intervals of data values are mapped to single colors of a chromatic scale). You can set the title (shown on top), a global description (shown on bottom and overridable for each dataset), the delimiter between the bin bounds, and the label shown as title attribute of each colored square (it has to be a function returning a string with min bin value, max bin value and the variable label as passed parameters).

## Menu

All geo layers, datasets, and columns are shown in clickable menus on the top of the map. To avoid too long menus, you can set here a max number of items (default value is 3). For each menu, if there are fewer items, it is shown always open. If there are more, the menu collapses and behaves like a select element (only selected item is shown and all items appear only on mouseover or click).

## Geographic layers

## Datasets

## Points sets

## Info window

## Controls


# Global inherited configurations

## Geographic layers sources

## Geographic layers types

## Datasets sources

## Datasets types

## Info window templates

