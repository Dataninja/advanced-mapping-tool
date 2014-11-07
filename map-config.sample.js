var mapConfig = {

    dataSources: {
        dkan: {
            uri: '',
            path: '', // ie. /api/confiscatibene/action/datastore/search.json
        }
        // ...
    },

    dataTypes: {
        choropleth: {
            bins: 7 // ie. int > 0
        },
        points: {}
    },

    geoTypes: {
        tile: {
            active: true,
            uri: '',
            path: '', // ie. /api/geoiq/{s}/{z}/{x}/{y}.png
            opacity: 0.7, // ie. float [0,1]
            attribution: ''
        },
        vector: {
            active: true,
            inSelectorControl: true,
            style: {
                default: {
		        	weight: 0.5,
			    	opacity: 1,
			        color: 'white',
    			    fillOpacity: 0.7,
        			fillColor: 'none'
                },
                highlight: { // Overrides default style attributes
                }
            }
        }
        // ...
    },

    dataSets: [
        {
            source: '', // from dataSources attributes
            type: '', // from dataTypes attributes
            // ... // based on dataTypes and dataSources attributes for this type and source
            schema: {
                layer: '', // keyname of matched layer
                id: '',
                label: '',
                value: ''
            }
        }
        // ...
    ],   

    geoSources: [
        {
            type: '', // from geoTypes attributes
            // ... // based on geoTypes attributes for this type
            schema: {
                layer: '', // keyname of layer
                id: '',
                label: ''
            }
        }
        // ...
    ],

    map: {
        bounds: {
            init: {
                southWest: {
                    lat: 0,
                    lng: 0
                },
                northEast: {
                    lat: 0,
                    lng: 0
                },
            },
            max: {
                southWest: {
                    lat: 0,
                    lng: 0
                },
                northEast: {
                    lat: 0,
                    lng: 0
                },
            }
        },
        zoom: {
            max: 0,
            min: 0,
            scrollWheel; false
        },
        attribution: [ // a string item per line
        ]
    },

    urlShortener: {
        path: '', // ie. /api/dtnj/yourls-api.php
        signature: '',
        prefix: '' // ie. confiscatibene-
    },

    infowindow: {}, // To do...

    label: {}, // To do...

    legend: {}, // To do...

    controls: {
        fullscreen: {
            active: true,
            title: '', // ie. Fullscreen mode
        },
        logo: {
            active: true,
            title: '',
            image: '', // ie. img/logo.png
            link: '' // ie. http://www.confiscatibene.it/
        },
        reset: {
            active: true,
            title: '',
            image: '' // ie. img/reset.png
        },
        embed: {
            active: true,
            title: '', // ie. Embed this map
            image: '', // ie. img/embed.png
            permalink: true,
            shorturl: false,
            iframe: true,
            widget: true,
            shortcode: false,
            svg: false
        },
        screenshot: {
            active: true,
            title: '', // ie. Take a screenshot
            image: '', // ie. img/screenshot.png
            filename: '' // ie. confiscatibene_map.png
        },
        detach: {
            active: true,
            title: '', // ie. Open in new window
            image: '', // ie. img/detach.png
        },
        shareButtons: {
            active: true,
            twitter: {
                active: true,
                via: '',
                lang: '',
                related: '',
                hashtags: '',
                count: '',
                text: '' // ie. Tweet
            },
            facebook: {
                active: true,
                appId: '',
                layout: '',
                action: '',
                'show-faces': '',
                share: ''
            },
            gplus: {
                active: true,
                size: '',
                annotation: ''
            }
        },
        geocoder: {
            active: true,
            layer: '',
            collapsed: true,
            title: '',
            email: '',
            autocomplete: {
                active: true,
                filename: '', // ie. geo/lista_comuni.json
                fileprefix: '' // ie. geo/lista_comuni-
            }
        }
    }
};
