import Phaser from "phaser";

export default class Scene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Image;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  spaceKey!: Phaser.Input.Keyboard.Key;
  lasers!: Phaser.Physics.Arcade.Group;
  enemies!: Phaser.Physics.Arcade.Group;
  timerText!: Phaser.GameObjects.Text;
  startTime!: number;

  constructor() {
    super({ key: "Scene" });
  }

  preload() {
    this.load.image("player", "/player.png");
    //this.load.image('laser', '/laser.png');
    this.load.image("enemy", "/enemy.png");
  }

  create() {
    // player
    this.player = this.physics.add
      .image(50, 50, "player")
      .setScale(0.23)
      .setOrigin(0, 0)
      .setCollideWorldBounds(true);

    // key setting
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.spaceKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    // laser & enemies
    this.lasers = this.physics.add.group();
    this.enemies = this.physics.add.group();

    // timer
    this.startTime = this.time.now;
    this.timerText = this.add
      .text(this.scale.width - 100, 20, "00:00:00", {
        fontSize: "16px",
        color: "#ffffff",
      })
      .setOrigin(1, 0);

    // timer for enemies spawn
    this.time.addEvent({
      delay: 5000,
      loop: true,
      callback: () => {
        const enemy = this.enemies
          .create(
            this.scale.width + 50,
            Phaser.Math.Between(50, this.scale.height - 50),
            "enemy"
          )
          .setScale(0.15);
        enemy.setVelocityX(-100);
      },
    });

    // collision handling
    this.physics.add.overlap(this.lasers, this.enemies, (laser, enemy) => {
      laser.destroy();
      enemy.destroy();
    });
  }

  // update player moving and other states
  update(time: number) {
    if (!this.player || !this.cursors) return;

    // move player
    this.player.setVelocity(0);
    if (this.cursors.left?.isDown) {
      this.player.setVelocityX(-200);
    }
    if (this.cursors.right?.isDown) {
      this.player.setVelocityX(200);
    }
    if (this.cursors.up?.isDown) {
      this.player.setVelocityY(-200);
    }
    if (this.cursors.down?.isDown) {
      this.player.setVelocityY(200);
    }
  }
}
