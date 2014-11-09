var mapConfig = {

    debug: true,

    dataSources: {
        dkan: {
            uri: '',
            path: '/api/confiscatibene/action/datastore/search.json',
            //path: '', // ie. /api/confiscatibene/action/datastore/search.json
            resourceId: ''
        }
        // ...
    },

    dataTypes: {
        choropleth: {
            bins: 3 // ie. int > 0
        },
        points: {}
    },

    geoSources: {
        local: {
            active: true,
            path: ''
        },
        remote: {
            active: true,
            uri: '',
            path: ''
        }
    },

    geoTypes: {
        tile: {
            active: true,
            inSelectorControl: false,
            uri: '',
            path: '', // ie. /api/geoiq/{s}/{z}/{x}/{y}.png
            attribution: '',
            style: {
                opacity: 0.7 // ie. float [0,1]
            }
        },
        vector: {
            active: true,
            inSelectorControl: true,
            path: '',
            format: '',
            style: {
                default: {
		        	weight: 0.5,
			    	opacity: 1,
			        color: 'white',
    			    fillOpacity: 0.7,
        			fillColor: 'none'
                },
                highlight: { // Overrides default style attributes
                    weight: 2,
                    color: '#666' 
                }
            }
        }
        // ...
    },

    dataSets: [
        {
            source: 'dkan', // from dataSources attributes
            resourceId: 'e2f0c989-929f-4e4d-87e2-097140f8880f',
            type: 'choropleth', // from dataTypes attributes
            bins: 7,
            // ... // based on dataTypes and dataSources attributes for this type and source
            schema: {
                layer: 'regioni', // keyname of matched layer
                id: 'IdRegioneISTAT',
                label: '',
                value: 'Totale beni'
            }
        },
        {
            source: 'dkan', // from dataSources attributes
            resourceId: 'c18fa1ca-971f-4cfa-92e9-869785260dec',
            type: 'choropleth', // from dataTypes attributes
            bins: 7,
            // ... // based on dataTypes and dataSources attributes for this type and source
            schema: {
                layer: 'province', // keyname of matched layer
                id: 'IdProvinciaISTAT',
                label: '',
                value: 'Totale beni'
            }
        },
        {
            source: 'dkan', // from dataSources attributes
            resourceId: '69b2565e-0332-422f-ad57-b11491e33b08',
            type: 'choropleth', // from dataTypes attributes
            bins: 7,
            // ... // based on dataTypes and dataSources attributes for this type and source
            schema: {
                layer: 'comuni', // keyname of matched layer
                id: 'IdComuneISTAT',
                label: '',
                value: 'Totale beni'
            }
        }
        // ...
    ],

    pointsSet: {
        source: 'dkan',
        clusters: true,
        icon: 'js/leaflet/marker-icon.png',
        shadow: 'js/leaflet/marker-shadow.png'
    },

    geoLayers: [
        {
            source: 'remote',
            type: 'tile',
            path: '/api/geoiq/{s}/{z}/{x}/{y}.png' // ie. http://{s}.acetate.geoiq.com/tiles/acetate/{z}/{x}/{y}.png
        },
        {
            source: 'local',
            path: 'geo/',
            format: 'json',
            type: 'vector', // from geoTypes attributes
            // ... // based on geoTypes attributes for this type
            schema: {
                name: 'regioni', // keyname of layer
                id: 'COD_REG',
                label: 'NOME_REG'
            }
        },
        {
            source: 'local',
            path: 'geo/',
            format: 'json',
            type: 'vector', // from geoTypes attributes
            // ... // based on geoTypes attributes for this type
            schema: {
                name: 'province', // keyname of layer
                id: 'COD_PRO',
                label: 'NOME_PRO'
            }
        },
        {
            source: 'local',
            path: 'geo/',
            format: 'json',
            type: 'vector', // from geoTypes attributes
            // ... // based on geoTypes attributes for this type
            schema: {
                name: 'comuni', // keyname of layer
                id: 'COD_COM',
                label: 'NOME_COM'
            }
        }
        // ...
    ],

    map: {
        bounds: {
            init: {
                southWest: {
                    lat: 35.568,
                    lng: 1.537
                },
                northEast: {
                    lat: 47.843,
                    lng: 23.203
                },
            },
            max: {
                southWest: {
                    lat: 22.472,
                    lng: -16.523
                },
                northEast: {
                    lat: 62.083,
                    lng: 73.828
                },
            }
        },
        zoom: {
            max: 13,
            min: 5,
            scrollWheel: true
        },
        attribution: [ // a string item per line
            'Powered by <a href="http://www.dataninja.it/" target="_blank">Dataninja</a>',
            'tileset from <a href="http://www.geoiq.com/" target="_blank">GeoIQ</a>',
            'icons from <a href="http://www.flaticon.com/" target="_blank">Freepik</a> and <a href="http://www.simplesharebuttons.com/" target="_blank">Simple Share Buttons</a>',
            'geocoding by <a href="http://wiki.openstreetmap.org/wiki/Nominatim" target="_blank">OSM Nominatim</a>',
            'code on <a href="https://github.com/Dataninja/confiscatibene-choropleth" target="_blank">GitHub</a>.'
        ]
    },

    urlShortener: {
        active: true,
        uri: '', 
        path: '/api/dtnj/yourls-api.php', // ie. /api/dtnj/yourls-api.php
        signature: 'efe758b8d3',
        prefix: '' // ie. confiscatibene-
    },

    infowindow: {
        active: true
    }, // To do...

    label: {
        active: true
    }, // To do...

    legend: {
        active: true,
        title: 'Legenda',
        description: 'Numero totale di beni confiscati',
        itemLabel: 'beni confiscati'
    }, // To do...

    controls: {
        fullscreen: {
            active: true,
            title: 'Fullscreen mode', // ie. Fullscreen mode
        },
        logo: {
            active: true,
            title: '',
            image: 'img/logo.png', // ie. img/logo.png
            link: 'http://www.confiscatibene.it/' // ie. http://www.confiscatibene.it/
        },
        reset: {
            active: true,
            title: 'Reset',
            image: 'img/reset.png' // ie. img/reset.png
        },
        embed: {
            active: true,
            title: 'Embed this map', // ie. Embed this map
            image: 'img/embed.png', // ie. img/embed.png
            permalink: true,
            shorturl: false,
            iframe: true,
            widget: true,
            shortcode: false,
            svg: false
        },
        screenshot: {
            active: true,
            title: 'Take a screenshot', // ie. Take a screenshot
            image: 'img/screenshot.png', // ie. img/screenshot.png
            filename: 'confiscatibene_map.png', // ie. confiscatibene_map.png
            ignoreMouse: true,
            ignoreAnimation: true, 
            ignoreDimensions: true, 
            ignoreClear: true,
            offsetX: 'auto',
            offsetY: 'auto'
        },
        detach: {
            active: true,
            title: 'Open in new window', // ie. Open in new window
            image: 'img/detach.png', // ie. img/detach.png
        },
        shareButtons: {
            active: true,
            twitter: {
                active: true,
                via: 'confiscatibene',
                lang: 'it',
                related: 'jenkin27:Data scientist at Dataninja',
                hashtags: 'confiscatibene,dataninja',
                count: 'vertical',
                text: 'Tweet' // ie. Tweet
            },
            facebook: {
                active: true,
                appId: '470290923072583', // appID dei Dataninja
                layout: 'box_count',
                action: 'like',
                'show-faces': 'false',
                share: 'false'
            },
            gplus: {
                active: true,
                size: 'tall',
                annotation: 'bubble'
            }
        },
        geocoder: {
            active: true,
            layer: 'comuni',
            collapsed: true,
            title: 'Cerca il tuo comune',
            email: 'jenkin@dataninja.it',
            zoom: 10,
            autocomplete: {
                active: false,
                path: 'geo/',
                name: 'lista_comuni.json', // ie. geo/lista_comuni.json
                prefix: 'lista_comuni-', // ie. geo/lista_comuni-
                format: 'json'
            }
        }
    }
};
