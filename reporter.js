#!/usr/bin/env node

const stream = require('stream');
const fs = require('fs');
const file_grower = require('./file_grower');

let start;
let rate;
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



(function setRate() {
  const input = process.argv[3];
  !!Number(input) ? rate = input : rate = 1000;
})();

(function startClock(){
  if (!start) start = process.hrtime();
})();

if (process.argv[2]) file_grower.growFile(rate, process.argv[2]);

process.stdin.on('data', data => {
  chunkstart = process.hrtime();

  objectifier.write(data, () => {});
});

objectifier.on('data', data => {
  reporter.write(data, () => {});
});

reporter.on('data', data => {
  logger(data);
});



function objectifyChunk(chunk){
  let lines = chunk.toString().split('\n').length - 1;
  totalLines += lines;

  let bytes = chunk.length;
  totalBytes += bytes;

  let time = process.hrtime(start);
  let ms = (time[0] * 1000) + (time[1]/1000000);

  const obj = new ProcessData(ms, totalBytes, totalLines);

  return obj;
}

function issueReport(data) {
  const seconds = (data['elapsedTime'] / 1000);
  const bps = (data['totalBytes'] / seconds);

  return `Report: ${data['totalLines']} lines processed at an average speed of ${bps} bytes/second.\n`;
}


function logger(report) {
  fs.appendFile('logfile', report, () => {});
  fs.appendFile('logfile', '--- --- ---\n', () => {
    console.log(report);
    console.log('. . .saved to logfile.');
  });
}

function ProcessData (elapsedTime, totalBytes, totalLines){
  this.elapsedTime = elapsedTime;
  this.totalBytes = totalBytes;
  this.totalLines = totalLines;
}
