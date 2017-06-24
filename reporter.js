#!/usr/bin/env node

const stream = require('stream');
const fs = require('fs');
const file_grower = require('./file_grower');

let startTime;
let totalLines = 0;
let totalBytes = 0;

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



function report(input) {
  checkOptions(process.argv[2], process.argv[3]);
  startTime = process.hrtime();

  input.on('data', data => {
    objectifier.write(data, () => {});
  });

  objectifier.on('data', data => {
    reporter.write(data, () => {});
  });

  reporter.on('data', data => {
    logger(data);
  });
}



function checkOptions(filename, rate ) {
  if (filename) {
    file_grower.growFile(setRate(rate), filename);
  }
}

function setRate(input) {
  let rate;

  !!Number(input) ? rate = input : rate = 1000;
  return rate;
};

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
  const lines = chunk.toString().split('\n').length - 1;
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
    console.log(report);
    console.log('. . .saved to logfile.');
  });

  fs.appendFile('logfile', '--- --- ---\n', () => {});
}



function ProcessData (elapsedTime, totalBytes, totalLines){
  this.elapsedTime = elapsedTime;
  this.totalBytes = totalBytes;
  this.totalLines = totalLines;
}

report(process.stdin);

module.exports.report = report;
