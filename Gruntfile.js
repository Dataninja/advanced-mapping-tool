'use strict';

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                // define a string to put between each file in the concatenated output
                separator: ';'
            },
            lib: {
                // the files to concatenate
                src: '<%= pkg.files %>',
                // the location of the resulting JS file
                dest: '<%= pkg.name %>.lib.js'
            }
        },
        uglify: {
            options: {
                // the banner is inserted at the top of the output
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    '<%= pkg.name %>.lib.min.js': ['<%= concat.lib.dest %>'],
                    '<%= pkg.name %>.min.js': ['<%= pkg.name %>.js']
                }
            }
        },
        cssmin: {
            options: {
                keepSpecialComments: false,
                target: 'img'
            },
            combine: {
                files: {
                    '<%= pkg.name %>.min.css': [
                        'js/leaflet/leaflet.css', 
                        'js/osm-geocoder/Control.OSMGeocoder.css',
                        'js/label/leaflet.label.css',
                        'js/fullscreen/Control.FullScreen.css',
                        'js/markerclusters/MarkerCluster.Default.css',
                        'js/markerclusters/MarkerCluster.css',
                        'css/cb.css', 
                        'css/cb-layout.css', 
                        'css/table.css'
                    ]
                }
            }
        },
        jshint: {
            // define the files to lint
            files: ['Gruntfile.js', 'js/**/*.js', '<%= pkg.name %>.js'],
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('jshint', ['jshint']);
    grunt.registerTask('default', [/*'jshint',*/ 'concat', 'uglify', 'cssmin']);
}
