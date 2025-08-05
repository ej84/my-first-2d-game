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
    this.load.image("laser", "/laser.png");
    this.load.image("enemy", "/enemy.png");
  }

  create() {
    // player
    this.player = this.physics.add
      .image(50, 100, "player")
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
          .setScale(0.1);
        enemy.setVelocityX(-100);
        // 충돌 박스를 작게 설정
        enemy.body.setSize(enemy.width * 0.6, enemy.height * 0.6); // 너비, 높이 60%로 줄이기
        enemy.body.setOffset(enemy.width * 0.2, enemy.height * 0.2); // 위치도 중앙으로 정렬
      },
    });

    // collision handling
    this.physics.add.overlap(
      this.lasers,
      this.enemies,
      (laser, enemy) => {
        laser.destroy();
        enemy.destroy();
      },
      undefined,
      this
    );
  }

  // update player moving and other states
  update(time: number) {
    if (!this.player || !this.cursors || !this.spaceKey) return;

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

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      const laser = this.lasers
        .create(
          this.player.x + this.player.width * this.player.scaleX, // 플레이어 앞부분
          this.player.y + this.player.height * 0.5 * this.player.scaleY, // 수직 중앙
          "laser"
        )
        .setScale(0.1);

      laser.setVelocityX(400);
      laser.setCollideWorldBounds(true);
      laser.body.onWorldBounds = true;

      // 충돌 범위를 길고 얇게 설정
      laser.body.setSize(laser.width * 0.8, laser.height * 0.4);
      laser.body.setOffset(laser.width * 0.1, laser.height * 0.3); // 세로 중앙 정렬

      // 레이저가 화면 밖 나가면 제거
      laser.body.world.on("worldbounds", (body: Phaser.Physics.Arcade.Body) => {
        if (body.gameObject === laser) {
          laser.destroy();
        }
      });
    }
  }
}
