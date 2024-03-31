const readFile = require("./readFile");
const YAML = require('yaml');
const fs = require('fs');
const file = fs.readFileSync('config.yml', 'utf8');


const config = YAML.parse(file);
if (!config) {
  console.log("Error parsing config.yml");
  process.exit(1);
}
console.log("Config loaded: ", config);

setInterval(() => {
readFile();
}, config.INTERVAL);