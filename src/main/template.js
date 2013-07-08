/* globals require, exports */
/**
 * Code coverage via istanbul.
 *
 * @module grunt-template-jasmine-istanbul
 * @class template
 */
var path = require('path');
var istanbul = require('istanbul');
var grunt = require('grunt');

var REPORTER = './node_modules/grunt-template-jasmine-istanbul/src/main/js/'
		+ 'reporter.js';
//var DEFAULT_TEMPLATE = './node_modules/grunt-contrib-jasmine/tasks/jasmine/'
//		+ 'templates/DefaultRunner.tmpl';

//HERE!!!!
var DEFAULT_TEMPLATE = './node_modules/grunt-template-jasmine-steal/src/templates/jasmine-steal.html';

/**
 * Instruments the specified sources and moves the instrumented sources to the
 * temporary location, recreating the original directory structure.
 *
 * @private
 * @method instrument
 *
 * @param {Array} sources The paths of the original sources
 * @param {String} tmp The path to the temporary directory
 *
 * @return {Array} The paths to the instrumented sources
 */
var instrument = function (sources, tmp) {
	var instrumenter = new istanbul.Instrumenter();
	var instrumentedSources = [];
	sources.forEach(function (source) {
		
		var sanitizedSource = source;
		// don't try to write "C:" as part of a folder name on Windows
		if (process.platform == 'win32') {
			sanitizedSource = source.replace(/^([a-z]):/i, '$1');
		}
		var tmpSource = path.join(tmp, sanitizedSource);
		
		
		
		//HERE!!!!
		
		if(source.indexOf('.ejs') !== -1 ||
			source.indexOf('.json') !== -1 ||
			source.indexOf('.html') !== -1 ||
			source.indexOf('.css') !== -1 ) {
			grunt.file.write(tmpSource, grunt.file.read(source));
		} else if(
			source.indexOf('_spec.js') !== -1 || 
			source.indexOf('documentjs') !== -1 || 
			source.indexOf('func-tests') !== -1 || 
			source.indexOf('funcunit') !== -1 || 
		   	source.indexOf('jquery') !== -1 || 
		   	//source.indexOf('jsmvc') !== -1 || 

		   	source.indexOf('steal') !== -1 || 		   	
		   	source.indexOf('thirdparty') !== -1 || 
			
		   source.indexOf('/scripts/') !== -1 ||
		   source.indexOf('ux-ipad') !== -1) {
			//console.log("Not intrumenting", source);
			grunt.file.write(tmpSource, "console.log('non-instrumented: "+source+"' ); " +grunt.file.read(source));			
		} else {
			console.log("Intrumenting", source);
			grunt.file.write(tmpSource, "console.log('instrumented: "+source+"' ); " + instrumenter.instrumentSync(
				grunt.file.read(source), source));
		}
		
		
		
		
		instrumentedSources.push(tmpSource);
	});
	return instrumentedSources;
};

/**
 * Writes the coverage file.
 *
 * @private
 * @method writeCoverage
 *
 * @param {Object} coverage The coverage data
 * @param {String} file The path to the coverage file
 */
var writeCoverage = function (coverage, file) {
	grunt.file.write(file, JSON.stringify(coverage));
};

/**
 * Writes the report of the specified type, using the specified options and
 * reporting the coverage collected by the specified collector.
 *
 * @private
 * @method writeReport
 *
 * @param {String} type The report type
 * @param {Object} options The report options
 * @param {Collector} collector The collector containing the coverage
 */
var writeReport = function (type, options, collector) {
	istanbul.Report.create(type, options).writeReport(collector, true);
};

/**
 * Writes the istanbul reports created from the specified options.
 *
 * @private
 * @method writeReports
 *
 * @param {Collector} collector The collector containing the coverage
 * @param {Object} options The options describing the reports
 */
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

/**
 * Checks whether the specified threshold options have been met. Issues a
 * warning if not.
 *
 * @param {Collector} collector The collector containing the coverage
 * @param {Object} options The options describing the thresholds
 */
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

/**
 * Processes the mixed-in template. Defaults to jasmine's default template and
 * sets up the context using the mixed-in template's options.
 *
 * @private
 * @method processMixedInTemplate
 *
 * @param {Object} grunt The grunt object
 * @param {Object} task Provides utility methods to register listeners and
 *	   handle temporary files
 * @param {Object} context Contains all options
 *
 * @return {String} The template HTML source of the mixed in template
 */
var processMixedInTemplate = function (grunt, task, context) {
	var template = context.options.template;
	if (!template) {
		template = DEFAULT_TEMPLATE;
	}
	// clone context
	var mixedInContext = context;//JSON.parse(JSON.stringify(context));
	// transit templateOptions
	
	//HERE!!!!
	mixedInContext.options = context.options || {};
	
	//console.log(mixedInContext);
	if (template.process) {
		return template.process(grunt, task, mixedInContext);
	} else {
		return grunt.util._.template(grunt.file.read(template), mixedInContext);
	}
};



//HERE!!!!
var steal  = {
      '3.2.3' : __dirname + '/../vendor/steal-3.2.3'
    };
//HERE!!!!    
var setUpSteal = function(grunt, task, context) {
  context.options.stealOptions = context.options.stealOptions || {};
  var stealUrl = context.options.steal.url;

  // find the latest version if none given
  if (!stealUrl) {
    stealUrl = '.grunt/grunt-contrib-jasmine/src/steal/steal.js';
  }

  var stealRoot = stealUrl.substring(0, stealUrl.indexOf('steal/steal.js'));

  context.options.steal.url = stealUrl;

  context.fn = {
    pathify: function(s) {
      var stealRel = new RegExp('^.*' + stealRoot),
          baseRel = /^\.\//,
          supportRel = /^\.grunt\//,
          absBase = '';

      if(s.indexOf(stealRoot) === -1 && s.indexOf('.grunt') === -1) {
        absBase = '/';
      }

      return absBase + s.replace(stealRel, '').replace(baseRel, '').replace(supportRel, '/.grunt/');
    }
  };
  
  //HERE!!!!
  // put steal into place
  //task.copyTempFile(steal['3.2.3'] + '/steal.js','steal/steal.js');
  //task.copyTempFile(steal['3.2.3'] + '/dev/dev.js','steal/dev/dev.js');

  //var source = grunt.file.read(template);
};


/**
 * Instruments the sources, generates reports and cleans up after tests.
 *
 * @method process
 *
 * @param {Object} grunt The grunt object
 * @param {Object} task Provides utility methods to register listeners and
 *	   handle temporary files
 * @param {Object} context Contains all options
 *
 * @return {String} The template HTML source
 */
exports.process = function (grunt, task, context) {
	// prepend coverage reporter
	context.scripts.reporters.unshift(REPORTER);
	
	// instrument sources
	var instrumentedSources = instrument(context.scripts.src, context.temp);
	// replace sources
	if (context.options.replace == null || context.options.replace) {
		context.scripts.src = instrumentedSources;
	}
	// listen to coverage event dispatched by reporter
	task.phantomjs.on('jasmine.coverage', function (coverage) {
		var collector = new istanbul.Collector();
		collector.add(coverage);
		writeCoverage(coverage, context.options.coverage);
		writeReports(collector, context.options.report);
		if (context.options.thresholds) {
			checkThresholds(collector, context.options.thresholds);
		}
	});
	
	//HERE!!!!
	setUpSteal(grunt, task, context);
	
	// process mixed-in template
	return processMixedInTemplate(grunt, task, context);
};
