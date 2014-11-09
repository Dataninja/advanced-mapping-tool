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
        for (i=0; i<$.dataSets.length; i++) {
            sourceDef = $.dataSources[$.dataSets[i].source],
            typeDef = $.dataTypes[$.dataSets[i].type];
            for (k in sourceDef) {
                if (sourceDef.hasOwnProperty(k) && !$.dataSets[i].hasOwnProperty(k)) {
                    $.dataSets[i][k] = sourceDef[k];
                }
            }
            for (k in typeDef) {
                if (typeDef.hasOwnProperty(k) && !$.dataSets[i].hasOwnProperty(k)) {
                    $.dataSets[i][k] = typeDef[k];
                }
            }
        }

        sourceDef = $.dataSources[$.pointsSet.source];
        for (k in sourceDef) {
            if (sourceDef.hasOwnProperty(k) && !$.pointsSet.hasOwnProperty(k)) {
                $.pointsSet[k] = sourceDef[k];
            }
        }

        for (i=0; i<$.geoLayers.length; i++) {
            sourceDef = $.geoSources[$.geoLayers[i].source],
            typeDef = $.geoTypes[$.geoLayers[i].type];
            for (k in sourceDef) {
                if (sourceDef.hasOwnProperty(k) && !$.geoLayers[i].hasOwnProperty(k)) {
                    $.geoLayers[i][k] = sourceDef[k];
                }
            }
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
        }

        if ($.debug) console.log("$",$);

        // Url shortener initialization
        if ($.urlShortener.active) {
            dtnj = yourls.connect($.urlShortener.uri+$.urlShortener.path, { signature: $.urlShortener.signature });
        }

        if ($.debug) console.log("dtnj",dtnj);

        /*** Geo layers initialization ***/
        for (i=0; i<$.geoLayers.length; i++) {
            if ($.geoLayers[i].type === 'vector') {
                defaultGeo[$.geoLayers[i].schema.name] = {
                    id: $.geoLayers[i].schema.id,
                    label: $.geoLayers[i].schema.label,
                    inSelectorControl: $.geoLayers[i].inSelectorControl,
                    resource: null,
                    list: []
                };
            }
        }

        if ($.debug) console.log("defaultGeo",defaultGeo);

        /*** Data sets initialization ***/
        for (i=0; i<$.dataSets.length; i++) {
            defaultData[$.dataSets[i].schema.layer] = {
                id: $.dataSets[i].schema.id,
                label: $.dataSets[i].schema.label,
                value: $.dataSets[i].schema.value,
                resourceId: $.dataSets[i].resourceId,
                resource: null,
                markers: null,
                bins: [],
                ranges: []
            };
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
                t: [int], // Codice istat del territorio centrato e con infowindow aperta (si riferisce a tl) -- TERRITORY
                i: [int] // Codice istat del territorio con infowindow aperta -- INFO
            }
        */
        
        parameters.ls = parameters.ls || d3.keys(defaultGeo); // Livelli caricati (default: tutti)
        parameters.ml = parameters.ls[0]; // Livello caricato più alto (PRIVATO)
        parameters.dl = parameters.dl || parameters.ml; // Livello visibile al caricamento
        parameters.md = parameters.md || (head.mobile ? 'mobile' : ''); // Layout
        d3.select('body').classed(parameters.md,true); // Tengo traccia del layout come classe del body

        if (parameters.t) { // Focus su un territorio (codice istat che si riferisce a tl)
            parameters.tl = parameters.tl || parameters.ml; // Livello a cui si riferisce t
            parameters.ml = parameters.ls[parameters.ls.indexOf(parameters.tl)+1]; // Si riferisce ora al livello più alto caricato
            if (parameters.ls.indexOf(parameters.dl) < parameters.ls.indexOf(parameters.tl)+1) {
                parameters.dl = parameters.ml;
            }
        }
        
        if (parameters.mr && parameters.mr.hasOwnProperty('rid')) {
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
            if (tileLayers[i].source === 'remote') {
                L.tileLayer(tileLayers[i].uri+tileLayers[i].path, tileLayers[i].style).addTo(map);
            }
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
        
        if ($.debug) console.log("info",info);

        info.update = function (props) {
            var that = this;
            this._div.innerHTML = '';
            if (props) {
                d3.select(this._div).classed("closed", false);
                if (parameters.md === 'mobile') map.dragging.disable();
                var delim = agnes.rowDelimiter(),
                    today = new Date(),
                    stoday = d3.time.format('%Y%m%d')(today),
                    territorio = parameters.dl,
                    filterKey = data[territorio].id,
                    filterValue = props[geo[territorio].id],
                    imResId = 'e5b4d63a-e1e8-40a3-acec-1d351f03ee56',
                    azResId = '8b7e12f1-6484-47f0-9cf6-88b446297dbc';

                var btnTitle = 'Condividi la situazione' + (territorio == 'regioni' ? ' in ' : ' a ') + props[geo[territorio].label],
                    btnUrl = 'http://' + location.hostname + Arg.url(parameters).replace(/&*md=[^&]*/,'').replace(/&{2,}/g,"&"),
                    btnEncUrl = 'http://' + location.hostname + encodeURIComponent(Arg.url(parameters).replace(/&*md=[^&]*/,'').replace(/&{2,}/g,"&")),
                    btnPlace = props[geo[territorio].label];
                    
                var buttons = [
                    '<a class="ssb" href="http://twitter.com/share?url=' + btnEncUrl + 
                    '&via=confiscatibene' + 
                    '&text=' + encodeURIComponent(btnPlace + ', immobili e aziende #confiscatibene ') + 
                    '" target="_blank" title="'+btnTitle+' su Twitter"><img src="img/twitter.png" id="ssb-twitter"></a>',
                    '<a class="ssb" href="http://www.facebook.com/sharer.php?u=' + btnEncUrl + 
                    '" target="_blank" title="'+btnTitle+' su Facebook"><img src="img/facebook.png" id="ssb-facebook"></a>',
                    '<a class="ssb" href="https://plus.google.com/share?url=' + btnEncUrl + 
                    '" target="_blank" title="'+btnTitle+' su Google Plus"><img src="img/gplus.png" id="ssb-gplus"></a>',
                    '<a class="ssb" href="http://www.linkedin.com/shareArticle?mini=true&url=' + btnEncUrl + 
                    '" target="_blank" title="'+btnTitle+' su LinkedIn"><img src="img/linkedin.png" id="ssb-linkedin"></a>',
                    '<a class="ssb" href="mailto:?Subject=' + encodeURIComponent('Confiscati Bene | ' + btnPlace) + 
                    '&Body=' + encodeURIComponent(btnPlace + ', gli immobili e le aziende #confiscatibene: ') + btnEncUrl + 
                    '" target="_blank" title="'+btnTitle+' per email"><img src="img/email.png" id="ssb-email"></a>',
                    '<a class="ssb" href="' + btnUrl + 
                    '" target="_blank" title="Permalink"><img src="img/link.png" id="ssb-link"></a>'
                ];

                var dnlBtn = [
                    '<a id="a-immobili" class="dnl" href="#" title="Scarica l\'elenco degli immobili"><img src="img/house109-dnl.png" /></a>',
                    '<a id="a-aziende" class="dnl" href="#" title="Scarica l\'elenco delle aziende"><img src="img/factory6-dnl.png" /></a>'
                ];

                var table = '<table class="zebra">' + 
                    '<thead>' + 
                    '<tr>' + 
                    '<th>' + '<span id="sdnlBtn">'+dnlBtn.join("&nbsp;")+'</span>' + "&nbsp;&nbsp;" + '<span id="sshrBtn">'+buttons.join("&nbsp;")+'</span>' + '</th>' + 
                    '<th style="text-align:right;"><a id="close-cross" href="#" title="Chiudi"><img src="img/close.png" /></a></th></tr>' + 
                    '<tr>' + 
                    '<th colspan="2" class="rossobc">' + props[geo[territorio].label] + '</th>' +
                    '</tr>' + 
                    '</thead>' + 
                    '<tfoot>' + 
                    '<tr><td colspan="2" style="text-align:right;font-size: smaller;">' + 
                    'Creative Commons Attribution <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank">CC-BY 4.0 International</a>.' + 
                    '</td></tr>' + 
                    '</tfoot>' + 
                    '<tbody>';

                for (var k in props.data) {
                    if (props.data.hasOwnProperty(k) && props.data[k] != '0' && k.charAt(0) == k.charAt(0).toUpperCase() && k.slice(0,2) != "Id") {
                        table += '<tr>' + 
                            '<td>' + (k.indexOf('Totale') > -1 ? '<b>'+k+'</b>' : k) + '</td>' +
                            '<td>' + (k.indexOf('Totale') > -1 ? '<b>'+parseInt(props.data[k])+'</b>' : (parseInt(props.data[k]) || props.data[k])) + '</td>' + 
                            '</tr>';
                    }
                }

                table += '</tbody></table>';

                this._div.innerHTML += table;

                if ($.urlShortener.active) {
                    dtnj.shorten(btnEncUrl, 'confiscatibene-'+md5(btnUrl), function(data) {
                        var btnEncUrl = data.shorturl,
                            buttons = [
                                '<a class="ssb" href="http://twitter.com/share?url=' + btnEncUrl + 
                                '&via=confiscatibene' + 
                                '&text=' + encodeURIComponent(btnPlace + ', immobili e aziende #confiscatibene ') + 
                                '" target="_blank" title="'+btnTitle+' su Twitter"><img src="img/twitter.png" id="ssb-twitter"></a>',
                                '<a class="ssb" href="http://www.facebook.com/sharer.php?u=' + btnEncUrl + 
                                '" target="_blank" title="'+btnTitle+' su Facebook"><img src="img/facebook.png" id="ssb-facebook"></a>',
                                '<a class="ssb" href="https://plus.google.com/share?url=' + btnEncUrl + 
                                '" target="_blank" title="'+btnTitle+' su Google Plus"><img src="img/gplus.png" id="ssb-gplus"></a>',
                                '<a class="ssb" href="http://www.linkedin.com/shareArticle?mini=true&url=' + btnEncUrl + 
                                '" target="_blank" title="'+btnTitle+' su LinkedIn"><img src="img/linkedin.png" id="ssb-linkedin"></a>',
                                '<a class="ssb" href="mailto:?Subject=' + encodeURIComponent('Confiscati Bene | ' + btnPlace) + 
                                '&Body=' + encodeURIComponent(btnPlace + ', gli immobili e le aziende #confiscatibene: ') + btnEncUrl + 
                                '" target="_blank" title="'+btnTitle+' per email"><img src="img/email.png" id="ssb-email"></a>',
                                '<a class="ssb" href="' + btnUrl + 
                                '" target="_blank" title="Permalink"><img src="img/link.png" id="ssb-link"></a>'
                            ];
                        d3.select("#sshrBtn").node().innerHTML = buttons.join("&nbsp;"); 
                    });
                }

                var imPath = apiPath + 
                        "?resource_id=" + imResId + "&limit=5000&filters[" + 
                        filterKey + 
                        "]=" + 
                        filterValue;
                
                d3.select('a#a-immobili').on("click", function() {
                    var that = this;
                    d3.json(imPath, function(err,res) {
                        if (res.result.records.length > 0) {
                            var csv = agnes.jsonToCsv(res.result.records, delim),
                                blob = new Blob([csv], {type: "text/csv;charset=utf-8"}),
                                filename = stoday + '_confiscatibene_immobili_' + filterKey + '-' + filterValue + '.csv';
                            saveAs(blob, filename);
                        } else {
                            alert("No data!");
                        }
                    });
                });

                var azPath = apiPath + 
                        "?resource_id=" + azResId + "&limit=5000&filters[" + 
                        filterKey + 
                        "]=" + 
                        filterValue;
                        
                d3.select('a#a-aziende').on("click", function() {
                    var that = this;
                    d3.json(azPath, function(err,res) {
                        if (res.result.records.length > 0) {
                            var csv = agnes.jsonToCsv(res.result.records, delim),
                                blob = new Blob([csv], {type: "text/csv;charset=utf-8"}),
                                filename = stoday + '_confiscatibene_aziende_' + filterKey + '-' + filterValue + '.csv';
                            saveAs(blob, filename);
                        } else {
                            alert("No data!");
                        }
                    });
                });
                
                d3.select(this._div).select("a#close-cross")
                    .on("click", function() {
                        geojson.eachLayer(function(l) { l.highlight = false; geojson.resetStyle(l); });
                        delete parameters.i;
                        if (embedControl.isAdded) embedControl.removeFrom(map);
                        info.update();
                        return false;
                    });

            } else { // if (props) 
                        
                d3.select(this._div).classed("closed", true);
                if (parameters.md === 'mobile') {
                    map.dragging.enable();
                    this._div.innerHTML += '<a href="mailto:info@confiscatibene.it" target="_blank" style="margin-right: 30px;">Info</a>';
                } else {
                    this._div.innerHTML += '' + 
                        '<p>La mappa mostra il numero di beni confiscati per tutti i territori amministrativi italiani, secondo i dati ufficiali dell\'<a href="http://www.benisequestraticonfiscati.it" target="_blank">ANBSC</a> (sono esclusi i beni non confiscati in via autonoma). La corrispondenza tra il gradiente di colore e il numero complessivo di beni confiscati è dato nella legenda in basso a sinistra.</p>' + 
                        '<p>Mediante il selettore in alto a sinistra si possono caricare e visualizzare ulteriori livelli (regioni, province, comuni).</p>' +
                        '<p>Principali funzioni della mappa: <ul>' + 
                        '<li>cerca i dati relativi al tuo territorio cliccando sulla lente e inserendo il nome di un comune;</li>' + 
                        '<li>clicca sul territorio per visualizzare i dati in dettaglio, la composizione dei beni e per scaricarne la lista completa;</li>' + 
                        '<li>includi la vista corrente della mappa sul tuo sito con il codice di embed o scaricane uno screenshot (pulsanti in alto a destra).</li>' +
                        '</ul></p>' +
                        '<p>Tieniti aggiornato sul progetto visitando il sito ufficiale di <a href="http://www.confiscatibene.it" target="_blank">Confiscati Bene</a> o seguendo l\'account Twitter <a href="https://twitter.com/confiscatibene" target="_blank">@confiscatibene</a>, puoi anche scriverci all\'indirizzo <a href="mailto:info@confiscatibene.it" target="_blank">info@confiscatibene.it</a>.</p>'
                }
            }
	    };
                
        if (parameters.md === 'widget') {
            info.update();
        } else {
            info.addTo(map);
        }
        
        /*** ***/

        /*** Fullscreen ***/
        if ($.controls.fullscreen.active) {
            if (parameters.md != 'widget' && parameters.md != 'embed') {
                fullscreen = L.control.fullscreen({title: $.controls.fullscreen.title}).addTo(map);
            }
        }
        
        if ($.debug) console.log("fullscreen",fullscreen);

        /*** ***/

        /*** Logo ***/
        if ($.controls.logo.active) {
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
        if ($.controls.reset.active) {
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
        if ($.controls.embed.active) {
            embedControl = L.control({position: (parameters.md === 'mobile' ? 'bottomleft' : 'topright')});
            embedControl.isAdded = false;
            embedControl.onRemove = function(map) { this.isAdded = false; }
            embedControl.onAdd = function(map) {
                this.isAdded = true;
                var textinput = {},
                    p = {},
                    label = {},
                    oldMd = parameters.md;

                var inputarea = L.DomUtil.create('div', 'info embed-inputarea'),
                    url = 'http://' + location.hostname + Arg.url(parameters).replace(/&*md=[^&]*/,'').replace(/&{2,}/g,"&"),
                    encUrl = 'http://' + location.hostname + encodeURIComponent(Arg.url(parameters).replace(/&*md=[^&]*/,'').replace(/&{2,}/g,"&"));

                if ($.controls.embed.permalink) {
                    p['permalink'] = L.DomUtil.create('p', 'permalink', inputarea);
                    p['permalink'].innerHTML = '' + 
                        '<label for="embed-permalink" title="Clicca per selezionare">Permalink:</label>&nbsp;' + 
                        '<input type="text" id="embed-permalink" value="' + url + '" readonly></input>';
                }

                if ($.urlShortener.active && $.controls.embed.shorturl) {
                    p['shorturl'] = L.DomUtil.create('p', 'shorturl', inputarea);
                    p['shorturl'].innerHTML = '' + 
                        '<label for="embed-shorturl" title="Clicca per selezionare">Short URL:</label>&nbsp;' + 
                        '<input type="text" id="embed-shorturl" value="Not available..." disabled readonly></input>';
                    dtnj.shorten(encUrl, 'confiscatibene-'+md5(url), function(data) {
                        d3.select("input#embed-shorturl").attr("value",data.shorturl).attr("disabled",null);
                    });
                }

                parameters.md = 'embed';
                if ($.controls.embed.iframe) {
                    p['iframe'] = L.DomUtil.create('p', 'iframe', inputarea);
                    p['iframe'].innerHTML = '' + 
                        '<label for="embed-iframe" title="Clicca per selezionare">Embed in post/page:</label>&nbsp;' + 
                        '<input type="text" id="embed-iframe" value="' + 
                        '<iframe src=&quot;' + url + '&quot; frameborder=&quot;0&quot; allowtransparency=&quot;true&quot; ' +
                        'allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen ' +
                        'width=&quot;100%&quot; height=&quot;700&quot;></iframe>' + 
                        '" readonly></input>';
                }

                parameters.md = 'widget';
                if ($.controls.embed.widget) {
                    p['widget'] = L.DomUtil.create('p', 'widget', inputarea);
                    p['widget'].innerHTML = '' + 
                        '<label for="embed-widget" title="Clicca per selezionare">Embed in sidebar:</label>&nbsp;' + 
                        '<input type="text" id="embed-widget" value="' + 
                        '<iframe src=&quot;' + url + '&quot; frameborder=&quot;0&quot; allowtransparency=&quot;true&quot; ' +
                        'allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen ' +
                        'width=&quot;100%&quot; height=&quot;755&quot;></iframe>' + 
                        '" readonly></input>';
                }

                parameters.md = 'embed';
                if ($.controls.embed.shortcode) {
                    p['shortcode'] = L.DomUtil.create('p', 'shortcode', inputarea);
                    p['shortcode'].innerHTML = '' + 
                        '<label for="embed-shortcode" title="Clicca per selezionare">WP Shortcode (<a href="https://github.com/Dataninja/wp-cbmap-shortcode" target="_blank">?</a>):</label>&nbsp;' +
                        '<input type="text" id="embed-shortcode" value="' +
                        '[cbmap ' + decodeURIComponent(Arg.url(parameters).replace(/^[^?]+\?/,"").replace(/&/g," ")) + ']' + 
                        '" readonly></input>';
                }

                parameters.md = oldMd;
                if ($.controls.embed.svg) {
                    p['svg'] = L.DomUtil.create('p', 'svg', inputarea);
                    p['svg'].innerHTML = '' + 
                        '<label for="embed-svg" title="Copia/incolla il codice o scaricalo cliccando sull\'immagine">Scalable Vector Graphics:</label>&nbsp;' +
                        '<textarea id="embed-svg" readonly>' +
                        d3.select(".leaflet-overlay-pane")[0][0].innerHTML.replace(/\>/g,">\n") + 
                        '</textarea>&nbsp;' + 
                        '<img src="img/svg.png" title="Scarica l\'immagine in SVG">';
                    d3.select(p['svg']).select("img").on("click", function() {
                        var blob = new Blob([d3.select(".leaflet-overlay-pane")[0][0].innerHTML.replace(/\>/g,">\n")], {type: "image/svg+xml;charset=utf-8"}),
                            filename = 'confiscatibene_map.svg';
                        saveAs(blob, filename);
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
                        if (embedControl.isAdded) embedControl.removeFrom(map);
                    }
                });
                return img;
            };

            embed.addTo(map);
        }
            
        if ($.debug) console.log("embed",embed);

        /*** ***/

        /*** Screenshot map ***/
        if ($.controls.screenshot.active) {
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
                                    offsetX = $.controls.screenshot.offsetX,
                                    offsetY = $.controls.screenshot.offsetY;
                                canvg(canvas, svg.node().outerHTML, {
                                    ignoreMouse: $.controls.screenshot.ignoreMouse, 
                                    ignoreAnimation: $.controls.screenshot.ignoreAnimation, 
                                    ignoreDimensions: $.controls.screenshot.ignoreDimensions, 
                                    ignoreClear: $.controls.screenshot.ignoreClear, 
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
        if ($.controls.detach.active) {
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
        if ($.controls.shareButtons.active) {
            if (!parameters.md) {
                share = L.control({position: 'bottomleft'});
                share.onAdd = function(map) {
                    var div = L.DomUtil.create('div','share '+parameters.md),
                        twitter = '', facebook = '', gplus = '';
                    
                    div.setAttribute('id','buttons');
                    div.innerHTML = '';

                    if ($.controls.shareButtons.twitter.active) {
                        twitter = '<a ' + 
                            'href="https://twitter.com/share" ' + 
                            'class="twitter-share-button" ' + 
                            'data-url="http://' + location.hostname + location.pathname + '" ' + 
                            'data-via="' + $.controls.shareButtons.twitter.via + '" ' + 
                            'data-lang="' + $.controls.shareButtons.twitter.lang + '" ' + 
                            'data-related="' + $.controls.shareButtons.twitter.related + '" ' + 
                            'data-hashtags="' + $.controls.shareButtons.twitter.hashtags + '" ' + 
                            'data-count="' + $.controls.shareButtons.twitter.count + '"' + 
                            '>' + $.controls.shareButtons.twitter.text + '</a>';
                        div.innerHTML += twitter;
                        head.load("https://platform.twitter.com/widgets.js");
                    }

                    if ($.controls.shareButtons.facebook.active) {
                        facebook = '<div ' + 
                            'class="fb-like" ' + 
                            'style="overflow:hidden;" ' + 
                            'data-href="http://' + location.hostname + location.pathname + '" ' + 
                            'data-layout="' + $.controls.shareButtons.facebook.layout + '" ' + 
                            'data-action="' + $.controls.shareButtons.facebook.action + '" ' + 
                            'data-show-faces="' + $.controls.shareButtons.facebook["show-faces"] + '" ' + 
                            'data-share="' + $.controls.shareButtons.facebook.share + '">' + 
                            '</div>';
                        div.innerHTML += facebook;
                        head.load("http://connect.facebook.net/it_IT/sdk.js#xfbml=1&appId=" + $.controls.shareButtons.facebook.appId + "&version=v2.0");
                    }
                    
                    if ($.controls.shareButtons.gplus.active) {
                        gplus = '<div ' + 
                            'class="g-plusone" ' + 
                            'data-size="' + $.controls.shareButtons.gplus.size + '" ' + 
                            'data-href="http://' + location.hostname + location.pathname + '" ' + 
                            'data-annotation="' + $.controls.shareButtons.gplus.annotation + '"' + 
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
        menuLayers = $.geoLayers.filter(function(l) { return l.inSelectorControl; });
        if (menuLayers.length) {
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
                    return !(geo.hasOwnProperty(d) && geo[d].inSelectorControl);
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
        if ($.controls.geocoder.active) {
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

                if ($.controls.geocoder.autocomplete.active) {
                    osmGeocoder._completely = completely(osmGeocoder._input);
                    
                    osmGeocoder._completely.onChange = function (text) {
                        osmGeocoder._completely.startFrom = text.lastIndexOf(' ')+1;
                        osmGeocoder._completely.repaint();
                    };

                    osmGeocoder._completely.input.maxLength = 50; // limit the max number of characters in the input text
                    
                    var acFile;
                    if (parameters.t) {
                        acFile = $.controls.geocoder.autocomplete.path + 
                            $.controls.geocoder.autocomplete.prefix + 
                            parameters.t + 
                            '.' + $.controls.geocoder.autocomplete.format;
                    } else {
                        acFile = $.controls.geocoder.autocomplete.path + 
                            $.controls.geocoder.autocomplete.filename + 
                            '.' + $.controls.geocoder.autocomplete.format;
                    }
                     
                    d3.json(acFile, function(err,data) {
                        defaultGeo[$.controls.geocoder.layer].list = data;
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
        if ($.legend.active) {
		    legend = L.control({position: 'bottomleft'});
    	    legend.onAdd = function (map) {
                this._div = L.DomUtil.create('div', 'info legend '+parameters.md);
                this._div.innerHTML = (parameters.md != 'widget' ? '<h4>'+$.legend.title+'</h4>' : '');
		        return this._div;
            };
            legend.update = function(territorio) {
                var grades = data[territorio].ranges;
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

        /*** Stile dei livelli ***/
        var defaultStyle = {
            weight: 0.5,
            opacity: 1,
            color: 'white',
            fillOpacity: 0.7,
            fillColor: 'none'
        };

        var highlightStyle = {
            weight: 2,
            color: '#666'
        };

        function getColor(d, bins, palette) {
            if ($.debug) console.log("getColorFunction",arguments);
            var palette = palette || 'Reds',
                binsNum = (colorbrewer[palette][bins.length-1] ? bins.length-1 : 3);
            for (var i=1; i<bins.length; i++) {
                if (d <= bins[i]) {
                    return colorbrewer[palette][binsNum][i-1];
                }
            }
        }

        function style(feature, l) {
            if ($.debug) console.log("styleFunction",arguments);
            var territorio = parameters.dl,
                currentStyle = defaultStyle;
            currentStyle.fillColor = getColor(parseInt(feature.properties.data[data[territorio].value]), data[territorio].bins);
	    	return currentStyle;
    	}

        /*** ***/

        /*** Gestione degli eventi ***/
        var geojson, label = new L.Label();

	    function highlightFeature(e) {
            if ($.debug) console.log("highlightFeatureFunction",arguments);
            var layer = e.target,
                props = layer.feature.properties;
                    
            label.setContent(props[geo[parameters.dl].label]+'<br>Beni confiscati: '+props.data[data[parameters.dl].value]);
            label.setLatLng(layer.getBounds().getCenter());
            map.showLabel(label);
	    }
                
        function resetHighlight(e) {
            if ($.debug) console.log("resetHighlightFunction",arguments);
            var layer = e.target;
            label.close();
	    }

	    function openInfoWindow(e, layer) {
            if ($.debug) console.log("openInfoWindowFunction",arguments);
            var layer = layer || e.target;
            geojson.eachLayer(function(l) { l.highlight = false; geojson.resetStyle(l); });
            layer.highlight = true;
            layer.setStyle(highlightStyle);
            parameters.i = layer.feature.properties[geo[parameters.dl].id];
            if (embedControl && embedControl.isAdded) embedControl.removeFrom(map);
            info.update(layer.feature.properties);
            if (!L.Browser.ie && !L.Browser.opera) {
	    		layer.bringToFront();
	        }
        }

        function onEachFeature(feature, layer) {
            if ($.debug) console.log("onEachFeatureFunction",arguments);
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
        function joinData(territorio) {
            if ($.debug) console.log("joinDataFunction",arguments);
            var numGeo = geo[territorio].resource.features.length,
                numData = data[territorio].resource.result.records.length,
                noData = true, numOkData = 0, numNoData = 0;
            for (var i=0; i<geo[territorio].resource.features.length; i++) {
                var geoID = geo[territorio].resource.features[i].properties[geo[territorio].id];
                for (var j=0; j<numData; j++) {
                    var dataID = data[territorio].resource.result.records[j][data[territorio].id];
                    if (dataID == geoID) {
                        numOkData++;
                        geo[territorio].resource.features[i].properties.data = data[territorio].resource.result.records[j];
                        noData = false;
                        break;
                    }
                }
                if (noData) {
                    numNoData++;
                    geo[territorio].resource.features.splice(i,1);
                    i--;
                } else {
                    noData = true;
                }
            }
        }

        // Binning della distribuzione dei dati
        function binData(territorio) {
            if ($.debug) console.log("binDataFunction",arguments);
            var geoLayer = $.geoLayers.filter(function(l) { return (l.type === "vector" && l.schema.name === territorio); })[0],
                dataSet = $.dataSets.filter(function(l) { return l.schema.layer === territorio; })[0];
            var serie = data[territorio].resource.result.records.map(function(el) { return parseInt(el[data[territorio].value]); });
            var gs = new geostats(serie);
            data[territorio].bins = gs.getJenks(serie.length > dataSet.bins ? dataSet.bins : serie.length-1);
            data[territorio].ranges = gs.ranges;
            legend.update(territorio);
        }

        // Caricamento asincrono dei dati
        function loadData(territorio) { // territorio = regioni || province || comuni
            
            if ($.debug) console.log("loadDataFunction",arguments);
            
            var geoLayer = $.geoLayers.filter(function(l) { return (l.type === "vector" && l.schema.name === territorio); })[0],
                dataSet = $.dataSets.filter(function(l) { return l.schema.layer === territorio; })[0];
            
            d3.selectAll("nav#menu-ui a").classed("active", false);
            d3.select("nav#menu-ui a#"+territorio).classed("active", true);
            parameters.dl = territorio;
            geojson.clearLayers();

            if ($.debug) console.log("geoLayer",geoLayer);
            if ($.debug) console.log("dataSet",dataSet);

            if (!geo[territorio].resource || !data[territorio].resource) {
                var limit = 5000,
                    geoPath = geoLayer.path + 
                        (parameters.t ? (territorio + '-' + parameters.tl + '-' + parameters.t) : territorio) + 
                        '.' + geoLayer.format,
                    dataPath = dataSet.path + 
                        '?resource_id=' + dataSet.resourceId + 
                        (parameters.t ? ('&filters[' + defaultData[parameters.tl].id + ']=' + parameters.t) : ""),
                    q = queue();
                map.spin(true);

                if ($.debug) console.log("geoPath",geoPath);
                if ($.debug) console.log("dataPath",dataPath);

                q.defer(d3.json, geoPath); // Geojson
                q.defer(d3.json, dataPath + '&limit=' + limit); // Dati

                if (parameters.mr && parameters.mr.hasOwnProperty("rid")) {
                    var markersPath = $.pointsSet.path +
                        '?resource_id=' + parameters.mr.rid; 
                    if ($.debug) console.log("markersPath",markersPath);
                    q.defer(d3.json, markersPath + '&limit=' + limit);
                }

                q.await(function(err, geojs, datajs, markersjs) {
                    if ($.debug) console.log("await",arguments);
                    geo[territorio].resource = geojs;
                    data[territorio].resource = datajs;
                    data[territorio].markers = markersjs || null;
                    map.spin(false);
                    /*if (territorio == 'comuni') {
                        JSTERS['comuni'] = geo['comuni'].resource.features.map(function(el) { var arr = {}; arr[geo['regioni'].id] = el.properties[geo['regioni'].id]; arr[geo['province'].id] = el.properties[geo['province'].id]; arr[geo['comuni'].id] = el.properties[geo['comuni'].id]; arr[geo['comuni'].label] = el.properties[geo['comuni'].label]; return arr; });
                    }*/
                    joinData(territorio);
                    binData(territorio);
	    	        geojson.addData(geo[territorio].resource);
                    if (!svgViewBox) svgViewBox = d3.select(".leaflet-overlay-pane svg").attr("viewBox").split(" ");
                    if (parameters.t) { map.fitBounds(geojson.getBounds()); }
                    if (parameters.i) {
                        geojson.eachLayer(function(l) { 
                            if (l.feature.properties[geo[territorio].id] == parameters.i) {
                                openInfoWindow(null, l);
                            }
                        });
                    }
                    if (data[territorio].markers) {
                        var clusters = new L.MarkerClusterGroup({ showCoverageOnHover: false }),
                            markers = [],
                            points = data[territorio].markers.result.records;
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
            } else {
                geojson.addData(geo[territorio].resource);
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
