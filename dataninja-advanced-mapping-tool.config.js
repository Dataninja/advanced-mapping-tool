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
                    palette: 'Reds',
		        	weight: 0.5,
			    	opacity: 1,
			        color: 'white',
    			    fillOpacity: 0.7,
        			fillColor: 'none'
                },
                highlight: { // Overrides default style attributes
                },
                selected: { // Overrides default style attributes
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
        active: true,
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
        prefix: 'confiscatibene-' // ie. confiscatibene-
    },

    infowindow: {
        active: true,
        text: {
            default: '<p>La mappa mostra il numero di beni confiscati per tutti i territori amministrativi italiani, secondo i dati ufficiali dell\'<a href="http://www.benisequestraticonfiscati.it" target="_blank">ANBSC</a> (sono esclusi i beni non confiscati in via autonoma). La corrispondenza tra il gradiente di colore e il numero complessivo di beni confiscati è dato nella legenda in basso a sinistra.</p>' + 
                '<p>Mediante il selettore in alto a sinistra si possono caricare e visualizzare ulteriori livelli (regioni, province, comuni).</p>' +
                '<p>Principali funzioni della mappa: <ul>' + 
                '<li>cerca i dati relativi al tuo territorio cliccando sulla lente e inserendo il nome di un comune;</li>' + 
                '<li>clicca sul territorio per visualizzare i dati in dettaglio, la composizione dei beni e per scaricarne la lista completa;</li>' + 
                '<li>includi la vista corrente della mappa sul tuo sito con il codice di embed o scaricane uno screenshot (pulsanti in alto a destra).</li>' +
                '</ul></p>' +
                '<p>Tieniti aggiornato sul progetto visitando il sito ufficiale di <a href="http://www.confiscatibene.it" target="_blank">Confiscati Bene</a> o seguendo l\'account Twitter <a href="https://twitter.com/confiscatibene" target="_blank">@confiscatibene</a>, puoi anche scriverci all\'indirizzo <a href="mailto:info@confiscatibene.it" target="_blank">info@confiscatibene.it</a>.</p>',
            mobile: '<a href="mailto:info@confiscatibene.it" target="_blank" style="margin-right: 30px;">Info</a>',
        },
        downloads: [
            {
                source: 'dkan',
                resourceId: 'e5b4d63a-e1e8-40a3-acec-1d351f03ee56',
                name: 'immobili',
                filebase: 'confiscatibene',
                title: 'Scarica l\'elenco degli immobili',
                image: 'img/house109-dnl.png'
            },
            {
                source: 'dkan',
                resourceId: '8b7e12f1-6484-47f0-9cf6-88b446297dbc',
                name: 'aziende',
                filebase: 'confiscatibene',
                title: 'Scarica l\'elenco delle aziende',
                image: 'img/factory6-dnl.png'
            }
        ],
        shareButtons: {
            active: true,
            title: 'Condividi la situazione',
            twitter: {
                active: true,
                via: 'confiscatibene',
                text: 'Immobili e aziende #confiscatibene' // ie. Tweet
            },
            facebook: {
                active: true
            },
            gplus: {
                active: true
            },
            linkedin: {
                active: true
            },
            email: {
                active: true,
                subject: 'Confiscati Bene',
                body: 'Gli immobili e le aziende #confiscatibene'
            },
            permalink: {
                active: true
            }
        }
    }, // To do...

    label: {
        active: true,
        text: 'Beni confiscati'
    },

    legend: {
        active: true,
        title: 'Legenda',
        description: 'Numero totale di beni confiscati',
        itemLabel: 'beni confiscati'
    },

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
            shorturl: true,
            iframe: true,
            widget: true,
            shortcode: true,
            svg: {
                active: true,
                filename: 'confiscatibene_map.svg',
                image: 'img/svg.png'
            }
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
        socialButtons: {
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
