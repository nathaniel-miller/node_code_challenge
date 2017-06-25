#!/usr/bin/env node

const stream = require('stream');
const fs = require('fs');
const file_grower = require('./file_grower');

let startTime;
let totalLines = 0;
let totalBytes = 0;


/* - Streams - */
const objectifier = new stream.Duplex({
  objectMode: true,

  write(chunk, enc, callback) {
    objectifier.push(objectifyChunk(chunk));
    callback();
  },

  read() {/* - required - */}
});

const reporter = new stream.Duplex({
  objectMode: true,

  write(obj, enc, callback) {
    const report = issueReport(obj);

    reporter.push(report);
    callback();
  },

  read() {/* - required - */}
});




/* - Main Process - */
function report(input) {
  checkOptions(process.argv[2], process.argv[3]);
  startTime = process.hrtime();

  input.on('data', data => {
    objectifier.write(data, () => {});
  });

  objectifier.on('data', data => {
    reporter.write(data, () => {});
  });

  reporter.on('data', report => {
    logger(report);
  });
}

report(process.stdin);



/* - Helpers - */
function checkOptions(filename, rate ) {
  if (filename) {
    if (notCoreFile(filename)) {
      file_grower.growFile(setRate(rate), filename);
    }
  }
}


function notCoreFile(filename) {
  let validity = true;

  switch(filename) {
    case 'file_grower.js':
      invalidFileMessage(filename);
      validity = false;
      break;
    case 'logfile':
      invalidFileMessage(filename);
      validity = false;
      break;
    case 'README.md':
      invalidFileMessage(filename);
      validity = false;
      break;
    case 'reporter.js':
      invalidFileMessage(filename);
      validity = false;
      break;
    case 'test.js':
      invalidFileMessage(filename);
      validity = false;
      break;
    case 'text.txt':
      invalidFileMessage(filename);
      validity = false;
      break;
  }

  return validity;
}


function invalidFileMessage(filename) {
  console.log(`Cannot grow ${filename} as it is a core file.`);
}


function setRate(input) {
  let rate;

  !!Number(input) ? rate = input : rate = 1000;
  return rate;
}


function objectifyChunk(chunk){
  return new ProcessData(
    setms(process.hrtime(startTime)),
    setTotalBytes(chunk),
    setTotalLines(chunk)
  );
}


function setms(hrtime) {
  return (hrtime[0] * 1000) + (hrtime[1]/1000000);
}


function setTotalBytes(chunk) {
  const bytes = chunk.length;
  totalBytes += bytes;

  return totalBytes;
}


function setTotalLines(chunk) {
  const lines = chunk.toString().split('\n').length;
  totalLines += lines;

  return totalLines;
}


function issueReport(data) {
  return `Report: ${data['totalLines']} lines processed at an average speed of ${setbps(data)} bytes/second.\n`;
}


function setbps(data) {
  const seconds = (data['elapsedTime'] / 1000);
  return (data['totalBytes'] / seconds);
}


function logger(report) {
  fs.appendFile('logfile', report, () => {
    storeReportForTest = report;
    console.log(report);
    console.log('. . .saved to logfile.');
  });

  fs.appendFile('logfile', '--- --- ---\n', () => {});
}



/* - Constructor - */
function ProcessData (elapsedTime, totalBytes, totalLines){
  this.elapsedTime = elapsedTime;
  this.totalBytes = totalBytes;
  this.totalLines = totalLines;
}



/* - For Testing Purposes - */
function resetStart(input) {
  startTime = [0,0];
  return startTime;
}

function resetTotalLines(input) {
  totalLines = 0;
  return totalLines;
}

function resetTotalBytes(input) {
  totalBytes = 0;
  return totalBytes;
}



/* - Functions to Export - */
module.exports.setRate = setRate;
module.exports.setms = setms;
module.exports.setbps = setbps;
module.exports.setTotalBytes = setTotalBytes;
module.exports.setTotalLines = setTotalLines;
module.exports.objectifyChunk = objectifyChunk;
module.exports.resetStart = resetStart;
module.exports.resetTotalLines = resetTotalLines;
module.exports.resetTotalBytes = resetTotalBytes;
module.exports.notCoreFile = notCoreFile;
module.exports.issueReport = issueReport;
