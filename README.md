# Node Code Challenge

## Instructions
Tail any existing file and pipe the input into `reporter.js` to get a
readout of the number of lines processed.

`tail -f logfile | ./reporter.js

Grow a file with randome lines of text by passing reporter.js a filename.

`tail -f growing.txt | ./reporter.js growing.txt`

Set the interval growth rate (in milliseconds) by passing a reporter.js a 2nd argument.

`tail -f growing.txt | ./reporter.js growing.txt 500`

Default growth rate is set to 1000ms.
