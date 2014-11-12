(function($) {

    console.log("mapConfig",mapConfig);

    if (!$) {
        throw 'ERRORE: configurazione errata o mancante...';
        return;
    }

    head.ready(function() {

        var $ = mapConfig, // Configuration object
            dtnj, // URL shortener via yourls-api lib
            parameters = Arg.query(), // Parsing URL GET parameters
            svgViewBox,
            defaultGeo = {}, geo = {},
            defaultData = {}, data = {},
            menuLayers,
            i, k,
            map,
            attrib = L.control.attribution(),
            info,
            fullscreen,
            logo,
            reset,
            embed, embedControl,
            screenshot,
            detach,
            share,
            menu,
            osmGeocoder,
            legend,
            sourceDef, typeDef;

        // Configuration initialization
        for (i=0; i<$.geoLayers.length; i++) {

            if ($.debug) console.log('geoLayer', i, $.geoLayers[i]);

            typeDef = $.geoTypes[$.geoLayers[i].type];
            for (k in typeDef) {
                if (typeDef.hasOwnProperty(k)) {
                    if (!$.geoLayers[i].hasOwnProperty(k)) {
                        $.geoLayers[i][k] = typeDef[k];
                    } else if (typeof typeDef[k] === 'object') {
                        for (var k2 in typeDef[k]) {
                            if (typeDef[k].hasOwnProperty(k2) && !$.geoLayers[i][k].hasOwnProperty(k2)) {
                                $.geoLayers[i][k][k2] = typeDef[k][k2];
                            }
                        }
                    }
                }
            }
            
            sourceDef = $.geoSources[$.geoLayers[i].source];
            for (k in sourceDef) {
                if (sourceDef.hasOwnProperty(k) && !$.geoLayers[i].hasOwnProperty(k)) {
                    $.geoLayers[i][k] = sourceDef[k];
                }
            }

            if (!$.geoLayers[i].active) { $.geoLayers.splice(i,1); }
        }

        for (i=0; i<$.dataSets.length; i++) {
            typeDef = $.dataTypes[$.dataSets[i].type];
            for (k in typeDef) {
                if (typeDef.hasOwnProperty(k) && !$.dataSets[i].hasOwnProperty(k)) {
                    $.dataSets[i][k] = typeDef[k];
                }
            }
            sourceDef = $.dataSources[$.dataSets[i].source];
            for (k in sourceDef) {
                if (sourceDef.hasOwnProperty(k) && !$.dataSets[i].hasOwnProperty(k)) {
                    $.dataSets[i][k] = sourceDef[k];
                }
            }
            
            var geoLayersData = $.geoLayers.filter(function(l) { return l.hasOwnProperty('schema') && l.schema.name === $.dataSets[i].schema.layer; });

            if ($.debug) console.log('geoLayersData', geoLayersData);

            if (!geoLayersData.length || !geoLayersData[0].active) { $.dataSets.splice(i,1); }
        }

        if ($.hasOwnProperty('infowindow') && $.infowindow.active && $.infowindow.hasOwnProperty('downloads') && $.infowindow.downloads.active) {
            for (i=0; i<$.infowindow.downloads.files.length; i++) {
                if ($.infowindow.downloads.files[i].active) {
                    sourceDef = $.dataSources[$.infowindow.downloads.files[i].source];
                    for (k in sourceDef) {
                        if (sourceDef.hasOwnProperty(k) && !$.infowindow.downloads.files[i].hasOwnProperty(k)) {
                            $.infowindow.downloads.files[i][k] = sourceDef[k];
                        }
                    }
                }
            }
        }

        if ($.hasOwnProperty('pointsSet') && $.pointsSet.active) {
            sourceDef = $.dataSources[$.pointsSet.source];
            for (k in sourceDef) {
                if (sourceDef.hasOwnProperty(k) && !$.pointsSet.hasOwnProperty(k)) {
                    $.pointsSet[k] = sourceDef[k];
                }
            }
        }

        if ($.debug) console.log("$",$);

        // Url shortener initialization
        if ($.hasOwnProperty('urlShortener') && $.urlShortener.active) {
            dtnj = yourls.connect($.urlShortener.url.call($.urlShortener), { signature: $.urlShortener.signature });
        }

        if ($.debug) console.log("dtnj",dtnj);

        /*** Geo layers initialization ***/
        for (i=0; i<$.geoLayers.length; i++) {
            if ($.geoLayers[i].type === 'vector') {
                defaultGeo[$.geoLayers[i].schema.name] = {
                    id: $.geoLayers[i].schema.id,
                    label: $.geoLayers[i].schema.label,
                    resource: null,
                    list: []
                };
            }
        }

        if ($.debug) console.log("defaultGeo",defaultGeo);

        /*** Data sets initialization ***/
        for (i=0; i<$.dataSets.length; i++) {
            defaultData[$.dataSets[i].schema.layer] = { // Layer in the object, key will be the name
                id: $.dataSets[i].schema.id,
                label: $.dataSets[i].schema.label,
                value: $.dataSets[i].schema.value,
                resourceId: $.dataSets[i].resourceId,
                resource: null,
                markers: null,
                bins: [],
                ranges: [],
                palette: $.dataSets[i].palette
            };

            if (typeof $.dataSets[i].parse === "string") {
                var parse = $.dataSets[i].parse;
                defaultData[$.dataSets[i].schema.layer].parse = function(el) { return isNaN(window[parse](el)) ? el : window[parse](el); };
            } else if (typeof $.dataSets[i].parse === "function") {
                defaultData[$.dataSets[i].schema.layer].parse = $.dataSets[i].parse;
            } else {
                defaultData[$.dataSets[i].schema.layer].parse = function(el) { return isNaN(parseFloat(el)) ? el : parseFloat(el); };
            }
        }

        if ($.debug) console.log("defaultData",defaultData);

        // URL GET parameters initialization
        /* ie. http://viz.confiscatibene.it/anbsc/choropleth/?ls[0]=regioni&ls[1]=province&ls[2]=comuni&dl=regioni&t=1
            {
                ls: Array(), // Livelli caricati: regioni, province, comuni (default: tutti) -- LAYERS
                md: [string], // Layout di visualizzazione: full (default), embed, mobile (auto se su mobile), widget -- MODE
                dl: [string], // Livello mostrato al caricamento -- DEFAULT LAYER
                ml: [string], // Livello caricato più alto: regioni, province, comuni -- MAX LAYER
                tl: [string], // Livello a cui si riferisce t -- TERRITORY LAYER
                t: [int], // Codice istat del region centrato e con infowindow aperta (si riferisce a tl) -- TERRITORY
                i: [int] // Codice istat del region con infowindow aperta -- INFO
            }
        */
        
        parameters.ls = parameters.ls || d3.keys(defaultGeo); // Livelli caricati (default: tutti)
        parameters.ml = parameters.ls[0]; // Livello caricato più alto (PRIVATO)
        parameters.dl = parameters.dl || parameters.ml; // Livello visibile al caricamento
        parameters.md = parameters.md || (head.mobile ? 'mobile' : ''); // Layout
        d3.select('body').classed(parameters.md,true); // Tengo traccia del layout come classe del body

        if (parameters.t) { // Focus su un region (codice istat che si riferisce a tl)
            parameters.tl = parameters.tl || parameters.ml; // Livello a cui si riferisce t
            parameters.ml = parameters.ls[parameters.ls.indexOf(parameters.tl)+1]; // Si riferisce ora al livello più alto caricato
            if (parameters.ls.indexOf(parameters.dl) < parameters.ls.indexOf(parameters.tl)+1) {
                parameters.dl = parameters.ml;
            }
        }
        
        if ($.hasOwnProperty('pointsSet') && $.pointsSet.active && parameters.mr && parameters.mr.hasOwnProperty('rid')) {
            $.pointsSet.resourceId = parameters.mr.rid;
            parameters.mr.lat = parameters.mr.lat || 'lat';
            parameters.mr.lng = parameters.mr.lng || 'lng';
        }
                
        if ($.debug) console.log("parameters",parameters);

        // Livelli disponibili da parametri dell'URL
        for (i=parameters.ls.indexOf(parameters.ml); i<parameters.ls.length; i++) {
            if (defaultGeo.hasOwnProperty(parameters.ls[i]) && defaultData.hasOwnProperty(parameters.ls[i])) {
                geo[parameters.ls[i]] = defaultGeo[parameters.ls[i]];
                data[parameters.ls[i]] = defaultData[parameters.ls[i]];
            }
        }
                
        if ($.debug) console.log("geo",geo);

        if ($.debug) console.log("data",data);

        /*** ***/

        /*** Inizializzazione della mappa ***/
	    var southWest = L.latLng($.map.bounds.init.southWest),
            northEast = L.latLng($.map.bounds.init.northEast),
            mapBounds = L.latLngBounds(southWest, northEast),
        	southWestB = L.latLng($.map.bounds.max.southWest),
            northEastB = L.latLng($.map.bounds.max.northEast),
            maxMapBounds = L.latLngBounds(southWestB, northEastB);
                
        map = L.map('map', { 
            maxZoom: $.map.zoom.max, 
            minZoom: $.map.zoom.min, 
            scrollWheelZoom: $.map.zoom.scrollWheel, 
            attributionControl: !$.map.attribution.length,
            maxBounds: maxMapBounds
        });

        if ($.debug) console.log("map",map);

        map.fitBounds(mapBounds);

        // Tile layers
        var tileLayers = $.geoLayers.filter(function(l) { return l.type === 'tile'; });

        if ($.debug) console.log("tileLayers",tileLayers);

        for (i=0; i<tileLayers.length; i++) {
            L.tileLayer(tileLayers[i].url.call(tileLayers[i]), tileLayers[i].options).addTo(map);
        }
        
        map.spin(true);
        
        // Attribution notices
        for (i=0; i<$.map.attribution.length; i++) {
            attrib.addAttribution($.map.attribution[i]);
        }
        
        if ($.debug) console.log("attrib",attrib);

        attrib.addTo(map);
        
        /*** ***/

        /*** Gestione dell'infowindow al click ***/
        if ($.hasOwnProperty('infowindow') && $.infowindow.active) {
            if (parameters.md === 'widget') {
                info = {};
                info._div = d3.select('body').append('div').attr('id','infowindow').classed("info", true).node();
            } else {
                info = L.control({position: 'bottomright'});
                info.onAdd = function (map) {
                    this._div = L.DomUtil.create('div', 'info '+parameters.md);
                    this._div.setAttribute('id','infowindow');
                    this._div.setAttribute('style','max-height:'+(head.screen.innerHeight-100)+'px;');
                    d3.select(this._div)
                        .on("mouseenter", function() {
                            map.scrollWheelZoom.disable();
                        })
                        .on("mouseleave", function() {
                            map.scrollWheelZoom.enable();
                        });
    	    	    this.update();
	                return this._div;
                };
            }
        
            info.update = function (props) {
                var that = this;
                this._div.innerHTML = '';
                if (props) {
                    d3.select(this._div).classed("closed", false);
                    if (parameters.md === 'mobile') map.dragging.disable();
                    var delim = agnes.rowDelimiter(),
                        today = new Date(),
                        stoday = d3.time.format('%Y%m%d')(today),
                        region = parameters.dl,
                        filterKey = data[region].id,
                        filterValue = props[geo[region].id],
                        buttons = [], btnTitle, btnUrl, btnPlace,
                        dnlBtn = [];
    
                    if ($.infowindow.hasOwnProperty('shareButtons') && $.infowindow.shareButtons.active) {
                        btnTitle = $.infowindow.shareButtons.title + (region == 'regioni' ? ' in ' : ' a ') + props[geo[region].label];
                        btnUrl = 'http://' + location.hostname + Arg.url(parameters).replace(/&*md=[^&]*/,'').replace(/&{2,}/g,"&");
                        btnEncUrl = 'http://' + location.hostname + encodeURIComponent(Arg.url(parameters).replace(/&*md=[^&]*/,'').replace(/&{2,}/g,"&"));
                        btnPlace = props[geo[region].label];
                    
                        if ($.infowindow.shareButtons.hasOwnProperty('twitter') && $.infowindow.shareButtons.twitter.active) {
                            buttons.push('<a class="ssb" href="http://twitter.com/share?url=' + btnEncUrl + 
                                '&via=' + $.infowindow.shareButtons.twitter.via + 
                                '&text=' + encodeURIComponent(btnPlace + ' - ' + $.infowindow.shareButtons.twitter.text + ' ') + 
                                '" target="_blank" title="'+btnTitle+' su Twitter"><img src="img/twitter.png" id="ssb-twitter"></a>'
                            );
                        }

                        if ($.infowindow.shareButtons.hasOwnProperty('facebook') && $.infowindow.shareButtons.facebook.active) {
                            buttons.push('<a class="ssb" href="http://www.facebook.com/sharer.php?u=' + btnEncUrl + 
                                '" target="_blank" title="'+btnTitle+' su Facebook"><img src="img/facebook.png" id="ssb-facebook"></a>'
                            );
                        }

                        if ($.infowindow.shareButtons.hasOwnProperty('gplus') && $.infowindow.shareButtons.gplus.active) {
                            buttons.push('<a class="ssb" href="https://plus.google.com/share?url=' + btnEncUrl + 
                                '" target="_blank" title="'+btnTitle+' su Google Plus"><img src="img/gplus.png" id="ssb-gplus"></a>'
                            );
                        }

                        if ($.infowindow.shareButtons.hasOwnProperty('linkedin') && $.infowindow.shareButtons.linkedin.active) {
                            buttons.push('<a class="ssb" href="http://www.linkedin.com/shareArticle?mini=true&url=' + btnEncUrl + 
                                '" target="_blank" title="'+btnTitle+' su LinkedIn"><img src="img/linkedin.png" id="ssb-linkedin"></a>'
                            );
                        }

                        if ($.infowindow.shareButtons.hasOwnProperty('email') && $.infowindow.shareButtons.email.active) {
                            buttons.push('<a class="ssb" href="mailto:?Subject=' + encodeURIComponent($.infowindow.shareButtons.email.subject + ' | ' + btnPlace) + 
                                '&Body=' + encodeURIComponent(btnPlace + ' - ' + $.infowindow.shareButtons.email.body + ': ') + btnEncUrl + 
                                '" target="_blank" title="'+btnTitle+' per email"><img src="img/email.png" id="ssb-email"></a>'
                            );
                        }

                        if ($.infowindow.shareButtons.hasOwnProperty('permalink') && $.infowindow.shareButtons.permalink.active) {
                            buttons.push('<a class="ssb" href="' + btnUrl + 
                                '" target="_blank" title="Permalink"><img src="img/link.png" id="ssb-link"></a>'
                            );
                        }
                    }

                    if ($.debug) console.log("shareButtons",buttons);

                    if ($.infowindow.hasOwnProperty('downloads') && $.infowindow.downloads.active) {
                        for (i=0; i<$.infowindow.downloads.files.length; i++) {
                            if ($.infowindow.downloads.files[i].active) {
                                dnlBtn.push('<a id="a-' + 
                                    $.infowindow.downloads.files[i].name + 
                                    '" class="dnl" href="#" title="' + 
                                    $.infowindow.downloads.files[i].title + 
                                    '"><img src="' + 
                                    $.infowindow.downloads.files[i].image + 
                                    '" /></a>'
                                );
                            }
                        }
                    }
                    
                    if ($.debug) console.log("downloadButtons",dnlBtn);

                    var thead = '<thead>' + 
                        '<tr>' + 
                        '<th>' + 
                        (dnlBtn.length ? '<span id="sdnlBtn">'+dnlBtn.join("&nbsp;")+'</span>' + '&nbsp;&nbsp;' : '') + 
                        (buttons.length ? '<span id="sshrBtn">'+buttons.join("&nbsp;")+'</span>' : '') + 
                        '</th>' + 
                        '<th style="text-align:right;"><a id="close-cross" href="#" title="Chiudi"><img src="img/close.png" /></a></th></tr>' + 
                        '<tr>' + 
                        '<th colspan="2" class="rossobc">' + props[geo[region].label] + '</th>' +
                        '</tr>' + 
                        '</thead>';

                    if ($.debug) console.log("Table header",thead);

                    var tfoot;
                    if ($.infowindow.hasOwnProperty('downloads') && $.infowindow.downloads.active) {
                        tfoot = '<tfoot>' + 
                            '<tr><td colspan="2" style="text-align:right;font-size: smaller;">' + 
                            ($.infowindow.downloads.license || '') + 
                            '</td></tr>' + 
                            '</tfoot>';
                    } else {
                        tfoot = '<tfoot></tfoot>';
                    }
                    
                    if ($.debug) console.log("Table footer",tfoot);

                    var tbody;
                    if ($.infowindow.hasOwnProperty('view') && $.infowindow.view.active && $.viewTypes.hasOwnProperty($.infowindow.view.type)) {
                        tbody = $.viewTypes[$.infowindow.view.type](props.data, $.infowindow.view.options);
                        if (!(tbody.indexOf('<tbody>') > -1)) {
                            tbody = '<tbody>' + tbody + '</tbody>';
                        }
                    } else {
                        tbody = '<tbody></tbody>';
                    }
                    
                    if ($.debug) console.log("Table body",tbody);

                    this._div.innerHTML += '<table class="zebra">' + thead + tbody + tfoot + '</table>';

                    if ($.debug) console.log("Table", this._div.innerHTML);

                    if ($.infowindow.hasOwnProperty('shareButtons') && $.infowindow.shareButtons.active && $.hasOwnProperty('urlShortener') && $.urlShortener.active) {
                        dtnj.shorten(btnEncUrl, $.urlShortener.prefix+md5(btnUrl), function(data) {
                            var btnEncUrl = data.shorturl,
                                buttons = [];

                            if ($.infowindow.shareButtons.hasOwnProperty('twitter') && $.infowindow.shareButtons.twitter.active) {
                                buttons.push('<a class="ssb" href="http://twitter.com/share?url=' + btnEncUrl + 
                                    '&via=' + $.infowindow.shareButtons.twitter.via + 
                                    '&text=' + encodeURIComponent(btnPlace + ' - ' + $.infowindow.shareButtons.twitter.text + ' ') + 
                                    '" target="_blank" title="'+btnTitle+' su Twitter"><img src="img/twitter.png" id="ssb-twitter"></a>'
                                );
                            }

                            if ($.infowindow.shareButtons.hasOwnProperty('facebook') && $.infowindow.shareButtons.facebook.active) {
                                buttons.push('<a class="ssb" href="http://www.facebook.com/sharer.php?u=' + btnEncUrl + 
                                    '" target="_blank" title="'+btnTitle+' su Facebook"><img src="img/facebook.png" id="ssb-facebook"></a>'
                                );
                            }

                            if ($.infowindow.shareButtons.hasOwnProperty('gplus') && $.infowindow.shareButtons.gplus.active) {
                                buttons.push('<a class="ssb" href="https://plus.google.com/share?url=' + btnEncUrl + 
                                    '" target="_blank" title="'+btnTitle+' su Google Plus"><img src="img/gplus.png" id="ssb-gplus"></a>'
                                );
                            }

                            if ($.infowindow.shareButtons.hasOwnProperty('linkedin') && $.infowindow.shareButtons.linkedin.active) {
                                buttons.push('<a class="ssb" href="http://www.linkedin.com/shareArticle?mini=true&url=' + btnEncUrl + 
                                    '" target="_blank" title="'+btnTitle+' su LinkedIn"><img src="img/linkedin.png" id="ssb-linkedin"></a>'
                                );
                            }
    
                            if ($.infowindow.shareButtons.hasOwnProperty('email') && $.infowindow.shareButtons.email.active) {
                                buttons.push('<a class="ssb" href="mailto:?Subject=' + encodeURIComponent($.infowindow.shareButtons.email.subject + ' | ' + btnPlace) + 
                                    '&Body=' + encodeURIComponent(btnPlace + ' - ' + $.infowindow.shareButtons.email.body + ': ') + btnEncUrl + 
                                    '" target="_blank" title="'+btnTitle+' per email"><img src="img/email.png" id="ssb-email"></a>'
                                );
                            }

                            if ($.infowindow.shareButtons.hasOwnProperty('permalink') && $.infowindow.shareButtons.permalink.active) {
                                buttons.push('<a class="ssb" href="' + btnUrl + 
                                    '" target="_blank" title="Permalink"><img src="img/link.png" id="ssb-link"></a>'
                                );
                            }
                            
                            d3.select("#sshrBtn").node().innerHTML = buttons.join("&nbsp;"); 

                        });
                    }
            
                    if ($.infowindow.hasOwnProperty('downloads') && $.infowindow.downloads.active) {
                        for (i=0; i<$.infowindow.downloads.files.length; i++) {
                            if ($.infowindow.downloads.files[i].active) {
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
                                            var dataset = $.infowindow.downloads.files[i].transform(res);
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
                            geojson.eachLayer(function(l) { l.selected = false; geojson.resetStyle(l); });
                            delete parameters.i;
                            if (embedControl && embedControl.isAdded) embedControl.removeFrom(map);
                            info.update();
                            return false;
                        });

                } else { // if (props) 
                        
                    d3.select(this._div).classed("closed", true);
                    if (parameters.md === 'mobile') {
                        map.dragging.enable();
                        this._div.innerHTML += $.infowindow.content.mobile;
                    } else {
                        this._div.innerHTML += $.infowindow.content.default;
                    }
                }
    	    };
                
            if (parameters.md === 'widget') {
                info.update();
            } else {
                info.addTo(map);
            }
        }
        
        if ($.debug) console.log("info",info);

        /*** ***/

        /*** Fullscreen ***/
        if ($.controls.hasOwnProperty('fullscreen') && $.controls.fullscreen.active) {
            if (parameters.md != 'widget' && parameters.md != 'embed') {
                fullscreen = L.control.fullscreen({title: $.controls.fullscreen.title}).addTo(map);
            }
        }
        
        if ($.debug) console.log("fullscreen",fullscreen);

        /*** ***/

        /*** Logo ***/
        if ($.controls.hasOwnProperty('logo') && $.controls.logo.active) {
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
                        img = L.DomUtil.create('img','logo',a);
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
        if ($.controls.hasOwnProperty('reset') && $.controls.reset.active) {
            reset = L.control({position: (parameters.md === 'mobile' ? 'bottomleft' : 'topright')});
            reset.onAdd = function(map) {
                var img = L.DomUtil.create('img', 'reset '+parameters.md);
                img.setAttribute('src', $.controls.reset.image);
                img.setAttribute('title', $.controls.reset.title);
                d3.select(img).on('click', function() {
                    loadData(parameters.ml);
                    map.fitBounds(mapBounds);
                });
                return img;
            };
            
            reset.addTo(map);
        }
        
        if ($.debug) console.log("reset",reset);

        /*** ***/

        /*** Pulsante di embed ***/
        if ($.controls.hasOwnProperty('embed') && $.controls.embed.active) {
            embedControl = L.control({position: (parameters.md === 'mobile' ? 'bottomleft' : 'topright')});
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

                if ($.hasOwnProperty('urlShortener') && $.urlShortener.active && $.controls.embed.shorturl) {
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

                if ($.controls.embed.hasOwnProperty('svg') && $.controls.embed.svg.active) {
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
                    if (p.hasOwnProperty(k)) {
                        d3.select(p[k]).select('input').on('focus', function() { this.select(); });
                    }
                }
                    
                return inputarea;
            };

            embed = L.control({position: (parameters.md === 'mobile' ? 'bottomleft' : 'topright')});
            
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
        if ($.controls.hasOwnProperty('screenshot') && $.controls.screenshot.active) {
            if (parameters.md != 'widget') {
                screenshot = L.control({position: (parameters.md === 'mobile' ? 'bottomleft' : 'topright')});
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
                                    offsetX: (typeof offsetX === 'number' ? offsetX : svgViewBox[0]), 
                                    offsetY: (typeof offsetY === 'number' ? offsetY : svgViewBox[1])
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
        if ($.controls.hasOwnProperty('detach') && $.controls.detach.active) {
            if (parameters.md === 'embed' || parameters.md === 'widget') {
                detach = L.control({position: 'topright'});
                detach.onAdd = function(map) {
                    var a = L.DomUtil.create('a','detach '+parameters.md),
                        img = L.DomUtil.create('img','detach',a);
                    a.setAttribute('href',Arg.url(parameters).replace(/&*md=[^&]*/,'').replace(/&{2,}/g,"&"));
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

        /*** Pulsanti di condivisione ***/
        if ($.controls.hasOwnProperty('socialButtons') && $.controls.socialButtons.active) {
            if (!parameters.md) {
                share = L.control({position: 'bottomleft'});
                share.onAdd = function(map) {
                    var div = L.DomUtil.create('div','share '+parameters.md),
                        twitter = '', facebook = '', gplus = '';
                    
                    div.setAttribute('id','buttons');
                    div.innerHTML = '';

                    if ($.controls.socialButtons.hasOwnProperty('twitter') && $.controls.socialButtons.twitter.active) {
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

                    if ($.controls.socialButtons.hasOwnProperty('facebook') && $.controls.socialButtons.facebook.active) {
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
                    
                    if ($.controls.socialButtons.hasOwnProperty('gplus') && $.controls.socialButtons.gplus.active) {
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

        /*** Creazione del menù dei livelli ***/
        menuLayers = $.geoLayers.filter(function(l) { return l.type != 'tile'; });
        if (menuLayers.length > 1) {
            menu = L.control({position: 'topleft'});
            menu.onAdd = function(map) {
                var nav = L.DomUtil.create('nav', 'menu-ui '+parameters.md);
                nav.setAttribute('id','menu-ui');
                if (parameters.md === 'widget') nav.setAttribute('style','display:none;');
                return nav;
            };
            
            menu.addTo(map);
            
            d3.select("nav#menu-ui").selectAll("a")
                .data(d3.keys(defaultGeo))
                .enter()
                .append("a")
                .attr("href", "#")
                .attr("id", function(d) { return d; })
                .classed("disabled", function(d) {
                    return !(geo.hasOwnProperty(d));
                })
                .on("click", function(d) {
                    if (geo.hasOwnProperty(d)) {
                        delete parameters.i;
                        if (embedControl && embedControl.isAdded) embedControl.removeFrom(map);
                        info.update();
                        loadData(d);
                    }
                })
                .text(function(d) { return d; });
        }
       
        if ($.debug) console.log("menuLayers",menuLayers);
        if ($.debug) console.log("menu",menu);

        /*** ***/

        /*** Funzione di ricerca del luogo ***/
        if ($.controls.hasOwnProperty('geocoder') && $.controls.geocoder.active) {
            if (parameters.md != 'widget' && parameters.md != 'mobile') {
                osmGeocoder = new L.Control.OSMGeocoder(
                    { 
                        collapsed: $.controls.geocoder.collapsed, 
                        position: 'topleft',
                        text: $.controls.geocoder.title,
                        bounds: mapBounds,
                        email: $.controls.geocoder.email,
                        callback: function (results) {
                            if (results.length) {
                                var bbox = results[0].boundingbox,
                                    first = new L.LatLng(bbox[0], bbox[2]),
                                    second = new L.LatLng(bbox[1], bbox[3]),
                                    bounds = new L.LatLngBounds([first, second]);
                                delete parameters.i;
                                if (embedControl && embedControl.isAdded) embedControl.removeFrom(map);
    		    	            info.update();
                                loadData($.controls.geocoder.layer);
                                this._map.fitBounds(bounds, { maxZoom: $.controls.geocoder.zoom });
                            }
                        }
                    }
                );
                    
                map.addControl(osmGeocoder);

                if ($.controls.geocoder.hasOwnProperty('autocomplete') && $.controls.geocoder.autocomplete.active) {
                    osmGeocoder._completely = completely(osmGeocoder._input);
                    
                    osmGeocoder._completely.onChange = function (text) {
                        osmGeocoder._completely.startFrom = text.lastIndexOf(' ')+1;
                        osmGeocoder._completely.repaint();
                    };

                    osmGeocoder._completely.input.maxLength = 50; // limit the max number of characters in the input text
                    
                    var acFile = $.controls.geocoder.autocomplete.url.call($.controls.geocoder.autocomplete, parameters.t || undefined);
                    d3[$.controls.geocoder.autocomplete.format](acFile, function(err,res) {
                        defaultGeo[$.controls.geocoder.layer].list = $.controls.geocoder.autocomplete.transform(res);
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

        /*** Legenda ***/
        if ($.hasOwnProperty('legend') && $.legend.active) {
		    legend = L.control({position: 'bottomleft'});
    	    legend.onAdd = function (map) {
                this._div = L.DomUtil.create('div', 'info legend '+parameters.md);
                this._div.innerHTML = (parameters.md != 'widget' ? '<h4>'+$.legend.title+'</h4>' : '');
		        return this._div;
            };
            legend.update = function(region) {
                var grades = data[region].ranges;
                this._div.innerHTML = (parameters.md != 'widget' ? '<h4 title="'+$.legend.description+'">'+$.legend.title+'</h4>' : '');
                for (var i=0; i<grades.length; i++) {
                    var color = (colorbrewer.Reds[grades.length] ? colorbrewer.Reds[grades.length][i] : colorbrewer.Reds[3][i]);
                    this._div.innerHTML += '<i title="Tra ' + 
                        grades[i].replace("-","e") + 
                        ' ' + $.legend.itemLabel+'" style="background:' + 
                        color + '"></i> ' + 
                        (parameters.md != 'widget' ? grades[i] : '') + '<br>';
                }
                if (parameters.md != 'widget') this._div.innerHTML += '<br>'+$.legend.description;
    		};
            legend.addTo(map);
        }
        
        if ($.debug) console.log("legend",legend);

        /*** ***/

        /*** Caricamento asincrono del pointsSet ***/
        if ($.pointsSet && $.pointsSet.active && $.pointsSet.resourceId) {
            var markersPath = $.pointsSet.url.call($.pointsSet);
            if ($.debug) console.log("markersPath",markersPath);
            d3[$.pointsSet.format](markersPath, function(err, markersjs) {
                if ($.debug) console.log("markers",arguments);
                var points = (markersjs ? $.pointsSet.transform(markersjs) : null);
                if (points) {
                    var clusters = new L.MarkerClusterGroup({ showCoverageOnHover: false }),
                        markers = [];
                    for (var i=0; i<points.length; i++) {
                        var marker = L.marker();
                        marker.setIcon(L.icon({iconUrl: $.pointsSet.icon, shadowUrl: $.pointsSet.shadow}));
                        marker.setLatLng(L.latLng(points[i][parameters.mr.lat],points[i][parameters.mr.lng]));
                        if (parameters.mr.hasOwnProperty('iw')) marker.bindPopup(points[i][parameters.mr.iw]);
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
            var palette = palette || 'Reds',
                binsNum = (colorbrewer[palette][bins.length-1] ? bins.length-1 : 3);
            for (var i=1; i<bins.length; i++) {
                if (d <= bins[i]) {
                    return colorbrewer[palette][binsNum][i-1];
                }
            }
        }

        function style(feature) {
            //if ($.debug) console.log("styleFunction",arguments);
            var region = feature.properties._layer,
                geoLayer = $.geoLayers.filter(function(l) { return (l.type === "vector" && l.schema.name === region); })[0],
                currentStyle = geoLayer.style.default;
            currentStyle.fillColor = getColor(feature.properties.data[data[region].value], data[region].bins, data[region].palette); // Dynamic parsing
	    	return currentStyle;
    	}

        /*** ***/

        /*** Gestione degli eventi ***/
        var geojson, label = new L.Label();

	    function highlightFeature(e) {
            //if ($.debug) console.log("highlightFeatureFunction",arguments);
            var layer = e.target,
                props = layer.feature.properties,
                region = layer.feature.properties._layer,
                geoLayer = $.geoLayers.filter(function(l) { return (l.type === "vector" && l.schema.name === region); })[0],
                highlightStyle = geoLayer.style.highlight;
                    
            if (!layer.selected) layer.setStyle(highlightStyle);
            if ($.hasOwnProperty('label') && $.label.active) {
                label.setContent(props[geo[parameters.dl].label]+'<br>' + $.label.text + ': '+props.data[data[parameters.dl].value]);
                label.setLatLng(layer.getBounds().getCenter());
                map.showLabel(label);
            }
	    }
                
        function resetHighlight(e) {
            //if ($.debug) console.log("resetHighlightFunction",arguments);
            var layer = e.target,
                region = layer.feature.properties._layer,
                geoLayer = $.geoLayers.filter(function(l) { return (l.type === "vector" && l.schema.name === region); })[0],
                defaultStyle = geoLayer.style.default;
            if (!layer.selected) geojson.eachLayer(function(l) { if (!l.selected) geojson.resetStyle(l); });
            if ($.hasOwnProperty('label') && $.label.active) label.close();
	    }

	    function openInfoWindow(e, layer) {
            if ($.debug) console.log("openInfoWindowFunction",arguments);
            var layer = layer || e.target,
                region = layer.feature.properties._layer,
                geoLayer = $.geoLayers.filter(function(l) { return (l.type === "vector" && l.schema.name === region); })[0],
                selectedStyle = geoLayer.style.selected;
            geojson.eachLayer(function(l) { l.selected = false; geojson.resetStyle(l); });
            layer.selected = true;
            layer.setStyle(selectedStyle);
            parameters.i = layer.feature.properties[geo[parameters.dl].id];
            if (embedControl && embedControl.isAdded) embedControl.removeFrom(map);
            info.update(layer.feature.properties);
            if (!L.Browser.ie && !L.Browser.opera) {
	    		layer.bringToFront();
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
            var numGeo = geo[region].resource.length,
                numData = data[region].resource.length,
                noData = true, numOkData = 0, numNoData = 0;
            for (var i=0; i<geo[region].resource.length; i++) {
                var geoID = geo[region].resource[i].properties[geo[region].id];
                for (var j=0; j<numData; j++) {
                    var dataID = data[region].resource[j][data[region].id];
                    if (dataID == geoID) {
                        numOkData++;
                        geo[region].resource[i].properties.data = data[region].resource[j];
                        for (var k in geo[region].resource[i].properties.data) {
                            if (geo[region].resource[i].properties.data.hasOwnProperty(k)) {
                                geo[region].resource[i].properties.data[k] = data[region].parse(geo[region].resource[i].properties.data[k]);
                            }
                        }
                        geo[region].resource[i].properties._layer = region;
                        noData = false;
                        break;
                    }
                }
                if (noData) {
                    numNoData++;
                    geo[region].resource.splice(i,1);
                    i--;
                } else {
                    noData = true;
                }
            }
        }

        // Binning della distribuzione dei dati
        function binData(region) {
            if ($.debug) console.log("binDataFunction",arguments);
            var geoLayer = $.geoLayers.filter(function(l) { return (l.type === "vector" && l.schema.name === region); })[0],
                dataSet = $.dataSets.filter(function(l) { return l.schema.layer === region; })[0];
            var serie = data[region].resource.map(function(el) { return el[data[region].value]; }); // Dynamic parsing
            var gs = new geostats(serie);
            data[region].bins = gs.getJenks(serie.length > dataSet.bins ? dataSet.bins : serie.length-1);
            data[region].ranges = gs.ranges;
            legend.update(region);
        }

        // Caricamento asincrono dei dati
        function loadData(region) { // region = regioni || province || comuni
            
            if ($.debug) console.log("loadDataFunction",arguments);
            
            var geoLayer = $.geoLayers.filter(function(l) { return (l.type === "vector" && l.schema.name === region); })[0],
                dataSet = $.dataSets.filter(function(l) { return l.schema.layer === region; })[0],
                geoPath, dataPath, markersPath, q;
            
            d3.selectAll("nav#menu-ui a").classed("active", false);
            d3.select("nav#menu-ui a#"+region).classed("active", true);
            parameters.dl = region;
            geojson.clearLayers();

            if ($.debug) console.log("geoLayer",geoLayer);
            if ($.debug) console.log("dataSet",dataSet);

            if (!geo[region].resource || !data[region].resource) { // Second condition in next loop
                
                map.spin(true);
                
                q = queue();

                geoPath = geoLayer.url.call(geoLayer, region, (parameters.t ? parameters.tl : undefined), parameters.t || undefined);
                q.defer(d3[geoLayer.format], geoPath); // Geojson
                if ($.debug) console.log("geoPath",geoPath);
                
                // It will be a loop on data linked to the same geo layer
                // Store data number for later in await callback
                dataPath = dataSet.url.call(dataSet, region, (parameters.t ? defaultData[parameters.tl].id : undefined), parameters.t || undefined);
                q.defer(d3[dataSet.format], dataPath); // Dati -> Loop with condition
                if ($.debug) console.log("dataPath",dataPath);

                q.await(function(err, geojs, datajs, markersjs) { // Access results by arguments
                    if ($.debug) console.log("await",arguments);
                    
                    geo[region].resource = geoLayer.transform(geojs);
                    data[region].resource = dataSet.transform(datajs); // Loop in object filtering data linked to current region

                    map.spin(false);
                    
                    /*if (region == 'comuni') {
                        JSTERS['comuni'] = geo['comuni'].resource.map(function(el) { var arr = {}; arr[geo['regioni'].id] = el.properties[geo['regioni'].id]; arr[geo['province'].id] = el.properties[geo['province'].id]; arr[geo['comuni'].id] = el.properties[geo['comuni'].id]; arr[geo['comuni'].label] = el.properties[geo['comuni'].label]; return arr; });
                    }*/
                    
                    joinData(region);
                    binData(region);
                    
	    	        geojson.addData(geo[region].resource);

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
                geojson.addData(geo[region].resource);
                delete parameters.i;
                if (embedControl && embedControl.isAdded) embedControl.removeFrom(map);
                info.update();
            }
        }
        /*** ***/

        /*** Inizializzazione ***/
        setTimeout(function () {
            map.spin(false);
            loadData(parameters.dl);
        }, 3000);
        /*** ***/
    });
})(mapConfig);
