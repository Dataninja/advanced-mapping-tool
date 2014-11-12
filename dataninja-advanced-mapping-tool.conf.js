/*
 * Map configuration
 * Go to the end of the file for options metadata
 */

var mapConfig = {

    // Debug mode activation with logs in console
    debug: true,

    // URL shortener service configuration (via yourls)
    urlShortener: {

        // Enable or not
        active: false,

        // Domain without trailing slash (only for remote file)
        domain: '', 
            
        /* Relative or absolute path (ie. [prepath]/yourls-api.php)
         * See http://yourls.org/#API
         */
        path: '/api/dtnj/yourls-api.php',

        // Signature, see https://github.com/YOURLS/YOURLS/wiki/PasswordlessAPI
        signature: 'efe758b8d3',

        // If prefix is not empty, short url will be [prefix]+md5([long url])
        prefix: 'confiscatibene-', // ie. confiscatibene-
            
        // URL generator based on region and a filter
        url: function() {
            return this.domain + this.path;
        }
    },

    // General options for Leaflet map, see http://leafletjs.com/reference.html#map-options
    map: {

        // Bounds of map, see http://leafletjs.com/reference.html#latlngbounds
        bounds: {

            // Map position on loading
            init: {

                // Bottom-left corner
                southWest: {
                    lat: 44.38596,
                    lng: 11.14014
                },

                // Top-right corner
                northEast: {
                    lat: 44.60514,
                    lng: 11.60912
                },
            },

            // Max bounds allowed to user
            max: {

                // Bottom-left corner
                southWest: {
                    lat: 43,
                    lng: 9
                },

                // Top-right corner
                northEast: {
                    lat: 45,
                    lng: 13
                },
            }
        },

        // Zoom options
        zoom: {
            init: 12,
            max: 13,
            min: 11,
            scrollWheel: true
        },

        /* Attribution line, see http://leafletjs.com/reference.html#control-attribution
         * Set a string item per service
         */
        attribution: [
            'Powered by <a href="http://www.dataninja.it/" target="_blank">Dataninja</a>',
            'tileset from <a href="http://www.geoiq.com/" target="_blank">GeoIQ</a>',
            'icons from <a href="http://www.flaticon.com/" target="_blank">Freepik</a> and <a href="http://www.simplesharebuttons.com/" target="_blank">Simple Share Buttons</a>',
            'geocoding by <a href="http://wiki.openstreetmap.org/wiki/Nominatim" target="_blank">OSM Nominatim</a>',
            'code on <a href="https://github.com/Dataninja/confiscatibene-choropleth" target="_blank">GitHub</a>.'
        ]
    },

    // Label control on mouse over regions in vectorial geolayers
    label: {

        // Enable or not
        active: true,

        /* Default label has this structure:
         * [REGION NAME]
         * [text]: [value]
         */
        text: 'Persone assistite'
    },

    // Legend control
    legend: {

        // Enable or not
        active: true,

        // Title at the top of the control
        title: 'Legenda',

        // Description at the bottom
        description: 'Persone assistite nell\'ambito dei PAI',

        // Label appended to legend items
        itemLabel: 'persone assistite'
    },

    // Definition of geographic layers to load
    geoLayers: [
        {

            // Inherits attributes from geoType named here
            type: 'tile'
        },
        {

            // Inherits attributes from geoSource named here
            source: 'file',
            path: 'geo/',
            filename: 'quartieri_bologna.json',
            format: 'json',
            
            // Inherits attributes from geoType named here
            type: 'vector',

            schema: {

                // Key name of layer
                name: 'quartieri',

                // Menu label for layer entry
                menu: 'Quartieri',

                // Key of id values used for join
                id: 'NUMQUART',

                // Key of label values used for label
                label: 'NOMEQUART'
            }
        }
    ],

    // Definition of data sets to load
    dataSets: [
        {
            
            // Inherits attributes from dataSource named here
            source: 'file',
            path: 'data/',
            filename: 'WelfareBO-Programma-Assistenziale-Individualizzato-PAI-1966-2014-Quartieri-dei-servizi.csv',
            format: 'csv',
            transform: function(res) {
                return res;
            },

            // Inherits attributes from geoType named here
            type: 'choropleth', // from dataTypes attributes
            bins: 7,
            palette: 'Greens',
            
            schema: {

                // Key name of dataset
                name: 'servizi',
                
                // Menu label for layer entry
                menu: 'Assistenza per servizio (PAI)',

                // Key name of layer data refer to
                layer: 'quartieri',

                // Key of id values used for join
                id: 'Id',
                
                // Key of label values (not used)
                label: '',

                // Keys of data values shown on map on loading
                values: [
                    'Numero PAI totale',
                    'Donne',
                    'Uomini',
                    'Anziani',
                    'Disagio adulto',
                    'Famiglia e Minori',
                    'Cittadinanza italiana',
                    'Cittadinanza estera'
                ]
            },

            /* Custom parse function name from string to number
             * If missing, 'parseFloat' is the default
             * You can also define a custom function (el) { return el; }
             */
            parse: 'parseInt'
        },
        {
            
            // Inherits attributes from dataSource named here
            source: 'file',
            path: 'data/',
            filename: 'WelfareBO-Programma-Assistenziale-Individualizzato-PAI-1966-2014-Quartieri-di-residenza.csv',
            format: 'csv',
            transform: function(res) {
                return res;
            },

            // Inherits attributes from geoType named here
            type: 'choropleth', // from dataTypes attributes
            bins: 7,
            palette: 'Greens',
            
            schema: {
                
                // Key name of dataset
                name: 'residenza',

                // Menu label for layer entry
                menu: 'Assistenza per residenza (PAI)',

                // Key name of layer data refer to
                layer: 'quartieri',

                // Key of id values used for join
                id: 'Id',
                
                // Key of label values (not used)
                label: '',

                // Keys of data values shown on map on loading
                values: [
                    'Numero PAI totale',
                    'Donne',
                    'Uomini',
                    'Anziani',
                    'Disagio adulto',
                    'Famiglia e Minori',
                    'Cittadinanza italiana',
                    'Cittadinanza estera'
                ]
            },

            /* Custom parse function name from string to number
             * If missing, 'parseFloat' is the default
             * You can also define a custom function (el) { return el; }
             */
            parse: 'parseInt'
        }
    ],

    // Management of data points passed by GET parameters
    pointsSet: {

        // Enable or not
        active: false,

        // Inherits attributes from dataSource named here
        source: 'dkan',

        // Cluster feature
        clusters: true,

        // Icons used for markers
        icon: 'img/marker-icon.png',
        shadow: 'img/marker-shadow.png'
    },

    // Info window appears on click on a region
    infowindow: {

        // Enable or not
        active: true,

        // Default content when no region is selected
        content: {

            // Shown in normal view modes
            default: '<p>La mappa mostra i dati dei servizi di assistenza del Comune di Bologna per ogni quartiere della città.</p>',

            // Shown on little screen, ie. on mobile
            mobile: 'I servizi di assistenza del Comune di Bologna per quartiere.',
        },

        // Data downloads allowed and linked in the infowindow
        downloads: {

            // Enable or not
            active: false,
            license: 'Creative Commons Attribution <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank">CC-BY 4.0 International</a>.',
            files: [
                {

                    // Enable or not
                    active: true,
                    
                    // Inherits attributes from dataSource named here
                    source: 'dkan',
                    resourceId: 'e5b4d63a-e1e8-40a3-acec-1d351f03ee56',

                    // Name of the download, used to build filename
                    name: 'immobili',
                    
                    // Filebase of the filename
                    filebase: 'confiscatibene',

                    // Title for download icon
                    title: 'Scarica l\'elenco degli immobili',

                    // Download icon
                    image: 'img/house109-dnl.png'
                },
                {
                    active: true,

                    source: 'dkan',
                    resourceId: '8b7e12f1-6484-47f0-9cf6-88b446297dbc',

                    name: 'aziende',
                    filebase: 'confiscatibene',
                    title: 'Scarica l\'elenco delle aziende',
                    image: 'img/factory6-dnl.png'
                }
            ]
        },

        // Share current status of the map from the infowindow
        shareButtons: {

            // Enable or not
            active: true,

            // Text prepended to title of each share icon (+ 'su [Twitter | Facebook | Google Plus | Linkedin | ...]')
            title: 'Condividi la situazione',

            // Twitter share icon
            twitter: {

                // Enable or not
                active: true,

                // Mention after sharing
                via: 'confiscatibene',

                // Text appended to tweet content, hashtags here (+ region name)
                text: 'Immobili e aziende #confiscatibene' // ie. Tweet
            },

            // Facebook share icon
            facebook: {

                // Enable or not
                active: true
            },

            // Google Plus share icon
            gplus: {

                // Enable or not
                active: true
            },

            // LinkedIn share icon
            linkedin: {

                // Enable or not
                active: true
            },

            // Send an email
            email: {

                // Enable or not
                active: true,

                // Text prepended to subject (+ region name)
                subject: 'Servizi di assistenza del Comune di Bologna',

                // Text prepended to body (+ region name and URL)
                body: 'I servizi di assistenza del Comune di Bologna'
            },
            permalink: {

                // Enable or not
                active: true
            }
        },

        // Data visualization in the infowindow
        view: {

            // Enable or not
            active: true,

            // Inherits attributes from viewType named here
            type: 'table',
            options: {
                /*bold: function(k,v) {
                    return (k.indexOf('Totale') > -1);
                },
                filter: function(k,v) {
                    return (v != '0' && k.charAt(0) == k.charAt(0).toUpperCase() && k.slice(0,2) != "Id");
                },*/
                transform: function(k,v) {
                    return parseInt(v) || v;
                }
            }
        }
    },

    // All the controls added to the map
    controls: {

        // Fullscreen button at the bottom of zoom control
        fullscreen: {

            // Enable or not
            active: true,

            // Title on mouseover
            title: 'Fullscreen mode',
        },

        // Logo at the top-right corner
        logo: {

            // Enable or not
            active: true,

            // Title on mouseover
            title: '',

            // Image
            image: 'img/logobo.jpg',

            // Border
            border: true,

            // Link
            link: 'http://www.comune.bologna.it/'
        },

        // Reset the map at the initial status
        reset: {

            // Enable or not
            active: true,

            // Title on mouseover
            title: 'Reset',

            // Image
            image: 'img/reset.png'
        },

        // Embed options
        embed: {

            // Enable or not
            active: false,

            // Title on mouseover
            title: 'Embed this map',

            // Image
            image: 'img/embed.png',

            // The permalink (long form)
            permalink: true,

            // The shorted permalink (ignored if urlShortener is not active)
            shorturl: true,

            // iframe code for pages or posts
            iframe: true,

            // iframe code for sidebars (widget mode)
            widget: true,

            // Wordpress widget code if widget is available
            // See https://github.com/Dataninja/wp-cbmap-shortcode
            shortcode: true,

            // SVG code and download of SVG image from shapes
            svg: {

                // Enable or not
                active: true,

                // File name for downloaded image
                filename: 'confiscatibene_map.svg',

                // Icon of the control
                image: 'img/svg.png'
            }
        },

        // Take a screenshot of the map
        screenshot: {

            // Enable or not
            active: false,

            // Title on mouseover
            title: 'Take a screenshot',

            // Icon of the control
            image: 'img/screenshot.png',

            // File name for downloaded image
            filename: 'confiscatibene_map.png',
        },

        // Open the map in an other window or tab (only in embed mode)
        detach: {

            // Enable or not
            active: true,

            // Title on mouseover
            title: 'Open in new window', // ie. Open in new window

            // Image
            image: 'img/detach.png', // ie. img/detach.png
        },

        // Social buttons: like, tweet, +1
        socialButtons: {

            // Enable or not
            active: false,

            // Tweet button
            twitter: {

                // Enable or not
                active: true,

                // Specific options from Twitter Dev
                // See https://dev.twitter.com/web/tweet-button
                via: 'confiscatibene',
                lang: 'it',
                related: 'jenkin27:Data scientist at Dataninja',
                hashtags: 'confiscatibene,dataninja',
                count: 'vertical',

                // Text on the button
                text: 'Tweet'
            },

            // Facebook button
            facebook: {

                // Enable or not
                active: true,

                // Specific options from Facebook Dev
                // See https://developers.facebook.com/docs/plugins/like-button
                appId: '470290923072583', // appID dei Dataninja
                layout: 'box_count',
                action: 'like',
                'show-faces': false,
                share: false
            },

            // +1 button
            gplus: {

                // Enable or not
                active: true,
                
                // Specific options from Google Plus Dev
                // See https://developers.google.com/+/web/+1button/?hl=it
                size: 'tall',
                annotation: 'bubble'
            }
        },

        // Geocoder control with optional autocomplete feature,
        // based on the OSM Nominatim service, see http://wiki.openstreetmap.org/wiki/Nominatim
        geocoder: {

            // Enable or not
            active: false,

            // Geo layer name map shows after geocoding
            layer: 'comuni',

            // Input text is shown only after mouseover on icon
            collapsed: true,

            // Text on send form button
            title: 'Cerca il tuo comune',

            // Email contact for Nominatim
            email: 'jenkin@dataninja.it',

            // Zoom of map after geocoding
            zoom: 10,

            /* Autocomplete feature
             * The list of possible strings is stored in a json file
             */
            autocomplete: {

                // Enable or not
                active: false,

                // Domain without trailing slash (only for remote file)
                domain: '',

                // Relative or absolute path (with trailing slash)
                path: 'geo/',
            
                // Complete file name if single file (with extension)
                filename: 'lista_comuni.json',

                // File prefix (used as extension in file name template for multiple files)
                prefix: 'lista_comuni-', // ie. geo/lista_comuni-
            
                // File format (used as extension in file name template for multiple files)
                format: 'json',
                
                // URL generator based on region
                url: function(region) {
                    return this.domain + 
                        this.path + 
                        (region ? this.prefix + region + '.' + this.format : this.filename);
                },
            
                // Callback function of ajax request for custom result transformation
                transform: function(res) {
                    return res;
                }
            }
        }
    },
    
    /*
     * Global configuration
     */

    // Known sources of data with global setting inherited to datasets with 'source' parameter
    dataSources: {

        // Local or remote static file
        file: {

            // Domain without trailing slash (only for remote file)
            domain: '',

            // Relative or absolute path (with trailing slash)
            path: '',

            // Complete file name if single file (with extension)
            filename: '',

            // File format (used also as extension in file name template for multiple files)
            format: '',

            // URL generator based on region and a filter
            url: function(region, filterKey, filterValue) {

                /* Default file name template if filename is empty:
                 * - region_filterKey-filterValue.format
                 * If no filter:
                 * - region.format
                 */
                return this.domain + 
                    this.path + 
                    (this.filename || (region + (filterKey && filterValue ? '_'+filterKey+'-'+filterValue : '') + "." + this.format));
            },

            // Callback function of ajax request for custom result transformation
            transform: function(res) {
                return res;
            }
        },

        // Dkan API: see http://docs.getdkan.com/docs/dkan-documentation/dkan-api/datastore-api
        dkan: {

            // Domain without trailing slash
            domain: '',

            /* Relative or absolute path (ie. [prepath]/action/datastore/search.json)
             * See http://docs.getdkan.com/docs/dkan-documentation/dkan-api/datastore-api#Datastore_API_URL_
             */
            path: '/api/confiscatibene/action/datastore/search.json',

            /* Request parameters for Dkan API
             * See http://docs.getdkan.com/docs/dkan-documentation/dkan-api/datastore-api#Request_Parameters
             */

            // UID of the resource
            resourceId: '',

            // Limit returned items number in response
            limit: 5000,

            // Format of response (ie. json)
            format: 'json',
            
            // URL generator based on region and a filter
            url: function(region, filterKey, filterValue) {
                return this.domain + this.path + 
                    '?resource_id=' + this.resourceId +
                    (filterKey && filterValue ? ('&filters[' + filterKey + ']=' + filterValue) : '') + 
                    (this.limit ? '&limit=' + this.limit : '');
            },
            
            /* Callback function of ajax request for custom result transformation
             * See http://docs.getdkan.com/docs/dkan-documentation/dkan-api/datastore-api#Return_Values
             */
            transform: function(res) {
                return res.result.records;
            }
        }
    },

    // Known types of data with global setting inherited to datasets with 'type' parameter
    dataTypes: {

        /* Choropleth (also known as thematic map):
         * regions are colored based on data values
         */
        choropleth: {

            /* Fillcolor when based on data
             * Palette names refer to colorbrewer2 lib
             * See http://colorbrewer2.org/
             */
            palette: 'Reds',

            // Bins number for data -> color scale transformation
            bins: 3
        },

        // Simple points with latitude and longitude shown as markers TODO
        points: {}
    },

    // Known sources of geo shapes with global setting inherited to geolayers with 'source' parameter
    geoSources: {

        // Local or remote static file
        file: {
            
            // Domain without trailing slash (only for remote file)
            domain: '',
            
            // Relative or absolute path (with trailing slash)
            path: '',
            
            /* File format (used as extension in file name template for multiple files)
             * Geojson is the default format, see http://geojson.org/
             */
            format: 'json',
            
            // Complete file name if single file (with extension)
            filename: '',

            // File format (used as extension in file name template for multiple files)
            url: function(region, filterKey, filterValue) {
                return this.domain + 
                    this.path + 
                    (this.filename || (region + (filterKey && filterValue ? '_'+filterKey+'-'+filterValue : '') + "." + this.format));
            },
            
            /* Callback function of ajax request for custom result transformation
             * See http://geojson.org/
             */
            transform: function(res) {
                return res.features;
            }
        },

        /* Remote tiles served by a tile server, see http://en.wikipedia.org/wiki/Tile_Map_Service
         * OSM Mapnik is the default server, see http://wiki.openstreetmap.org/wiki/Tile_servers
         */
        tileserver: {

            // Template of the domain (ie. {s} will be replaced by a, b, c, ...)
            domain: 'http://{s}.tile.openstreetmap.org',

            // Template of the path to image (ie. xyz will be replaced by integers)
            path: '/{z}/{x}/{y}.png',

            // URL generator
            url: function() {
                return this.domain + this.path;
            }
        }
    },

    // Known types of geolayers with global setting inherited to geolayers with 'type' parameter
    geoTypes: {

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

        // Vector shapefile
        vector: {

            // Enable or not
            active: true,
            
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
        // ...
    },

    // Known types of visualization into the infowindow with global setting inherited to infowindow with 'view' parameter
    viewTypes: {

        /* The infowindow contains a table with header and footer,
         * here a structure of the body can be defined
         * returning the tbody element, see http://www.w3schools.com/tags/tag_tbody.asp
         */
        table: function(data, options) {
            if (!data) return '';

            /* Default options can be overrided (include and exclude filters are evaluated in this order):
             * - include array has data keys to include
             * - exclude array has data keys to exclude
             * - bold function defines a rule to boldify a row
             * - filter function defines a custom filter after include and exclude filters
             * - transform function defines a transformation (ie. casting) on data values
             */
            var defaultOptions = {
                    include: [],
                    exclude: [],
                    bold: function(key, value) { return false; },
                    filter: function(key, value) { return true; },
                    transform: function(key, value) { return value; }
                },
                options = options || {},
                tbody = '',
                k;

            for (k in defaultOptions) {
                if (defaultOptions.hasOwnProperty(k) && !options.hasOwnProperty(k)) {
                    options[k] = defaultOptions[k];
                }
            }

            for (k in data) {
                if (data.hasOwnProperty(k)) {
                    if (!options.include.length || options.include.indexOf(k) > -1) {
                        if (!options.exclude.length || !(options.exclude.indexOf(k) > -1)) {
                            if (options.filter(k,data[k])) {
                                var val = options.transform(k,data[k]),
                                    isBold = options.bold(k,data[k]);
                                tbody += '<tr>' + 
                                    '<td>' + (isBold ? '<b>'+k+'</b>' : k) + '</td>' +
                                    '<td>' + (isBold ? '<b>'+val+'</b>' : val) + '</td>' +
                                    '</tr>';
                            }
                        }
                    }
                }
            }

            return tbody;
        }
    }
};

/*
 * Map configuration complete structure:
 *
 * - debug: [bool]
 * - dataSources: [object]
 *   - file [object]
 *     - domain [string]
 *     - path [string]
 *     - filename [string]
 *     - format [string]
 *     - url [string] function ( [string], [string], [string | int] )
 *     - transform [array] function ( [mixed] )
 *   - dkan [object]
 *     - domain [string]
 *     - path [string]
 *     - resourceId [string]
 *     - limit [int > 0]
 *     - format [string]
 *     - url [string] function ( [string], [string], [string | int] )
 *     - transform [array] function ( [object] )
 * - dataTypes [object]
 *   - choropleth [object]
 *     - bins [int > 0]
 *   - points [object]
 * - geoSources [object]
 *   - file [object]
 *     - domain [string]
 *     - path [string]
 *     - format [string]
 *     - url [string] function ( [string], [string], [string | int] )
 *     - transform [array] function ( [mixed] )
 *   - tileserver [object]
 *     - domain [string]
 *     - path [string]
 *     - url [string] function ( )
 * - geoTypes [object]
 *   - tile [object]
 *     - active [bool]
 *     - source [string matching geoSources attributes]
 *     - options [object matching http://leafletjs.com/reference.html#tilelayer-options structure]
 *   - vector [object]
 *     - active [bool]
 *     - style [object]
 *       - default [object matching http://leafletjs.com/reference.html#geojson-options style structure]
 *       - highlight [object]
 *       - selected [object]
 * - viewTypes [object]
 *   - table [string] function ( [object], [object] )
 * - dataSets [array]
 *   - [object]
 *     - active [bool]
 *     - source [string matching dataSources attributes]
 *     - type [string matching dataTypes attributes]
 *     - schema [object]
 *       - layer [string matching a geoLayer.name for joining]
 *       - id [string]
 *       - menu [string]
 *       - label [string]
 *       - values [string | array]
 *         - [string]
 *     - parse [string] | [mixed] function( [string] )
 *     - (other attributes are inherited from dataSources and dataTypes and can be overrided)
 *   - ...
 * - pointsSet [object]
 *   - active [bool]
 *   - source [string matching dataSources attributes]
 *   - clusters [bool]
 *   - icon [string]
 *   - shadow [string]
 * - geoLayers [array]
 *   - [object]
 *     - active [bool]
 *     - source [string matching geoSources attributes]
 *     - type [string matching geoTypes attributes]
 *     - schema [object]
 *       - name [string]
 *       - menu [string]
 *       - id [string]
 *       - label [string]
 *     - (other attributes are inherited from geoSources and geoTypes and can be overrided)
 *   - ...
 * - map [object]
 *   - bounds [object]
 *     - init [object]
 *       - southWest [object]
 *         - lat [float]
 *         - lng [float]
 *       - northEast [object]
 *         - lat [float]
 *         - lng [float]
 *     - max [object]
 *       - southWest [object]
 *         - lat [float]
 *         - lng [float]
 *       - northEast [object]
 *         - lat [float]
 *         - lng [float]
 *   - zoom [object]
 *     - init [int]
 *     - min [int]
 *     - max [int]
 *     - scrollWheel [bool]
 *   - attribution [array]
 *     - [string]
 *     - ...
 * - urlShortener [object]
 *   - active [bool]
 *   - domain [string]
 *   - path [string]
 *   - signature [string]
 *   - prefix [string]
 *   - url [string] function ( )
 * - infowindow [object]
 *   - active [bool]
 *   - content [object]
 *     - default [string]
 *     - mobile [string]
 *   - downloads [object]
 *     - active [object]
 *     - license [string]
 *     - files [array]
 *       - [object]
 *         - active [bool]
 *         - source [string matching dataSources attributes]
 *         - name [string]
 *         - filebase [string]
 *         - title [string]
 *         - image [string]
 *         - transform [array] function ( [object] )
 *         - (other attributes are inherited from geoSources and geoTypes and can be overrided)
 *       - ...
 *   - shareButtons [object]
 *     - active [bool]
 *     - title [string]
 *     - twitter [object]
 *       - active [bool]
 *       - via [string]
 *       - text [string]
 *     - facebook [object]
 *       - active [bool]
 *     - gplus [object]
 *       - active [bool]
 *     - linkedin [object]
 *       - active [bool]
 *     - email [object]
 *       - active [bool]
 *       - subject [string]
 *       - body [string]
 *     - permalink [object]
 *       - active [bool]
 *   - view [object]
 *     - active [bool]
 *     - type [string matching viewTypes attributes]
 *     - (other attributes are inherited from geoSources and geoTypes and can be overrided)
 * - label [object]
 *   - active [bool]
 *   - text [string]
 * - legend [object]
 *   - active [bool]
 *   - title [string]
 *   - description [string]
 *   - itemLabel [string]
 * - controls [object]
 *   - active [bool]
 *   - fullscreen [object]
 *     - active [bool]
 *     - title [string]
 *   - logo [object]
 *     - active [bool]
 *     - title [string]
 *     - image [string]
 *     - border [bool]
 *     - link [string]
 *   - reset [object]
 *     - active [bool]
 *     - title [string]
 *     - image [string]
 *   - embed [object]
 *     - active [bool]
 *     - title [string]
 *     - image [string]
 *     - permalink [bool]
 *     - shorturl [bool]
 *     - iframe [bool]
 *     - widget [bool]
 *     - shortcode [bool]
 *     - svg [object]
 *       - active [bool]
 *       - filename [string]
 *       - image [string]
 *   - screenshot [object]
 *     - active [bool]
 *     - title [string]
 *     - image [string]
 *     - filename [string]
 *     - ignoreMouse [bool]
 *     - ignoreAnimation [bool]
 *     - ignoreDimensions [bool]
 *     - ignoreClear [bool]
 *     - offsetX ['auto' | int]
 *     - offsetY ['auto' | int]
 *   - detach [object]
 *     - active [bool]
 *     - title [string]
 *     - image [string]
 *   - socialButtons [object]
 *     - active [bool]
 *     - twitter [object]
 *       - active [bool]
 *       - via [string]
 *       - lang [string (ISO 3166-1 alpha-2)]
 *       - related [string]
 *       - hashtags [string]
 *       - count [string]
 *       - text [string]
 *     - facebook [object]
 *       - active [bool]
 *       - appId [string]
 *       - layout [string]
 *       - action [string]
 *       - show-faces [bool]
 *       - share [bool]
 *     - gplus [object]
 *       - active [bool]
 *       - size [string]
 *       - annotation [string]
 *   - geocoder [object]
 *     - active [bool]
 *     - layer [string matching a geoLayer.name]
 *     - collapsed [bool]
 *     - title [string]
 *     - email [string]
 *     - zoom [int]
 *     - autoocmplete [object]
 *       - active [bool]
 *       - domain [string]
 *       - path [string]
 *       - filename [string]
 *       - prefix [string]
 *       - format [string]
 *       - url [string] function ( [string] )
 *       - transform [array] function ( [array] )
 */

