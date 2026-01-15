export class PixelParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
  }
  
  createExplosion(x, y, color, count = 16, size = 8) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i;
      const particle = this.scene.add.rectangle(
        x, y, size, size, color
      );
      particle.alpha = 1;
      
      const speed = 100 + Math.random() * 100;
      particle.body = this.scene.physics.add.existing(particle).body;
      particle.body.setVelocity(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );
      
      this.scene.tweens.add({
        targets: particle,
        alpha: 0,
        scale: 0,
        duration: 500,
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }
  
  createSparks(x, y, count = 8) {
    for (let i = 0; i < count; i++) {
      const particle = this.scene.add.triangle(
        x, y,
        x - 3, y + 6,
        x, y + 3,
        x + 3, y + 6,
        0xffff00
      );
      
      const angle = Math.random() * Math.PI * 2;
      const speed = 150 + Math.random() * 100;
      particle.body = this.scene.physics.add.existing(particle).body;
      particle.body.setVelocity(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed - 100
      );
      
      this.scene.tweens.add({
        targets: particle,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }
  
  createSmoke(x, y, count = 5) {
    for (let i = 0; i < count; i++) {
      const particle = this.scene.add.circle(
        x + Math.random() * 20 - 10,
        y + Math.random() * 20 - 10,
        10 + Math.random() * 10,
        0x888888,
        0.3
      );
      
      this.scene.tweens.add({
        targets: particle,
        y: y - 50 - Math.random() * 30,
        alpha: 0,
        scale: 2,
        duration: 1000 + Math.random() * 500,
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }
  
  createScorePopup(x, y, score) {
    const text = this.scene.add.text(x, y, `+${score}`, {
      fontSize: '16px',
      fontFamily: '"Press Start 2P", monospace',
      fill: '#ffff00',
      stroke: '#000',
      strokeThickness: 3
    });
    text.setOrigin(0.5);
    
    this.scene.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 800,
      onComplete: () => {
        text.destroy();
      }
    });
  }
  
  createBloodSplatter(x, y, color = 0xff0000, count = 10) {
    for (let i = 0; i < count; i++) {
      const particle = this.scene.add.rectangle(
        x, y, 4, 4, color
      );
      particle.alpha = 0.8;
      
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 100;
      particle.body = this.scene.physics.add.existing(particle).body;
      particle.body.setVelocity(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );
      
      this.scene.tweens.add({
        targets: particle,
        alpha: 0,
        duration: 1000,
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }
  
  createHealParticles(x, y) {
    for (let i = 0; i < 8; i++) {
      const particle = this.scene.add.circle(
        x + Math.random() * 30 - 15,
        y + Math.random() * 30 - 15,
        4,
        0x00ff00
      );
      
      this.scene.tweens.add({
        targets: particle,
        y: y - 40 - Math.random() * 20,
        alpha: 0,
        duration: 600,
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }
  
  clearAll() {
  }
}
