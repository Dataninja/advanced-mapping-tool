'use strict';

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            main: {
                src: [
                    'bower_components/leaflet-control-osm-geocoder/images/*',
                    'bower_components/leaflet-fullscreen/*.png',
                    'bower_components/leaflet/dist/images/*'

                ],
                dest: 'img/',
            },
        },
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
                        'bower_components/leaflet/dist/leaflet.css', 
                        'bower_components/leaflet-control-osm-geocoder/Control.OSMGeocoder.css',
                        'bower_components/Leaflet.label/dist/leaflet.label.css',
                        'bower_components/leaflet-fullscreen/Control.FullScreen.css',
                        'bower_components/leaflet.markercluster/dist/MarkerCluster.Default.css',
                        'bower_components/leaflet.markercluster/dist/MarkerCluster.css',
                        'css/main.css', 
                        'css/layout.css', 
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

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('jshint', ['jshint']);
    grunt.registerTask('default', [/*'jshint',*/ 'copy', 'concat', 'uglify', 'cssmin']);
}
