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
                    lat: 40,
                    lng: 10
                },

                // Top-right corner
                northEast: {
                    lat: 45,
                    lng: 15
                }
            },

            // Max bounds allowed to user
            max: {

                // Bottom-left corner
                southWest: {
                    lat: 44,
                    lng: 11
                },

                // Top-right corner
                northEast: {
                    lat: 45,
                    lng: 12
                }
            }
        },

        // Zoom options
        zoom: {
            init: 9,
            max: 18,
            min: 1,
            scrollWheel: true
        },

        // Center of the map
        center: {
            lat: 43,
            lng: 9
        },

        /* Attribution line, see http://leafletjs.com/reference.html#control-attribution
         * Set a string item per service
         */
        attribution: [
            'Powered by <a href="http://www.dataninja.it/" target="_blank">Dataninja</a>',
            'tileset from <a href="http://mapnik.org/" target="_blank">OSM Mapnik</a>',
            'icons from <a href="http://www.flaticon.com/" target="_blank">Freepik</a> and <a href="http://www.simplesharebuttons.com/" target="_blank">Simple Share Buttons</a>',
            //'geocoding by <a href="http://wiki.openstreetmap.org/wiki/Nominatim" target="_blank">OSM Nominatim</a>',
            'code on <a href="https://github.com/Dataninja/advanced-mapping-tool" target="_blank">GitHub</a>.'
        ]
    },

    // External div for long text description
    summary: {

        // Enable or not
        active: false,

        // Position respect to map
        position: 'right',

        // Control image to open / close summary
        image: 'icons/info.png',

        // Title on control mouseover
        title: 'Further informations',

        // Initial status (can be overwritten by 'summary' get parameter)
        closed: false,

        // HTML content of the description
        content: '<p></p>'
    },

    // Tooltip control on mouse over regions in vectorial geolayers
    /* Default tooltip content has this structure:
     * [REGION NAME]
     * [key]: [value]
    */
    tooltip: {

        // Enable or not
        active: true

    },

    // Legend control
    legend: {

        // Enable or not
        active: true,

        // Title at the top of the control
        title: '',

        // Description at the bottom, overridable by dataset configuration
        description: '',

        // Symbol between range numbers
        // It will be '-' if missing
        delimiter: '-',

        // Label appended to legend items
        label: function(min,max,label) {
            var prefix = (label ? label+": " : "");
            return prefix + min + (min != max ? " "+this.delimiter+" "+max : "");
        }

    },

    // Menu controls
    menu: {
        
        // Max number of items for an always open menu.
        // If items (geo layers, datasets or columns) are more, menu will collapse.
        // If missing or 0, it will be 3.
        maxItems: 3

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
            format: '',
            
            // Inherits attributes from geoType named here
            type: 'thematic',

            schema: {

                // Key name of layer
                name: 'layer1',

                // Menu label for layer entry
                menu: 'layer1',

                // Key of id values used for join
                id: '',

                // Key of label values used for label
                label: ''
            }
        }
    ],

    // Definition of data sets to load
    dataSets: [
        {
            
            // Inherits attributes from dataSource named here
            source: 'file',
            path: 'data/',
            filename: '',
            format: '',

            // Transformation of the ajax results before their using
            transform: function(res) {
                return res;
            },
           
            // Format specifier for d3.format(), see https://github.com/mbostock/d3/wiki/Formatting#d3_format
            // For string template, see http://docs.python.org/release/3.1.3/library/string.html#formatspec
            // If missing or return empty string, default formatting function is d3.format(',d')(v) || d3.format(',.2f')(v) || v
            formatter: function(k,v) {
                return '';
            }, 


            // Inherits attributes from dataType named here
            type: 'choropleth',
            bins: 7,
            precision: 0,
            palette: 'Reds',

            
            schema: {
                
                // Key name of dataset
                name: 'dataset1',

                // Menu label for layer entry
                label: 'dataset1',

                // Key name of layer data refer to
                layer: 'layer1',

                // Key of id values used for join
                id: '',

                // Legend description
                description: '',

                // Choroplethable columns with custom label, description and bins number
                menu: [
                    {
                        column: '',
                        label: '',
                        description: '',
                        bins: 7,
                        precision: 0
                    }
                    //...
                ],

                // Columns aggregation
                groups: {}
                
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
        icon: 'icons/marker-icon.png',
        shadow: 'icons/marker-shadow.png'
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
            default: '<p></p>',

            // Shown on little screen, ie. on mobile
            mobile: ''
        },

        // Data downloads allowed and linked in the infowindow
        downloads: {

            // Enable or not
            active: false,
            license: 'Creative Commons Attribution <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank">CC-BY 4.0 International</a>.',
            image: 'icons/download.png',
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

                    // Shown only when these datasets are selected (all if missing or empty)
                    datasets: [],

                    // Title for download icon
                    title: '',

                    // Download icon for this specific resource
                    //image: 'icons/download.png'
                }
                // ...
            ]
        },

        // Share current status of the map from the infowindow
        shareButtons: {

            // Enable or not
            active: true,

            // Text prepended to title of each share icon (+ 'su [Twitter | Facebook | Google Plus | Linkedin | ...]')
            title: 'Condividi',

            // If missing or empty, it will be used the url map with proper get parameters to show selected region
            // Otherwise, this custom url will be used
            url: '',

            // Common path for all icons
            // If missing, it will be 'icons/'
            // If empty, you can use absolute path for every icon or different relative paths
            path: 'icons/',

            // Twitter share icon
            twitter: {

                // Enable or not
                active: true,

                // Name of the image file, relative to global path
                // If missing or empty, it will be twitter.png
                image: '',

                // Mention after sharing
                via: '',

                // Text for tweeted content
                // If string it will be "region name - [text]"
                // If function it can use region data: function(d) { return [string]; }
                text: 'Tweet'
            },

            // Facebook share icon
            facebook: {

                // Enable or not
                active: true,

                // Name of the image file, relative to global path
                // If missing or empty, it will be facebook.png
                image: ''
            },

            // Google Plus share icon
            gplus: {

                // Enable or not
                active: true,

                // Name of the image file, relative to global path
                // If missing or empty, it will be gplus.png
                image: ''
            },

            // LinkedIn share icon
            linkedin: {

                // Enable or not
                active: true,

                // Name of the image file, relative to global path
                // If missing or empty, it will be linkedin.png
                image: ''
            },

            // Send an email
            email: {

                // Enable or not
                active: true,

                // Name of the image file, relative to global path
                // If missing or empty, it will be email.png
                image: '',

                // Text for subject
                // If string, it will be "[subject] | region name"
                // If function, it has region data as input and must return a string
                subject: '',

                // Text for body
                // If string, it will be "region name, [body]: url"
                // If function, it has region data and url as input and must return a string
                body: ''
            },
            permalink: {

                // Enable or not
                active: true,

                // Name of the image file, relative to global path
                // If missing or empty, it will be link.png
                image: ''
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
                    return false;
                },
                filter: function(k,v) {
                    return true;
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
            title: 'Fullscreen',
        },

        // Logo at the top-right corner
        logo: {

            // Enable or not
            active: true,

            // Title on mouseover
            title: '',

            // Image
            image: 'icons/logo.png',

            // Border
            border: true,

            // Link
            link: ''
        },

        // Reset the map at the initial status
        reset: {

            // Enable or not
            active: true,

            // Title on mouseover
            title: 'Reset',

            // Image
            image: 'icons/reset.png'
        },

        // Embed options
        embed: {

            // Enable or not
            active: false,

            // Title on mouseover
            title: 'Embed this map',

            // Image
            image: 'icons/embed.png',

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
            shortcode: false,

            // SVG code and download of SVG image from shapes
            svg: {

                // Enable or not
                active: true,

                // File name for downloaded image
                filename: 'map.svg',

                // Icon of the control
                image: 'icons/svg.png'
            }
        },

        // Take a screenshot of the map
        screenshot: {

            // Enable or not
            active: false,

            // Title on mouseover
            title: 'Take a screenshot',

            // Icon of the control
            image: 'icons/screenshot.png',

            // File name for downloaded image
            filename: 'map.png',
        },

        // Open the map in an other window or tab (only in embed mode)
        detach: {

            // Enable or not
            active: true,

            // Static url the control links to
            // If missing or empty, it will be the dynamic url to the map status at the moment of the click
            url: '',

            // Title on mouseover
            title: 'Open in new window', // ie. Open in new window

            // Image
            image: 'icons/detach.png', // ie. icons/detach.png
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
                via: '',
                lang: 'en',
                related: '',
                hashtags: 'dataninja',
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
            active: false,

            // Geo layer name map shows after geocoding
            // If missing or empty, only map view will be set (no layer change)
            layer: 'layer1',

            // Input text is shown only after mouseover on icon
            collapsed: true,

            // Text on send form button
            title: 'Search',

            // Email contact for Nominatim
            email: '',

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
                filename: 'list.json',

                // File prefix (used as extension in file name template for multiple files)
                prefix: 'list-', // ie. geo/lista_comuni-
            
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
 *       - description [string]
 *       - precision 10^[int]
 *       - menu [array]
 *         - [object]
 *           - column [string]
 *           - label [string]
 *           - description [string]
 *           - bins [int > 0]
 *           - precision 10^[int]
 *       - groups [object]
 *         - (groups as keys) [array of columns' names]
 *     - parse [string] | [mixed] function( [string], [mixed] )
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
 * - summary [object]
 *   - active [bool]
 *   - position [string]
 *   - image [string]
 *   - title [string]
 *   - closed [bool]
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
 *         - datasets [array]
 *           - [string matching dataSets names]
 *         - title [string]
 *         - image [string]
 *         - transform [array] function ( [object] )
 *         - (other attributes are inherited from geoSources and geoTypes and can be overrided)
 *       - ...
 *   - shareButtons [object]
 *     - active [bool]
 *     - title [string]
 *     - url [string]
 *     - path [string]
 *     - twitter [object]
 *       - active [bool]
 *       - image [string]
 *       - via [string]
 *       - text [string | [string] function ( [object] )]
 *     - facebook [object]
 *       - active [bool]
 *       - image [string]
 *     - gplus [object]
 *       - active [bool]
 *       - image [string]
 *     - linkedin [object]
 *       - active [bool]
 *       - image [string]
 *     - email [object]
 *       - active [bool]
 *       - image [string]
 *       - subject [string | [string] function ( [object] )]
 *       - body [string | [string] function ( [pbject], [string] )]
 *     - permalink [object]
 *       - active [bool]
 *       - image [string]
 *   - view [object]
 *     - active [bool]
 *     - type [string matching viewTypes attributes]
 *     - (other attributes are inherited from geoSources and geoTypes and can be overrided)
 * - tooltip [object]
 *   - active [bool]
 *   - text [string]
 * - legend [object]
 *   - active [bool]
 *   - title [string]
 *   - description [string]
 *   - delimiter [string]
 *   - label [string] function ( [float], [float] )
 * - menu [object]
 *   - maxItems [int > 0]
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
 *     - url [string]
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

