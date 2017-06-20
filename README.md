# Node Code Challenge

## Instructions

`tail -f logfile | ./reporter.js [--verbose]`

Or for testing purposes:
`tail -f much_text.txt | node file_grower.js`

## Question

I'm running into an issue with getting a continuous stream going.

For example: In the `file_grower` script, I've set up a timer to add some lines
to the `much_text.txt` file.

In that script, if I pipe directly from stdin to stdout, it works as expected -
The last 10 lines that have been added get logged to the console.

However if I pipe them elsewhere for processing and then back to stdout, I don't
get the update from stdin.

The Same problem exists with `reporter.js` as I've written the two scripts on the
same principles.

## Update:
Problem solved. I wasn't calling the callbacks from my write streams. I thought I didn't need them since they are completely empty functions, but
it looks as though they need to be called in order to keep the stream flowing properly.
