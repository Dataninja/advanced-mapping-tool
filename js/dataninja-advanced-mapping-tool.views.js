if (mapConfig) {
    // Known types of visualization into the infowindow with global setting inherited to infowindow with 'view' parameter
    mapConfig.viewTypes = {

        /* The infowindow contains a table with header and footer,
         * here a structure of the body can be defined
         * returning the tbody element, see http://www.w3schools.com/tags/tag_tbody.asp
         */
        table: function(data, options, formatter, groups) {
            if (!data) return '';

            /* Default options can be overrided (include and exclude filters are evaluated in this order):
             * - formatter string defines how to format numbers in printing
             * - include array has data keys to include
             * - exclude array has data keys to exclude
             * - bold function defines a rule to boldify a row
             * - filter function defines a custom filter after include and exclude filters
             */
            var defaultOptions = {
                    include: [],
                    exclude: [],
                    bold: function(k,v) { return false; },
                    filter: function(k,v) { return true; },
                    groups: groups || {}
                },
                options = options || {},
                formatter = formatter || function(k,v) { return (_.isNumber(v) ? (d3.format(",d")(v) || d3.format(",.2f")(v)) : v); },
                group = '',
                tbody = '',
                k;

            _.defaults(options, defaultOptions);

            for (k in data) {
                if (_.has(data,k)) {
                    if (!options.include.length || _.contains(options.include,k)) {
                        if (!options.exclude.length || !(_.contains(options.exclude,k))) {
                            if (options.filter(k,data[k])) {
                                
                                var val = formatter(k,data[k]),
                                    isBold = options.bold(k,data[k]),
                                    isSecondLevel = _.has(options.groups,k);
                                
                                if (isSecondLevel && options.groups[k] != group) {
                                    group = options.groups[k];
                                    tbody += '<tr class="first-level group"><td colspan="2">'+group+'</td></tr>';
                                }
                                
                                tbody += '<tr class="'+(isSecondLevel ? 'second-level' : 'first-level')+'">' + 
                                    '<td class="table-key">' + (isBold ? '<b>'+k+'</b>' : k) + '</td>' +
                                    '<td class="table-value">' + (isBold ? '<b>'+val+'</b>' : val) + '</td>' +
                                    '</tr>';
                            }
                        }
                    }
                }
            }

            return tbody;
        }
    };
}

/*
 * Map configuration complete structure:
 *
 * - viewTypes [object]
 *   - table [string] function ( [object], [object] )
 */

