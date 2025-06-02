class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

    }

    create() {
         //this.scene.start( ** REPLACE WITH GAME SCENE ** );
    }

    update() {
    }
}