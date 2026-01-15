import express from 'express';
import cors from 'cors';
import path from 'path';
import { Game } from './game/Game';
import { GameState } from './game/types';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../web')));

const game = new Game({
  mapWidth: 50,
  mapHeight: 50,
  maxRooms: 10,
  enableAutoSave: false,
  autoSaveInterval: 300000
});

game.start();

app.get('/api/game/state', (_req, res) => {
  res.json({
    state: game.getState(),
    player: {
      name: game.getPlayer().getName(),
      health: game.getPlayer().getStats().currentHealth,
      maxHealth: game.getPlayer().getStats().maxHealth,
      position: game.getPlayer().getPosition(),
      level: game.getPlayer().getStats().level,
      experience: game.getPlayer().getStats().experience
    },
    map: {
      width: game.getMap().getWidth(),
      height: game.getMap().getHeight(),
      tiles: game.getMap().serialize(),
      rooms: game.getMap().getRooms(),
      exploredTiles: game.getMap().getExploredTiles()
    },
    stats: game.getStats(),
    level: game.getCurrentLevel()
  });
});

app.post('/api/game/action', (req, res) => {
  const { action, direction } = req.body;
  
  if (game.getState() !== GameState.PLAYING) {
    return res.status(400).json({ error: 'Game is not in playing state' });
  }
  
  const player = game.getPlayer();
  const currentPos = player.getPosition();
  
  switch (action) {
    case 'move': {
      let newX = currentPos.x;
      let newY = currentPos.y;
      
      switch (direction) {
        case 'up':
          newY -= 1;
          break;
        case 'down':
          newY += 1;
          break;
        case 'left':
          newX -= 1;
          break;
        case 'right':
          newX += 1;
          break;
        default:
          return res.status(400).json({ error: 'Invalid direction' });
      }
      
      const map = game.getMap();
      if (map.isWalkable(newX, newY)) {
        player.setPosition({ x: newX, y: newY });
        map.setExplored(newX, newY, true);
        
        game.getStats().roomsExplored++;
        
        return res.json({
          success: true,
          newPosition: { x: newX, y: newY }
        });
      } else {
        return res.json({
          success: false,
          reason: 'Tile is not walkable'
        });
      }
    }
      
    case 'wait':
      return res.json({
        success: true,
        message: 'Player waits'
      });
      
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
});

app.post('/api/game/pause', (_req, res) => {
  game.pause();
  res.json({ success: true, state: game.getState() });
});

app.post('/api/game/resume', (_req, res) => {
  game.resume();
  res.json({ success: true, state: game.getState() });
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '../web/index.html'));
});

app.listen(PORT, () => {
  console.log(`Roguelike game server running on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  console.log('\nShutting down game server...');
  game.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down game server...');
  game.stop();
  process.exit(0);
});
