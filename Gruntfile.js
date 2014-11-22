module.exports = function(grunt){
  var allJsFiles = 'app/**/*.js';
  var allStylusFiles = 'app/styles/**/*.styl';
  var allPartialsFiles = 'app/partials/**/*.html'

  grunt.initConfig({
    clean: {
      public: ['public/']
    },

    stylus: {
      compile: {
        compress: true,
        use: [ require('nib') ],
        files: {'public/css/app.css': 'app/styles/app.styl'}
      }
    },

    html2js: {
      options: {
        base: 'app/partials'
      },
      main: {
        src: [allPartialsFiles],
        dest: 'public/js/partials.js'
      }
    },

    concat: {
      vendor: {
        src: ['vendor/js/angular.js', 'vendor/js/**/*.js'],
        dest: 'public/js/vendor.js'
      },

      public: {
        src: [
          'app/app.js',
          'app/**/*.js',
          'app/app-config.js'
        ],
        dest: 'public/js/app.js'
      },

      vendorCSS: {
        src: ['vendor/css/**/*.css'],
        dest: 'public/css/vendor.css'
      }
    },

    uglify: {
      vendor: {
        options: { mangle: false },
        files: {
          'public/js/vendor.js': ['public/js/vendor.js']
        }
      },

      public: {
        options: { mangle: false },
        files: {
          'public/js/app.js': ['public/js/app.js']
        }
      },

      partials: {
        options: { mangle: false },
        files: {
          'public/js/partials.js': ['public/js/partials.js']
        }
      }
    },

    watch: {
      js: {
        files: [allJsFiles],
        tasks: ['concat:public']
      },

      css: {
        files: [allStylusFiles],
        tasks: ['stylus']
      },

      partials: {
        files: [allPartialsFiles],
        tasks: ['html2js']
      }
    },

    copy: {
      images: {
        src: ['**/*.*'],
        dest: 'public/images/',
        expand: true,
        cwd: 'app/assets/images/'
      },

      sounds: {
        src: ['**/*.*'],
        dest: 'public/sounds/',
        expand: true,
        cwd: 'app/assets/sounds/'
      },

      font: {
        src: ['**/*.*'],
        dest: 'public/font/',
        expand: true,
        cwd: 'app/assets/font/'
      },

      workers: {
        src: ['**/*.*'],
        dest: 'public/workers/',
        expand: true,
        cwd: 'app/assets/workers/'
      },

      styles: {
        src: ['**/*.*'],
        dest: 'public/styles/',
        expand: true,
        cwd: 'app/assets/styles/'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-html2js');

  grunt.registerTask('default', ['clean', 'stylus', 'html2js', 'concat', 'copy']);
  grunt.registerTask('w', ['default', 'watch']);
  grunt.registerTask('build', ['default', 'uglify']);
}