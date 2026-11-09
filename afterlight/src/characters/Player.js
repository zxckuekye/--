import Phaser from 'phaser';

export default class Player {
  constructor(scene, x, y, texture = 'maxim') {
    this.scene = scene;
    this.speed = 180;
    this.sprite = scene.add.image(x, y, texture).setOrigin(0.5, 1);

    const imageHeight = this.sprite.height || 1;
    const maxHeight = Math.min(150, scene.scale.height * 0.24);
    this.sprite.setScale(Math.min(1, maxHeight / imageHeight));
    this.halfWidth = this.sprite.displayWidth / 2;
    this.height = this.sprite.displayHeight;
    this.keys = scene.input.keyboard.addKeys({
      up: 'W', left: 'A', down: 'S', right: 'D',
      arrowUp: Phaser.Input.Keyboard.KeyCodes.UP,
      arrowLeft: Phaser.Input.Keyboard.KeyCodes.LEFT,
      arrowDown: Phaser.Input.Keyboard.KeyCodes.DOWN,
      arrowRight: Phaser.Input.Keyboard.KeyCodes.RIGHT
    });
  }

  update(_, delta) {
    const k = this.keys;
    const x = Number(k.left.isDown || k.arrowLeft.isDown) * -1 + Number(k.right.isDown || k.arrowRight.isDown);
    const y = Number(k.up.isDown || k.arrowUp.isDown) * -1 + Number(k.down.isDown || k.arrowDown.isDown);
    const direction = new Phaser.Math.Vector2(x, y);

    if (direction.lengthSq() > 0) {
      direction.normalize();
      const step = this.speed * (delta / 1000);
      this.sprite.x += direction.x * step;
      this.sprite.y += direction.y * step;
      if (x !== 0) this.sprite.setFlipX(x < 0);
    }

    const { width, height } = this.scene.scale;
    this.sprite.x = Phaser.Math.Clamp(this.sprite.x, this.halfWidth, width - this.halfWidth);
    this.sprite.y = Phaser.Math.Clamp(this.sprite.y, this.height * 0.52, height - 18);
    this.sprite.setDepth(this.sprite.y);
  }

  destroy() {
    this.sprite.destroy();
  }
}

