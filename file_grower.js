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

function startGrow(rate, file) {
  setInterval(growFile, rate, file);
}

module.exports.growFile = startGrow;
