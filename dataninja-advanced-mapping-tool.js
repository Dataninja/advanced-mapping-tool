            head.ready(function() {

                var apiPath = '/api/confiscatibene/action/datastore/search.json',
                    dtnjPath = '/api/dtnj/yourls-api.php', 
                    dtnj = yourls.connect(dtnjPath, { signature: 'efe758b8d3' }),
                    svgViewBox;
                
                /*** Gestione dei dati ***/
                var defaultGeo = {
                        'regioni': { id: 'COD_REG', label: 'NOME_REG', resource: null, list: [] },
                        'province': { id: 'COD_PRO', label: 'NOME_PRO', resource: null, list: [] },
                        'comuni': { id: 'PRO_COM', label: 'NOME_COM', resource: null, list: [] }
                    },
                    defaultData = {
                        'regioni': { id: 'IdRegioneISTAT', resourceId: 'e2f0c989-929f-4e4d-87e2-097140f8880f', resource: null, markers: null, value: 'Totale beni', bins: [], ranges: [] },
                        'province': { id: 'IdProvinciaISTAT', resourceId: 'c18fa1ca-971f-4cfa-92e9-869785260dec', resource: null, markers: null, value: 'Totale beni', bins: [], ranges: [] },
                        'comuni': { id: 'IdComuneISTAT', resourceId: '69b2565e-0332-422f-ad57-b11491e33b08', resource: null, markers: null, value: 'Totale beni', bins: [], ranges: [] }
                    },
                    geo = {}, data = {};

                // Parametri dell'URL
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
                var parameters = Arg.query(); // Parsing dei parametri dell'URL
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
                    if(parameters.mr.mc) {
                        parameters.mr.mc = parseInt(parameters.mr.mc);
                    }
                }
                
                // Livelli disponibili da parametri dell'URL
                for (var i=parameters.ls.indexOf(parameters.ml); i<parameters.ls.length; i++) {
                    if (defaultGeo.hasOwnProperty(parameters.ls[i]) && defaultData.hasOwnProperty(parameters.ls[i])) {
                        geo[parameters.ls[i]] = defaultGeo[parameters.ls[i]];
                        data[parameters.ls[i]] = defaultData[parameters.ls[i]];
                    }
                }
                /*** ***/

                /*** Inizializzazione della mappa ***/
        	    var southWest = L.latLng(35.568,1.537),
                    northEast = L.latLng(47.843,23.203),
                    mapBounds = L.latLngBounds(southWest, northEast),
        	        southWestB = L.latLng(22.472,-16.523),
                    northEastB = L.latLng(62.083,73.828),
                    maxMapBounds = L.latLngBounds(southWestB, northEastB);
                var map = L.map('map', { 
                        maxZoom: 13, 
                        minZoom: 5, 
                        scrollWheelZoom: true, 
                        attributionControl: false, 
                        maxBounds: maxMapBounds
                    });
                map.fitBounds(mapBounds);

                L.tileLayer (
	    	        //'http://{s}.acetate.geoiq.com/tiles/acetate/{z}/{x}/{y}.png',
	    	        '/api/geoiq/{s}/{z}/{x}/{y}.png',
                    {
                		opacity: 0.7
		            }
                ).addTo(map);
                map.spin(true);
                var attrib = L.control.attribution().addTo(map);
                attrib.addAttribution('Powered by <a href="http://www.dataninja.it/" target="_blank">Dataninja</a>');
                attrib.addAttribution('tileset from <a href="http://www.geoiq.com/" target="_blank">GeoIQ</a>');
                attrib.addAttribution('icons from <a href="http://www.flaticon.com/" target="_blank">Freepik</a> and <a href="http://www.simplesharebuttons.com/" target="_blank">Simple Share Buttons</a>');
                attrib.addAttribution('geocoding by <a href="http://wiki.openstreetmap.org/wiki/Nominatim" target="_blank">OSM Nominatim</a>');
                attrib.addAttribution('code on <a href="https://github.com/Dataninja/confiscatibene-choropleth" target="_blank">GitHub</a>.');
                /*** ***/

                /*** Gestione dell'infowindow al click ***/
                var info;
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
                    } else {
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
                if (parameters.md != 'widget' && parameters.md != 'embed') var fullscreen = L.control.fullscreen({title: 'Fullscreen mode'}).addTo(map);
                /*** ***/

                /*** Logo ***/
                var logo;
                if (parameters.md === 'widget') {
                    logo = d3.select('body').insert('div','#map').attr('id','logo-widget')
                        .append('a').classed('logo '+parameters.md, true)
                        .attr('href','http://www.confiscatibene.it/')
                        .attr('target','_blank')
                        .append('img')
                        .attr('id','logo')
                        .attr('src','img/logo.png');
                } else {
                    logo = L.control({position: 'topleft'});
                    logo.onAdd = function(map) {
                        var a = L.DomUtil.create('a','logo '+parameters.md),
                            img = L.DomUtil.create('img','logo',a);
                        a.setAttribute('href','http://www.confiscatibene.it/');
                        a.setAttribute('target','_blank');
                        img.setAttribute('id','logo');
                        img.setAttribute('src','img/logo.png');
                        return a;
                    };
                    logo.addTo(map);
                }
                /*** ***/

                /*** Pulsante di reset ***/
                var reset = L.control({position: (parameters.md === 'mobile' ? 'bottomleft' : 'topright')});
                reset.onAdd = function(map) {
                    var img = L.DomUtil.create('img', 'reset '+parameters.md);
                    img.setAttribute('src','img/reset.png');
                    img.setAttribute('title','Reset');
                    d3.select(img).on('click', function() {
                        loadData(parameters.ml);
                        map.fitBounds(mapBounds);
                    });
                    return img;
                };
                reset.addTo(map);
                /*** ***/

                /*** Pulsante di embed ***/
                var embedControl = L.control({position: (parameters.md === 'mobile' ? 'bottomleft' : 'topright')});
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

                    p['permalink'] = L.DomUtil.create('p', 'permalink', inputarea);
                    p['shorturl'] = L.DomUtil.create('p', 'shorturl', inputarea);
                    p['iframe'] = L.DomUtil.create('p', 'iframe', inputarea);
                    p['widget'] = L.DomUtil.create('p', 'widget', inputarea);
                    p['shortcode'] = L.DomUtil.create('p', 'shortcode', inputarea);
                    p['svg'] = L.DomUtil.create('p', 'svg', inputarea);

                    p['permalink'].innerHTML = '' + 
                        '<label for="embed-permalink" title="Clicca per selezionare">Permalink:</label>&nbsp;' + 
                        '<input type="text" id="embed-permalink" value="' + url + '" readonly></input>';
                    
                    p['shorturl'].innerHTML = '' + 
                        '<label for="embed-shorturl" title="Clicca per selezionare">Short URL:</label>&nbsp;' + 
                        '<input type="text" id="embed-shorturl" value="Not available..." disabled readonly></input>';
                    dtnj.shorten(encUrl, 'confiscatibene-'+md5(url), function(data) {
                        d3.select("input#embed-shorturl").attr("value",data.shorturl).attr("disabled",null);
                    });
                    
                    parameters.md = 'embed';
                    p['iframe'].innerHTML = '' + 
                        '<label for="embed-iframe" title="Clicca per selezionare">Embed in post/page:</label>&nbsp;' + 
                        '<input type="text" id="embed-iframe" value="' + 
                        '<iframe src=&quot;' + url + '&quot; frameborder=&quot;0&quot; allowtransparency=&quot;true&quot; ' +
                        'allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen ' +
                        'width=&quot;100%&quot; height=&quot;700&quot;></iframe>' + 
                        '" readonly></input>';
                    
                    parameters.md = 'widget';
                    p['widget'].innerHTML = '' + 
                        '<label for="embed-widget" title="Clicca per selezionare">Embed in sidebar:</label>&nbsp;' + 
                        '<input type="text" id="embed-widget" value="' + 
                        '<iframe src=&quot;' + url + '&quot; frameborder=&quot;0&quot; allowtransparency=&quot;true&quot; ' +
                        'allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen ' +
                        'width=&quot;100%&quot; height=&quot;755&quot;></iframe>' + 
                        '" readonly></input>';

                    parameters.md = 'embed';
                    p['shortcode'].innerHTML = '' + 
                        '<label for="embed-shortcode" title="Clicca per selezionare">WP Shortcode (<a href="https://github.com/Dataninja/wp-cbmap-shortcode" target="_blank">?</a>):</label>&nbsp;' +
                        '<input type="text" id="embed-shortcode" value="' +
                        '[cbmap ' + decodeURIComponent(Arg.url(parameters).replace(/^[^?]+\?/,"").replace(/&/g," ")) + ']' + 
                        '" readonly></input>';
                    
                    parameters.md = oldMd;
                    p['svg'].innerHTML = '' + 
                        '<label for="embed-svg" title="Copia/incolla il codice o scaricalo cliccando sull\'immagine">Scalable Vector Graphics:</label>&nbsp;' +
                        '<textarea id="embed-svg" readonly>' +
                        d3.select(".leaflet-overlay-pane")[0][0].innerHTML.replace(/\>/g,">\n") + 
                        '</textarea>&nbsp;' + 
                        '<img src="img/svg.png" title="Scarica l\'immagine in SVG">';

                    for (var k in p) {
                        if (p.hasOwnProperty(k)) {
                            d3.select(p[k]).select('input').on('focus', function() { this.select(); });
                        }
                    }

                    d3.select(p['svg']).select("img").on("click", function() {
                        var blob = new Blob([d3.select(".leaflet-overlay-pane")[0][0].innerHTML.replace(/\>/g,">\n")], {type: "image/svg+xml;charset=utf-8"}),
                            filename = 'confiscatibene_map.svg';
                        saveAs(blob, filename);
                    });
                    
                    return inputarea;
                };

                var embed = L.control({position: (parameters.md === 'mobile' ? 'bottomleft' : 'topright')});
                embed.onAdd = function(map) {
                    var img = L.DomUtil.create('img', 'embed '+parameters.md);
                    img.setAttribute('src','img/embed.png');
                    img.setAttribute('title','Embed this map');
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
                /*** ***/

                /*** Screenshot map ***/
                if (parameters.md != 'widget') {
                    var screenshot = L.control({position: (parameters.md === 'mobile' ? 'bottomleft' : 'topright')});
                    screenshot.onAdd = function(map) {
                        var img = L.DomUtil.create('img','screenshot '+parameters.md);
                        img.setAttribute('id','screenshot');
                        img.setAttribute('src','img/screenshot.png');
                        img.setAttribute('title','Take a screenshot');
                        d3.select(img).on('click', function () {
                            html2canvas(document.body, {
                                onrendered: function(canvas) {
                                    var svg = d3.select(".leaflet-overlay-pane svg");
                                    canvg(canvas, svg.node().outerHTML, {ignoreMouse: true, ignoreAnimation: true, ignoreDimensions: true, ignoreClear: true, offsetX: svgViewBox[0], offsetY: svgViewBox[1]});
                                    canvas.toBlob(function(blob) {
                                        saveAs(blob,"confiscatibene_map.png");
                                    });
                                }
                            });
                        });
                        return img;
                    };
                    screenshot.addTo(map);
                }
                /*** ***/

                /*** Detach map ***/
                if (parameters.md === 'embed' || parameters.md === 'widget') {
                    var detach = L.control({position: 'topright'});
                    detach.onAdd = function(map) {
                        var a = L.DomUtil.create('a','detach '+parameters.md),
                            img = L.DomUtil.create('img','detach',a);
                        a.setAttribute('href',Arg.url(parameters).replace(/&*md=[^&]*/,'').replace(/&{2,}/g,"&"));
                        a.setAttribute('target','_blank');
                        a.setAttribute('title','Open in new window');
                        img.setAttribute('id','detach');
                        img.setAttribute('src','img/detach.png');
                        d3.select(a).on('click', function () {
                            this.setAttribute('href',Arg.url(parameters).replace(/&*md=[^&]*/,'').replace(/&{2,}/g,"&"));
                        });
                        return a;
                    };
                    detach.addTo(map);
                }
                /*** ***/

                /*** Pulsanti di condivisione ***/
                if (!parameters.md) {
                    var share = L.control({position: 'bottomleft'});
                    share.onAdd = function(map) {
                        var div = L.DomUtil.create('div','share '+parameters.md);
                        div.setAttribute('id','buttons');
                        var twitter = '<a href="https://twitter.com/share" class="twitter-share-button" data-url="http://' + location.hostname + location.pathname + '" data-via="confiscatibene" data-lang="it" data-related="jenkin27:Data scientist at Dataninja" data-hashtags="confiscatibene,dataninja" data-count="vertical">Tweet</a>';
                        var facebook = '<div class="fb-like" style="overflow:hidden;" data-href="http://' + location.hostname + location.pathname + '" data-layout="box_count" data-action="like" data-show-faces="false" data-share="false"></div>';
                        var gplus = '<div class="g-plusone" data-size="tall" data-href="http://' + location.hostname + location.pathname + '" data-annotation="bubble"></div>';
                        div.innerHTML = twitter + facebook + gplus;
                        head.load("https://platform.twitter.com/widgets.js")
                            .load("http://connect.facebook.net/it_IT/sdk.js#xfbml=1&appId=470290923072583&version=v2.0") // appID di Dataninja
                            .load("https://apis.google.com/js/plusone.js");
                        return div;
                    };
                    share.addTo(map);
                }
                /*** ***/

                /*** Creazione del menù dei livelli ***/
                var menu = L.control({position: 'topleft'});
                menu.onAdd = function(map) {
                    var nav = L.DomUtil.create('nav', 'menu-ui '+parameters.md);
                    nav.setAttribute('id','menu-ui');
                    if (parameters.md === 'widget') nav.setAttribute('style','display:none;');
                    return nav;
                };
                menu.addTo(map);
                /*** ***/

                /*** Stile dei livelli ***/
                var defaultStyle = {
		        		weight: 0.5,
			        	opacity: 1,
				        color: 'white',
    				    fillOpacity: 0.7,
    	    			fillColor: 'none'
		    	    },
    			    highlightStyle = {
                        weight: 2,
                        color: '#666'
                    };

                function getColor(d, bins) {
                    for (var i=1; i<bins.length; i++) {
                        if (d <= bins[i]) {
                            return (colorbrewer.Reds[bins.length-1] ? colorbrewer.Reds[bins.length-1][i-1] : colorbrewer.Reds[3][i-1]);
                        }
                    }
                }

        		function style(feature) {
                    var territorio = parameters.dl,
                        currentStyle = defaultStyle;
                    currentStyle.fillColor = getColor(parseInt(feature.properties.data[data[territorio].value]), data[territorio].bins);
	        		return currentStyle;
        		}

                /*** Funzione di ricerca del luogo ***/
                if (parameters.md != 'widget' && parameters.md != 'mobile') {
                    var osmGeocoder = new L.Control.OSMGeocoder(
                        { 
                            collapsed: true, 
                            position: 'topleft',
                            text: 'Cerca il tuo comune',
                            bounds: mapBounds,
                            email: "jenkin@dataninja.it",
                            callback: function (results) {
                                if (results.length) {
                                    var bbox = results[0].boundingbox,
                                        first = new L.LatLng(bbox[0], bbox[2]),
                                        second = new L.LatLng(bbox[1], bbox[3]),
                                        bounds = new L.LatLngBounds([first, second]);
                                    delete parameters.i;
                                    if (embedControl.isAdded) embedControl.removeFrom(map);
    	    	    	            info.update();
                                    loadData('comuni');
                                    this._map.fitBounds(bounds, {maxZoom:10});
                                }
                            }
                        }
                    );
                    map.addControl(osmGeocoder);
                    osmGeocoder._completely = completely(osmGeocoder._input);
                    osmGeocoder._completely.onChange = function (text) {
                        osmGeocoder._completely.startFrom = text.lastIndexOf(' ')+1;
                        osmGeocoder._completely.repaint();
                    };
                    osmGeocoder._completely.input.maxLength = 50; // limit the max number of characters in the input text 
                    d3.json((parameters.t ? 'geo/lista_comuni-'+parameters.t+'.json' : 'geo/lista_comuni.json'), function(err,data) {
                        defaultGeo['comuni'].list = data;
                        osmGeocoder._completely.options = defaultGeo['comuni'].list.map(function(el) { return el[geo['comuni'].label]; });
                    });
                }
                /*** ***/

                /*** Gestione degli eventi ***/
                var geojson, label = new L.Label();

	        	function highlightFeature(e) {
                    var layer = e.target,
                        props = layer.feature.properties;
                    
                    label.setContent(props[geo[parameters.dl].label]+'<br>Beni confiscati: '+props.data[data[parameters.dl].value]);
                    label.setLatLng(layer.getBounds().getCenter());
                    map.showLabel(label);
    	    	}
                
                function resetHighlight(e) {
                    var layer = e.target;
                    label.close();
    	    	}

	    	    function openInfoWindow(e, layer) {
                    var layer = layer || e.target;
                    geojson.eachLayer(function(l) { l.highlight = false; geojson.resetStyle(l); });
                    layer.highlight = true;
                    layer.setStyle(highlightStyle);
                    parameters.i = layer.feature.properties[geo[parameters.dl].id];
                    if (embedControl.isAdded) embedControl.removeFrom(map);
                    info.update(layer.feature.properties);
                    if (!L.Browser.ie && !L.Browser.opera) {
	        			layer.bringToFront();
    	        	}
        		}

	        	function onEachFeature(feature, layer) {
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
                /*** ***/

                /*** Legenda ***/
    		    var legend = L.control({position: 'bottomleft'});
    	    	legend.onAdd = function (map) {
                    this._div = L.DomUtil.create('div', 'info legend '+parameters.md);
                    this._div.innerHTML = (parameters.md != 'widget' ? '<h4>Legenda</h4>' : '');
			        return this._div;
                };
                legend.update = function(territorio) {
                    var grades = data[territorio].ranges;
                    this._div.innerHTML = (parameters.md != 'widget' ? '<h4 title="Numero totale di beni confiscati">Legenda</h4>' : '');
                    for (var i=0; i<grades.length; i++) {
                        var color = (colorbrewer.Reds[grades.length] ? colorbrewer.Reds[grades.length][i] : colorbrewer.Reds[3][i]);
                        this._div.innerHTML += '<i title="Tra ' + grades[i].replace("-","e") + ' beni confiscati" style="background:' + 
                            color + '"></i> ' + 
                            (parameters.md != 'widget' ? grades[i] : '') + '<br>';
                    }
                    if (parameters.md != 'widget') this._div.innerHTML += '<br>Numero totale<br>di beni confiscati';
    	    	};
                legend.addTo(map);
                /*** ***/

                // Selettore dei livelli
                d3.select("nav#menu-ui").selectAll("a")
                    .data(d3.keys(defaultGeo))
                    .enter()
                    .append("a")
                    .attr("href", "#")
                    .attr("id", function(d) { return d; })
                    .classed("disabled", function(d) {
                        return !geo.hasOwnProperty(d);
                    })
                    .on("click", function(d) {
                        if (geo.hasOwnProperty(d)) {
                            delete parameters.i;
                            if (embedControl.isAdded) embedControl.removeFrom(map);
                            info.update();
                            loadData(d);
                        }
                    })
                    .text(function(d) { return d; });

                // Join tra dati e territori
                function joinData(territorio) {
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
                    var serie = data[territorio].resource.result.records.map(function(el) { return parseInt(el[data[territorio].value]); });
                    var gs = new geostats(serie);
                    data[territorio].bins = gs.getJenks(serie.length > 7 ? 7 : serie.length-1);
                    data[territorio].ranges = gs.ranges;
                    legend.update(territorio);
                }

                // Caricamento asincrono dei dati
                function loadData(territorio) { // territorio = regioni || province || comuni
                    d3.selectAll("nav#menu-ui a").classed("active", false);
                    d3.select("nav#menu-ui a#"+territorio).classed("active", true);
                    parameters.dl = territorio;
                    geojson.clearLayers();
                    if (!geo[territorio].resource || !data[territorio].resource) {
                        var limit = 5000,
                            geoPath = 'geo/' + 
                                (parameters.t ? (territorio + '-' + parameters.tl + '-' + parameters.t) : territorio) + 
                                '.json',
                            dataPath = apiPath + 
                                '?resource_id=' + data[territorio].resourceId + 
                                (parameters.t ? ('&filters[' + defaultData[parameters.tl].id + ']=' + parameters.t) : ""),
                            q = queue();
                        map.spin(true);
                        q.defer(d3.json, geoPath); // Geojson
                        q.defer(d3.json, dataPath + '&limit=' + limit); // Dati
                        if (parameters.mr && parameters.mr.hasOwnProperty("rid")) {
                            var markersPath = apiPath +
                                '?resource_id=' + parameters.mr.rid; 
                            q.defer(d3.json, markersPath + '&limit=' + limit);
                        }
                        q.await(function(err, geojs, datajs, markersjs) {
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
                                    marker.setIcon(L.icon({iconUrl: 'js/leaflet/marker-icon.png', shadowUrl: 'js/leaflet/marker-shadow.png'}));
                                    marker.setLatLng(L.latLng(points[i][parameters.mr.lat],points[i][parameters.mr.lng]));
                                    if (parameters.mr.hasOwnProperty('iw')) marker.bindPopup(points[i][parameters.mr.iw]);
                                    markers.push(marker);
                                    clusters.addLayer(marker);
                                }
                                
                                if (parameters.mr.mc) {
                                    map.addLayer(clusters);
                                } else {
                                    map.addLayer(L.layerGroup(markers));
                                }
                            }
                        });
                    } else {
                        geojson.addData(geo[territorio].resource);
                        delete parameters.i;
                        if (embedControl.isAdded) embedControl.removeFrom(map);
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


