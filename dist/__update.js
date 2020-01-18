
/* global __dirname */

const path = require('path');
const tgrwb = require(path.resolve(__dirname, '../../../admin/_template_module.js'));

var name = __dirname.replace(/^.*\//, '').replace(/^.*\\/, '');
console.log(name);
tgrwb.update(__dirname, name);
