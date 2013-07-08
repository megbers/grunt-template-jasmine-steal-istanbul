/* jshint camelcase: false */
/* globals jasmine, phantom, __coverage__ */
/**
 * Reports the coverage results after the test have run.
 *
 * @module grunt-template-jasmine-istanbul
 * @class reporter
 */
(function () {
	var reporter = new jasmine.Reporter();
	/**
	 * Reports the coverage variable by dispatching a message from phantom.
	 *
	 * @method reportRunnerResults
	 */
	reporter.reportRunnerResults = function () {
		console.log("Reporting Findings", __coverage__ );
		if (__coverage__) {
			//console.log("Reporting Findings", __coverage__ );
			phantom.sendMessage('jasmine.coverage', __coverage__);
		}
	};
	jasmine.getEnv().addReporter(reporter);
})();