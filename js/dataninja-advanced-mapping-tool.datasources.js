if (mapConfig) {
    // Known sources of data with global setting inherited to datasets with 'source' parameter
    mapConfig.dataSources = {

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
            // this is the dataSet object
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
             * this is the dataSet object
             * See http://docs.getdkan.com/docs/dkan-documentation/dkan-api/datastore-api#Return_Values
             */
            transform: function(res) {
                return res.result.records;
            }
        }
    };
}

/*
 * Map configuration complete structure:
 *
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
 */

