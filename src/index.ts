import { Game } from './game/Game';

const game = new Game({
  mapWidth: 50,
  mapHeight: 50,
  maxRooms: 10,
  enableAutoSave: false,
  autoSaveInterval: 300000
});

game.start();

process.on('SIGINT', () => {
  console.log('\nShutting down game...');
  game.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down game...');
  game.stop();
  process.exit(0);
});
