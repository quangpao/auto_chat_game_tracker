const readFile = require("./readFile");
const YAML = require('yaml');
const fs = require('fs');

// Check if config.yml exists, if not, create it and write default values
if (!fs.existsSync('config.yml')) {
  const defaultConfig = {
    INTERVAL: 500
  };
  fs.writeFileSync('config.yml', YAML.stringify(defaultConfig));
  console.log("Config.yml created with default values");
}
const file = fs.readFileSync('config.yml', 'utf8');

const config = YAML.parse(file);
if (!config) {
  console.log("Error parsing config.yml");
  process.exit(1);
}
console.log("Config loaded: ", config);

setInterval(() => {
readFile(config.INTERVAL);
}, config.INTERVAL);