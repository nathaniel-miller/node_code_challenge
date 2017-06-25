const assert = require('assert');
const stream = require('stream');
const reporter = require('./reporter');
const file_grower = require('./file_grower');

const buf = Buffer.from("Line 1\nLine 2", 'utf8');
const buf2 = Buffer.from("Line 1\nLine 2\nLine 3", 'utf8');

let finalMessage = "All tests pass :)"

const tests = {
  "test1": function() {
    assert.equal(reporter.setRate(), 1000, 'setRate does not work if no option is passed.')
  },
  "test2": function() {
    assert.equal(reporter.setRate(2000), 2000, 'setRate does not set rate according to the option passed.')
  },
  "test3": function() {
    assert.equal(reporter.setRate('letters'), 1000, 'setRate does not set default rate if option passed is invalid.')
  },
  "test4": function() {
    assert.equal(reporter.setms([1, 2345678]), 1002.345678, 'setms does not convert hrtime to ms properly.')
  },
  "test5": function() {
    assert.equal(reporter.setms([2, 3456789]), 2003.456789, 'setms does not convert hrtime to ms properly.')
  },
  "test6": function() {
    reporter.resetTotalBytes();
    assert.equal(reporter.setTotalBytes(buf), 13, 'setTotalBytes does not set the total number of bytes properly.');
  },
  "test7": function() {
    reporter.resetTotalBytes();
    assert.equal(reporter.setTotalBytes(buf2), 20, 'setTotalBytes does not set the total number of bytes properly.')
  },
  "test8": function() {
    reporter.resetTotalLines();
    assert.equal(reporter.setTotalLines(buf), 2, 'setTotalLines does not set the total number of lines properly.');
  },
  "test9": function() {
    reporter.resetTotalLines();
    assert.equal(reporter.setTotalLines(buf2), 3, 'setTotalLines does not set the total number of lines properly.');
  },
  "test10": function() {
    reporter.resetTotalLines();
    assert.equal(reporter.setbps({'elapsedTime': 2000, 'totalBytes': 4000}), 2000, 'setbps does not set properly calculate bytes pers second.');
  },
  "test11": function() {
    const testms = reporter.setms(process.hrtime());
    reporter.resetStart()
    assert.equal(
      Math.floor(reporter.objectifyChunk(buf)['elapsedTime']),
      Math.floor(testms),
     'objectifyChunk does not set ms properly.');
  },
  "test12": function() {
    reporter.resetTotalBytes();
    assert.equal(reporter.objectifyChunk(buf)['totalBytes'], 13, 'objectifyChunk does not set totalBytes properly.');
  },
  "test13": function() {
    reporter.resetTotalLines();
    assert.equal(reporter.objectifyChunk(buf)['totalLines'], 2, 'objectifyChunk does not set totalLines properly.');
  },
  "test14": function() {
    assert.equal(reporter.notCoreFile('test.js'), false, 'notCoreFile does not properly recognize core files.');
  },
  "test15": function() {
    assert.equal(reporter.notCoreFile('somefile.js'), true, 'notCoreFile does not properly recognize core files.');
  },
  "test16": function() {
    const testObj = {'elapsedTime': 2000, 'totalBytes': 4000, 'totalLines': 3};
    assert.equal(reporter.issueReport(testObj),
    'Report: 3 lines processed at an average speed of 2000 bytes/second.\n',
    'issueReport issues an incorrect report.');
  }
}

function testRunner(tests) {
  for (test in tests) {
    try {
      tests[test]();
    } catch (e) {
      finalMessage = '';

      errorMessage(e);
    }
  }

  console.log(finalMessage)
}

function errorMessage(e) {
  console.log('Test Failed:');
  console.log(e.message);
  console.log('Expected: ', e.expected);
  console.log('Actual: ', e.actual);
  console.log('');
}

testRunner(tests);
