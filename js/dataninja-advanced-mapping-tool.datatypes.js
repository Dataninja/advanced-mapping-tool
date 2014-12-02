if (mapConfig) {
    // Known types of data with global setting inherited to datasets with 'type' parameter
    mapConfig.dataTypes = {

        /* Choropleth (also known as thematic map):
         * regions are colored based on data values
         */
        choropleth: {

            /* Fillcolor when based on data
             * Palette names refer to colorbrewer2 lib
             * See http://colorbrewer2.org/
             */
            palette: 'Reds',

            // Rounding factor for binning bounds, in 10^n with n is an integer
            // 0 means no rounding
            precision: 0,

            // Bins number for data -> color scale transformation
            bins: 3
        },

        // Simple points with latitude and longitude shown as markers TODO
        points: {}
    };
}

/*
 * Map configuration complete structure:
 *
 * - dataTypes [object]
 *   - choropleth [object]
 *     - palette [string]
 *     - precision 10^[int]
 *     - bins [int > 0]
 *   - points [object]
 */

