import { Scene } from 'phaser';

export class GameOverScene extends Scene {
    constructor() {
        super({ key: 'GameOverScene' });
        this.finalStats = null;
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
        // 设置背景色
        this.cameras.main.setBackgroundColor('#1a0020');
        
        // 游戏结束标题
        const gameOverText = this.add.text(
            this.game.config.width / 2,
            150,
            '游戏结束',
            {
                fontSize: '64px',
                fontFamily: 'Arial',
                color: '#ff0000',
                stroke: '#000',
                strokeThickness: 6
            }
        );
        gameOverText.setOrigin(0.5);
        
        // 添加动画效果
        this.tweens.add({
            targets: gameOverText,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
        
        // 显示角色信息
        const characterText = this.add.text(
            this.game.config.width / 2,
            250,
            `角色: ${this.finalStats.characterName}`,
            {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#ffffff'
            }
        );
        characterText.setOrigin(0.5);
        
        // 显示死亡原因
        const reasonText = this.add.text(
            this.game.config.width / 2,
            300,
            this.finalStats.reason || '你倒在了地牢中...',
            {
                fontSize: '20px',
                fontFamily: 'Arial',
                color: '#ffaaaa',
                stroke: '#000',
                strokeThickness: 2
            }
        );
        reasonText.setOrigin(0.5);
        
        // 统计信息面板
        this.createStatsPanel();
        
        // 创建按钮
        this.createButtons();
        
        // 添加背景粒子效果（可选）
        this.createParticleEffect();
    }

    createStatsPanel() {
        const panelY = 380;
        
        // 面板背景
        const panelBg = this.add.rectangle(
            this.game.config.width / 2,
            panelY,
            400, 150,
            0x000000,
            0.5
        );
        panelBg.setStrokeStyle(2, 0x666666);
        
        // 击杀数
        const killText = this.add.text(
            this.game.config.width / 2 - 150,
            panelY - 40,
            `击杀敌人: ${this.finalStats.killCount}`,
            {
                fontSize: '20px',
                fontFamily: 'Arial',
                color: '#00ff00'
            }
        );
        killText.setOrigin(0, 0.5);
        
        // 游戏时长
        const minutes = Math.floor(this.finalStats.gameTime / 60000);
        const seconds = Math.floor((this.finalStats.gameTime % 60000) / 1000);
        const timeText = this.add.text(
            this.game.config.width / 2 - 150,
            panelY,
            `生存时间: ${minutes}分${seconds}秒`,
            {
                fontSize: '20px',
                fontFamily: 'Arial',
                color: '#ffff00'
            }
        );
        timeText.setOrigin(0, 0.5);
        
        // 评级系统
        const rating = this.calculateRating();
        const ratingText = this.add.text(
            this.game.config.width / 2 - 150,
            panelY + 40,
            `评级: ${rating}`,
            {
                fontSize: '20px',
                fontFamily: 'Arial',
                color: this.getRatingColor(rating)
            }
        );
        ratingText.setOrigin(0, 0.5);
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

    createButtons() {
        // 重新开始按钮
        const restartBtn = this.add.rectangle(
            this.game.config.width / 2 - 150,
            550,
            180, 50,
            0x00aa00
        );
        restartBtn.setInteractive();
        restartBtn.setStrokeStyle(3, 0x00ff00);
        
        const restartText = this.add.text(
            this.game.config.width / 2 - 150,
            550,
            '重新开始',
            {
                fontSize: '20px',
                fontFamily: 'Arial',
                color: '#fff',
                stroke: '#000',
                strokeThickness: 2
            }
        );
        restartText.setOrigin(0.5);
        
        // 主菜单按钮
        const menuBtn = this.add.rectangle(
            this.game.config.width / 2 + 150,
            550,
            180, 50,
            0xaa0000
        );
        menuBtn.setInteractive();
        menuBtn.setStrokeStyle(3, 0xff0000);
        
        const menuText = this.add.text(
            this.game.config.width / 2 + 150,
            550,
            '主菜单',
            {
                fontSize: '20px',
                fontFamily: 'Arial',
                color: '#fff',
                stroke: '#000',
                strokeThickness: 2
            }
        );
        menuText.setOrigin(0.5);
        
        // 按钮交互
        this.setupButton(restartBtn, restartText, 0x00cc00, 0x00aa00, () => {
            this.restartGame();
        });
        
        this.setupButton(menuBtn, menuText, 0xcc0000, 0xaa0000, () => {
            this.backToMenu();
        });
    }

    setupButton(button, text, hoverColor, normalColor, callback) {
        button.on('pointerover', () => {
            button.setFillStyle(hoverColor);
        });
        
        button.on('pointerout', () => {
            button.setFillStyle(normalColor);
        });
        
        button.on('pointerdown', callback);
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