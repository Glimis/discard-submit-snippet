var path = require('path'),
fs = require('fs'),
filepath = path.join(__dirname, 'experiment.log'),
fd = fs.openSync(filepath, 'r');



fs.read(fd, 1210241024, 0, 'utf-8', function(err, str, bytesRead) {

});

console.log('[main thread] execute operation after read');