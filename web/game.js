class GameClient {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.tileSize = 16;
        this.gameState = null;
        this.isPaused = false;
        
        this.initializeCanvas();
        this.setupEventListeners();
        this.startGameLoop();
    }
    
    initializeCanvas() {
        const maxCanvasWidth = Math.floor((window.innerWidth * 0.7) / this.tileSize) * this.tileSize;
        const maxCanvasHeight = Math.floor((window.innerHeight * 0.8) / this.tileSize) * this.tileSize;
        
        this.canvas.width = Math.min(800, maxCanvasWidth);
        this.canvas.height = Math.min(600, maxCanvasHeight);
        
        window.addEventListener('resize', () => {
            const newMaxWidth = Math.floor((window.innerWidth * 0.7) / this.tileSize) * this.tileSize;
            const newMaxHeight = Math.floor((window.innerHeight * 0.8) / this.tileSize) * this.tileSize;
            
            this.canvas.width = Math.min(800, newMaxWidth);
            this.canvas.height = Math.min(600, newMaxHeight);
        });
    }
    
    setupEventListeners() {
        document.getElementById('btn-up').addEventListener('click', () => this.movePlayer('up'));
        document.getElementById('btn-down').addEventListener('click', () => this.movePlayer('down'));
        document.getElementById('btn-left').addEventListener('click', () => this.movePlayer('left'));
        document.getElementById('btn-right').addEventListener('click', () => this.movePlayer('right'));
        document.getElementById('btn-wait').addEventListener('click', () => this.playerWait());
        document.getElementById('btn-pause').addEventListener('click', () => this.pauseGame());
        document.getElementById('btn-resume').addEventListener('click', () => this.resumeGame());
        
        document.addEventListener('keydown', (e) => {
            if (this.isPaused) return;
            
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    this.movePlayer('up');
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    this.movePlayer('down');
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    this.movePlayer('left');
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    this.movePlayer('right');
                    break;
                case ' ':
                case '5':
                    e.preventDefault();
                    this.playerWait();
                    break;
                case 'Escape':
                    e.preventDefault();
                    if (this.isPaused) {
                        this.resumeGame();
                    } else {
                        this.pauseGame();
                    }
                    break;
            }
        });
    }
    
    async movePlayer(direction) {
        try {
            const response = await fetch('/api/game/action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'move',
                    direction: direction
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.addLogEntry(`Moved ${direction}`, 'info');
                await this.updateGameState();
            } else {
                this.addLogEntry(`Cannot move ${direction}: ${result.reason}`, 'warning');
            }
        } catch (error) {
            console.error('Move failed:', error);
            this.addLogEntry('Move failed: Network error', 'error');
        }
    }
    
    async playerWait() {
        try {
            const response = await fetch('/api/game/action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'wait'
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.addLogEntry('You wait...', 'info');
                await this.updateGameState();
            }
        } catch (error) {
            console.error('Wait action failed:', error);
            this.addLogEntry('Action failed: Network error', 'error');
        }
    }
    
    async pauseGame() {
        try {
            const response = await fetch('/api/game/pause', {
                method: 'POST'
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.isPaused = true;
                this.addLogEntry('Game paused', 'warning');
                this.updatePauseState();
            }
        } catch (error) {
            console.error('Pause failed:', error);
        }
    }
    
    async resumeGame() {
        try {
            const response = await fetch('/api/game/resume', {
                method: 'POST'
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.isPaused = false;
                this.addLogEntry('Game resumed', 'success');
                this.updatePauseState();
            }
        } catch (error) {
            console.error('Resume failed:', error);
        }
    }
    
    updatePauseState() {
        const buttons = document.querySelectorAll('.control-btn');
        buttons.forEach(btn => {
            if (btn.id !== 'btn-resume' && btn.id !== 'btn-pause') {
                btn.disabled = this.isPaused;
            }
        });
        
        document.getElementById('btn-pause').disabled = this.isPaused;
        document.getElementById('btn-resume').disabled = !this.isPaused;
    }
    
    async updateGameState() {
        try {
            const response = await fetch('/api/game/state');
            this.gameState = await response.json();
            this.render();
            this.updateUI();
        } catch (error) {
            console.error('Failed to update game state:', error);
        }
    }
    
    updateUI() {
        if (!this.gameState) return;
        
        document.getElementById('level').textContent = this.gameState.level;
        document.getElementById('health').textContent = 
            `${this.gameState.player.health}/${this.gameState.player.maxHealth}`;
        document.getElementById('experience').textContent = this.gameState.player.experience;
        document.getElementById('position').textContent = 
            `${this.gameState.player.position.x}, ${this.gameState.player.position.y}`;
        
        const stats = this.gameState.stats;
        document.getElementById('playTime').textContent = `${Math.floor(stats.playTime / 1000)}s`;
        document.getElementById('roomsExplored').textContent = stats.roomsExplored;
        document.getElementById('enemiesDefeated').textContent = stats.enemiesDefeated;
        document.getElementById('itemsCollected').textContent = stats.itemsCollected;
    }
    
    render() {
        if (!this.gameState) return;
        
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const map = this.gameState.map;
        const player = this.gameState.player;
        const tiles = map.tiles;
        
        const offsetX = (this.canvas.width - map.width * this.tileSize) / 2;
        const offsetY = (this.canvas.height - map.height * this.tileSize) / 2;
        
        for (let y = 0; y < map.height; y++) {
            for (let x = 0; x < map.width; x++) {
                const tile = tiles[y][x];
                const tileX = offsetX + x * this.tileSize;
                const tileY = offsetY + y * this.tileSize;
                
                this.renderTile(tile, tileX, tileY, x, y);
                
                if (x === player.position.x && y === player.position.y) {
                    this.renderPlayer(tileX, tileY);
                }
            }
        }
        
        this.ctx.strokeStyle = '#444';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(offsetX, offsetY, map.width * this.tileSize, map.height * this.tileSize);
    }
    
    renderTile(tile, x, y, tileX, tileY) {
        const isExplored = this.gameState.map.exploredTiles.some(
            t => t.x === tileX && t.y === tileY
        );
        
        if (!isExplored) {
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
            return;
        }
        
        switch (tile.type) {
            case 'wall':
                this.ctx.fillStyle = '#444';
                break;
            case 'floor':
                this.ctx.fillStyle = '#666';
                break;
            case 'door':
                this.ctx.fillStyle = '#8B4513';
                break;
            case 'corridor':
                this.ctx.fillStyle = '#555';
                break;
            default:
                this.ctx.fillStyle = '#000';
        }
        
        this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
        
        if (tile.type === 'floor' || tile.type === 'corridor') {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            this.ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
        }
    }
    
    renderPlayer(x, y) {
        const centerX = x + this.tileSize / 2;
        const centerY = y + this.tileSize / 2;
        const radius = this.tileSize / 3;
        
        this.ctx.fillStyle = '#3498db';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#2980b9';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(centerX - radius/3, centerY - radius/3, radius/5, 0, Math.PI * 2);
        this.ctx.arc(centerX + radius/3, centerY - radius/3, radius/5, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    addLogEntry(message, type = 'info') {
        const logContainer = document.getElementById('game-log');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        
        logContainer.appendChild(entry);
        logContainer.scrollTop = logContainer.scrollHeight;
        
        while (logContainer.children.length > 100) {
            logContainer.removeChild(logContainer.firstChild);
        }
    }
    
    startGameLoop() {
        this.updateGameState();
        
        setInterval(() => {
            this.updateGameState();
        }, 100);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const gameClient = new GameClient();
    
    gameClient.addLogEntry('Welcome to Miniature Fortnight!', 'success');
    gameClient.addLogEntry('Use arrow keys or WASD to move', 'info');
    gameClient.addLogEntry('Press SPACE or 5 to wait', 'info');
    gameClient.addLogEntry('Press ESC to pause/resume', 'info');
    
    window.gameClient = gameClient;
});