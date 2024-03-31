const readFile = require("./readFile");
const YAML = require('yaml');
const fs = require('fs');
const file = fs.readFileSync('config.yml', 'utf8');


const config = YAML.parse(file);

console.log(config);

setInterval(() => {
readFile();
}, config.INTERVAL);