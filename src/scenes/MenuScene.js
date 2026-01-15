import { Scene } from 'phaser';
import { CharacterConfig } from '../characters/CharacterConfig.js';

export class MenuScene extends Scene {
    constructor() {
        super({ key: 'MenuScene' });
        this.selectedCharacter = 'INA'; // 默认选择伊娜
    }

    create() {
        // 设置背景色
        this.cameras.main.setBackgroundColor('#1a1a2e');
        
        // 游戏标题
        const title = this.add.text(this.game.config.width / 2, 100, '地牢肉鸽', {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#00ff00',
            stroke: '#000',
            strokeThickness: 4
        });
        title.setOrigin(0.5);
        
        // 副标题
        const subtitle = this.add.text(this.game.config.width / 2, 160, '选择你的角色，征服地牢！', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff'
        });
        subtitle.setOrigin(0.5);
        
        // 角色选择区域
        this.createCharacterSelection();
        
        // 开始游戏按钮
        this.createStartButton();
        
        // 操作说明
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
            
            // 角色按钮背景
            const buttonBg = this.add.rectangle(
                this.game.config.width / 2, y, 400, 50,
                this.selectedCharacter === char.id ? 0x00ff00 : 0x333333
            );
            buttonBg.setInteractive();
            buttonBg.setStrokeStyle(2, 0x666666);
            
            // 角色信息
            const nameText = this.add.text(
                this.game.config.width / 2 - 180, y,
                `${char.name} (${char.class})`,
                {
                    fontSize: '16px',
                    fontFamily: 'Arial',
                    color: this.selectedCharacter === char.id ? '#000' : '#fff'
                }
            );
            nameText.setOrigin(0, 0.5);
            
            const statsText = this.add.text(
                this.game.config.width / 2 - 180, y + 12,
                `HP: ${config.stats.health} | 盾: ${config.stats.shield}`,
                {
                    fontSize: '12px',
                    fontFamily: 'Arial',
                    color: this.selectedCharacter === char.id ? '#000' : '#aaa'
                }
            );
            nameText.setOrigin(0, 0.5);
            
            const descText = this.add.text(
                this.game.config.width / 2 + 180, y,
                char.desc,
                {
                    fontSize: '12px',
                    fontFamily: 'Arial',
                    color: this.selectedCharacter === char.id ? '#000' : '#aaa'
                }
            );
            descText.setOrigin(1, 0.5);
            
            // 点击事件
            buttonBg.on('pointerover', () => {
                if (this.selectedCharacter !== char.id) {
                    buttonBg.setFillStyle(0x444444);
                }
            });
            
            buttonBg.on('pointerout', () => {
                if (this.selectedCharacter !== char.id) {
                    buttonBg.setFillStyle(0x333333);
                }
            });
            
            buttonBg.on('pointerdown', () => {
                this.selectCharacter(char.id, characters);
            });
            
            this.characterButtons.push({
                bg: buttonBg,
                name: nameText,
                stats: statsText,
                desc: descText,
                id: char.id
            });
        });
    }

    selectCharacter(characterId, characters) {
        // 重置所有按钮样式
        characters.forEach((char, index) => {
            const button = this.characterButtons[index];
            button.bg.setFillStyle(0x333333);
            button.name.setColor('#fff');
            button.stats.setColor('#aaa');
            button.desc.setColor('#aaa');
        });
        
        // 高亮选中的按钮
        const selectedIndex = characters.findIndex(c => c.id === characterId);
        const selectedButton = this.characterButtons[selectedIndex];
        selectedButton.bg.setFillStyle(0x00ff00);
        selectedButton.name.setColor('#000');
        selectedButton.stats.setColor('#000');
        selectedButton.desc.setColor('#000');
        
        this.selectedCharacter = characterId;
    }

    createStartButton() {
        // 开始按钮
        const startBtn = this.add.rectangle(
            this.game.config.width / 2,
            600,
            200, 60,
            0x00aa00
        );
        startBtn.setInteractive();
        startBtn.setStrokeStyle(3, 0x00ff00);
        
        const startText = this.add.text(
            this.game.config.width / 2,
            600,
            '开始游戏',
            {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#fff',
                stroke: '#000',
                strokeThickness: 2
            }
        );
        startText.setOrigin(0.5);
        
        // 按钮交互
        startBtn.on('pointerover', () => {
            startBtn.setFillStyle(0x00cc00);
        });
        
        startBtn.on('pointerout', () => {
            startBtn.setFillStyle(0x00aa00);
        });
        
        startBtn.on('pointerdown', () => {
            this.startGame();
        });
    }

    createInstructions() {
        const instructions = [
            '操作说明：',
            'WASD / 方向键 - 移动',
            '鼠标左键 - 射击',
            '鼠标右键 - 使用角色特殊技能',
            '目标：消灭敌人，生存下去！'
        ];
        
        instructions.forEach((text, index) => {
            this.add.text(
                this.game.config.width / 2,
                650 + index * 20,
                text,
                {
                    fontSize: '14px',
                    fontFamily: 'Arial',
                    color: '#aaa'
                }
            ).setOrigin(0.5);
        });
    }

    startGame() {
        // 传递选中的角色ID到游戏场景
        this.scene.start('GameScene', { 
            characterId: this.selectedCharacter 
        });
    }
}