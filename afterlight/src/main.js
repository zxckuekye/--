
import './style.css';
import Phaser from 'phaser';
import Player from './characters/Player.js';
import playerImage from './assets/персонаж.png';

const SAVE_KEY = 'afterlight-winter-save';

const overlay = document.querySelector('#overlay');
const dialogLabel = document.querySelector('#dialog-label');
const dialogTitle = document.querySelector('#dialog-title');
const dialogText = document.querySelector('#dialog-text');
const dialogAction = document.querySelector('#dialog-action');
const status = document.querySelector('#status');

let currentAction = null;

function openDialog(label, title, text, actionLabel, action) {
  dialogLabel.textContent = label;
  dialogTitle.textContent = title;
  dialogText.textContent = text;
  dialogAction.querySelector('span:nth-child(2)').textContent = actionLabel;
  overlay.classList.remove('hidden');
  currentAction = action;
}

function closeDialog() {
  overlay.classList.add('hidden');
  currentAction = null;
}

document.querySelector('#close-overlay').addEventListener('click', closeDialog);

dialogAction.addEventListener('click', () => {
  const action = currentAction;
  closeDialog();
  action?.();
});

document.querySelector('#new-game').addEventListener('click', () => {
  const save = {
    release: 'winter',
    version: 1,
    currentScene: 'station',
    solvedPuzzles: [],
    discoveredFiles: [],
    inventory: [],
    createdAt: new Date().toISOString()
  };

  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  status.textContent = 'SIGNAL DETECTED';

  openDialog(
    'INCOMING TRANSMISSION',
    'The last train never arrived.',
    '23:47. The station is buried under snow. The lights are still on, although nobody has been here for years. Somewhere beyond the platform, a signal is calling you.',
    'ENTER THE STATION',
    () => startGame()
  );
});

document.querySelector('#continue-game').addEventListener('click', () => {
  const save = localStorage.getItem(SAVE_KEY);

  if (!save) {
    openDialog(
      'NO SAVED DATA',
      'Nothing to remember.',
      'There is no saved journey on this device yet.',
      'START NEW GAME',
      () => document.querySelector('#new-game').click()
    );
    return;
  }

  openDialog(
    'SAVED TRANSMISSION',
    'Welcome back.',
    'Your progress is saved on this device. The station is waiting.',
    'CONTINUE',
    () => startGame()
  );
});

document.querySelector('#open-archive').addEventListener('click', () => {
  openDialog(
    'RESTRICTED ACCESS',
    'The archive is locked.',
    'Some memories are hidden behind encrypted files. Find the first key inside the station to begin unlocking them.',
    'UNDERSTOOD',
    () => {}
  );
});

class StationScene extends Phaser.Scene {
  constructor() {
    super('station');
  }

  preload() {
    this.load.image('maxim', playerImage);
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.cameras.main.setBackgroundColor('#111b27');

    this.add.rectangle(width / 2, height * 0.7, width, height * 0.6, 0x1b2b39);

    for (let i = 0; i < 75; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(1, 3);

      const snow = this.add.circle(x, y, size, 0xdce8ef, Math.random() * 0.65 + 0.2);

      this.tweens.add({
        targets: snow,
        y: y + Phaser.Math.Between(25, 90),
        duration: Phaser.Math.Between(2500, 6000),
        repeat: -1,
        yoyo: true,
        ease: 'Sine.easeInOut'
      });
    }

    this.add.rectangle(width / 2, height * 0.48, width * 0.78, 90, 0x243747);
    this.add.rectangle(width / 2, height * 0.43, width * 0.8, 5, 0x8ca3b3, 0.7);

    for (let i = 0; i < 5; i++) {
      const x = width * 0.16 + i * width * 0.17;
      this.add.rectangle(x, height * 0.47, 4, 74, 0x8ca3b3, 0.55);
      this.add.rectangle(x + 18, height * 0.47, 4, 74, 0x8ca3b3, 0.55);
    }

    this.add.text(width / 2, 35, 'PLATFORM 01', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#b8cad6',
      letterSpacing: 4
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.22, 'THE STATION', {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#e2eaf0',
      letterSpacing: 5
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.28, 'Find the source of the signal.', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#a4b6c4'
    }).setOrigin(0.5);

    this.player = new Player(this, width / 2, height * 0.82);


    const beacon = this.add.circle(width * 0.78, height * 0.67, 13, 0xc4e8f5, 0.9);

    this.tweens.add({
      targets: beacon,
      alpha: 0.25,
      scale: 1.5,
      duration: 900,
      yoyo: true,
      repeat: -1
    });

    const beaconText = this.add.text(width * 0.78, height * 0.67 + 32, 'SIGNAL', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#dcebf3'
    }).setOrigin(0.5);

    beacon.setInteractive({ useHandCursor: true });

    beacon.on('pointerdown', () => {
      openDialog(
        'UNKNOWN SIGNAL',
        'A message for you.',
        'The receiver crackles. A familiar voice is buried beneath the static. The first archive key is somewhere nearby.',
        'SEARCH THE PLATFORM',
        () => {
          const save = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
          save.discoveredFiles = [...new Set([...(save.discoveredFiles || []), 'first-signal'])];
          localStorage.setItem(SAVE_KEY, JSON.stringify(save));
          beaconText.setText('SIGNAL FOUND');
          status.textContent = '1 FILE DISCOVERED';
        }
      );
    });

    const backButton = this.add.text(18, height - 24, '← BACK TO MENU', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#cbd9e2'
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });

    backButton.on('pointerdown', () => {
      this.game.destroy(true);
      document.querySelector('#app').classList.remove('playing');
      document.querySelector('#game-mount')?.remove();
      document.querySelector('.start-screen').style.display = 'flex';
    });

    const hint = this.add.text(width / 2, height - 24, 'TAP THE GLOWING SIGNAL', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#9fb5c5'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: hint,
      alpha: 0.4,
      duration: 800,
      yoyo: true,
      repeat: -1
    });
  }
  update(_, delta) {
    this.player?.update(_, delta);
  }
}

function startGame() {
  document.querySelector('.start-screen').style.display = 'none';

  let mount = document.querySelector('#game-mount');

  if (!mount) {
    mount = document.createElement('div');
    mount.id = 'game-mount';
    mount.style.cssText = 'position:fixed;inset:0;z-index:2;';
    document.querySelector('#app').appendChild(mount);
  }

  mount.innerHTML = '';

  new Phaser.Game({
    type: Phaser.AUTO,
    parent: mount,
    backgroundColor: '#111b27',
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: window.innerWidth,
      height: window.innerHeight
    },
    scene: [StationScene]
  });
}


