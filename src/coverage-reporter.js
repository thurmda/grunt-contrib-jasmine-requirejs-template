(function () {
var customReporter = function(){
    this.count = 0;
};
customReporter.prototype.reportRunnerResults = function(runner){
    ///TODO make this work!    
    if(typeof(__coverage__) !== 'undefined'){
        phantom.sendMessage('jasmine.coverage', __coverage__);
    }
} 
customReporter.prototype.reportSuiteResults = function(runner){
    this.count++;
    if(jasmine.getEnv().reporter.subReporters_[0].suites_.length === this.count){
        if(typeof(__coverage__) !== 'undefined'){
            phantom.sendMessage('jasmine.coverage', __coverage__);
        }
    }
} 
jasmine.getEnv().addReporter(new customReporter() );
})();
