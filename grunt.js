/**
 * grunt
 * https://github.com/Takazudo/gruntExamples
 */
module.exports = function(grunt){

  grunt.loadTasks('tasks');

  grunt.initConfig({
    coffee: {
      lib: {
        files: [ 'jquery.presetpreloader.coffee' ],
        dest: 'jquery.presetpreloader.js'
      }
    },
    watch: {
      lib: {
        files: '<config:coffee.lib.files>',
        tasks: 'default'
      }
    }
  });

  grunt.registerTask('default', 'coffee:lib ok');

};
