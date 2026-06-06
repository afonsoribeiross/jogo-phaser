import Phaser from 'phaser';

const TILE = 16;
const SCALE = 3;

const MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1],
  [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const COLS = MAP[0].length;
const ROWS = MAP.length;
const MUNDO_W = COLS * TILE * SCALE;
const MUNDO_H = ROWS * TILE * SCALE;

const TILE_CHAO   = 0;
const TILE_PAREDE = 2;
const FRAME_JOGADOR = 84;

class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  preload() {
    this.load.spritesheet('tiles', '/tilemap_packed.png', {
      frameWidth: TILE,
      frameHeight: TILE,
    });
  }

  create() {
    this.paredes = this.physics.add.staticGroup();

    MAP.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const x = colIndex * TILE * SCALE + (TILE * SCALE) / 2;
        const y = rowIndex * TILE * SCALE + (TILE * SCALE) / 2;

        if (cell === 1) {
          const p = this.paredes.create(x, y, 'tiles', TILE_PAREDE);
          p.setScale(SCALE).refreshBody();
        } else {
          this.add.image(x, y, 'tiles', TILE_CHAO).setScale(SCALE);
        }
      });
    });

    const startX = 2 * TILE * SCALE + (TILE * SCALE) / 2;
    const startY = 2 * TILE * SCALE + (TILE * SCALE) / 2;

    this.jogador = this.physics.add.sprite(startX, startY, 'tiles', FRAME_JOGADOR);
    this.jogador.setScale(SCALE);
    this.jogador.setCollideWorldBounds(true);

    this.physics.add.collider(this.jogador, this.paredes);
    this.cursors = this.input.keyboard.createCursorKeys();

    this.cameras.main.setBounds(0, 0, MUNDO_W, MUNDO_H);
    this.cameras.main.startFollow(this.jogador, true, 0.1, 0.1);
    this.physics.world.setBounds(0, 0, MUNDO_W, MUNDO_H);
  }

  update() {
    const speed = 150;
    const j = this.jogador;
    j.setVelocity(0);

    if (this.cursors.left.isDown) {
      j.setVelocityX(-speed);
      j.setFlipX(true);
    } else if (this.cursors.right.isDown) {
      j.setVelocityX(speed);
      j.setFlipX(false);
    } else if (this.cursors.up.isDown) {
      j.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      j.setVelocityY(speed);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: MUNDO_W,
  height: MUNDO_H,
  backgroundColor: '#1a0a0a',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false },
  },
  scene: GameScene,
};

new Phaser.Game(config);