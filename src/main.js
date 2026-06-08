import Phaser from 'phaser';

const TILE = 16;
const SCALE = 3;
const TS = TILE * SCALE;

const MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const COLS = MAP[0].length;
const ROWS = MAP.length;
const MUNDO_W = COLS * TS;
const MUNDO_H = ROWS * TS;

const FRAME_CHAO    = 0;
const FRAME_PAREDE  = 2;
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
    this.energiaOn   = false;
    this.portaAberta = false;
    this.cenaFinal   = false;
    this.paredes     = this.physics.add.staticGroup();
    this.geradorPos  = null;
    this.portaPos    = null;

    MAP.forEach((row, ry) => {
      row.forEach((cell, cx) => {
        const x = cx * TS + TS / 2;
        const y = ry * TS + TS / 2;

        if (cell === 1) {
          const p = this.paredes.create(x, y, 'tiles', FRAME_PAREDE);
          p.setScale(SCALE).refreshBody();
        } else if (cell === 2) {
          this.add.image(x, y, 'tiles', FRAME_CHAO).setScale(SCALE);
          this.add.image(x, y, 'tiles', 20).setScale(SCALE);
          this.geradorPos = { x, y };
        } else if (cell === 3) {
          this.add.image(x, y, 'tiles', FRAME_CHAO).setScale(SCALE);
          this.add.image(x, y, 'tiles', 17).setScale(SCALE).setAlpha(0.5).setTint(0x00ff88);
          this.portaPos = { x, y };
        } else {
          this.add.image(x, y, 'tiles', FRAME_CHAO).setScale(SCALE);
        }
      });
    });

    const startX = 1 * TS + TS / 2;
    const startY = 1 * TS + TS / 2;
    this.jogador = this.physics.add.sprite(startX, startY, 'tiles', FRAME_JOGADOR);
    this.jogador.setScale(SCALE).setCollideWorldBounds(true);
    this.physics.add.collider(this.jogador, this.paredes);

    this.overlay = this.add.rectangle(
      MUNDO_W / 2, MUNDO_H / 2, MUNDO_W, MUNDO_H, 0x000000, 0.6
    ).setDepth(10);

    this.textoInteragir = this.add.text(0, 0, '[E] Interagir', {
      fontSize: '12px', fontFamily: 'Courier New',
      color: '#ffff00', backgroundColor: '#000000',
      padding: { x: 6, y: 4 },
    }).setDepth(20).setVisible(false);

    this.textoStatus = this.add.text(16, 16, 'ENERGIA: OFF', {
      fontSize: '14px', fontFamily: 'Courier New', color: '#ff4444',
    }).setScrollFactor(0).setDepth(20);

    this.cameras.main.setBounds(0, 0, MUNDO_W, MUNDO_H);
    this.cameras.main.startFollow(this.jogador, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
    this.physics.world.setBounds(0, 0, MUNDO_W, MUNDO_H);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.teclaE  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  update() {
    const speed = 150;
    const j = this.jogador;
    j.setVelocity(0);

    if (this.cursors.left.isDown)       { j.setVelocityX(-speed); j.setFlipX(true); }
    else if (this.cursors.right.isDown) { j.setVelocityX(speed);  j.setFlipX(false); }
    else if (this.cursors.up.isDown)    { j.setVelocityY(-speed); }
    else if (this.cursors.down.isDown)  { j.setVelocityY(speed); }

    const perto = this.geradorPos &&
      Phaser.Math.Distance.Between(j.x, j.y, this.geradorPos.x, this.geradorPos.y) < TS * 2;

    this.textoInteragir.setVisible(perto && !this.energiaOn);
    if (perto) {
      this.textoInteragir.setPosition(this.geradorPos.x - 40, this.geradorPos.y - 50);
    }

    if (perto && !this.energiaOn && Phaser.Input.Keyboard.JustDown(this.teclaE)) {
      this.ligarEnergia();
    }

    if (this.portaAberta && this.portaPos) {
      const dist = Phaser.Math.Distance.Between(j.x, j.y, this.portaPos.x, this.portaPos.y);
      if (dist < TS) {
        this.sinalRestabelecido();
      }
    }
  }

  ligarEnergia() {
    this.energiaOn = true;
    this.textoInteragir.setVisible(false);

    const msgs = [
      'Inicializando sistema...',
      'Verificando circuitos...',
      'Energia restaurada.',
      'Porta destrancada.',
    ];

    let i = 0;
    const textoCentro = this.add.text(
      MUNDO_W / 2, MUNDO_H / 2, msgs[0],
      { fontSize: '16px', fontFamily: 'Courier New', color: '#00ff88', backgroundColor: '#000', padding: { x: 10, y: 6 } }
    ).setOrigin(0.5).setDepth(30);

    this.time.addEvent({
      delay: 800,
      repeat: msgs.length - 1,
      callback: () => {
        i++;
        if (i < msgs.length) {
          textoCentro.setText(msgs[i]);
        } else {
          textoCentro.destroy();
          this.abrirPorta();
        }
      }
    });

    this.tweens.add({
      targets: this.overlay,
      alpha: 0,
      duration: 2000,
      ease: 'Linear',
    });

    this.textoStatus.setText('ENERGIA: ONLINE').setColor('#00ff88');
  }

  abrirPorta() {
    this.portaAberta = true;

    const t = this.add.text(
      MUNDO_W / 2, MUNDO_H / 2 + 60, 'PORTA ABERTA — Va ate a saida',
      { fontSize: '12px', fontFamily: 'Courier New', color: '#00ff88', backgroundColor: '#000', padding: { x: 6, y: 4 } }
    ).setOrigin(0.5).setDepth(20).setScrollFactor(0);

    this.time.delayedCall(2000, () => t.destroy());
  }

  sinalRestabelecido() {
    if (this.cenaFinal) return;
    this.cenaFinal = true;
    this.jogador.setVelocity(0);

    this.cameras.main.fadeOut(1500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('FinalScene');
    });
  }
}

// ← GameScene fechada aqui

class FinalScene extends Phaser.Scene {
  constructor() { super('FinalScene'); }

  create() {
    const cx = this.cameras.main.width / 2;
    const cy = this.cameras.main.height / 2;

    this.cameras.main.setBackgroundColor('#000000');

    this.add.text(cx, cy - 30, 'SINAL RESTABELECIDO', {
      fontSize: '24px', fontFamily: 'Courier New', color: '#00ff88',
    }).setOrigin(0.5);

    this.add.text(cx, cy + 20, '...', {
      fontSize: '18px', fontFamily: 'Courier New', color: '#ffffff',
    }).setOrigin(0.5);

    this.time.delayedCall(1500, () => {
      this.add.text(cx, cy + 60, 'ORIGEM DESCONHECIDA', {
        fontSize: '14px', fontFamily: 'Courier New', color: '#ff4444',
      }).setOrigin(0.5);
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: MUNDO_W,
  height: MUNDO_H,
  backgroundColor: '#050a05',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false },
  },
  scene: [GameScene, FinalScene],
};

new Phaser.Game(config);