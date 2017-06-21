const fs = require('fs');
const stream = require('stream');

const words = fs.readFileSync('text.txt', 'utf8').split(' ');
const maxLines = maxOf(50);

function growFile(file) {

  for(let line = 0; line < maxLines; line++) {
    let chunk = writeLine();

    fs.appendFile(file, chunk, err => {
      if (err) throw err;
    })
  }
}

function writeLine() {
  let wordCount = maxOf(20);
  let line = "";

  for(let i = 0; i < wordCount; i++) {
    word = words[maxOf(words.length)] + " ";
    line += word;
  }

  return line + "\n";
}

function maxOf(n) {
  return Math.floor(Math.random() * n);
}


// *******************************************************
// const readable1 = new stream.Readable({
//   read(size){/*...*/}
// });
//
// const readable2 = new stream.Readable({
//   read(size){/*...*/}
// });
//
// const writable1 = new stream.Writable({
//   write(data, enc, callback){
//     console.log('CheckPoint 2', data);
//
//     readable1.push(data.toString().toUpperCase(););
//
//     callback();
//   }
// });

// const writable2 = new stream.Writable({
//   write(data, enc, callback){
//     console.log('CheckPoint 4', data);
//
//     readable2.push(data.toString().split(',').join(''););
//
//     callback();
//   }
// });

// -----  -----  -------   ----- ----   ---------
//Readable Stream gets data -> writes that data to a writeable stream.
//That writable stream pushes the data to the next readable stream.

// process.stdin.on('data', data => {
//   console.log('CheckPoint 1', data);
//   writable1.write(data, () => {
//     console.log('CheckPoint 2.b', data);
//   });
// });
//
// // readable1.pipe(writeable2);
// readable1.on('data', data => {
//   console.log('CheckPoint 3', data);
//
//   writable2.write(data, () => {
//     console.log('CheckPoint 4.b');
//   });
// });
//
// readable2.pipe(process.stdout);
// *******************************************************


function startGrow(file) {
  setInterval(growFile, 5000, file);
}


// process.stdin.pipe(process.stdout); //Works as expected.

module.exports.growFile = startGrow;
