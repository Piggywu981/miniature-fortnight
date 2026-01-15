import { Scene } from 'phaser';
import { AudioGenerator } from '../assets/AudioGenerator.js';

export class GameOverScene extends Scene {
    constructor() {
        super({ key: 'GameOverScene' });
        this.finalStats = null;
        this.audio = null;
    }

    init(data) {
        // 接收游戏结束时的数据
        this.finalStats = data || {
            characterName: '未知',
            characterClass: '未知',
            killCount: 0,
            gameTime: 0,
            reason: '未知原因',
            characterId: 'INA'  // 添加角色ID以便重新开始
        };
    }

    create() {
        this.audio = new AudioGenerator();
        this.audio.init().then(() => {
            this.audio.playGameOverBGM();
        });
        
        this.cameras.main.setBackgroundColor('#0f0010');
        
        const gameOverText = this.add.text(
            this.game.config.width / 2, 120,
            'GAME OVER',
            {
                fontSize: '64px',
                fontFamily: '"Press Start 2P", monospace',
                color: '#ff0000',
                stroke: '#000',
                strokeThickness: 8,
                shadow: { offsetX: 4, offsetY: 4, blur: 0, color: '#ff0000', fill: true }
            }
        );
        gameOverText.setOrigin(0.5);
        
        this.tweens.add({
            targets: gameOverText,
            x: this.game.config.width / 2 + 2,
            duration: 50,
            yoyo: true,
            repeat: 20
        });
        
        const characterText = this.add.text(
            this.game.config.width / 2,
            200,
            `角色: ${this.finalStats.characterName}`,
            {
                fontSize: '12px',
                fontFamily: '"Press Start 2P", monospace',
                color: '#ffffff'
            }
        );
        characterText.setOrigin(0.5);
        
        const reasonText = this.add.text(
            this.game.config.width / 2,
            230,
            this.finalStats.reason || '你倒在了地牢中...',
            {
                fontSize: '10px',
                fontFamily: '"Press Start 2P", monospace',
                color: '#ffaaaa'
            }
        );
        reasonText.setOrigin(0.5);
        
        this.createStatsPanel();
        
        this.createRatingDisplay();
        
        this.createButtons();
        
        this.createParticleEffect();
    }

    createStatsPanel() {
        const panelX = this.game.config.width / 2;
        const panelY = 330;
        
        const panelBg = this.add.rectangle(panelX, panelY, 450, 160, 0x000000);
        panelBg.setStrokeStyle(4, 0x666666);
        
        this.add.text(panelX - 200, panelY - 50, `角色: ${this.finalStats.characterName}`, {
            fontSize: '10px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#ffffff'
        }).setOrigin(0, 0.5);
        
        this.add.text(panelX - 200, panelY - 30, this.finalStats.reason || '你倒在了地牢中...', {
            fontSize: '10px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#ffaaaa'
        }).setOrigin(0, 0.5);
        
        this.add.text(panelX - 200, panelY + 20, `击杀: ${this.finalStats.killCount}`, {
            fontSize: '12px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#00ff00'
        }).setOrigin(0, 0.5);
        
        const minutes = Math.floor(this.finalStats.gameTime / 60000);
        const seconds = Math.floor((this.finalStats.gameTime % 60000) / 1000);
        this.add.text(panelX - 200, panelY + 50, `时间: ${minutes}:${seconds.toString().padStart(2, '0')}`, {
            fontSize: '12px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#ffff00'
        }).setOrigin(0, 0.5);
    }

    calculateRating() {
        const killCount = this.finalStats.killCount;
        const time = this.finalStats.gameTime / 1000; // 转换为秒
        
        const score = killCount * 10 + time * 0.5;
        
        if (score >= 5000) return 'S';
        if (score >= 3000) return 'A';
        if (score >= 2000) return 'B';
        if (score >= 1000) return 'C';
        if (score >= 500) return 'D';
        return 'F';
    }

