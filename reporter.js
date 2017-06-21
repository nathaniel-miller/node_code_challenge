#!/usr/bin/env node

const stream = require('stream');
const fs = require('fs');
const file_grower = require('./file_grower');

let start;
let totalLines = 0;
let totalBytes = 0;

const objectifier = new stream.Duplex({
  objectMode: true,
  write(chunk, enc, callback) {
    objectifier.push(objectifyChunk(chunk));
    callback();
  },
  read(size) {/*...*/},
});

const reporter = new stream.Duplex({
  objectMode: true,
  write(obj, enc, callback) {

    const report = issueReport(obj);

    reporter.push(report);
    callback();
  },
  read(size){/*...*/}
});



process.stdin.on('data', data => {
  chunkstart = process.hrtime();

  objectifier.write(data, err => {
    if (err) throw err;
  });
});

objectifier.on('data', data => {
  reporter.write(data, err => {
    if (err) throw err;
  });
});

reporter.on('data', data => {
  logger(data);
});

file_grower.growFile(process.argv[2]);



(function startClock(){
  if (!start) start = process.hrtime();
})();


function objectifyChunk(chunk){

  let lines = chunk.toString().split('\n').length - 1;
  totalLines += lines;

  let bytes = chunk.length;
  totalBytes += bytes;

  let time = process.hrtime(start);
  let ms = (time[0] * 1000) + (time[1]/1000000)

  const obj = new ProcessData(ms, bytes, lines);

  return obj;
}


function issueIndividualReport(chunk) {
  return `Time: ${chunk['elapsedTime']} ms\nBytes: ${chunk['bytes']}\nLines: ${chunk['lines']}\n`
}


function issueTotalReport() {
  let totalTime = process.hrtime(start);
  let ts = ((totalTime[0] * 1000) + (totalTime[1]/1000000)) / 1000
  let bps = totalBytes / ts

  return `Report: ${totalLines} lines processed at an average speed of ${bps} bytes/second.\n`;
}

function issueReport(data) {
    const seconds = (data['elapsedTime'] / 1000);
    const bps = (data['totalBytes'] / seconds);

    return `Report: ${data['totalLines']} lines processed at an average speed of ${bps} bytes/second.\n`;
}


function logger(report) {

  fs.appendFile('logfile', report, err => {
    if (err) throw err;
  });

  fs.appendFile('logfile', '--- --- ---\n', err => {
    if (err) throw err;

    console.log(report);
    console.log('...saved to logfile.');
  })
}

function ProcessData (elapsedTime, totalBytes, totalLines){
  this.elapsedTime = elapsedTime;
  this.totalBytes = totalBytes;
  this.totalLines = totalLines;
}
