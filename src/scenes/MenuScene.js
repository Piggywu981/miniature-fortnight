import { Scene } from 'phaser';
import { CharacterConfig } from '../characters/CharacterConfig.js';
import { AudioGenerator } from '../assets/AudioGenerator.js';

export class MenuScene extends Scene {
    constructor() {
        super({ key: 'MenuScene' });
        this.selectedCharacter = 'INA'; // 默认选择伊娜
    }

    create() {
        this.audio = new AudioGenerator();
        this.audio.init().then(() => {
            this.audio.playMenuBGM();
        });

        this.cameras.main.setBackgroundColor('#0a0a15');
        
        this.createStarfieldBackground();
        
        const title = this.add.text(this.game.config.width / 2, 80, '地牢肉鸽', {
            fontSize: '48px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#00ff00',
            stroke: '#000',
            strokeThickness: 6,
            shadow: { offsetX: 2, offsetY: 2, blur: 0, color: '#00ff00', fill: true }
        });
        title.setOrigin(0.5);
        
        this.tweens.add({
            targets: title,
            alpha: 0.7,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
        
        const subtitle = this.add.text(this.game.config.width / 2, 150, '选择你的角色，征服地牢！', {
            fontSize: '14px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#ffffff'
        });
        subtitle.setOrigin(0.5);
        
        this.createCharacterSelection();
        
        this.createStartButton();
        
        this.createInstructions();
    }

    createCharacterSelection() {
        const characters = [
            { id: 'INA', name: '伊娜', class: '干活的', desc: '新手友好型，霰弹枪专精' },
            { id: 'MISHKA', name: '米什卡', class: '疯子', desc: '高伤害，免疫元素' },
            { id: 'ANNA', name: '安娜', class: '谨慎军师', desc: '高闪避，召唤专精' },
            { id: 'MILAN', name: '米兰', class: '傻子', desc: '高护盾，无敌技能' },
            { id: 'YUKO', name: '玉子', class: '乐子人', desc: '随机升级，爆炸伤害' }
        ];
        
        const startY = 250;
        const spacing = 70;
        
        this.characterButtons = [];
        
        characters.forEach((char, index) => {
            const y = startY + index * spacing;
            const config = CharacterConfig[char.id];
            
            const preview = this.add.rectangle(
                this.game.config.width / 2 - 190,
                y,
                32, 32,
                this.getCharacterColor(char.id)
            );
            preview.alpha = this.selectedCharacter === char.id ? 1 : 0.5;
            
            const buttonBg = this.add.rectangle(
                this.game.config.width / 2, y, 450, 60,
                this.selectedCharacter === char.id ? 0x003300 : 0x222222
            );
            buttonBg.setInteractive();
            buttonBg.setStrokeStyle(2, 0x666666);
            
            const nameText = this.add.text(
                this.game.config.width / 2 - 160, y - 5,
                `${char.name} (${char.class})`,
                {
                    fontSize: '14px',
                    fontFamily: '"Press Start 2P", monospace',
                    color: this.selectedCharacter === char.id ? '#00ff00' : '#ffffff'
                }
            );
            nameText.setOrigin(0, 0.5);
            
            const statsText = this.add.text(
                this.game.config.width / 2 - 160, y + 15,
                `HP:${config.stats.health} SH:${config.stats.shield}`,
                {
                    fontSize: '10px',
                    fontFamily: '"Press Start 2P", monospace',
                    color: this.selectedCharacter === char.id ? '#00ff00' : '#aaaaaa'
                }
            );
            statsText.setOrigin(0, 0.5);
            
            const descText = this.add.text(
                this.game.config.width / 2 + 180, y,
                char.desc,
                {
                    fontSize: '10px',
                    fontFamily: '"Press Start 2P", monospace',
                    color: this.selectedCharacter === char.id ? '#00ff00' : '#aaaaaa'
                }
            );
            descText.setOrigin(1, 0.5);
            
            buttonBg.on('pointerover', () => {
                if (this.audio) this.audio.uiClick();
                if (this.selectedCharacter !== char.id) {
                    buttonBg.setFillStyle(0x333333);
                    preview.alpha = 0.8;
                }
            });
            
            buttonBg.on('pointerout', () => {
                if (this.selectedCharacter !== char.id) {
                    buttonBg.setFillStyle(0x222222);
                    preview.alpha = 0.5;
                }
            });
            
            buttonBg.on('pointerdown', () => {
                if (this.audio) this.audio.uiClick();
                this.selectCharacter(char.id, characters);
            });
            
            this.characterButtons.push({
                bg: buttonBg,
                name: nameText,
                stats: statsText,
                desc: descText,
                preview: preview,
                id: char.id
            });
        });
    }

    selectCharacter(characterId, characters) {
        characters.forEach((char, index) => {
            const button = this.characterButtons[index];
            button.bg.setFillStyle(0x222222);
            button.name.setColor('#ffffff');
            button.stats.setColor('#aaaaaa');
            button.desc.setColor('#aaaaaa');
            button.preview.alpha = 0.5;
        });
        
        const selectedIndex = characters.findIndex(c => c.id === characterId);
        const selectedButton = this.characterButtons[selectedIndex];
        selectedButton.bg.setFillStyle(0x003300);
        selectedButton.name.setColor('#00ff00');
        selectedButton.stats.setColor('#00ff00');
        selectedButton.desc.setColor('#00ff00');
        selectedButton.preview.alpha = 1;
        
        this.selectedCharacter = characterId;
    }

    createStartButton() {
        const startBtn = this.add.rectangle(
            this.game.config.width / 2,
            600,
            200, 50,
            0x00aa00
        );
        startBtn.setInteractive();
        startBtn.setStrokeStyle(4, 0x00ff00);
        
        const startText = this.add.text(
            this.game.config.width / 2,
            600,
            '开始游戏',
            {
                fontSize: '16px',
                fontFamily: '"Press Start 2P", monospace',
                color: '#ffffff',
                stroke: '#000',
                strokeThickness: 3
            }
        );
        startText.setOrigin(0.5);
        
        startBtn.on('pointerover', () => {
            if (this.audio) this.audio.uiClick();
            startBtn.setFillStyle(0x00cc00);
            this.tweens.add({
                targets: startBtn,
                scale: 1.05,
                duration: 100
            });
        });
        
        startBtn.on('pointerout', () => {
            startBtn.setFillStyle(0x00aa00);
            this.tweens.add({
                targets: startBtn,
                scale: 1,
                duration: 100
            });
        });
        
        startBtn.on('pointerdown', () => {
            if (this.audio) this.audio.uiClick();
            this.tweens.add({
                targets: startBtn,
                scale: 0.95,
                duration: 50,
                yoyo: true,
                onComplete: () => {
                    this.startGame();
                }
            });
        });
    }

    createInstructions() {
        const instructions = [
            '操作说明：',
            'WASD / 方向键 - 移动',
            '鼠标左键 - 射击',
            '鼠标右键 - 特殊技能',
            '目标：消灭敌人，生存下去！'
        ];
        
        instructions.forEach((text, index) => {
            this.add.text(
                this.game.config.width / 2,
                660 + index * 20,
                text,
                {
                    fontSize: '10px',
                    fontFamily: '"Press Start 2P", monospace',
                    color: '#aaaaaa'
                }
            ).setOrigin(0.5);
        });
    }

    startGame() {
        if (this.audio) {
            this.audio.stopBGM();
        }
        this.scene.start('GameScene', { 
            characterId: this.selectedCharacter 
        });
    }
    
    createStarfieldBackground() {
        const starCount = 100;
        for (let i = 0; i < starCount; i++) {
            const x = Phaser.Math.Between(0, this.game.config.width);
            const y = Phaser.Math.Between(0, this.game.config.height);
            const size = Phaser.Math.Between(1, 3);
            const star = this.add.rectangle(x, y, size, size, 0xffffff);
            star.alpha = Phaser.Math.FloatBetween(0.3, 0.8);
            
            this.tweens.add({
                targets: star,
                alpha: 0.1,
                duration: Phaser.Math.Between(1000, 3000),
                yoyo: true,
                repeat: -1
            });
        }
    }
    
    getCharacterColor(characterId) {
        const colors = {
            'INA': 0x00ff00,
            'MISHKA': 0xff8800,
            'ANNA': 0x00ffff,
            'MILAN': 0xff00ff,
            'YUKO': 0xffff00
        };
        return colors[characterId] || 0x00ff00;
    }
}