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

You can download the final application to work offline zipping it: `zip -r map.zip . -x@.zipignore`,
or you can upload it to an [AWS S3 bucket](http://aws.amazon.com/cli/), if you have a working [aws-cli](https://github.com/aws/aws-cli): 
`bash -f -c 'aws s3 sync . s3://[BUCKET]/[PATH]/ --recursive --exclude $(xargs -a .awsignore | sed "s/ / --exclude /g")'`.

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

A string parameter for language codes in [ISO 639-1:2002](http://en.wikipedia.org/wiki/ISO_639-1) format (ie. *it* or *en*) for default numbers and datetimes formatting. It acts only on the output format, not on the input when reading a file, for example.

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

If true, this setting can be override for specific geographic layers.

## Legend

Legend is the control where the mapping between data and colors is shown after a binning process (intervals of data values are mapped to single colors of a chromatic scale). You can set the title (shown on top), a global description (shown on bottom and overridable for each dataset), the delimiter between the bin bounds, and the label shown as title attribute of each colored square (it has to be a function returning a string with min bin value, max bin value and the variable label as passed parameters).

## Menu

All geo layers, datasets, and columns are shown in clickable menus on the top of the map. To avoid too long menus, you can set here a max number of items (default value is 3). For each menu, if there are fewer items, it is shown always open. If there are more, the menu collapses and behaves like a select element (only selected item is shown and all items appear only on mouseover or click).

## Geographic layers

An array of objects describing geographic layers available to the user. Two important attributes define the typology of layers: **type** (*tile* and *thematic* string values are supported) and **source** (*tileserver*, *file* and *dkan* string values are supported). Their specific attributes and options are inherited by the geo layer and can be overrided.

Specific informations about geo layer have to be stored in the *schema* object:

*  name: the unique name of the layer, it will be used also as [HTML id token](http://www.w3.org/TR/html4/types.html#h-6.2)
*  menu: the string used as menu label (instead of the *name*)
*  id: the key in geo layer properties containing the unique id of features used for joining datasets
*  label: the key in geo layer properties containig the label of each feature

### Geographic types

#### tile

The **tile** type defines an active tile layer with a default source equal to *tileserver* (see below) and an options object to pass to the [L.tileLayer() constructor](http://leafletjs.com/reference.html#tilelayer). Below there are the default values you can override here. The simplest default tile layer is defined by `{ type: 'tile' }`.

Global inherited configurations:

```json
{
    active: true,
    source: 'tileserver',
    options: {
        attribution: '',
        opacity: 0.7
    }
}
```

#### thematic

The **thematic** type defines an active vector layer of polygons suitable to be joined to one or more datasets.
At the moment only [choropleth maps](http://en.wikipedia.org/wiki/Choropleth_map) are supported: 
you can color polygons from data after a binning process to couple data values to color bins. 
Two main options are required (but default values are provided, 
see *Global inherited configurations* > *Geographic layers types* below): *classification* sets the binning algorithm
(implemented by [geostatsjs library](https://github.com/simogeo/geostats), 
available values are the names of functions listed in the *Classification* section of its README, without the 'get' prefix,
or an explicit array of bins' bounds), *style* expects three options objects for default style, 
highlight style (shown on mouseover) and selected style (shown on click).
The attributes of these last two override those of default style. 
You can also disable infowindow and/or tooltip for this layer and block the zoom level 
(in case of data not suitable to a too much detailed view, for example). 
Below there are the default values you can override here. 
This type doesn't define a *source* its own, so you have to provide it explicitly.

Global inherited configurations:

```json
{
    active: true,
    classification: 'Jenks',
    infowindow: true,
    tooltip: true,
    zoom: 0,
    style: {
        default: {
		    weight: 0.5,
			opacity: 1,
	        color: 'white',
   		fillOpacity: 0.7,
    		fillColor: 'none'
        },
        highlight: {},
        selected: {
            weight: 2,
            color: '#666' 
        }
    }
}
```

### Geographic sources

#### tileserver

The **tileserver** source defines the URL template to pass to the [L.tileLayer() function](http://leafletjs.com/reference.html#tilelayer), 
tipically in the form http://{s}.*domain*/{z}/{x}/{y}.png. 
Default service is [OSM Mapnik basic map](http://wiki.openstreetmap.org/wiki/Tile_usage_policy), 
but [many more open services](http://wiki.openstreetmap.org/wiki/Tile_servers) are available. 
You can customize the URL template simply defining a *domain* and a *path*. 
Final URL will be build concatening these two strings (but you can customize also the *url()* function, if needed).
Below there are the default values you can override here.

Global inherited configurations:

```json
{
    domain: 'http://{s}.tile.openstreetmap.org',
    path: '/{z}/{x}/{y}.png',
    url: function() {
        return this.domain + this.path;
    }
}
```

#### file

The **file** source defines the local (or remote) path to shape files containing the vector layer definition.
At the moment, only [geojson](http://geojson.org/) and [topojson](https://github.com/mbostock/topojson) formats are supported.

The URL are built by an *url()* function concatenating *domain*, *path* and *filename* string attributes. 
If *filename* is not defined, the concatenation of the geo layer name and the *format* attribute will be used instead.
You have to specify also the format of the file in the *format* attribute.

[TODO]
To the *url()* function three additional parameters are also passed: 
the region (the geo layer name), a filter key and a filter value.
Without a fixed *filename*, the returned string is the concatenation of *domain*, *path*, a basename, a period and *format*.
The basename are built from the origin, filter key and filter value strings, these last two set by appropriate GET parameters.
[/TODO]

Files are loaded asyncronously via the [d3.json() method](https://github.com/mbostock/d3/wiki/Requests#d3_json),
and in the callback function you can perform a transformation of result by the *transform()* function
(the original file can be an array of geojsons, for example, so a valid json but not a valid geojson:
within the transform() function you can *prepare* the results to further uses by the application,
selecting only the useful geojson from the original array).

Global inherited configurations:
           
```json
{
    domain: '',
    path: '',
    format: 'geojson',
    filename: '',
    url: function(region, filterKey, filterValue) {
        return this.domain + 
            this.path + 
            (this.filename || (region + (filterKey && filterValue ? '_'+filterKey+'-'+filterValue : '') + "." + this.format));
    },
    transform: function(res) {
        return res;
    }
}
```

## Datasets

An array of objects descriping datasets available to the user. Two important attributes define the typology of layers: 
**type** (only *choropleth* is supported at the moment) and **source** (*file* and *dkan* string values are supported).
Their specific attributes and options are inherited by the dataset and can be overrided.

You can customize three functions that act to the loaded dataset in reading and writing phases.

*  transform: files are loaded asyncronously and in the callback function you can perform a transformation of result just after loading and before further calcula (ie. to remove commented lines)
*  parse: sources such as csv are read as strings, so a parsing step is needed for non string values such as numbers and you can define a custom function here that takes the column name (the key) and the raw value and returns the parsed value (you can also define a simple string for built-in javascript functions such as *parseInt* or *parseFloat* or use the default setting that parse integers in integers, floats in floats and strings in strings automatically)
*  formatter: printed numbers need a nice format, depending from localization 
(ie. period for decimals in UK and US, but comma for Italy and latin countries), 
but also from the value itself (ie. a float as a percentage or a currency), 
so you can define a custom function that takes the column name (the key) and the raw value and returns a string 
compatible with the [format specification mini-language](https://github.com/mbostock/d3/wiki/Formatting), 
passed to the [d3.format() method](https://github.com/mbostock/d3/wiki/Formatting#d3_format).

Specific informations about dataset have to be stored in the *schema* object:

*  name: the unique name of the dataset, it will be used also as [HTML id token](http://www.w3.org/TR/html4/types.html#h-6.2)
*  label: the string used as menu label (instead of the *name*)
*  layer: this string refers to the geo layer name this dataset is joined with
*  id: the name of dataset column containing the unique id of rows used for joining the geo layer
*  description: a simple and short text (also basic HTML) shown at the bottom of the legend when dataset is selected

Often a dataset (a table) contains a lot of columns but not all are suitable to be shown as a thematic map.
You can define which column can be selected by the user and so can color the map in the *menu* array of objects.
Each object represents a column of the table:

*  column: name of the column to expose
*  label: the string used as menu label (instead of the *column*)
*  description: a simple and short text (also basic HTML) shown at the bottom of the legend when column is selected
*  bins: max number of bins for binning process (an integer greater than 2)
*  precision: the order of magnitude of calculation results in powers of ten (0 means 'auto')

If the table has a lot of columns, often some of them are related and can be grouped (ie. age classes).
You can define these groups and the columns belong to them with a *groups* object that has groups' names
as keys and arrays of column names as values.

### Dataset types

#### choropleth

For a choropleth map you have to provide the color *palette*, the binning algorithm and the number of the *bins*.
The first one is defined by the [Color Brewer sets](http://colorbrewer2.org/), so you have to use simply the name
of the chosen palette. The second one is set globally for the geo layer in the geo *thematic* type.
The last one is an integer greater than 2. 

With real data, binning bounds are horrible numbers with many digits not so nice to read on a legend.
With *precision* you can prettify these bounds, setting the lower meaningful digit in power of tens.
Original bins calculated by the given algorithm are so slightly changed: it's a matter of equilibrium
between mathematical strictness and ease of reading.

These are global settings for the whole dataset: you can override
the values of *palette* and *bins* in each column definition of the *menu* array.

Global inherited configurations:

```json
{
    palette: 'Reds',
    precision: 0,
    bins: 3
}
```

#### points

[TODO]...[/TODO]

### Dataset sources

#### file

Equal to the geographic file source definition. See the *Geographic sources* > *file* section.

#### dkan

[TODO]...[/TODO]

## Points sets

[TODO]...[/TODO]

## Info window

### Views

## Controls


