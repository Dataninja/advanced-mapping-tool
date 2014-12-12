(function($) {

    console.log("mapConfig",mapConfig);

    if (!$) {
        throw 'ERRORE: configurazione errata o mancante...';
        return;
    }

    d3.geojson = d3.topojson = d3.json;

    head.ready(function() {

        // Global variables
        var $ = mapConfig, // Configuration object
            svgViewBox,
            h, i, j, k,
            selectedLayer;



        /*** Language formatter ***/
        if (_.has($,'language')) {

            var myFormat;
            switch($.language) {

                case 'it':
                    myFormat = d3.locale({
                        "decimal": ",",
                        "thousands": ".",
                        "grouping": [3],
                        "currency": ["€ ", ""],
                        "dateTime": "%a %b %e %X %Y",
                        "date": "%d/%m/%Y",
                        "time": "%H:%M:%S",
                        "periods": ["AM", "PM"],
                        "days": ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"],
                        "shortDays": ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
                        "months": ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
                        "shortMonths": ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"]
                    });
                    break;

                default:
                    myFormat = d3.locale();

            }

            d3.format = myFormat.numberFormat;
            d3.time.format = myFormat.timeFormat;
        }
        /*** ***/



        /*** Google Analytics ***/
        if (_.has($,'analytics') && $.analytics.active) {
          (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
          (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
          m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
          })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
          ga('create', $.analytics.ua || '', 'auto');
          ga('send', 'pageview');
        }
        /*** ***/



        /*** Configuration initialization ***/
        // Geolayers
        for (i=0; i<$.geoLayers.length; i++) {

            // Opzioni di default
            if (_.has($.geoTypes[$.geoLayers[i].type],'options')) {
                $.geoLayers[i].options = $.geoLayers[i].options || {};
                _.defaults($.geoLayers[i].options, $.geoTypes[$.geoLayers[i].type].options);
            }

            // Stili di default
            if (_.has($.geoTypes[$.geoLayers[i].type],'style')) {
                $.geoLayers[i].style = $.geoLayers[i].style || { default: {}, highlight: {}, selected: {} };
                _.defaults($.geoLayers[i].style.default, $.geoTypes[$.geoLayers[i].type].style.default);
                _.defaults($.geoLayers[i].style.highlight, $.geoTypes[$.geoLayers[i].type].style.highlight);
                _.defaults($.geoLayers[i].style.selected, $.geoTypes[$.geoLayers[i].type].style.selected);
            }

            // Parametri di default per il geoType
            _.defaults($.geoLayers[i], $.geoTypes[$.geoLayers[i].type]);
            // Parametri di default per il geoSource
            _.defaults($.geoLayers[i], $.geoSources[$.geoLayers[i].source]);

        }

        // Filtra via i geoLayer non attivi
        $.geoLayers = _.where($.geoLayers, {active: true});


        // Datasets
        for (i=0; i<$.dataSets.length; i++) {

            // Parametri di default per il dataType
            _.defaults($.dataSets[i], $.dataTypes[$.dataSets[i].type]);
            // Parametri di default per il dataSource
            _.defaults($.dataSets[i], $.dataSources[$.dataSets[i].source]);
            
        }

        // Ignore datasets linked to disabled geolayers
        $.dataSets = _.filter($.dataSets, function(el) { 
            return (_.has(el,'schema') && _.has(el.schema,'layer') && _.contains(_.map($.geoLayers, function(l) { 
                return (_.has(l,'schema') ? l.schema.name : undefined); 
            }), el.schema.layer)); 
        });

        // Downloads in infowindow
        if (_.has($,'infowindow') && $.infowindow.active && _.has($.infowindow,'downloads') && $.infowindow.downloads.active) {
            for (i=0; i<$.infowindow.downloads.files.length; i++) {
                if ($.infowindow.downloads.files[i].active) {
                    _.defaults($.infowindow.downloads.files[i], $.dataSources[$.infowindow.downloads.files[i].source]);
                }
            }
        }

        // PointsSet
        if (_.has($,'pointsSet') && $.pointsSet.active) {
            _.defaults($.pointsSet, $.dataSources[$.pointsSet.source]);
        }

        if ($.debug) console.log("$",$);
        /*** ***/



        /*** Url shortener initialization ***/
        var dtnj; // URL shortener via yourls-api lib
        if (_.has($,'urlShortener') && $.urlShortener.active) {
            dtnj = yourls.connect($.urlShortener.url.call($.urlShortener), { signature: $.urlShortener.signature });
        }

        if ($.debug) console.log("dtnj",dtnj);
        /*** ***/



        /*** Geo layers initialization ***/
        var defaultGeo = {}, geo = {}; // Geo layers enabled and used
        for (i=0; i<$.geoLayers.length; i++) {
            if ($.geoLayers[i].type === 'thematic') {
                defaultGeo[$.geoLayers[i].schema.name] = {
                    id: $.geoLayers[i].schema.id,
                    label: $.geoLayers[i].schema.label,
                    resource: [],
                    list: []
                };
            }
        }

        if ($.debug) console.log("defaultGeo",defaultGeo);



        /*** Data sets initialization ***/
        var defaultData = {}, data = {}; // Data sets enabled and used
        
        for (i=0; i<$.dataSets.length; i++) {
            
            var dataSet = $.dataSets[i];
            defaultData[dataSet.schema.name] = {
                name: dataSet.schema.name || _.uniqueId('dataset-'),
                layer: dataSet.schema.layer,
                id: (dataSet.source != 'shape' ? dataSet.schema.id || undefined : undefined),
                groups: {},
                columns: (_.has(dataSet.schema,'menu') && dataSet.schema.menu.length ? dataSet.schema.menu.map(function(el) { return el.column; }) : null),
                labels: (_.has(dataSet.schema,'menu') && dataSet.schema.menu.length ? dataSet.schema.menu.map(function(el) { return el.label || el.column; }) : null),
                descriptions: (_.has(dataSet.schema,'menu') && dataSet.schema.menu.length ? dataSet.schema.menu.map(function(el) { return el.description || dataSet.schema.description || (el.label ? el.label + '>' + el.column : el.column); }) : null),
                precisions: (_.has(dataSet.schema,'menu') && dataSet.schema.menu.length ? dataSet.schema.menu.map(function(el) { return _.isNumber(el.precision) ? el.precision : (dataSet.precision || 0); }) : null),
                resourceId: dataSet.resourceId, // HMMM
                palette: dataSet.palette || 'Reds',
                transform: dataSet.transform || function(k,v) { return v; },
                resource: [],
                binsNums: (_.has(dataSet.schema,'menu') && dataSet.schema.menu.length ? dataSet.schema.menu.map(function(el) { return el.bins || dataSet.bins; }) : null),
                bins: [],
                ranges: [],
                active: false
            };

            defaultData[dataSet.schema.name].menuLabel = dataSet.schema.label || defaultData[dataSet.schema.name].name;
            defaultData[dataSet.schema.name].column = defaultData[dataSet.schema.name].columns[0];
            defaultData[dataSet.schema.name].label = defaultData[dataSet.schema.name].labels[0];
            defaultData[dataSet.schema.name].description = defaultData[dataSet.schema.name].descriptions[0];
            defaultData[dataSet.schema.name].precision = defaultData[dataSet.schema.name].precisions[0];
            defaultData[dataSet.schema.name].binsNum = defaultData[dataSet.schema.name].binsNums[0];

            // Columns grouping
            if (_.has(dataSet.schema,'groups') && !_.isEmpty(dataSet.schema.groups)) {
                for (k in dataSet.schema.groups) {
                    if (_.has(dataSet.schema.groups,k) && !_.isEmpty(dataSet.schema.groups[k])) {
                        _.each(dataSet.schema.groups[k], function(el) {
                            defaultData[dataSet.schema.name].groups[el] = k;
                        });
                    }
                }
            }

            // Parsing function for dataset columns
            if (_.isString(dataSet.parse)) {
                var parseFn = window[dataSet.parse];
                defaultData[dataSet.schema.name].parse = function(k,v) { var val = parseFn(v); return _.isNumber(val) && !_.isNaN(val) ? val : v; };
            } else if (_.isFunction(dataSet.parse)) {
                defaultData[dataSet.schema.name].parse = dataSet.parse;
            } else {
                defaultData[dataSet.schema.name].parse = function(k,v) { var val = parseFloat(v); return _.isNumber(val) && !_.isNaN(val) ? val : v; };
            }
            
            // Formatter function for dataset columns
            if (_.isString(dataSet.formatter) && !_.isEmpty(dataSet.formatter)) {
                defaultData[dataSet.schema.name].formatter = function(k,v) { 
                    return d3.format(dataSet.formatter)(v); 
                };
            } else if (_.isFunction(dataSet.formatter)) {
                (function(i) {
                    var dataSet = $.dataSets[i];
                    defaultData[dataSet.schema.name].formatter = function(k,v) { 
                        var formatter = dataSet.formatter(k,v);
                        if (formatter) {
                            return d3.format(formatter)(v);
                        } else {
                            return (_.isNumber(v) ? (d3.format(",d")(v) || d3.format(",.2f")(v)) : v);
                        }
                    };
                })(i);
            } else {
                defaultData[dataSet.schema.name].formatter = function(k,v) { 
                    return (_.isNumber(v) ? (d3.format(",d")(v) || d3.format(",.2f")(v)) : v); 
                };
            }

        }

        if ($.debug) console.log("defaultData",defaultData);
        /*** ***/



        /*** URL GET parameters initialization ***/
        var parameters = Arg.query(); // Parsing URL GET parameters

        /* ie. http://viz.confiscatibene.it/anbsc/choropleth/?ls[0]=regioni&ls[1]=province&ls[2]=comuni&dl=regioni&t=1
            {
                ls: Array(), // Livelli caricati: regioni, province, comuni (default: tutti) -- LAYERS
                md: [string], // Layout di visualizzazione: full (default), embed, widget (auto se su mobile) -- MODE
                dl: [string], // Livello mostrato al caricamento -- DEFAULT LAYER
                ml: [string], // Livello caricato più alto: regioni, province, comuni -- MAX LAYER
                tl: [string], // Livello a cui si riferisce t -- TERRITORY LAYER
                t: [int], // Codice istat del territorio centrato e con infowindow aperta (si riferisce a tl) -- TERRITORY
                i: [int] // Codice istat del territotio con infowindow aperta -- INFO,
                summary: [bool] // Se attiva, permette di nascondere la barra laterale
            }
        */
        
        parameters.ls = parameters.ls || d3.keys(defaultGeo); // Livelli caricati (default: tutti)
        parameters.ml = parameters.ls[0]; // Livello caricato più alto (PRIVATO)
        parameters.dl = parameters.dl || parameters.ml; // Livello visibile al caricamento
        parameters.md = parameters.md || (L.Browser.mobile && head.screen.innerWidth < 800 ? 'widget' : ''); // Layout
        d3.select('body').classed(parameters.md,true); // Tengo traccia del layout come classe del body

        if (parameters.t) { // Focus su un region (codice istat che si riferisce a tl)
            parameters.tl = parameters.tl || parameters.ml; // Livello a cui si riferisce t
            parameters.ml = parameters.ls[_.indexOf(parameters.ls,parameters.tl)+1]; // Si riferisce ora al livello più alto caricato
            if (_.indexOf(parameters.ls,parameters.dl) < _.indexOf(parameters.ls,parameters.tl)+1) {
                parameters.dl = parameters.ml;
            }
        }
        
        if (_.has($,'pointsSet') && $.pointsSet.active && parameters.mr && _.has(parameters.mr,'rid')) {
            $.pointsSet.resourceId = parameters.mr.rid;
            parameters.mr.lat = parameters.mr.lat || 'lat';
            parameters.mr.lng = parameters.mr.lng || 'lng';
        }

        if (_.has($,'summary') && !_.isUndefined(parameters.summary)) {
            $.summary.closed = !parameters.summary;
        }
                
        if ($.debug) console.log("parameters",parameters);

        // Livelli disponibili da parametri dell'URL
        for (i=_.indexOf(parameters.ls,parameters.ml); i<parameters.ls.length; i++) {
            if (_.has(defaultGeo,parameters.ls[i])) {
                var defaultJoinData = [];
                for (k in defaultData) {
                    if (_.has(defaultData,k) && defaultData[k].layer === parameters.ls[i]) {
                        defaultJoinData.push(defaultData[k]);
                    }
                }
                if (defaultJoinData.length) {
                    geo[parameters.ls[i]] = defaultGeo[parameters.ls[i]];
                    data[parameters.ls[i]] = _.each(defaultJoinData, function(el,index) { el.index = index; });
                }
            }
        }
                
        if ($.debug) console.log("geo",geo);
        if ($.debug) console.log("data",data);
        /*** ***/



        /*** Inizializzazione della mappa ***/
	    var map,
            southWest,
            northEast,
            mapBounds,
        	southWestB,
            northEastB,
            maxMapBounds;

        if (_.has($.map,'bounds')) {
            if (_.has($.map.bounds,'init')) {
        	    southWest = L.latLng($.map.bounds.init.southWest);
                northEast = L.latLng($.map.bounds.init.northEast);
                mapBounds = L.latLngBounds(southWest, northEast);
            }

            if (_.has($.map.bounds,'max')) {
            	southWestB = L.latLng($.map.bounds.max.southWest);
                northEastB = L.latLng($.map.bounds.max.northEast);
                maxMapBounds = L.latLngBounds(southWestB, northEastB);
            }
        }

        map = L.map('map', { 
            maxZoom: $.map.zoom.max || null, 
            minZoom: $.map.zoom.min || null, 
            zoom: (parameters.md != 'widget' ? $.map.zoom.init : $.map.zoom.init-1) || null,
            center: ($.map.center || (mapBounds ? mapBounds.getCenter() : null)),
            scrollWheelZoom: (_.has($.map.zoom,'scrollWheel') ? $.map.zoom.scrollWheel : true),
            attributionControl: !$.map.attribution.length,
            maxBounds: maxMapBounds || null
        });

        if (!$.map.zoom.init && mapBounds) map.fitBounds(mapBounds);

        if ($.debug) console.log("map",map);

        // Tile layers
        var tileLayers = $.geoLayers.filter(function(l) { return l.type === 'tile'; });

        if ($.debug) console.log("tileLayers",tileLayers);

        for (i=0; i<tileLayers.length; i++) {
            L.tileLayer(tileLayers[i].url.call(tileLayers[i]), tileLayers[i].options).addTo(map);
        }
        
        // Attribution notices
        var attrib = L.control.attribution();
        for (i=0; i<$.map.attribution.length; i++) {
            attrib.addAttribution($.map.attribution[i]);
        }
        
        if ($.debug) console.log("attrib",attrib);

        attrib.addTo(map);        
        /*** ***/



        /*** Gestione dell'infowindow al click ***/
        var info;
        if (_.has($,'infowindow') && $.infowindow.active) {
            if (parameters.md === 'widget') {
                info = {
                    _div: d3.select('body').append('div').attr("class", "info bottom").node(),
                    addTo: function(map) { this.onAdd(map); return this; }
                };
            } else if (_.has($.infowindow,'position') && $.infowindow.position != 'inside') {
                info = {};
                d3.select('body').classed('summary '+$.infowindow.position, true);
                if ($.infowindow.position === 'top' || $.infowindow.position === 'left') {
                     info._div = d3.select('body').insert('div','#map').attr("class", "info external "+$.infowindow.position).node();
                } else if ($.infowindow.position === 'right' || $.infowindow.position === 'bottom') {
                    info._div = d3.select('body').append('div').attr("class", "info external "+$.infowindow.position).node();
                }
                info.addTo = function(map) {
                    this.onAdd(map);
                    return this;
                };
            } else {
                info = L.control({position: 'bottomright'});
            }
                
            info.onAdd = function (map) {
                this._div = this._div || L.DomUtil.create('div', 'info '+parameters.md);
                d3.select(this._div)
                    .attr('id','infowindow')
                    .style('max-height', (parameters.md != 'widget' ? (head.screen.innerHeight-100)+'px' : null))
                    .classed('empty', function() {
                        return parameters.md === 'widget' ? !(_.has($.infowindow.content,'mobile') && $.infowindow.content.mobile) : !(_.has($.infowindow.content,'default') && $.infowindow.content.default);
                    })
                    .on("mouseenter", function() {
                        map.scrollWheelZoom.disable();
                        map.doubleClickZoom.disable();
                    })
                    .on("mouseleave", function() {
                        if (_.has($.map.zoom,'scrollWheel') && $.map.zoom.scrollWheel) map.scrollWheelZoom.enable();
                        map.doubleClickZoom.enable();
                    });
        	    this.update();
                return this._div;
            };
        
            info.update = function (props) {
                var that = this;
                this._div.innerHTML = '';
                if (props) {
                    d3.select(this._div)
                        .classed("closed", false)
                        .classed("empty", false);
                    if (parameters.md === 'widget') map.dragging.disable();
                    var delim = agnes.rowDelimiter(),
                        today = new Date(),
                        stoday = d3.time.format('%Y%m%d')(today),
                        region = props._layer,
                        dataSet = data[region].filter(function(el) { return el.active; })[0],
                        filterKey = dataSet.id,
                        filterValue = props[geo[region].id],
                        buttons = [], btnTitle, btnUrl, btnPlace,
                        dnlBtn = [],
                        globalImagePath = (_.isString($.infowindow.path) ? $.infowindow.path : 'icons/');
                    
                    if (_.has($.infowindow,'shareButtons') && $.infowindow.shareButtons.active) {

                        var shareImagePath = (_.isString($.infowindow.shareButtons.path) ? $.infowindow.shareButtons.path : globalImagePath);
                        
                        btnTitle = $.infowindow.shareButtons.title + (region == 'regioni' ? ' in ' : ' a ') + props[geo[region].label];
                        btnUrl = 'http://' + location.hostname + Arg.url(parameters).replace(/&*md=[^&]*/,'').replace(/&{2,}/g,"&");
                        btnEncUrl = 'http://' + location.hostname + encodeURIComponent(Arg.url(parameters).replace(/&*md=[^&]*/,'').replace(/&{2,}/g,"&"));
                        btnPlace = props[geo[region].label];

                        if ($.infowindow.shareButtons.url) {
                            btnUrl = btnEncUrl = $.infowindow.shareButtons.url;
                        }
                    
                        if (_.has($.infowindow.shareButtons,'twitter') && $.infowindow.shareButtons.twitter.active) {
                            buttons.push('<a class="ssb" href="http://twitter.com/share?url=' + btnEncUrl + 
                                '&via=' + $.infowindow.shareButtons.twitter.via + 
                                '&text=' + 
                                encodeURIComponent((_.isFunction($.infowindow.shareButtons.twitter.text) ? $.infowindow.shareButtons.twitter.text(props._data[dataSet.name]) : btnPlace + ' - ' + $.infowindow.shareButtons.twitter.text)) + 
                                '" target="_blank" title="'+btnTitle+' su Twitter"><img src="'+shareImagePath+($.infowindow.shareButtons.twitter.image || 'twitter.png')+'" id="ssb-twitter"></a>'
                            );
                        }

                        if (_.has($.infowindow.shareButtons,'facebook') && $.infowindow.shareButtons.facebook.active) {
                            buttons.push('<a class="ssb" href="http://www.facebook.com/sharer.php?u=' + btnEncUrl + 
                                '" target="_blank" title="'+btnTitle+' su Facebook"><img src="'+shareImagePath+($.infowindow.shareButtons.facebook.image || 'facebook.png')+'" id="ssb-facebook"></a>'
                            );
                        }

                        if (_.has($.infowindow.shareButtons,'gplus') && $.infowindow.shareButtons.gplus.active) {
                            buttons.push('<a class="ssb" href="https://plus.google.com/share?url=' + btnEncUrl + 
                                '" target="_blank" title="'+btnTitle+' su Google Plus"><img src="'+shareImagePath+($.infowindow.shareButtons.gplus.image || 'gplus.png')+'" id="ssb-gplus"></a>'
                            );
                        }

                        if (_.has($.infowindow.shareButtons,'linkedin') && $.infowindow.shareButtons.linkedin.active) {
                            buttons.push('<a class="ssb" href="http://www.linkedin.com/shareArticle?mini=true&url=' + btnEncUrl + 
                                '" target="_blank" title="'+btnTitle+' su LinkedIn"><img src="'+shareImagePath+($.infowindow.shareButtons.linkedin.image || 'linkedin.png')+'" id="ssb-linkedin"></a>'
                            );
                        }

                        if (_.has($.infowindow.shareButtons,'email') && $.infowindow.shareButtons.email.active) {
                            buttons.push('<a class="ssb" href="mailto:?Subject=' + encodeURIComponent((_.isFunction($.infowindow.shareButtons.email.subject) ? $.infowindow.shareButtons.email.subject(props._data[dataSet.name]) : $.infowindow.shareButtons.email.subject + ' | ' + btnPlace)) + 
                                '&Body=' + encodeURIComponent((_.isFunction($.infowindow.shareButtons.email.body) ? $.infowindow.shareButtons.email.body(props._data[dataSet.name],btnEncUrl) : btnPlace + ' - ' + $.infowindow.shareButtons.email.body + ': ' + btnUrl)) + 
                                '" target="_blank" title="'+btnTitle+' per email"><img src="'+shareImagePath+($.infowindow.shareButtons.email.image || 'email.png')+'" id="ssb-email"></a>'
                            );
                        }

                        if (_.has($.infowindow.shareButtons,'permalink') && $.infowindow.shareButtons.permalink.active) {
                            buttons.push('<a class="ssb" href="' + btnUrl + 
                                '" target="_blank" title="Permalink"><img src="'+shareImagePath+($.infowindow.shareButtons.permalink.image || 'link.png')+'" id="ssb-link"></a>'
                            );
                        }
                    }

                    if ($.debug) console.log("shareButtons",buttons);

                    if (_.has($.infowindow,'downloads') && $.infowindow.downloads.active) {
                        var dwnlImagePath = (_.isString($.infowindow.downloads.path) ? $.infowindow.downloads.path : globalImagePath);
                        for (i=0; i<$.infowindow.downloads.files.length; i++) {
                            if ($.infowindow.downloads.files[i].active) {
                                if (!$.infowindow.downloads.files[i].datasets || !$.infowindow.downloads.files[i].datasets.length || _.contains($.infowindow.downloads.files[i].datasets,dataSet.name)) {
                                    dnlBtn.push('<a id="a-' + 
                                        $.infowindow.downloads.files[i].name + 
                                        '" class="dnl" href="'+($.infowindow.downloads.files[i].filename ? $.infowindow.downloads.files[i].url() : '#')+'" title="' + 
                                        $.infowindow.downloads.files[i].title + 
                                        '"><img src="' + 
                                        dwnlImagePath + ($.infowindow.downloads.files[i].image || $.infowindow.downloads.image || 'download.png') + 
                                        '" /></a>'
                                    );
                                }
                            }
                        }
                    }
                    
                    if ($.debug) console.log("downloadButtons",dnlBtn);

                    var thead = '<thead>' + 
                        '<tr>' + 
                        '<th colspan="2">' + 
                        (dnlBtn.length ? '<span id="sdnlBtn">'+dnlBtn.join("&nbsp;")+'</span>' + '&nbsp;&nbsp;' : '') + 
                        (buttons.length ? '<span id="sshrBtn">'+buttons.join("&nbsp;")+'</span>' : '') + 
                        '<a id="close-cross" href="#" title="Chiudi"><img src="'+globalImagePath+($.infowindow.image || 'close.png')+'" /></a>' + 
                        '</th>' + 
                        '</tr>' + 
                        (geo[region].label ? '<tr>' + 
                        '<th colspan="2" class="rossobc">' + props[geo[region].label] + '</th>' +
                        '</tr>' : '') + 
                        '</thead>';

                    //if ($.debug) console.log("Table header",thead);

                    var tfoot;
                    if (_.has($.infowindow,'downloads') && $.infowindow.downloads.active) {
                        tfoot = '<tfoot>' + 
                            '<tr><td colspan="2" style="text-align:right;font-size: smaller;">' + 
                            ($.infowindow.downloads.license || '') + 
                            '</td></tr>' + 
                            '</tfoot>';
                    } else {
                        tfoot = '<tfoot></tfoot>';
                    }
                    
                    //if ($.debug) console.log("Table footer",tfoot);

                    var tbody;
                    if (_.has($.infowindow,'view') && $.infowindow.view.active && _.has($.viewTypes,$.infowindow.view.type)) {
                        tbody = $.viewTypes[$.infowindow.view.type](props._data[dataSet.name], $.infowindow.view.options, dataSet.formatter, dataSet.groups);
                        if (!(tbody.search('<tbody>') > -1)) {
                            tbody = '<tbody>' + tbody + '</tbody>';
                        }
                    } else {
                        tbody = '<tbody></tbody>';
                    }
                    
                    //if ($.debug) console.log("Table body",tbody);

                    this._div.innerHTML += '<table class="zebra">' + thead + tbody + tfoot + '</table>';

                    //if ($.debug) console.log("Table", this._div.innerHTML);

                    d3.selectAll("tr.first-level.group")
                        .on("click", function(d,i) {
                            d3.select(this)
                                .classed("open", !d3.select(this).classed("open"));
                            d3.selectAll("tr.second-level.g"+(i+1)).classed("hidden", function() { return !d3.select(this).classed("hidden"); });
                        });

                    if (_.has($.infowindow,'shareButtons') && $.infowindow.shareButtons.active && _.has($,'urlShortener') && $.urlShortener.active) {
                        dtnj.shorten(btnEncUrl, $.urlShortener.prefix+md5(btnUrl), function(data) {
                            var btnEncUrl = data.shorturl,
                                buttons = [];

                            if (_.has($.infowindow.shareButtons,'twitter') && $.infowindow.shareButtons.twitter.active) {
                                buttons.push('<a class="ssb" href="http://twitter.com/share?url=' + btnEncUrl + 
                                    '&via=' + $.infowindow.shareButtons.twitter.via + 
                                    '&text=' + encodeURIComponent(btnPlace + ' - ' + $.infowindow.shareButtons.twitter.text + ' ') + 
                                    '" target="_blank" title="'+btnTitle+' su Twitter"><img src="'+imagePath+($.infowindow.shareButtons.twitter.image || 'twitter.png')+'" id="ssb-twitter"></a>'
                                );
                            }

                            if (_.has($.infowindow.shareButtons,'facebook') && $.infowindow.shareButtons.facebook.active) {
                                buttons.push('<a class="ssb" href="http://www.facebook.com/sharer.php?u=' + btnEncUrl + 
                                    '" target="_blank" title="'+btnTitle+' su Facebook"><img src="'+imagePath+($.infowindow.shareButtons.facebook.image || 'facebook.png')+'" id="ssb-facebook"></a>'
                                );
                            }

                            if (_.has($.infowindow.shareButtons,'gplus') && $.infowindow.shareButtons.gplus.active) {
                                buttons.push('<a class="ssb" href="https://plus.google.com/share?url=' + btnEncUrl + 
                                    '" target="_blank" title="'+btnTitle+' su Google Plus"><img src="'+imagePath+($.infowindow.shareButtons.gplus.image || 'gplus.png')+'" id="ssb-gplus"></a>'
                                );
                            }

                            if (_.has($.infowindow.shareButtons,'linkedin') && $.infowindow.shareButtons.linkedin.active) {
                                buttons.push('<a class="ssb" href="http://www.linkedin.com/shareArticle?mini=true&url=' + btnEncUrl + 
                                    '" target="_blank" title="'+btnTitle+' su LinkedIn"><img src="'+imagePath+($.infowindow.shareButtons.linkedin.image || 'linkedin.png')+'" id="ssb-linkedin"></a>'
                                );
                            }
    
                            if (_.has($.infowindow.shareButtons,'email') && $.infowindow.shareButtons.email.active) {
                                buttons.push('<a class="ssb" href="mailto:?Subject=' + encodeURIComponent($.infowindow.shareButtons.email.subject + ' | ' + btnPlace) + 
                                    '&Body=' + encodeURIComponent(btnPlace + ' - ' + $.infowindow.shareButtons.email.body + ': ') + btnEncUrl + 
                                    '" target="_blank" title="'+btnTitle+' per email"><img src="'+imagePath+($.infowindow.shareButtons.email.image || 'email.png')+'" id="ssb-email"></a>'
                                );
                            }

                            if (_.has($.infowindow.shareButtons,'permalink') && $.infowindow.shareButtons.permalink.active) {
                                buttons.push('<a class="ssb" href="' + btnUrl + 
                                    '" target="_blank" title="Permalink"><img src="'+imagePath+($.infowindow.shareButtons.permalink.image || 'link.png')+'" id="ssb-link"></a>'
                                );
                            }
                            
                            d3.select("#sshrBtn").node().innerHTML = buttons.join("&nbsp;"); 

                        });
                    }
            
                    if (_.has($.infowindow,'downloads') && $.infowindow.downloads.active) {
                        for (i=0; i<$.infowindow.downloads.files.length; i++) {
                            if ($.infowindow.downloads.files[i].active && !$.infowindow.downloads.files[i].filename) {
                                (function(i) {
                                    var dnlPath = $.infowindow.downloads.files[i].url.call($.infowindow.downloads.files[i], region, filterKey, filterValue);

                                    var dnlFile = stoday + 
                                        '_' + $.infowindow.downloads.files[i].filebase + 
                                        '-' + $.infowindow.downloads.files[i].name + 
                                        (filterKey && filterValue ? '_' + filterKey + '-' + filterValue : '') + 
                                        '.csv';

                                    d3.select('a#a-'+$.infowindow.downloads.files[i].name).on("click", function() {
                                        if ($.debug) console.log(this, i, $.infowindow.downloads.files[i].name, dnlPath, dnlFile);
                                        d3[$.infowindow.downloads.files[i].format](dnlPath, function(err,res) {
                                            var dataset = $.infowindow.downloads.files[i].transform.call($.infowindow.downloads.files[i],res);
                                            if (dataset.length > 0) {
                                                var csv = agnes.jsonToCsv(dataset, delim),
                                                    blob = new Blob([csv], {type: "text/csv;charset=utf-8"});
                                                saveAs(blob, dnlFile);
                                            } else {
                                                alert("No data!");
                                            }
                                        });
                                    });
                                })(i);
                            }
                        }
                    }
    
                    d3.select(this._div).select("a#close-cross")
                        .on("click", function() {
                            if ($.debug) console.log("clickCloseCross",arguments);;
                            info.update();
                            return false;
                        });

                } else { // if (props) 
                        
                    d3.select(this._div)
                        .classed("closed", true)
                        .classed('empty', function() {
                            return parameters.md === 'widget' ? !(_.has($.infowindow.content,'mobile') && $.infowindow.content.mobile) : !(_.has($.infowindow.content,'default') && $.infowindow.content.default);
                        });
                    if (selectedLayer) {
                        selectedLayer.feature._selected = false;
                        delete selectedLayer.feature._position;
                        geojson.resetStyle(selectedLayer);
                        selectedLayer = undefined;
                    }
                    delete parameters.i;
                    if (embedControl && embedControl.isAdded) embedControl.removeFrom(map);
                    if (_.has($.map.zoom,'scrollWheel') && $.map.zoom.scrollWheel) map.scrollWheelZoom.enable();
                    if (parameters.md === 'widget') {
                        map.dragging.enable();
                        this._div.innerHTML += $.infowindow.content.mobile;
                    } else {
                        this._div.innerHTML += $.infowindow.content.default;
                    }
                }
    	    };
                
            info.addTo(map);
        }
        
        if ($.debug) console.log("info",info);

        /*** ***/

        
        
        /*** Funzione di ricerca del luogo ***/
        var osmGeocoder;
        if (_.has($.controls,'geocoder') && $.controls.geocoder.active) {
            if (parameters.md != 'widget') {
                osmGeocoder = new L.Control.OSMGeocoder(
                    { 
                        collapsed: $.controls.geocoder.collapsed, 
                        position: 'topright',
                        text: $.controls.geocoder.title,
                        bounds: mapBounds,
                        email: $.controls.geocoder.email,
                        type: 'city',
                        callback: function (results) {
                            if ($.debug) console.log("osmGeocoderResults",results);
                            if (results.length) {
                                var bbox = results[0].boundingbox,
                                    first = new L.LatLng(bbox[0], bbox[2]),
                                    second = new L.LatLng(bbox[1], bbox[3]),
                                    bounds = new L.LatLngBounds([first, second]);
                                if (_.has($.controls.geocoder,'layer') && $.controls.geocoder.layer) { 
        		    	            info.update();
                                    var e = document.createEvent('UIEvents');
                                    e.initUIEvent('click', true, true, window, 1);
                                    d3.select("#geomenu-ui #"+$.controls.geocoder.layer).node().dispatchEvent(e);
                                }
                                this._map.fitBounds(bounds, { maxZoom: $.controls.geocoder.zoom || null });
                            }
                        }
                    }
                );
                    
                map.addControl(osmGeocoder);

                if (_.has($.controls.geocoder,'autocomplete') && $.controls.geocoder.autocomplete.active) {
                    osmGeocoder._completely = completely(osmGeocoder._input);
                    
                    osmGeocoder._completely.onChange = function (text) {
                        osmGeocoder._completely.startFrom = text.lastIndexOf(' ')+1;
                        osmGeocoder._completely.repaint();
                    };

                    osmGeocoder._completely.input.maxLength = 50; // limit the max number of characters in the input text
                    
                    var acFile = $.controls.geocoder.autocomplete.url.call($.controls.geocoder.autocomplete, parameters.t || undefined);
                    d3[$.controls.geocoder.autocomplete.format](acFile, function(err,res) {
                        defaultGeo[$.controls.geocoder.layer].list = $.controls.geocoder.autocomplete.transform.call($.controls.geocoder.autocomplete,res);
                        osmGeocoder._completely.options = defaultGeo[$.controls.geocoder.layer]
                            .list.map(function(el) { 
                                return el[geo[$.controls.geocoder.layer].label]; 
                            });
                    });
                }
            }
        }
        
        if ($.debug) console.log("osmGeocoder",osmGeocoder);
        /*** ***/



        /*** Fullscreen ***/
        var fullscreen;
        if (_.has($.controls,'fullscreen') && $.controls.fullscreen.active) {
            if (parameters.md != 'widget' && parameters.md != 'embed') {
                fullscreen = L.control.fullscreen({title: $.controls.fullscreen.title}).addTo(map);
            }
        }
        
        if ($.debug) console.log("fullscreen",fullscreen);

        /*** ***/



        /*** Logo ***/
        var logo;
        if (_.has($.controls,'logo') && $.controls.logo.active) {
            if (parameters.md === 'widget') {
                logo = d3.select('body').insert('div','#map').attr('id','logo-widget')
                    .append('a').classed('logo '+parameters.md, true)
                    .attr('href', $.controls.logo.link || '#')
                    .attr('target','_blank')
                    .append('img')
                    .attr('id','logo')
                    .attr('src', $.controls.logo.image);
            } else {
                logo = L.control({position: 'topleft'});
                logo.onAdd = function(map) {
                    var a = L.DomUtil.create('a','logo '+parameters.md),
                        img = L.DomUtil.create('img','logo' + ($.controls.logo.border ? ' border' : ''),a);
                    a.setAttribute('href', $.controls.logo.link || '#');
                    a.setAttribute('target','_blank');
                    img.setAttribute('id','logo');
                    img.setAttribute('src', $.controls.logo.image);
                    return a;
                };
                logo.addTo(map);
            }
        }
        
        if ($.debug) console.log("logo",logo);

        /*** ***/

        /*** Pulsante di reset ***/
        var reset;
        if (_.has($.controls,'reset') && $.controls.reset.active) {
            reset = L.control({position: (parameters.md === 'widget' ? 'bottomleft' : 'topright')});
            reset.onAdd = function(map) {
                var img = L.DomUtil.create('img', 'reset '+parameters.md);
                img.setAttribute('src', $.controls.reset.image);
                img.setAttribute('title', $.controls.reset.title);
                d3.select(img).on('click', function() {
                    info.update();
                    if (!$.map.zoom.init && mapBounds) {
                        map.fitBounds(mapBounds);
                    } else {
                        map.setView(($.map.center || (mapBounds ? mapBounds.getCenter() : null)), (parameters.md != 'widget' ? $.map.zoom.init : $.map.zoom.init-1));
                    }
                    if (d3.select("#geomenu-ui #"+parameters.ml).classed("active")) {
                        geoMenu.onChange(parameters.ml);
                    } else {
                        var e = document.createEvent('UIEvents');
                        e.initUIEvent('click', true, true, window, 1);
                        d3.select("#geomenu-ui #"+parameters.ml).node().dispatchEvent(e);
                    }
                    if (_.has($.controls,'geocoder') && $.controls.geocoder.active) {
                        d3.select(".leaflet-control-geocoder input").node().value = '';
                    }
                });
                return img;
            };
            
            reset.addTo(map);
        }
        
        if ($.debug) console.log("reset",reset);

        /*** ***/

        /*** Pulsante di embed ***/
        var embed, embedControl;
        if (_.has($.controls,'embed') && $.controls.embed.active) {
            embedControl = L.control({position: (parameters.md === 'widget' ? 'bottomleft' : 'topright')});
            embedControl.isAdded = false;
            embedControl.onRemove = function(map) { this.isAdded = false; }
            embedControl.onAdd = function(map) {
                this.isAdded = true;
                var textinput = {},
                    p = {},
                    label = {};

                var inputarea = L.DomUtil.create('div', 'info embed-inputarea'),
                    url = 'http://' + location.hostname + Arg.url(parameters).replace(/&*md=[^&]*/,'').replace(/&{2,}/g,"&"),
                    encUrl = 'http://' + location.hostname + encodeURIComponent(Arg.url(parameters).replace(/&*md=[^&]*/,'').replace(/&{2,}/g,"&"));

                if ($.controls.embed.permalink) {
                    p['permalink'] = L.DomUtil.create('p', 'permalink', inputarea);
                    p['permalink'].innerHTML = '' + 
                        '<label for="embed-permalink" title="Clicca per selezionare">Permalink:</label>&nbsp;' + 
                        '<input type="text" id="embed-permalink" value="' + url + '" readonly></input>';
                }

                if (_.has($,'urlShortener') && $.urlShortener.active && $.controls.embed.shorturl) {
                    p['shorturl'] = L.DomUtil.create('p', 'shorturl', inputarea);
                    p['shorturl'].innerHTML = '' + 
                        '<label for="embed-shorturl" title="Clicca per selezionare">Short URL:</label>&nbsp;' + 
                        '<input type="text" id="embed-shorturl" value="Not available..." disabled readonly></input>';
                    dtnj.shorten(encUrl, $.urlShortener.prefix+md5(url), function(data) {
                        d3.select("input#embed-shorturl").attr("value",data.shorturl).attr("disabled",null);
                    });
                }

                if ($.controls.embed.iframe) {
                    p['iframe'] = L.DomUtil.create('p', 'iframe', inputarea);
                    p['iframe'].innerHTML = '' + 
                        '<label for="embed-iframe" title="Clicca per selezionare">Embed in post/page:</label>&nbsp;' + 
                        '<input type="text" id="embed-iframe" value="' + 
                        '<iframe src=&quot;' + url + '&md=embed' + '&quot; frameborder=&quot;0&quot; allowtransparency=&quot;true&quot; ' +
                        'allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen ' +
                        'width=&quot;100%&quot; height=&quot;700&quot;></iframe>' + 
                        '" readonly></input>';
                }

                if ($.controls.embed.widget) {
                    p['widget'] = L.DomUtil.create('p', 'widget', inputarea);
                    p['widget'].innerHTML = '' + 
                        '<label for="embed-widget" title="Clicca per selezionare">Embed in sidebar:</label>&nbsp;' + 
                        '<input type="text" id="embed-widget" value="' + 
                        '<iframe src=&quot;' + url + '&md=widget' + '&quot; frameborder=&quot;0&quot; allowtransparency=&quot;true&quot; ' +
                        'allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen ' +
                        'width=&quot;100%&quot; height=&quot;755&quot;></iframe>' + 
                        '" readonly></input>';
                }

                if ($.controls.embed.shortcode) {
                    p['shortcode'] = L.DomUtil.create('p', 'shortcode', inputarea);
                    p['shortcode'].innerHTML = '' + 
                        '<label for="embed-shortcode" title="Clicca per selezionare">WP Shortcode (<a href="https://github.com/Dataninja/wp-cbmap-shortcode" target="_blank">?</a>):</label>&nbsp;' +
                        '<input type="text" id="embed-shortcode" value="' +
                        '[cbmap ' + decodeURIComponent(url).replace(/^[^?]+\?/,"").replace(/&/g," ") + ' md=embed]' + 
                        '" readonly></input>';
                }

                if (_.has($.controls.embed,'svg') && $.controls.embed.svg.active) {
                    p['svg'] = L.DomUtil.create('p', 'svg', inputarea);
                    p['svg'].innerHTML = '' + 
                        '<label for="embed-svg" title="Copia/incolla il codice o scaricalo cliccando sull\'immagine">Scalable Vector Graphics:</label>&nbsp;' +
                        '<textarea id="embed-svg" readonly>' +
                        d3.select(".leaflet-overlay-pane")[0][0].innerHTML.replace(/\>/g,">\n") + 
                        '</textarea>&nbsp;' + 
                        '<img src="' + $.controls.embed.svg.image + '" title="Scarica l\'immagine in SVG">';
                    d3.select(p['svg']).select("img").on("click", function() {
                        var blob = new Blob([d3.select(".leaflet-overlay-pane")[0][0].innerHTML.replace(/\>/g,">\n")], {type: "image/svg+xml;charset=utf-8"});
                        saveAs(blob, $.controls.embed.svg.filename);
                    });
                }

                for (var k in p) {
                    if (_.has(p,k)) {
                        d3.select(p[k]).select('input').on('focus', function() { this.select(); });
                    }
                }
                    
                return inputarea;
            };

            embed = L.control({position: (parameters.md === 'widget' ? 'bottomleft' : 'topright')});
            
            embed.onAdd = function(map) {
                var img = L.DomUtil.create('img', 'embed '+parameters.md);
                img.setAttribute('src', $.controls.embed.image);
                img.setAttribute('title', $.controls.embed.title);
                d3.select(img).on('click', function() {
                    if (!embedControl.isAdded) {
                        embedControl.addTo(map);
                    } else {
                        if (embedControl && embedControl.isAdded) embedControl.removeFrom(map);
                    }
                });
                return img;
            };

            embed.addTo(map);
        }
            
        if ($.debug) console.log("embed",embed);

        /*** ***/

        /*** Screenshot map ***/
        var screenshot;
        if (_.has($.controls,'screenshot') && $.controls.screenshot.active) {
            if (parameters.md != 'widget') {
                screenshot = L.control({position: (parameters.md === 'widget' ? 'bottomleft' : 'topright')});
                screenshot.onAdd = function(map) {
                    var img = L.DomUtil.create('img','screenshot '+parameters.md);
                    img.setAttribute('id','screenshot');
                    img.setAttribute('src', $.controls.screenshot.image);
                    img.setAttribute('title', $.controls.screenshot.title);
                    d3.select(img).on('click', function () {
                        html2canvas(document.body, {
                            onrendered: function(canvas) {
                                var svg = d3.select(".leaflet-overlay-pane svg"),
                                    offsetX = $.controls.screenshot.offsetX || 'auto',
                                    offsetY = $.controls.screenshot.offsetY || 'auto';
                                canvg(canvas, svg.node().outerHTML, {
                                    ignoreMouse: $.controls.screenshot.ignoreMouse || true, 
                                    ignoreAnimation: $.controls.screenshot.ignoreAnimation || true, 
                                    ignoreDimensions: $.controls.screenshot.ignoreDimensions || true, 
                                    ignoreClear: $.controls.screenshot.ignoreClear || true, 
                                    offsetX: (_.isNumber(offsetX) ? offsetX : svgViewBox[0]), 
                                    offsetY: (_.isNumber(offsetY) ? offsetY : svgViewBox[1])
                                });
                                canvas.toBlob(function(blob) {
                                    saveAs(blob, $.controls.screenshot.filename);
                                });
                            }
                        });
                    });
                    return img;
                };
                screenshot.addTo(map);
            }
        }
        
        if ($.debug) console.log("screenshot",screenshot);

        /*** ***/

        /*** Detach map ***/
        var detach;
        if (_.has($.controls,'detach') && $.controls.detach.active) {
            if (parameters.md === 'embed' || parameters.md === 'widget') {
                detach = L.control({position: 'topright'});
                detach.onAdd = function(map) {
                    var a = L.DomUtil.create('a','detach '+parameters.md),
                        img = L.DomUtil.create('img','detach',a);
                    a.setAttribute('href', $.controls.detach.url || Arg.url(parameters).replace(/&*md=[^&]*/,'').replace(/&{2,}/g,"&"));
                    a.setAttribute('target','_blank');
                    a.setAttribute('title', $.controls.detach.title);
                    img.setAttribute('id','detach');
                    img.setAttribute('src', $.controls.detach.image);
                    d3.select(a).on('click', function () {
                        this.setAttribute('href',Arg.url(parameters).replace(/&*md=[^&]*/,'').replace(/&{2,}/g,"&"));
                    });
                    return a;
                };
                detach.addTo(map);
            }
        }
        
        if ($.debug) console.log("detach",detach);

        /*** ***/



        /*** Summary ***/
        var summary, summaryControl;
        if (_.has($,'summary') && $.summary.active && parameters.md != 'widget') {

            $.summary.position = $.summary.position || 'right';
            d3.select('body').classed('summary '+$.summary.position, true);

            if ($.summary.position === 'top' || $.summary.position === 'left') {
                summary = d3.select('body').insert('div','#map');
            } else {
                summary = d3.select('body').append('div');
            }

            summary
                .attr('id','map-summary')
                .attr("class","summary "+$.summary.position)
                .append('div')
                .html($.summary.content || '');

            summaryControl = L.control({position: 'topright'});

            if (_.has($.summary,'closed') && $.summary.closed) {
                summaryControl.isAdded = false;
                summary.style('display','none');
                d3.select('body').classed('summary',false);
            } else {
                summaryControl.isAdded = true;
                summary.style('display',null);
                d3.select('body').classed('summary',true);
            }

            summaryControl.onAdd = function(map) {
                var img = L.DomUtil.create('img', 'summary '+parameters.md),
                    that = this;
                img.setAttribute('src', $.summary.image);
                img.setAttribute('title', $.summary.title);
                d3.select(img).on('click', function() {
                    d3.select('#map-summary').style('display',(that.isAdded ? 'none' : null));
                    d3.select('body').classed('summary',!that.isAdded);
                    that.isAdded = !that.isAdded;
                });
                return img;
            };

            summaryControl.addTo(map);

        }
        
        if ($.debug) console.log("summaryControl",summaryControl);
        
        /*** ***/



        /*** Pulsanti di condivisione ***/
        var share;
        if (_.has($.controls,'socialButtons') && $.controls.socialButtons.active) {
            if (!parameters.md) {
                share = L.control({position: 'bottomleft'});
                share.onAdd = function(map) {
                    var div = L.DomUtil.create('div','share '+parameters.md),
                        twitter = '', facebook = '', gplus = '';
                    
                    div.setAttribute('id','buttons');
                    div.innerHTML = '';

                    if (_.has($.controls.socialButtons,'twitter') && $.controls.socialButtons.twitter.active) {
                        twitter = '<a ' + 
                            'href="https://twitter.com/share" ' + 
                            'class="twitter-share-button" ' + 
                            'data-url="http://' + location.hostname + location.pathname + '" ' + 
                            'data-via="' + $.controls.socialButtons.twitter.via + '" ' + 
                            'data-lang="' + $.controls.socialButtons.twitter.lang + '" ' + 
                            'data-related="' + $.controls.socialButtons.twitter.related + '" ' + 
                            'data-hashtags="' + $.controls.socialButtons.twitter.hashtags + '" ' + 
                            'data-count="' + $.controls.socialButtons.twitter.count + '"' + 
                            '>' + $.controls.socialButtons.twitter.text + '</a>';
                        div.innerHTML += twitter;
                        head.load("https://platform.twitter.com/widgets.js");
                    }

                    if (_.has($.controls.socialButtons,'facebook') && $.controls.socialButtons.facebook.active) {
                        facebook = '<div ' + 
                            'class="fb-like" ' + 
                            'style="overflow:hidden;" ' + 
                            'data-href="http://' + location.hostname + location.pathname + '" ' + 
                            'data-layout="' + $.controls.socialButtons.facebook.layout + '" ' + 
                            'data-action="' + $.controls.socialButtons.facebook.action + '" ' + 
                            'data-show-faces="' + $.controls.socialButtons.facebook["show-faces"].toString() + '" ' + 
                            'data-share="' + $.controls.socialButtons.facebook.share.toString() + '">' + 
                            '</div>';
                        div.innerHTML += facebook;
                        head.load("http://connect.facebook.net/it_IT/sdk.js#xfbml=1&appId=" + $.controls.socialButtons.facebook.appId + "&version=v2.0");
                    }
                    
                    if (_.has($.controls.socialButtons,'gplus') && $.controls.socialButtons.gplus.active) {
                        gplus = '<div ' + 
                            'class="g-plusone" ' + 
                            'data-size="' + $.controls.socialButtons.gplus.size + '" ' + 
                            'data-href="http://' + location.hostname + location.pathname + '" ' + 
                            'data-annotation="' + $.controls.socialButtons.gplus.annotation + '"' + 
                            '></div>';
                        div.innerHTML += gplus;
                        head.load("https://apis.google.com/js/plusone.js");
                    }
                    
                    return div;
                };
                share.addTo(map);
            }
        }
        
        if ($.debug) console.log("share",share);
        /*** ***/



        /*** Legenda ***/
        var legend;
        if (_.has($,'legend') && $.legend.active) {
		    legend = L.control({position: 'bottomleft'});
    	    legend.onAdd = function (map) {
                this._div = L.DomUtil.create('div', 'info legend '+parameters.md);
		        return this._div;
            };
            legend.update = function(region) {
                if (region) {
                    var dataSet = data[region].filter(function(el) { return el.active; })[0],
                        delimiter = $.legend.delimiter || '-',
                        grades = dataSet.ranges.map(function(el) { 
                            return el.split(" - ").map(function(el) { 
                                var num = parseFloat(el);
                                return dataSet.formatter(dataSet.column, num); 
                            }).join(' '+delimiter+' ');
                        }),
                        description = dataSet.description || $.legend.description || '',
                        pal = dataSet.palette.replace("~",""),
                        binsNum = (colorbrewer[pal][grades.length] ? grades.length : 3),
                        colors = (dataSet.palette[0] === "~" ? _.clone(colorbrewer[pal][binsNum]).reverse() : colorbrewer[pal][binsNum]);

                    this._div.innerHTML = (parameters.md != 'widget' ? '<h3 title="'+description+'">'+$.legend.title+'</h3>' : '');
                    for (var i=0; i<grades.length; i++) {
                        this._div.innerHTML += '<i title="'+(_.has($.legend,'label') ? $.legend.label.call($.legend,grades[i].split(' '+delimiter+' ')[0],grades[i].split(' '+delimiter+' ')[1],dataSet.label) : grades[i])+'" '+
                            'style="background:' + 
                            colors[i] + '"></i> ' + 
                            (parameters.md != 'widget' ? $.legend.label.call($.legend,grades[i].split(' '+delimiter+' ')[0],grades[i].split(' '+delimiter+' ')[1]) : '') + '<br>';
                    }
                    if (parameters.md != 'widget') this._div.innerHTML += '<p>'+description+'</p>';
                } else {
                    this._div.innerHTML = (parameters.md != 'widget' ? '<h3>'+$.legend.title+'</h3>' : '');
                }
    		};
            legend.addTo(map);
            legend.update();
        }
        
        if ($.debug) console.log("legend",legend);
        /*** ***/



        /*** Menus ***/
        var maxMenuItems = (_.has($,'menu') ? $.menu.maxItems || 3 : 3);


        /*** Creazione del menù dei geolayers ***/
        var geoMenu, 
            menuGeoLayers = $.geoLayers.filter(function(l) { return l.type != 'tile'; });

        if (parameters.md === 'widget') {
            geoMenu = {
                _nav: d3.select('body').insert('nav','#map').node(),
                addTo: function(map) { this.onAdd(map); return this; }
            };
        } else {
            geoMenu = L.control({position: 'topleft'});
        }

        geoMenu.onAdd = function(map) {
            this._nav = this._nav || L.DomUtil.create('nav');
            d3.select(this._nav)
                .attr('id','geomenu-ui')
                .attr("class", "menu-ui "+parameters.md)
                .style('display','none')
                .on("mouseenter", function() {
                    map.scrollWheelZoom.disable();
                    map.doubleClickZoom.disable();
                    map.dragging.disable();
                })
                .on("mouseleave", function() {
                    if (_.has($.map.zoom,'scrollWheel') && $.map.zoom.scrollWheel) map.scrollWheelZoom.enable();
                    map.doubleClickZoom.enable();
                    map.dragging.enable();
                });
            this.update();
            return this._nav;
        };
          
        geoMenu.onChange = function(region) {
            if ($.debug) console.log("geoMenuOnChange", arguments, region);
                
            var geoLayer = $.geoLayers.filter(function(l) { return (l.type === 'thematic' && l.schema.name === region); })[0];

            if (geoLayer.zoom) {
                map.setZoom(geoLayer.zoom);
                map.options.maxZoom = geoLayer.zoom;
                map.options.minZoom = geoLayer.zoom;
            } else {
                map.options.maxZoom = $.map.zoom.max || null;
                map.options.minZoom = $.map.zoom.min || null;
            }

            data[region][0].active = true;
            for (var i=0; i<data[region].length; i++) {
                if (i != 0) data[region][i].active = false;
            }
            info.update();
            dataMenu.update(region);
            dataMenu.onChange(region);
        };

        geoMenu.update = function() {
            d3.select(this._nav).style("width",null).selectAll("a").remove();
            
            var that = this;
            d3.select(this._nav)
                .selectAll("a")
                .data(menuGeoLayers.map(function(el) { return el.schema; }))
                .enter()
                .append("a")
                .attr("href", "#")
                .attr("id", function(d) { return d.name; })
                .attr("class", function(d,index) {
                    if (index === 0) {
                        return 'first-item active';
                    } else if (index === menuGeoLayers.length-1) {
                        return 'last-item';
                    } else {
                        return '';
                    }
                })
                .classed("disabled", function(d) {
                    return !_.has(geo,d.name);
                })
                .on("click", function(d) {
                    var listener = d3.select(this).on("click");
                    if (_.has(geo,d.name)) {
                        d3.select(that._nav)
                            .select("a.active")
                            .classed("active",false)
                            .on("click",listener)
                            .on("mouseout",null);
                        d3.select(that._nav).selectAll("a").style("display",null);
                        d3.select(this)
                            .classed('active',true)
                            .style("display","block")
                            .on("click", function() {
                                if (d3.select(that._nav).classed("open")) {
                                    d3.select(that._nav)
                                        .classed("open",false)
                                        .selectAll("a")
                                        .style("display",null);
                                } else {
                                    d3.select(that._nav)
                                        .classed("open",true)
                                        .selectAll("a")
                                        .style("display","block");
                                }
                            })
                            .on("mouseout", function() {
                                d3.select(that._nav)
                                    .classed("open",false)
                                    .selectAll("a")
                                    .style("display",null);
                            });
                        console.log(d.name);
                        that.onChange(d.name);
                    }
                })
                .text(function(d) { return d.menu; });
                
            if (menuGeoLayers.length > 1) {
                var maxLabelLength = d3.max(menuGeoLayers.map(function(el) { return el.schema.menu.length; }));
                d3.select(this._nav)
                    .style("display",null)
                    .classed('collapsable', false)
                    .style("width", function() {
                        if (parameters.md != 'widget' && menuGeoLayers.length > maxMenuItems) {
                            return d3.select(this)
                                .selectAll("a")
                                .filter(function(d) { 
                                    return d.menu.length === maxLabelLength; 
                                })[0][0].offsetWidth+15+"px";
                        } else {
                            return null;
                        }
                    })
                    .classed('collapsable',(menuGeoLayers.length > maxMenuItems));

            } else {
                d3.select(this._nav).style('display','none');
            }
        };
       
        if ($.debug) console.log("menuGeoLayers",menuGeoLayers);
        if ($.debug) console.log("geoMenu",geoMenu);
        /*** ***/



        /*** Creazione del menù dei datasets ***/
        var dataMenu;
        
        if (parameters.md === 'widget') {
            dataMenu = {
                _nav: d3.select('body').insert('nav','#map').node(),
                addTo: function(map) { this.onAdd(map); return this; }
            };
        } else {
            dataMenu = L.control({position: 'topleft'});
        }

        dataMenu.onAdd = function(map) {
            this._nav = this._nav || L.DomUtil.create('nav');
            d3.select(this._nav)
                .attr('id','datamenu-ui')
                .attr('class','menu-ui '+parameters.md)
                .style('display','none')
                .on("mouseenter", function() {
                    map.scrollWheelZoom.disable();
                    map.doubleClickZoom.disable();
                    map.dragging.disable();
                })
                .on("mouseleave", function() {
                    if (_.has($.map.zoom,'scrollWheel') && $.map.zoom.scrollWheel) map.scrollWheelZoom.enable();
                    map.doubleClickZoom.enable();
                    map.dragging.enable();
                });
            return this._nav;
        };

        dataMenu.onChange = function(region,index) {
            var index = index || 0,
                dataSet = data[region][index];
            
            if ($.debug) console.log("dataMenuOnChange", arguments, region, index, dataSet);
            
            dataSet.active = true;
            for (var i=0; i<data[region].length; i++) {
                if (i != index) data[region][i].active = false;
            }
            if (selectedLayer) {
                info.update(selectedLayer.feature.properties);
            } else {
                info.update();
            }
            varMenu.update(region, index);
            varMenu.onChange(region, index);
        };

        dataMenu.update = function(region) {
            d3.select(this._nav).style("width",null).selectAll("a").remove();
            var that = this,
                dataSets = data[region];
                
            d3.select(this._nav)
                .selectAll("a")
                .data(dataSets)
                .enter()
                .append("a")
                .attr("href", "#")
                .attr("id", function(d) { return d.name; })
                .attr("title", function(d) { return d.description; })
                .attr("class", function(d,index) {
                    if (index === 0) {
                        return 'first-item active';
                    } else if (index === dataSets.length-1) {
                        return 'last-item';
                    } else {
                        return '';
                    }
                })
                .on("click", function(d) {
                    var listener = d3.select(this).on("click");
                    d3.select(that._nav)
                        .select("a.active")
                        .classed("active",false)
                        .on("click",listener)
                        .on("mouseout",null);
                    d3.select(that._nav).selectAll("a").style("display",null);
                    d3.select(this)
                        .classed('active',true)
                        .style("display","block")
                        .on("click", function() {
                            if (d3.select(that._nav).classed("open")) {
                                d3.select(that._nav)
                                    .classed("open",false)
                                    .selectAll("a")
                                    .style("display",null);
                            } else {
                                d3.select(that._nav)
                                    .classed("open",true)
                                    .selectAll("a")
                                    .style("display","block");
                            }
                        })
                        .on("mouseout", function() {
                            d3.select(that._nav)
                                .classed("open",false)
                                .selectAll("a")
                                .style("display",null);
                        });
                    that.onChange(d.layer, d.index);
                })
                .text(function(d) { return d.menuLabel; });
                
            if (dataSets.length > 1) {
                var maxLabelLength = d3.max(dataSets.map(function(el) { return el.menuLabel.length; }));
                d3.select(this._nav)
                    .style("display",null)
                    .classed('collapsable', false)
                    .style("width", function() {
                        if (parameters.md != 'widget' && dataSets.length > maxMenuItems) {
                            return d3.select(this)
                                .selectAll("a")
                                .filter(function(d) { 
                                    return d.menuLabel.length === maxLabelLength; 
                                })[0][0].offsetWidth+15+"px";
                        } else {
                            return null;
                        }
                    })
                    .classed('collapsable',(dataSets.length > maxMenuItems));
            
            } else {
                d3.select(this._nav).style('display','none');
            }
        };

        if ($.debug) console.log("dataMenu",dataMenu);
        /*** ***/



        /*** Creazione del menù delle colonne del dataset ***/
        var varMenu;

        if (parameters.md === 'widget') {
            varMenu = {
                _nav: d3.select('body').insert('nav','#map').node(),
                addTo: function(map) { this.onAdd(map); return this; }
            };
        } else {
            varMenu = L.control({position: 'topleft'});
        }

        varMenu.onAdd = function(map) {
            this._nav = this._nav || L.DomUtil.create('nav');
            d3.select(this._nav)
                .attr('id','varmenu-ui')
                .attr("class", "menu-ui "+parameters.md)
                .style('display','none')
                .on("mouseenter", function() {
                    map.scrollWheelZoom.disable();
                    map.doubleClickZoom.disable();
                    map.dragging.disable();
                })
                .on("mouseleave", function() {
                    if (_.has($.map.zoom,'scrollWheel') && $.map.zoom.scrollWheel) map.scrollWheelZoom.enable();
                    map.doubleClickZoom.enable();
                    map.dragging.enable();
                })
            return this._nav;
        }

        varMenu.onChange = function(region, index, column) {
            var index = index || 0,
                column = column || 0,
                dataSet = data[region][index];
            
            if ($.debug) console.log("varMenuOnChange", arguments, region, index, column, dataSet);
            
            //info.update();
            legend.update();
            dataSet.column = dataSet.columns[column];
            dataSet.label = dataSet.labels[column];
            dataSet.description = dataSet.descriptions[column];
            dataSet.precision = dataSet.precisions[column];
            dataSet.binsNum = dataSet.binsNums[column];
            loadData(region, dataSet.name);
        };

        varMenu.update = function(region,index) {
            d3.select(this._nav).style("width",null).selectAll("a").remove();

            var that = this,
                index = index || 0,
                dataSet = data[region][index],
                items = [],
                firstActive = true,
                group = '';

            for (var i=0; i<dataSet.columns.length; i++) {
                if (_.has(dataSet.groups,dataSet.columns[i])) {
                    if (dataSet.groups[dataSet.columns[i]] != group) {
                        group = dataSet.groups[dataSet.columns[i]];
                        items.push({ label: group, enabled: false, level: 'first-level' });
                    }
                    items.push({ label: dataSet.labels[i], descr: dataSet.descriptions[i], enabled: true, level: 'second-level' });
                } else {
                    items.push({ label: dataSet.labels[i], descr: dataSet.descriptions[i], enabled: true, level: 'first-level' });
                }
            }

            if (dataSet.columns) {
                
                d3.select(this._nav)
                    .selectAll("a")
                    .data(items)
                    .enter()
                    .append("a")
                    .attr("href", "#")
                    .attr("title", function(d) { return d.descr; })
                    .attr("class", function(d,index) {
                        var classText = '';
                        if (index === 0) {
                            classText = 'first-item';
                        } else if (index === items.length-1) {
                            classText = 'last-item';
                        }

                        if (firstActive && d.enabled) {
                            firstActive = false;
                            classText += ' active';
                        }

                        return classText + ' ' +
                            d.level + ' ' + 
                            (d.enabled ? 'enabled' : 'disabled'); 
                    })
                    .on("click", function(d) {
                        var listener = d3.select(this).on("click");
                        if (d.enabled) {
                            var column = _.indexOf(dataSet.labels,d.label);
                            d3.select(that._nav)
                                .select("a.active")
                                .classed("active",false)
                                .on("click",listener)
                                .on("mouseout",null);
                            d3.select(that._nav).selectAll("a").style("display",null);
                            d3.select(this)
                                .classed('active',true)
                                .style("display","block")
                                .on("click", function() {
                                    if (d3.select(that._nav).classed("open")) {
                                        d3.select(that._nav)
                                            .classed("open",false)
                                            .selectAll("a")
                                            .style("display",null);
                                    } else {
                                        d3.select(that._nav)
                                            .classed("open",true)
                                            .selectAll("a")
                                            .style("display","block");
                                    }
                                })
                                .on("mouseout", function() {
                                    d3.select(that._nav)
                                        .classed("open",false)
                                        .selectAll("a")
                                        .style("display",null);
                                });
                            that.onChange(region,index,column);
                        }
                    })
                    .text(function(d) { return d.label; });

                if (dataSet.columns.length > 1) {
                    var maxLabelLength = d3.max(items.map(function(el) { return el.label.length; }));
                    d3.select(this._nav)
                        .style("display",null)
                        .classed('collapsable', false)
                        .style("width", function() {
                            if (parameters.md != 'widget' && dataSet.columns.length > maxMenuItems) {
                                return d3.select(this)
                                    .selectAll("a")
                                    .filter(function(d) { 
                                        return d.label.length === maxLabelLength; 
                                    })[0][0].offsetWidth+15+"px";
                            } else {
                                return null;
                            }
                        })
                        .classed('collapsable',(dataSet.columns.length > maxMenuItems));
                } else {
                    d3.select(this._nav).style('display','none');
                }

            } else {
                d3.select(this._nav).style('display','none');
            }
        };
            
        if ($.debug) console.log("varMenu",varMenu);
        /*** ***/



        geoMenu.addTo(map);
        dataMenu.addTo(map);
        varMenu.addTo(map);
        geoMenu.onChange(menuGeoLayers[0].schema.name);



        /*** Dev utility ***/
        var devUtil;
        if ($.debug) {
            devUtil = L.control({position: 'bottomright'});
            devUtil.onAdd = function(map) {
                var div = L.DomUtil.create('div','devutil');

                d3.select(div).append('p')
                    .attr('id','devutil-coord')
                    .text('Mouse position: ...');
                d3.select(div).append('p')
                    .attr('id','devutil-sw')
                    .text('SouthWest bound: '+map.getBounds().getSouthWest().toString()),
                d3.select(div).append('p')
                    .attr('id','devutil-ne')
                    .text('NorthEast bound: '+map.getBounds().getNorthEast().toString()),
                d3.select(div).append('p')
                    .attr('id','devutil-center')
                    .text('Map center: '+map.getCenter().toString());
                d3.select(div).append('p')
                    .attr('id','devutil-zoom')
                    .text('Zoom level: '+map.getZoom());
                d3.select(div).append('p')
                    .attr('id','devutil-screen')
                    .text('Screen size: ' + head.screen.innerWidth + ' x ' + head.screen.innerHeight);

                d3.select(div)
                    .on("mouseenter", function() {
                        map.scrollWheelZoom.disable();
                        map.doubleClickZoom.disable();
                        map.dragging.disable();
                    })
                    .on("mouseleave", function() {
                        if (_.has($.map.zoom,'scrollWheel') && $.map.zoom.scrollWheel) map.scrollWheelZoom.enable();
                        map.doubleClickZoom.enable();
                        map.dragging.enable();
                    });

                return div;
            };
            devUtil.addTo(map);
            map
                .on('mousemove', function(e) { d3.select('#devutil-coord').text('Mouse position: '+e.latlng.toString()); })
                .on('move', function(e) { 
                    d3.select('#devutil-sw').text('SouthWest bound: '+map.getBounds().getSouthWest().toString()); 
                    d3.select('#devutil-ne').text('NorthEast bound: '+map.getBounds().getNorthEast().toString()); 
                    d3.select('#devutil-center').text('Map center: '+map.getCenter().toString());
                })
                .on('zoomend', function(e) { d3.select('#devutil-zoom').text('Zoom level: '+map.getZoom()); });
        }
        /*** ***/



        /*** Caricamento asincrono del pointsSet ***/
        if ($.pointsSet && $.pointsSet.active && $.pointsSet.resourceId) {
            var markersPath = $.pointsSet.url.call($.pointsSet);
            if ($.debug) console.log("markersPath",markersPath);
            d3[$.pointsSet.format](markersPath, function(err, markersjs) {
                if ($.debug) console.log("markers",arguments);
                var points = (markersjs ? $.pointsSet.transform.call($.pointsSet,markersjs) : null);
                if (points) {
                    var clusters = new L.MarkerClusterGroup({ showCoverageOnHover: false }),
                        markers = [];
                    for (var i=0; i<points.length; i++) {
                        var marker = L.marker();
                        marker.setIcon(L.icon({iconUrl: $.pointsSet.icon, shadowUrl: $.pointsSet.shadow}));
                        marker.setLatLng(L.latLng(points[i][parameters.mr.lat],points[i][parameters.mr.lng]));
                        if (_.has(parameters.mr,'iw')) marker.bindPopup(points[i][parameters.mr.iw]);
                        markers.push(marker);
                        clusters.addLayer(marker);
                    }
                        
                    if ($.pointsSet.clusters) {
                        map.addLayer(clusters);
                    } else {
                        map.addLayer(L.layerGroup(markers));
                    }
                }
            });
        }
        /*** ***/



        /*** Gestione degli stili della choropleth ***/
        function getColor(d, bins, palette) {
            //if ($.debug) console.log("getColorFunction",arguments);
            var pal = palette.replace("~",""),
                binsNum = (colorbrewer[pal][bins.length-1] ? bins.length-1 : 3),
                colors = (palette[0] === "~" ? _.clone(colorbrewer[pal][binsNum]).reverse() : colorbrewer[pal][binsNum]);
            for (var i=1; i<bins.length; i++) {
                if (d <= bins[i]) {
                    return colors[i-1];
                }
            }
        }

        function style(feature) {
            //if ($.debug) console.log("styleFunction",arguments);
            var region = feature.properties._layer,
                geoLayer = $.geoLayers.filter(function(l) { return (l.type === 'thematic' && l.schema.name === region); })[0],
                dataSet = data[region].filter(function(el) { return el.active; })[0],
                currentStyle = _.clone(geoLayer.style.default);
            if (feature._selected) {
                _.extend(currentStyle,geoLayer.style.selected);
            }
            currentStyle.fillColor = (_.has(feature.properties._data,dataSet.name) ? getColor(feature.properties._data[dataSet.name][dataSet.column], dataSet.bins, dataSet.palette) : 'transparent');
	    	return currentStyle;
    	}
        /*** ***/



        /*** Gestione degli eventi ***/
        var geojson, tooltip = new L.Label();

	    function highlightFeature(e) {
            //if ($.debug) console.log("highlightFeatureFunction",arguments);
            var layer = e.target,
                props = layer.feature.properties,
                region = layer.feature.properties._layer,
                geoLayer = $.geoLayers.filter(function(l) { return (l.type === 'thematic' && l.schema.name === region); })[0],
                dataSet = data[region].filter(function(el) { return el.active; })[0],
                highlightStyle = geoLayer.style.highlight,
                num = props._data[dataSet.name][dataSet.column];
                    
            if (!layer.feature._selected) layer.setStyle(highlightStyle);
            if (_.has($,'tooltip') && $.tooltip.active && (!_.has(geoLayer,'tooltip') || geoLayer.tooltip)) {
                tooltip.setContent((geo[region].label ? props[geo[region].label]+'<br>' : '') + dataSet.label + ': '+ dataSet.formatter(dataSet.column, num));
                tooltip.setLatLng(layer.getBounds().getCenter());
                map.showLabel(tooltip);
            }
	    }
                
        function resetHighlight(e) {
            //if ($.debug) console.log("resetHighlightFunction",arguments);
            var layer = e.target,
                region = layer.feature.properties._layer,
                geoLayer = $.geoLayers.filter(function(l) { return (l.type === 'thematic' && l.schema.name === region); })[0],
                defaultStyle = geoLayer.style.default;
            if (!layer.feature._selected) geojson.resetStyle(layer);
            if (_.has($,'tooltip') && $.tooltip.active) tooltip.close();
	    }

	    function openInfoWindow(e, layer) {
            if ($.debug) console.log("openInfoWindowFunction",arguments);
            var layer = layer || e.target,
                region = layer.feature.properties._layer,
                geoLayer = $.geoLayers.filter(function(l) { return (l.type === 'thematic' && l.schema.name === region); })[0],
                selectedStyle = geoLayer.style.selected;

            if (_.has(geoLayer,'infowindow') && geoLayer.infowindow) {
                if (!layer.feature._selected) {
                    if (selectedLayer) {
                        selectedLayer.feature._selected = false;
                        geojson.resetStyle(selectedLayer);
                    }
                    layer.feature._selected = true;
                    layer.feature._position = _.indexOf(_.keys(geojson._layers),''+layer._leaflet_id);
                    layer.setStyle(selectedStyle);
                    parameters.i = layer.feature.properties[geo[parameters.dl].id];
                    if (embedControl && embedControl.isAdded) embedControl.removeFrom(map);
                    info.update(layer.feature.properties);
                }   
            
                if (!L.Browser.ie && !L.Browser.opera) {
	            	layer.bringToFront();
                }
    
                selectedLayer = layer;
            }
        }

        function onEachFeature(feature, layer) {
            //if ($.debug) console.log("onEachFeatureFunction",arguments);
	    	layer.on({
	        	mouseover: highlightFeature,
				mouseout: resetHighlight,
    		    click: openInfoWindow
    		});
	    }
                
        geojson = L.geoJson("", {
        	style: style,
    	    onEachFeature: onEachFeature
    	}).addTo(map);
        
        if ($.debug) console.log("geojson",geojson);
        /*** ***/



        // Join tra dati e territori
        function joinData(region) {
            if ($.debug) console.log("joinDataFunction",arguments);

            var geoID, dataID;
            for (var i=0; i<geo[region].resource.length; i++) { // Ciclo sui territori del layer
                geoID = geo[region].resource[i].properties[geo[region].id];
                geo[region].resource[i].properties._data = {};
                for (var h=0; h<data[region].length; h++) { // Ciclo sui dataset associati al layer
                    data[region][h].active = !h;
                    if (!data[region][h].id) {
                        data[region][h].resource.push(_.clone(geo[region].resource[i].properties));
                        geo[region].resource[i].properties._data[data[region][h].name] = data[region][h].resource[i];
                        for (var k in geo[region].resource[i].properties._data[data[region][h].name]) {
                            if (_.has(geo[region].resource[i].properties._data[data[region][h].name],k)) {
                                geo[region].resource[i].properties._data[data[region][h].name][k] = data[region][h].parse(k,geo[region].resource[i].properties._data[data[region][h].name][k]);
                            }
                        }
                        geo[region].resource[i].properties._layer = region;
                    } else {
                        for (var j=0; j<data[region][h].resource.length; j++) { // Ciclo sulle righe del dataset
                            var dataID = data[region][h].resource[j][data[region][h].id];
                            if (dataID == geoID) {
                                geo[region].resource[i].properties._data[data[region][h].name] = data[region][h].resource[j];
                                for (var k in geo[region].resource[i].properties._data[data[region][h].name]) {
                                    if (_.has(geo[region].resource[i].properties._data[data[region][h].name],k)) {
                                        geo[region].resource[i].properties._data[data[region][h].name][k] = data[region][h].parse(k,geo[region].resource[i].properties._data[data[region][h].name][k]);
                                    }
                                }
                                geo[region].resource[i].properties._layer = region;
                            }
                        }
                    }
                }
                if (!d3.keys(geo[region].resource[i].properties._data).length) {
                    geo[region].resource.splice(i,1);
                    i--;
                }
            }

        }



        // Binning della distribuzione dei dati
        function binData(region) {
            if ($.debug) console.log("binDataFunction",arguments);

            var dataSet = data[region].filter(function(el) { return el.active; })[0],
                geoLayer = $.geoLayers.filter(function(l) { return (l.type === 'thematic' && l.schema.name === region); })[0];

            var serie = dataSet.resource.map(function(el) { return el[dataSet.column]; }),
                bins, ranges;
            var gs = new geostats(serie);

            if (serie.length > 3) {
                if (dataSet.binsNum > serie.length) {
                    dataSet.binsNum = serie.length-1;
                }
            } else {
                dataSet.binsNum = 3;
            }

            if (_.isArray(geoLayer.classification)) {
                dataSet.binsNum = geoLayer.classification.length-1;
                bins = gs.setClassManually(_.flatten([d3.min(serie), geoLayer.classification.slice(1,-1), d3.max(serie)])).map(function(el) { return parseFloat(el) || el; });
                ranges = gs.ranges;
                ranges[0] = geoLayer.classification[0] + " - " + ranges[0].split(" - ")[1];
                ranges[ranges.length-1] = ranges[ranges.length-1].split(" - ")[0] + " - " + geoLayer.classification[geoLayer.classification.length-1];
            } else {
                bins = gs['get'+geoLayer.classification](dataSet.binsNum).map(function(el) { return parseFloat(el) || el; });
                var uniqBins = _.uniq(bins);
                if (dataSet.binsNum > 3 && uniqBins.length < bins.length) {
                    dataSet.binsNum = uniqBins.length-1;
                    bins = gs['get'+geoLayer.classification](dataSet.binsNum).map(function(el) { return parseFloat(el) || el; });
                }
                ranges = gs.ranges;
            }


            if (dataSet.precision) {
                for (var i=1; i<bins.length-1; i++) {
                    bins[i] = Math.round(bins[i]/dataSet.precision)*dataSet.precision;
                }
                bins = gs.setClassManually(_.flatten([d3.min(serie), bins.slice(1,-1), d3.max(serie)])).map(function(el) { var val = parseFloat(el); return _.isNumber(val) && !_.isNaN(val) ? val : el; });
                ranges = gs.ranges;
                ranges[0] = Math.floor(bins[0]/dataSet.precision)*dataSet.precision + " - " + ranges[0].split(" - ")[1];
                ranges[ranges.length-1] = ranges[ranges.length-1].split(" - ")[0] + " - " + (Math.floor(bins[bins.length-1]/dataSet.precision)+1)*dataSet.precision;
            }

            dataSet.bins = bins;
            dataSet.ranges = ranges;
            legend.update(region);
        }



        // Caricamento asincrono dei dati
        function loadData(region, dataset) { // region = regioni || province || comuni
            
            if ($.debug) console.log("loadDataFunction",arguments);
            
            var geoLayer = $.geoLayers.filter(function(l) { return (l.type === 'thematic' && l.schema.name === region); })[0],
                dataSets = $.dataSets.filter(function(l) { return l.schema.layer === region; }),
                geoPath, dataPath, q;
            
            parameters.dl = region;
            if (geojson) geojson.clearLayers();

            if ($.debug) console.log("geoLayer",geoLayer);
            if ($.debug) console.log("dataSets",dataSets);

            if (!geo[region].resource.length) { 
                
                map.spin(true);
                
                q = queue();

                geoPath = geoLayer.url.call(geoLayer, region, (parameters.t ? parameters.tl : undefined), parameters.t || undefined);
                q.defer(d3[geoLayer.format], geoPath); // Geojson
                if ($.debug) console.log("geoPath",geoPath);
                
                for (var i=0; i<dataSets.length; i++) {
                    if (dataSets[i].source != 'shape') {
                        dataPath = dataSets[i].url.call(dataSets[i], region, (parameters.t ? defaultData[parameters.tl].id : undefined), parameters.t || undefined); // CHECK!
                        q.defer(d3[dataSets[i].format], dataPath); // Dati -> Loop with condition
                        if ($.debug) console.log("dataPath", i, dataPath);
                    }
                }

                q.await(function(err, geojs) { // Access results by arguments
                    if ($.debug) console.log("await",arguments);
                   
                    geojs = geoLayer.transform.call(geoLayer, geojs);

                    if (geoLayer.format === 'topojson') {
                        geo[region].resource = topojson.feature(geojs, geojs.objects[geoLayer.filename.split(".")[0]]).features;
                    } else if (geoLayer.format === 'geojson') {
                        geo[region].resource = geojs.features;
                    }

                    for (var i=2; i<arguments.length; i++) {
                        data[region][i-2].resource = dataSets[i-2].transform.call(dataSets[i-2],arguments[i]);
                    }

                    joinData(region);
                    binData(region);
                    
	    	        geojson.addData(geo[region].resource);

                    map.spin(false);
                    
                    if (!svgViewBox) svgViewBox = d3.select(".leaflet-overlay-pane svg").attr("viewBox").split(" ");
                    if (parameters.t) { map.fitBounds(geojson.getBounds()); }
                    if (parameters.i) {
                        geojson.eachLayer(function(l) { 
                            if (l.feature.properties[geo[region].id] == parameters.i) {
                                openInfoWindow(null, l);
                            }
                        });
                    }
                    
                });
            } else {
                binData(region);
                geojson.addData(geo[region].resource);
                if (selectedLayer) {
                    selectedLayer = geojson._layers[_.keys(geojson._layers)[selectedLayer.feature._position]];
                    if (!L.Browser.ie && !L.Browser.opera) {
	                	selectedLayer.bringToFront();
                    }
                }
                delete parameters.i;
                if (embedControl && embedControl.isAdded) embedControl.removeFrom(map);
                legend.update(region);
                //info.update();
            }
        }
        /*** ***/



    });
})(mapConfig);
