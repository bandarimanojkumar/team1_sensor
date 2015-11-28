#!/usr/bin/env node
// Measure the weather
// https://learn.sparkfun.com/tutorials/mpl3115a2-pressure-sensor-hookup-guide?_ga=1.250115779.435039742.1438648588
// https://github.com/vmayoral/bb_altimeter/blob/master/scripts/mpl2115a2.py

// Go to http://14.139.34.32:8080/streams/make and create a new stream
// Save the keys json file and copy to keys.json
// Run this script

// Logging 
// https://www.npmjs.com/package/winston
var winston = require('winston');

var logger = new winston.Logger({
    transports: [
        new winston.transports.File({
            level: 'debug',
            filename: '/var/run/log/weather.log',
            handleExceptions: true,
            json: true,
            maxsize: 1024000, // 1MB
            maxFiles: 5
        }),
        new winston.transports.Console({
            level: 'info',
            handleExceptions: true,
            json: false,
            colorize: true
        })
    ],
    exitOnError: false
});

var request       = require('request');
var util          = require('util');
var fs            = require('fs');
var b             = require('bonescript');

var filename = "/root/keys_many.json";
// logger.debug("process.argv.length: " + process.argv.length);
if(process.argv.length === 3) {
    filename = process.argv[2];
}
var keys = JSON.parse(fs.readFileSync(filename));
// logger.info("Using: " + filename);
logger.info("Title: " + keys.title);
//logger.info("key: " + keys.privateKey);
// logger.debug(util.inspect(keys));

var urlBase = keys.inputUrl + "?private_key=" + keys.privateKey + "&altitude=%s&humidity=%s&hydrogen=%s&methane=%s&temp=%s";
//console.log("url"+urlBase);
var ch4;
var h;


setInterval(readCH4Data, 1000);
setInterval(readHData, 1000);

function readCH4Data(){
 b.analogRead('P9_36', printCH4Status);
}

function printCH4Status(x) {
    console.log('raw_CH4_value = ' + x.value.toFixed(4));    //Print the raw CO value; needs calibration
     ch4 = x.value.toFixed(4) ;
    if (x.err) console.log('x.err = ' + x.err);
    if (h){
    postData();
    }
}


function readHData(){
 b.analogRead('P9_38', printHStatus);
}

function printHStatus(x) {
    console.log('raw_H_value = ' + x.value.toFixed(4));    //Print the raw CO value; needs calibration
     h = x.value.toFixed(4) ;
    if (x.err) console.log('x.err = ' + x.err);
    if (ch4){
    postData();
    }
}


function postData() {
    // logger.debug("data: " + util.inspect(data));
    
        var url = util.format(urlBase, 0,0,h,ch4,0);
        //logger.debug("url: ", url);
       // logger.info(url);
       request(url, {timeout: 10000}, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                logger.info(body); 
            } else {
                logger.error("error=" + error + " response=" + JSON.stringify(response));
            }
       })
        
    
}
