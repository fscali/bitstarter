#!/usr/bin/env node

var fs = require('fs');
var rest = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URLFILE_DEFAULT = "http://www.google.com";

var assertFileExists = function(infile){
    var instr = infile.toString();
    if (!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1);
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
    
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
}

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();

    var out = {};
    for (var ii in checks){
	var present  = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    return fn.bind({});
    //workaround for commander.js issue
    //http://stackoverflow.com/a/6772648
}

var doChecks= function(theFile, checks){
    var checkJson = checkHtmlFile(theFile, checks);
    var outjson = JSON.stringify(checkJson, null, 4);
    console.log(outjson);
}

var buildfn = function(theFile, checks){
    var response2console = function(result, response){
	if (result instanceof Error) {
	    console.error('Error: ' + util.format(response.message));
	}else {
	    console.error("Wrote %s", theFile);
	    fs.writeFileSync(theFile, result);
	    doChecks(theFile, checks);

	}
    }
    return response2console;
};




if (require.main == module) {
    program
	.option('-c, --checks <check-file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
    //	.option('-u, --url <url_path>', 'Url to index.html', clone(assertFileExists), URLFILE_DEFAULT)
	.option('-u, --url <url_path>', 'Url to index.html')
	.parse(process.argv);
    var theFile = "out.html";
    if ( program.url !== undefined){

	var response2console = buildfn(theFile, program.checks);
	rest.get(program.url).on('complete', response2console);
    }
    else {
	theFile = program.file;
	doChecks(theFile, program.checks);
    }

    /*    var checkJson = checkHtmlFile(theFile, program.checks);
	  var outjson = JSON.stringify(checkJson, null, 4);
	  console.log(outjson);*/
}
else{
    exports.checkhtmlfile = checkhtmlfile;
}
