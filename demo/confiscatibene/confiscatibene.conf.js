/*
 * Map configuration
 * Go to the end of the file for options metadata
 */

var mapConfig = {

    // Debug mode activation with logs in console
    debug: false,

    // Language code in ISO 639-1:2002 format (see http://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)
    language: 'it',

    // Google Analytics code for tracking, see http://www.google.it/intl/it/analytics/
    analytics: {
        active: false,
        ua: ''
    },

    // URL shortener service configuration (via yourls)
    urlShortener: {

        // Enable or not
        active: false,

        // Domain without trailing slash (only for remote file)
        domain: '', 
            
        /* Relative or absolute path (ie. [prepath]/yourls-api.php)
         * See http://yourls.org/#API
         */
        path: '',

        // Signature, see https://github.com/YOURLS/YOURLS/wiki/PasswordlessAPI
        signature: '',

        // If prefix is not empty, short url will be [prefix]+md5([long url])
        prefix: '',
            
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
                    lat: 35.568,
                    lng: 1.537
                },

                // Top-right corner
                northEast: {
                    lat: 47.843,
                    lng: 23.203
                },
            },

            // Max bounds allowed to user
            max: {

                // Bottom-left corner
                southWest: {
                    lat: 22.472,
                    lng: -16.523
                },

                // Top-right corner
                northEast: {
                    lat: 62.083,
                    lng: 73.828
                },
            }
        },

        // Zoom options
        zoom: {
            //init: 11,
            max: 13,
            min: 5,
            scrollWheel: true
        },

        // Center of the map
        /*center: {
            lat: 43,
            lng: 9
        },*/

        /* Attribution line, see http://leafletjs.com/reference.html#control-attribution
         * Set a string item per service
         */
        attribution: [
            'Powered by <a href="http://www.dataninja.it/" target="_blank">Dataninja</a>',
            'tileset from <a href="http://mapnik.org/" target="_blank">OSM Mapnik</a>',
            'icons from <a href="http://www.flaticon.com/" target="_blank">Freepik</a> and <a href="http://www.simplesharebuttons.com/" target="_blank">Simple Share Buttons</a>',
            'geocoding by <a href="http://wiki.openstreetmap.org/wiki/Nominatim" target="_blank">OSM Nominatim</a>',
            'code on <a href="https://github.com/Dataninja/advanced-mapping-tool" target="_blank">GitHub</a>.'
        ]
    },

    // External div for long text description
    description: {

        // Enable or not
        active: false,

        // Position respect to map
        position: 'right',

        // HTML content of the description
        content: '<p></p>'
    },

    // Label control on mouse over regions in vectorial geolayers
    label: {

        // Enable or not
        active: true,

        /* Default label has this structure:
         * [REGION NAME]
         * [text]: [value]
         */
        text: 'Beni confiscati'
    },

    // Legend control
    legend: {

        // Enable or not
        active: true,

        // Title at the top of the control
        title: 'Legenda',

        // Description at the bottom, overridable by dataset configuration
        description: 'Numero totale di beni confiscati',

        // Label appended to legend items
        label: function(min,max,label) {
            return label + ": " + min + " - " + max;
        }

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
            filename: '',
            format: 'json',
            
            // Inherits attributes from geoType named here
            type: 'vector',

            schema: {

                // Key name of layer
                name: 'regioni',

                // Menu label for layer entry
                menu: 'Regioni',

                // Key of id values used for join
                id: 'COD_REG',

                // Key of label values used for label
                label: 'NOME_REG'
            }
        },
        {

            source: 'file',
            path: 'geo/',
            filename: '',
            format: 'json',

            type: 'vector',

            schema: {
                name: 'province',
                menu: 'Province',
                id: 'COD_PRO',
                label: 'NOME_PRO'
            }
        },
        {

            source: 'file',
            path: 'geo/',
            filename: '',
            format: 'json',
            
            type: 'vector',

            schema: {
                name: 'comuni',
                menu: 'Comuni',
                id: 'PRO_COM',
                label: 'NOME_COM'
            }
        }
    ],

    // Definition of data sets to load
    dataSets: [
        {
            
            // Inherits attributes from dataSource named here
            source: 'file',
            path: 'data/',
            filename: 'e2f0c989-929f-4e4d-87e2-097140f8880f.json',
            format: 'json',

            // Transformation of the ajax results before their using
            transform: function(res) {
                return res.result.records;
            },
           
            // Format specifier for d3.format(), see https://github.com/mbostock/d3/wiki/Formatting#d3_format
            // For string template, see http://docs.python.org/release/3.1.3/library/string.html#formatspec
            // If missing or return empty string, default formatting function is d3.format(',d')(v) || d3.format(',.2f')(v) || v
            /*formatter: function(k,v) {
                return '';
            },*/ 

            // Inherits attributes from dataType named here
            type: 'choropleth',
            bins: 7,
            palette: 'Reds',
            
            schema: {
                
                // Key name of dataset
                name: 'regioni',

                // Menu label for layer entry
                label: '',

                // Key name of layer data refer to
                layer: 'regioni',

                // Key of id values used for join
                id: 'IdRegioneISTAT',

                // Choroplethable columns with custom lable, description and bins number
                menu: [
                    {
                        column: 'Totale beni'
                        //label: '',
                        //description: '',
                        //bins: 3
                    },
                    {
                        column: 'Totale immobili'
                        //label: '',
                        //description: '',
                        //bins: 3
                    },
                    {
                        column: 'Totale aziende'
                        //label: '',
                        //description: '',
                        //bins: 3
                    }
                    //...
                ]

                // Columns aggregation
                //groups: {}
                
            },

            // Custom parse function name from string to number
            // If missing, formatting is performing by parseInt(v) || parseFloat(v) || v
            // You can also define a custom function (k,v) { return v; }
            //parse: 'parseFloat'
        },
        {
            source: 'file',
            path: 'data/',
            filename: 'c18fa1ca-971f-4cfa-92e9-869785260dec.json',
            format: 'json',

            transform: function(res) {
                return res;
            },
           
            type: 'choropleth',
            bins: 7,
            palette: 'Blues',
            
            schema: {
                name: 'province',
                label: '',
                layer: 'province',
                id: 'IdProvinciaISTAT',
                menu: [
                    {
                        column: 'Totale beni'
                        //label: '',
                        //description: '',
                        //bins: 3
                    },
                    {
                        column: 'Totale immobili'
                        //label: '',
                        //description: '',
                        //bins: 3
                    },
                    {
                        column: 'Totale aziende'
                        //label: '',
                        //description: '',
                        //bins: 3
                    }
                    //...
                ]

                // Columns aggregation
                //groups: {}
                
            },

            // Custom parse function name from string to number
            // If missing, formatting is performing by parseInt(v) || parseFloat(v) || v
            // You can also define a custom function (k,v) { return v; }
            //parse: 'parseFloat'
        },
        {
            source: 'file',
            path: 'data/',
            filename: '69b2565e-0332-422f-ad57-b11491e33b08.json',
            format: 'json',

            transform: function(res) {
                return res;
            },
           
            type: 'choropleth',
            bins: 7,
            palette: 'Greens',
            
            schema: {
                name: 'comuni',
                label: '',
                layer: 'comuni',
                id: 'IdComuneISTAT',
                menu: [
                    {
                        column: 'Totale beni'
                        //label: '',
                        //description: '',
                        //bins: 3
                    },
                    {
                        column: 'Totale immobili'
                        //label: '',
                        //description: '',
                        //bins: 3
                    },
                    {
                        column: 'Totale aziende'
                        //label: '',
                        //description: '',
                        //bins: 3
                    }
                    //...
                ]

                // Columns aggregation
                //groups: {}
                
            },

            // Custom parse function name from string to number
            // If missing, formatting is performing by parseInt(v) || parseFloat(v) || v
            // You can also define a custom function (k,v) { return v; }
            //parse: 'parseFloat'
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

        // Position respect to map (default 'inside', bottom-right corner)
        position: 'inside',

        // Default content when no region is selected
        content: {

            // Shown in normal view modes
            default: '<p>La mappa mostra il numero di beni confiscati per tutti i territori amministrativi italiani, secondo i dati ufficiali dell\'<a href="http://www.benisequestraticonfiscati.it" target="_blank">ANBSC</a> (sono esclusi i beni non confiscati in via autonoma). La corrispondenza tra il gradiente di colore e il numero complessivo di beni confiscati è dato nella legenda in basso a sinistra.</p>' + 
                '<p>Mediante il selettore in alto a sinistra si possono caricare e visualizzare ulteriori livelli (regioni, province, comuni).</p>' +
                '<p>Principali funzioni della mappa: <ul>' + 
                '<li>cerca i dati relativi al tuo territorio cliccando sulla lente e inserendo il nome di un comune;</li>' + 
                '<li>clicca sul territorio per visualizzare i dati in dettaglio, la composizione dei beni e per scaricarne la lista completa;</li>' + 
                '<li>includi la vista corrente della mappa sul tuo sito con il codice di embed o scaricane uno screenshot (pulsanti in alto a destra).</li>' +
                '</ul></p>' +
                '<p>Tieniti aggiornato sul progetto visitando il sito ufficiale di <a href="http://www.confiscatibene.it" target="_blank">Confiscati Bene</a> o seguendo l\'account Twitter <a href="https://twitter.com/confiscatibene" target="_blank">@confiscatibene</a>, puoi anche scriverci all\'indirizzo <a href="mailto:info@confiscatibene.it" target="_blank">info@confiscatibene.it</a>.</p>',

            // Shown on little screen, ie. on mobile
            mobile: '<a href="mailto:info@confiscatibene.it" target="_blank" style="margin-right: 30px;">Info</a>',
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
                    resourceId: '',

                    // Name of the download, used to build filename
                    name: 'dwn1',
                    
                    // Filebase of the filename
                    filebase: 'dwn1',

                    // Title for download icon
                    title: '',

                    // Download icon
                    image: 'img/house109-dnl.png'
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
                text: 'Immobili e aziende #confiscatibene'
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
                subject: 'Confiscati Bene',

                // Text prepended to body (+ region name and URL)
                body: 'Gli immobili e le aziende #confiscatibene'
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
                bold: function(k,v) {
                    return (k.indexOf('Totale') > -1);
                },
                filter: function(k,v) {
                    return (v != '0' && k.charAt(0) == k.charAt(0).toUpperCase() && k.slice(0,2) != "Id");
                }/*,
                formatter: function(k,v) {
                    return '';
                }*/
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
            image: 'img/logocb.png',

            // Border
            border: false,

            // Link
            link: 'http://www.confiscatibene.it/'
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
                active: false,

                // Specific options from Facebook Dev
                // See https://developers.facebook.com/docs/plugins/like-button
                appId: '', // appID dei Dataninja
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
            active: true,

            // Geo layer name map shows after geocoding
            layer: 'comuni',

            // Input text is shown only after mouseover on icon
            collapsed: true,

            // Text on send form button
            title: 'Cerca il tuo comune',

            // Email contact for Nominatim
            email: 'info@confiscatibene.it',

            // Zoom of map after geocoding
            zoom: 10,

            /* Autocomplete feature
             * The list of possible strings is stored in a json file
             */
            autocomplete: {

                // Enable or not
                active: true,

                // Domain without trailing slash (only for remote file)
                domain: '',

                // Relative or absolute path (with trailing slash)
                path: 'geo/',
            
                // Complete file name if single file (with extension)
                filename: 'lista_comuni.json',

                // File prefix (used as extension in file name template for multiple files)
                prefix: 'list_comuni-', // ie. geo/lista_comuni-
            
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
            path: '',

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
    }
};

/*
 * Map configuration complete structure:
 *
 * - debug [bool]
 * - language [string]
 * - analytics [object]
 *   - active [bool]
 *   - ua [string]
 * - dataSources [object]
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
 *     - formatter [string] function ( [string], [mixed] )
 *     - schema [object]
 *       - name [string]
 *       - layer [string matching a geoLayer.name for joining]
 *       - id [string]
 *       - menu [array]
 *         - [object]
 *           - column [string]
 *           - label [string]
 *           - description [string]
 *           - bins [int > 0]
 *       - groups [object]
 *         - (groups as keys) [array of columns' names]
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
 *   - center [object]
 *     - lat [float]
 *     - lng [float]
 *   - attribution [array]
 *     - [string]
 *     - ...
 * - description [object]
 *   - active [bool]
 *   - position [string]
 *   - content [string]
 * - urlShortener [object]
 *   - active [bool]
 *   - domain [string]
 *   - path [string]
 *   - signature [string]
 *   - prefix [string]
 *   - url [string] function ( )
 * - infowindow [object]
 *   - active [bool]
 *   - position [string]
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
 *   - label [string] function ( [float], [float] )
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

