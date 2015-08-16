module.exports = function(grunt) {


  grunt.loadNpmTasks('grunt-grunticon');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-svgmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-ftp-deploy');



  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),


    config: {
      layoutRoot: 'layout',
      src: 'src',
      dist: 'assets',
      grunticonSelectors: (function() {
        var path = 'src/_svg/_customSelectors.json';
        return grunt.file.exists(path) ? grunt.file.readJSON(path) : {}
      }())
    },



    // ===========
    // SVG TASK
    // ===========

    clean: {
      svg: [
        '<%= config.src %>/_svg/_svgmin',
        '<%= config.src %>/img/svg/png-grunticon',
        '<%= config.src %>/css/grunticon*'
      ],
      dist:
        '<%= config.dist %>'
    },


    svgmin: {
      options: {
        plugins: [
          {
            removeDesc: true
          }
        ]
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.src %>/_svg',
          src: ['!!ai','*.svg'],
          dest: '<%= config.src %>/_svg/_svgmin'
        }]
      }
    },


    grunticon: {
      mysvg: {
        files: [{
          expand: true,
          cwd: '<%= config.src %>/_svg',
          src: ['_svgmin/*.svg', '*.png'],
          dest: '<%= config.src %>'
        }],
        options: {
          cssprefix    : '.icon-',
          datasvgcss   : 'css/grunticon-icons.data.svg.css',
          datapngcss   : 'css/grunticon-icons.data.png.css',
          urlpngcss    : 'css/grunticon-icons.fallback.css',
          previewhtml  : '_grunticon-preview.html',
          pngfolder    : 'img/svg/png-grunticon',
          loadersnippet: 'js/lib/grunticon.loader.js',
          pngpath      : '../img/svg/png-grunticon',
          template     : '<%= config.src %>/_svg/_template.hbs',
          defaultWidth : '20px',
          defaultHeight: '20px',
          customselectors: '<%= config.grunticonSelectors %>',
          enhanceSVG: true
        }
      }
    },

    assemble: {
      options: {
        onProduction: false,
        helpers: ['<%= config.src %>/_templates/helpers/*.js'],
        flatten: true,
        assets: '<%= config.src %>',
        layoutdir: '<%= config.src %>/_templates/layouts/',
        layout: 'default.hbs',
        data: '<%= config.src %>/_data/*.{json,yml}',
        partials: '<%= config.src %>/_templates/partials/*.hbs'
      },
      pages: {
        files: [{
          cwd: '<%= config.src %>/_templates/pages/',
          dest: '<%= config.src %>',
          expand: true,
          src: '**/*.hbs'
        }]
      }
    },



    copy: {
      dist: {
        expand: true,
        cwd: '<%= config.src %>',
        src: [
          '**',
          '!**/styl/**', // no styl
          '!**/_*/**', // ignore '_name' folders
          '!**/js/**', // ignore all js
          'js/build/*',
          'js/lib/*'
          ],
        dest: '<%= config.dist %>'
      }
    },


    // ===
    // FTP
    // ===

    'ftp-deploy': {
      make: {
        auth: {
          host: '77.222.40.32',
          port: 21,
          authKey: 'aalexeev'
        },
        src: '<%= config.dist %>',
        dest: '<%= pkg.name %>',
        forceVerbose: true,
        exclusions: [
          '<%= config.dist %>/**/.DS_Store',
          '<%= config.dist %>/**/Thumbs.db'
        ]
      },
      light: {
        auth: {
          host: '77.222.40.32',
          port: 21,
          authKey: 'aalexeev'
        },
        src: '<%= config.dist %>',
        dest: '<%= pkg.name %>',
        forceVerbose: true,
        exclusions: [
          '<%= config.dist %>/**/.DS_Store',
          '<%= config.dist %>/**/Thumbs.db',
          'img',
          'fonts'
        ]
      }
    }

    // END FTP

  });

  grunt.loadNpmTasks('assemble');

  // Tasks
  if (grunt.file.exists(__dirname, '.ftppass')) {
    grunt.registerTask('ftp_l', ['ftp-deploy:light']);
    grunt.registerTask('ftp_m', ['ftp-deploy:make']);
  } else {
    grunt.registerTask('ftp_l', ['']);
    grunt.registerTask('ftp_m', ['']);
  }

  grunt.registerTask('l', [
    'copy:dist',
    'ftp_l'
  ]);

  grunt.registerTask('m', [
    'clean:dist',
    'copy:dist',
    'ftp_m'
  ]);

  grunt.registerTask('svg', [
    'clean:svg',
    'svgmin',
    'grunticon'
  ]);

  return grunt.registerTask('grunt-assemble', ['assemble']);
};
