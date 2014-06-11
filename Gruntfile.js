module.exports = function(grunt) {
    grunt.initConfig({
        clean: {
            build: {
                src: [
                    'build/css/*.css',
                    '!build/css/site.css',
                    'build/js/*.js',
                    '!build/js/site.js'
                ]
            }
        },
        copy: {
            build: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: 'source',
                    dest: 'build',
                    src: [
                        '**',
                        '**'
                    ]
                }]
            }
        },
        autoprefixer: {
            mixdown: {
                options: {
                    browsers: ['last 2 version', 'ie 9', 'ie 8', 'Opera 12.1']
                },
                files: {
                    'build/css/main.css': 'build/css/main.css'
                }
            }
        },
        useminPrepare: {
            html: 'build/index.html',
            options: {
                dest: 'build',
                flow: {
                    html: {
                        steps: {
                            'js': ['concat', 'uglifyjs'],
                            'css': ['concat', 'cssmin']
                        },
                        post: {}
                    }
                }
            }
        },
        usemin: {
            html: ['build/{,*/}*.html'],
            css: ['build/css/{,*/}*.css'],
            options: {
                dirs: ['build']
            }
        },
        imagemin: {
            dynamic: {
                options: {
                    cache: false
                },
                files: [{
                    expand: true,
                    cwd: 'build/img',
                    src: '{,*/}*.{png,jpg,jpeg}',
                    dest: 'build/img'
                }]

            }
        },
        cssmin: {
            build: {
                files: {
                    'build/css/site.css': [
                        '.tmp/css/{,*/}*.css',
                        'build/css/{,*/}*.css'
                    ]
                }
            }
        },
        htmlcompressor: {
            compile: {
                files: {
                    'build/index.html': 'build/index.html'
                },
                options: {
                    type: 'html',
                    preserveServerScript: true
                }
            }
        },
        uglify: {
            build: {
                files: {
                    'build/js/site.js': ['build/js/site.js']
                }
            }
        },
        compress: {
            main: {
                options: {
                    mode: 'gzip'
                },
                expand: true,
                cwd: 'build/',
                src: ['**/*', '!{,*/}*.{png,jpg,jpeg}'],
                dest: 'build/'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-htmlcompressor');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-autoprefixer');

    grunt.registerTask(
        'build',
        [
            'copy',
            'autoprefixer',
            'useminPrepare',
            'imagemin',
            'concat',
            'cssmin',
            'uglify',
            'usemin',
            'htmlcompressor',
            'clean',
            'compress'
        ]
    );

};