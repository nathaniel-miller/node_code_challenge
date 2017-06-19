#!/usr/bin/env node

const stream = require('stream');
const fs = require('fs');

let startTime;
let chunkStartTime;
let totalLines = 0;
let totalBytes = 0;


const objectifier = new stream.Duplex({
  objectMode: true,
  write(chunk, enc, callback) {
    objectifier.push(objectifyChunk(chunk));
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
  },
  read(size){/*...*/}
});



startClock();

process.stdin.pipe(objectifier);
objectifier.pipe(reporter);
reporter.on('data', reports => {
  logger(reports);
});

objectifier.on('data', data => {
  console.log(data);
})



function startClock(){
  const now = new Date().getTime();

  if (!startTime) startTime = now;
  chunkStartTime = now;
};


function objectifyChunk(chunk){

  endTime = new Date().getTime();

  let lineCount = chunk.toString().split('\n').length - 1;
  totalLines += lineCount;

  let bytes = chunk.length;
  totalBytes += bytes;

  const obj = new ChunkData((endTime - chunkStartTime), bytes, lineCount);

  return obj;
}


function issueIndividualReport(chunk) {
  return `Time: ${chunk['elapsedTime']} ms\nBytes: ${chunk['bytes']}\nLines: ${chunk['lines']}\n`
}


function issueTotalReport() {
  let totalTime = endTime - startTime;
  let bps = Math.floor(totalBytes / (totalTime/1000));

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
