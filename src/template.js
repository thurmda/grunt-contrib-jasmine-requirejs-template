var template = __dirname + '/template.tmpl';

exports.process = function(grunt, task, context) {
      var source = grunt.file.read(template);
      task.copyTempFile(__dirname + '/jasmine-helper.js', 'jasmine-helper.js');
      return grunt.util._.template(source, context);
};
