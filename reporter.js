#!/usr/bin/env node

const stream = require('stream');
const fs = require('fs');

let start;
let chunkstart;
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

    const iReport = issueIndividualReport(obj);
    const tReport = issueTotalReport();

    const reports = {
      'iReport' : iReport,
      'tReport' : tReport
    }

    reporter.push(reports);
    callback();
  },
  read(size){/*...*/}
});



process.stdin.on('data', data => {
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



(function startClock(){
  const now = process.hrtime();

  if (!start) start = now;
  chunkstart = now;
})();


function objectifyChunk(chunk){

  let lineCount = chunk.toString().split('\n').length - 1;
  totalLines += lineCount;

  let bytes = chunk.length;
  totalBytes += bytes;

  const obj = new ChunkData(process.hrtime(chunkstart), bytes, lineCount);

  return obj;
}


function issueIndividualReport(chunk) {
  return `Time: ${chunk['elapsedTime']} ms\nBytes: ${chunk['bytes']}\nLines: ${chunk['lines']}\n`
}


function issueTotalReport() {
  let totalTime = process.hrtime(start);
  let bps = Math.round((totalBytes / (totalTime[1]/1000000) * 100)) / 100;

  return `Report: ${totalLines} lines processed at an average speed of ${bps} bytes/second.\n`;
}


function logger(reports) {
  fs.appendFile('logfile', reports['iReport'], err => {
    if (err) throw err;
  })

  fs.appendFile('logfile', reports['tReport'], err => {
    if (err) throw err;
  });

  fs.appendFile('logfile', '--- --- ---\n', err => {
    if (err) throw err;

    if(process.argv[2] == '--verbose') console.log(reports['iReport']);
    console.log(reports['tReport']);
    console.log('...saved to logfile.');
  })
}

function ChunkData (elapsedTime, bytes, lines){
  this.elapsedTime = elapsedTime;
  this.bytes = bytes;
  this.lines = lines;
}
