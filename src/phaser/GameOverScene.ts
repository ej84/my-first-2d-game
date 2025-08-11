import Phaser from "phaser";

export default class GameOverScene extends Phaser.Scene {

    constructor() {
        super({key: 'GameOverScene'});
    }

    create() {
        const { width, height } = this.scale;

        this.add.rectangle(0, 0, width, height, 0x000000, 0.55).setOrigin(0);

        // Game Over
        this.add.text(width / 2,  height / 2 - 40, 'Game Over', {
            fontSize: '48px',
            color: '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        // Replay button
        const replayBtn = this.add.rectangle(width / 2, height / 2 + 48, 220, 56, 0xffffff)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true});
        this.add.text(replayBtn.x, replayBtn.y, 'Replay', {
            fontSize: '22px',
            color: '#000000'
        }).setOrigin(0.5);

        replayBtn.on('pointerup', () => {
            // completely restart the game scene
            this.scene.stop('GameOverScene');
            this.scene.stop('Scene');
            this.scene.start('Scene');
        });
    
    }

}