    getRatingColor(rating) {
        switch (rating) {
            case 'S': return '#ff00ff';
            case 'A': return '#ffff00';
            case 'B': return '#00ffff';
            case 'C': return '#00ff00';
            case 'D': return '#ffaa00';
            default: return '#ff0000';
        }
    }
    
    getStarCount(rating) {
        switch(rating) {
            case 'S': return 5;
            case 'A': return 4;
            case 'B': return 3;
            case 'C': return 2;
            case 'D': return 1;
            default: return 0;
        }
    }
    
    createRatingDisplay() {
        const rating = this.calculateRating();
        const ratingX = this.game.config.width / 2;
        const ratingY = 400;
        
        const ratingText = this.add.text(ratingX, ratingY, rating, {
            fontSize: '80px',
            fontFamily: '"Press Start 2P", monospace',
            color: this.getRatingColor(rating),
            stroke: '#000',
            strokeThickness: 8
        });
        ratingText.setOrigin(0.5);
        
        this.tweens.add({
            targets: ratingText,
            scale: 1.1,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
        
        const stars = this.getStarCount(rating);
        for (let i = 0; i < stars; i++) {
            const star = this.add.rectangle(
                ratingX - 60 + i * 40,
                ratingY + 50,
                20, 20, 0xffff00
            );
        }
    }

    createButtons() {
        const buttonY = 530;
        
        this.createPixelButton(
            this.game.config.width / 2 - 100,
            buttonY,
            180, 50,
            '重新开始',
            0x00aa00,
            () => this.restartGame()
        );
        
        this.createPixelButton(
            this.game.config.width / 2 + 100,
            buttonY,
            180, 50,
            '主菜单',
            0xaa0000,
            () => this.backToMenu()
        );
    }
    
    createPixelButton(x, y, width, height, text, color, callback) {
        const container = this.add.container(x, y);
        
        const bg = this.add.rectangle(0, 0, width, height, color);
        bg.setStrokeStyle(4, this.lightenColor(color, 50));
        
        const textObj = this.add.text(0, 0, text, {
            fontSize: '14px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#ffffff',
            stroke: '#000',
            strokeThickness: 3
        });
        textObj.setOrigin(0.5);
        
        container.add([bg, textObj]);
        
        bg.setInteractive();
        
        bg.on('pointerover', () => {
            if (this.audio) this.audio.uiClick();
            bg.setFillStyle(this.lightenColor(color, 30));
            this.tweens.add({
                targets: container,
                scale: 1.05,
                duration: 100
            });
        });
        
        bg.on('pointerout', () => {
            bg.setFillStyle(color);
            this.tweens.add({
                targets: container,
                scale: 1,
                duration: 100
            });
        });
        
        bg.on('pointerdown', () => {
            if (this.audio) this.audio.uiClick();
            this.tweens.add({
                targets: container,
                scale: 0.95,
                duration: 50,
                yoyo: true,
                onComplete: callback
            });
        });
    }
    
    lightenColor(color, amount) {
        return color + amount;
    }

    createParticleEffect() {
        // 创建粒子效果作为背景装饰
        const particles = this.add.particles(400, 300, 'particle', {
            speed: { min: 20, max: 50 },
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 3000,
            frequency: 500
        });
        
        // 创建简单的粒子纹理（如果不存在）
        if (!this.textures.exists('particle')) {
            const graphics = this.make.graphics({ x: 0, y: 0 }, false);
            graphics.fillStyle(0xff0000);
            graphics.fillCircle(4, 4, 4);
            graphics.generateTexture('particle', 8, 8);
            graphics.destroy();
        }
    }

    restartGame() {
        // 重新使用相同的角色开始新游戏
        this.scene.start('GameScene', {
            characterId: this.finalStats.characterId || 'INA'
        });
    }

    backToMenu() {
        // 返回主菜单
        this.scene.start('MenuScene');
    }
}