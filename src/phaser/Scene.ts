import Phaser, { Physics } from "phaser";

export default class Scene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Image;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  spaceKey!: Phaser.Input.Keyboard.Key;
  lasers!: Phaser.Physics.Arcade.Group;
  enemies!: Phaser.Physics.Arcade.Group;
  timerText!: Phaser.GameObjects.Text;
  startTime!: number;
  isGameOver!: false;
  playerEnemyCollider?: Phaser.Physics.Arcade.Collider;

  constructor() {
    super({ key: "Scene" });
  }

  preload() {
    this.load.image("player", "/player.png");
    this.load.image("laser", "/laser.png");
    this.load.image("enemy", "/enemy.png");
    this.load.image("explosion", "/explosion.png");
  }

  // create a function for explosion effect
  createExplosion(x: number, y: number) {
    const explosion = this.add.image(x, y, "explosion").setScale(0.13);
    this.time.delayedCall(300, () => {
      explosion.destroy();
    });
  }

  // player death function with enemy hit
  onPlayerHit(
    playerGO: Phaser.GameObjects.GameObject,
    enemyGO: Phaser.GameObjects.GameObject
  ) {
    const p = playerGO as Phaser.Physics.Arcade.Image;
    const e = enemyGO as Phaser.Physics.Arcade.Image;

    this.createExplosion(p.x, p.y);
    p.destroy();

    // After player death, switch to Game Over Scene
    this.time.delayedCall(300, () => {
      // stop the current scene
      const elapsedSeconds = Math.floor(
        (this.time.now - this.startTime) / 1000
      );
      this.scene.pause("Scene");
      this.scene.launch("GameOverScene", { elapsed: elapsedSeconds });
    });
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

    // lasers group
    this.lasers = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      runChildUpdate: true,
    });

    // enemies group
    this.enemies = this.physics.add.group();

    // timer
    this.startTime = 0;
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
          .setScale(0.08);
        enemy.setVelocityX(-100);
        // set the enemy collision box
        enemy.body.setSize(enemy.width * 0.6, enemy.height * 0.6);
        enemy.body.setOffset(enemy.width * 0.2, enemy.height * 0.2);

        enemy.body.world.on(
          "worldbounds",
          (body: Phaser.Physics.Arcade.Body) => {
            if (body.gameObject === enemy) {
              enemy.destroy();
            }
          }
        );
      },
    });

    // collision handling
    this.physics.add.overlap(
      this.lasers,
      this.enemies,
      (laser, enemy) => {
        const this_enemy = enemy as Phaser.Physics.Arcade.Image;
        this.createExplosion(this_enemy.x, this_enemy.y);
        laser.destroy();
        enemy.destroy();
      },
      undefined,
      this
    );

    // player collision with enemy
    this.playerEnemyCollider = this.physics.add.overlap(
      this.player,
      this.enemies,
      this.onPlayerHit as any,
      undefined,
      this
    );
  }

  // update player moving and other states
  update(time: number) {
    // set the startTime
    if (this.startTime === 0) {
      this.startTime = time;
    }

    // calculate the time
    const elapsed = Math.floor(time - this.startTime / 1000);

    // convert to hour, minutes, seconds
    const hours = String(Math.floor(elapsed / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
    const seconds = String(elapsed % 60).padStart(2, "0");

    // update timerText
    this.timerText.setText(`${hours}:${minutes}:${seconds}`);

    if (this.isGameOver) return;

    if (!this.player || !this.player.body || !this.cursors || !this.spaceKey)
      return;

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

    // fire the laser when space key is pressed
    if (
      Phaser.Input.Keyboard.JustDown(this.spaceKey) &&
      this.lasers.countActive(true) < 3
    ) {
      const laser = this.lasers
        .create(
          this.player.x + this.player.width * this.player.scaleX,
          this.player.y + this.player.height * 0.5 * this.player.scaleY,
          "laser"
        )
        .setScale(0.1);
      console.log(this.lasers.countActive(true));
      laser.setVelocityX(400);
      laser.setCollideWorldBounds(true);
      laser.body.onWorldBounds = true;

      laser.body.setSize(laser.width * 0.8, laser.height * 0.4);
      laser.body.setOffset(laser.width * 0.3, laser.height * 0.1);

      laser.body.world.on("worldbounds", (body: Phaser.Physics.Arcade.Body) => {
        if (body.gameObject === laser) {
          laser.destroy();
        }
      });
    }
  }
}
