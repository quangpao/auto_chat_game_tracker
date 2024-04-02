const fs = require('fs');
const rl = require('readline');
const path = require('path');
const math = require('mathjs');
const { exec } = require('child_process');

let lastDetectedGame = [0, '', ''];
let gameTypes = {
  'First to type the word': 2,
  'Solve the following': 1
}

module.exports = function readFile() {
  try {
    const appData = process.env.APPDATA;
    const filePath = path.join(appData, '.minecraft', 'logs', 'latest.log');
    
    // Make stream read file line by line
    const reader = rl.createInterface({
      input: fs.createReadStream(filePath, { encoding: 'utf8' })
    });

    let lastChatGame = [0, '', '']; //[timestamp, chatGame, time]
    let lastTypeGame = 1; // 1 = guessNumber, 2 = typeString
    let isGame = false;

    reader.on('line', (line) => {
      isGame = false;
      const gameType = Object.keys(gameTypes).find(type => line.includes(type));
      if (gameType) {
        lastTypeGame = gameTypes[gameType];
        isGame = true;
      }

      if (isGame) {
        const date = new Date().toISOString().split('T')[0];
        const [time] = line.split(' ')[0].match(/\[(.*?)\]/) || [];
        const timestamp = Date.parse(`${date} ${time}`) / 1000;
        if (timestamp > lastChatGame[0]) {
          let result = '';
          switch (lastTypeGame) {
            case 1:
              result = line.split('Solve the following: ')[1].replace('\r', '');
              lastChatGame = [timestamp, math.evaluate(result), time];
              break;
            case 2:
              result = line.split('First to type the word: ')[1].replace('\r', '');
              lastChatGame = [timestamp, result, time];
              break;
          }
        }
      }
    });

    reader.on('close', () => {
      const currentTime = Date.now() / 1000;
      if (lastDetectedGame[1] === lastChatGame[1]) {
        return;
      }
      lastDetectedGame = lastChatGame;
      console.log(`[${lastChatGame[2]}] Detected game: ${lastChatGame[1]}`)
      console.log(`Next game will be at ${new Date((currentTime + 600) * 1000).toISOString().split('T')[1].split('.')[0]}`)

      exec(`echo ${lastChatGame[1]} | clip`, (err, stdout, stderr) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    });
  } catch (error) {
    console.log('Error detected: ', error);
  }
}
