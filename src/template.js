var path = require('path');
var istanbul = require('istanbul');
var grunt = require('grunt');

var instrument = function (sources, tmp) {
    ///TODO fix me
   //var jsregex = new RegExp('',''); // /\.js$/;
    var instrumenter= new istanbul.Instrumenter();
    var instrumentedSources = [];
    sources.forEach(function (source) {
        source = source.substr(3);
        var tmpSource = path.join(tmp, source);
        //if ( jsregex.test(source) ){
            grunt.file.write(tmpSource, instrumenter.instrumentSync(
                grunt.file.read(source), source));
            instrumentedSources.push(tmpSource);
        //}else{
         //grunt.file.write(tmpSource, grunt.file.read(source));
        //}
    });
    return instrumentedSources;
};

var writeCoverage = function (coverage, file) {
    grunt.file.write(file, JSON.stringify(coverage));
};
var writeReport = function (type, options, collector) {
    istanbul.Report.create(type, options).writeReport(collector, true);
};
var writeReports = function (collector, options) {
    if (typeof options == 'string' || options instanceof String) {
        // default to html report at options directory
        writeReport('html', {
            dir: options
        }, collector);
    } else if (options instanceof Array) {
        // multiple reports
        for (var i = 0; i < options.length; i = i + 1) {
            var report = options[i];
            writeReport(report.type, report.options, collector);
        }
    } else {
        // single report
        writeReport(options.type, options.options, collector);
    }
};

var checkThresholds = function (collector, options) {
    var summaries = [];
    collector.files().forEach(function (file) {
        summaries.push(istanbul.utils.summarizeFileCoverage(
                collector.fileCoverageFor(file)));
    });
    var finalSummary = istanbul.utils.mergeSummaryObjects.apply(null,
            summaries);
    grunt.util._.each(options, function (threshold, metric) {
        var actual = finalSummary[metric];
        if(!actual) {
            grunt.warn('unrecognized metric: ' + metric);
        }
        if(actual.pct < threshold) {
            grunt.warn('expected ' + metric + ' coverage to be at least '
                    + threshold + '% but was ' + actual.pct + '%');
        }
    });
};

exports.process = function (grunt, task, context) {
    //console.dir(grunt);
    //console.dir(task);
    console.dir(context);
    var instrumentedSources = instrument(context.scripts.src, context.temp);
    task.phantomjs.on('jasmine.message', function (message) {
        console.log('phantom said ', message);
    });
    task.phantomjs.on('jasmine.coverage', function (coverage) {
        var collector = new istanbul.Collector();
        collector.add(coverage);
        writeCoverage(coverage, context.options.coverage);
        writeReports(collector, context.options.report);
        if (context.options.thresholds) {
            checkThresholds(collector, context.options.thresholds);
        }
    });
    var source = grunt.file.read(__dirname + '/template.tmpl');
    task.copyTempFile(__dirname + '/jasmine-helper.js', 'jasmine-helper.js');
    task.copyTempFile(__dirname + '/coverage-reporter.js', '/coverage-reporter.js');
    return grunt.util._.template(source, context);
};
