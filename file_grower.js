const fs = require('fs');
const stream = require('stream');

const words = fs.readFileSync('text.txt', 'utf8').split(' ');
const maxLines = maxOf(50);

function growFile() {

  for(let line = 0; line < maxLines; line++) {
    let chunk = writeLine();

    fs.appendFile('much_text.txt', chunk, err => {
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
const readable1 = new stream.Readable({
  read(size){/*...*/}
});

const readable2 = new stream.Readable({
  read(size){/*...*/}
});

const writable1 = new stream.Writable({
  write(data, enc, callback){
    console.log('CheckPoint 2', data);
    readable1.push(data);
    callback();
  }
});

const writable2 = new stream.Writable({
  write(data, enc, callback){
    console.log('CheckPoint 4', data);
    readable2.push(data);
    callback();
  }
});

// -----  -----  -------   ----- ----   ---------
//Readable Stream gets data -> writes that data to a writeable stream.
//That writable stream pushes the data to the next readable stream.

process.stdin.on('data', data => {
  console.log('CheckPoint 1', data);
  writable1.write(data, () => {
    console.log('CheckPoint 2.b', data);
  });
});

// readable1.pipe(writeable2);
readable1.on('data', data => {
  console.log('CheckPoint 3', data);
  writable2.write(data, () => {
    console.log('CheckPoint 4.b');
  });
});

readable2.pipe(process.stdout)
readable2.on('end', () => {console.log('Its Over')})
// *******************************************************


// const rw1 = new stream.Duplex({
//   write(chunk, enc, callback) {
//     rw1.push(chunk.toString().toUpperCase());
//     rw1.push(null);
//   },
//   read(size) {/*...*/},
// });
//
// const rw2 = new stream.Duplex({
//   write(chunk, enc, callback) {
//     rw2.push(chunk.toString().split(',').join(''));
//     rw2.push(null);
//   },
//   read(size) {/*...*/},
// });

setInterval(growFile, 5000);

// process.stdin.pipe(rw1);
// rw1.pipe(rw2);
// rw2.pipe(process.stdout);

// process.stdin.pipe(process.stdout); //Works as expected.

module.exports.growFile = growFile;
