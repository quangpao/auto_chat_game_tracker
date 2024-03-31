const fs = require('fs');
const rl = require('readline');
const path = require('path');

module.exports = function readFile() {

  const appData = process.env.APPDATA;
  const filePath = path.join(appData, '.minecraft', 'logs', 'latest.log');
  // Make stream read file line by line
  const reader = rl.createInterface({
    input: fs.createReadStream(filePath, { encoding: 'utf8' })
  });
  let lastChatGame = [0, '']; //[timestamp, chatGame]
  let lastTypeGame = 1; // 1 = guessNumber, 2 = typeString
  let isGame = false;
  reader.on('line', (line) => {
    isGame = false;
    if (line.includes('First to type the word')) {
      lastTypeGame = 2;
      isGame = true;
    } else if (line.includes('Solve the following')) {
      lastTypeGame = 1;
      isGame = true;
    }
    if (isGame) {
      const date = new Date().toISOString().split('T')[0];
      const timeLine = `${date} ` + line.split(' ')[0].split('[')[1].split(']')[0];
      const timestamp = new Date(timeLine).getTime() / 1000;
      if (timestamp > lastChatGame[0]) {
        let result = '';
        switch (lastTypeGame) {
          case 1:
            result = line.split('Solve the following: ')[1].replace('\r', '');
            lastChatGame = [timestamp, eval(result)];
            break;
          case 2:
            result = line.split('First to type the word: ')[1].replace('\r', '');
            lastChatGame = [timestamp, result];
            break;

        }
      }
    }
  });

  reader.on('close', () => {
    console.log('Last chat game:', lastChatGame);
    const currentTime = new Date().getTime() / 1000;
    console.log('Current time:', currentTime, 'Diff:', currentTime - lastChatGame[0]);
    if (currentTime - lastChatGame[0] > 30) {
      return;
    }

    const { exec } = require('child_process');
    exec(`echo ${lastChatGame[1]} | clip`, (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return;
      }
    });
  });

}
