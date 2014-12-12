if (mapConfig) {
    // Known types of geolayers with global setting inherited to geolayers with 'type' parameter
    mapConfig.geoTypes = {

        /* Tile type served by a tile map service (defined in geoSources)
         * See http://leafletjs.com/reference.html#tilelayer
         */
        tile: {

            // Enable or not
            active: true,

            // Default source is a tile server defined in geoSources
            source: 'tileserver',

            // Same options supported by Leaflet API: http://leafletjs.com/reference.html#tilelayer-options
            options: {
                attribution: '',
                opacity: 0.7
            }
        },

        // Vector shapefile for thematic maps
        thematic: {

            // Enable or not
            active: true,

            // Binning algorithm, see https://github.com/simogeo/geostats (Classification)
            // Supported names are the same of geostats functions without 'get' prefix
            // It can be also an array of bounds for manually class definition
            // Default value is 'Jenks'
            classification: 'Jenks',

            // Infowindow on click can be disabled
            infowindow: true,

            // Tooltip on mouseover can be disabled
            tooltip: true,

            // Fixed zoom on display
            // If missing or zero, there is no restriction on zoom control
            zoom: 0,
            
            /* Layer style, with three presets:
             * - default
             * - highlight
             * - selected
             * Attributes defined in the latest two override default settings
             * See http://leafletjs.com/reference.html#geojson-options
             */
            style: {

                // Default (on loading and reset)
                default: {
		        	weight: 0.5,
			    	opacity: 1,
			        color: 'white',
    			    fillOpacity: 0.7,
        			fillColor: 'none'
                },

                // Highlight (on mouseover)
                highlight: {},
                
                // Selected (on click)
                selected: {
                    weight: 2,
                    color: '#666' 
                }
            }
        }
    };
}

/*
 * Map configuration complete structure:
 *
 * - geoTypes [object]
 *   - tile [object]
 *     - active [bool]
 *     - source [string matching geoSources attributes]
 *     - options [object matching http://leafletjs.com/reference.html#tilelayer-options structure]
 *   - thematic [object]
 *     - active [bool]
 *     - classification [string]
 *     - infowindow [bool]
 *     - tooltip [bool]
 *     - zoom [int>0]
 *     - style [object]
 *       - default [object matching http://leafletjs.com/reference.html#geojson-options style structure]
 *       - highlight [object]
 *       - selected [object]
 */

