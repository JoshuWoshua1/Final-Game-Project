class CreditsScene extends Phaser.Scene {
    
    constructor() {
        super("creditsScene");
    }

    
    create() {
        this.click = this.sound.add("click")

     // Create tilemap game object & set world bounds to the map size
        this.Bbackground = this.add.tilemap("Background", 18, 18, 6, 30);
        this.map = this.add.tilemap("mainMenuMap", 18, 18, 27, 16);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        // Loading tilesets into tilemap
        this.tileset = this.map.addTilesetImage("Tiles", "tilemap_tiles");
        this.tilesetIND = this.map.addTilesetImage("TilesIND", "tilemap_tilesIND");
        this.tilesetFRM = this.map.addTilesetImage("TilesFRM", "tilemap_tilesFRM");
        this.tilesetBG = this.Bbackground.addTilesetImage("Background", "tilemap_tilesBG");

        // Creating layers out of the tilemap in order from back to front.
        this.BigBG = this.Bbackground.createLayer("bigBackground", [this.tilesetBG], 0, 0);
        this.BigBG.setScale(7);
        this.BigBG.setScrollFactor(0.2, 0.1);
        this.Background = this.map.createLayer("Background", [this.tileset, this.tilesetIND, this.tilesetFRM], 0, 0);
        this.Background.setScale(3);
        this.darkOverlay = this.add.rectangle(
            0, 0,
            this.map.widthInPixels,
            this.map.heightInPixels,
            0x000000,
            0.2
        ).setOrigin(0, 0).setScale(3);
        this.Ground = this.map.createLayer("Ground", [this.tileset, this.tilesetIND, this.tilesetFRM], 0, 0);
        this.Ground.setScale(3);

        const centerX = this.sys.game.config.width / 2;
        const centerY = this.sys.game.config.height / 2;

        const screenWidth = this.sys.game.config.width;
        const screenHeight = this.sys.game.config.height;

        const bgRect = this.add.rectangle(
            centerX,
            centerY,
            screenWidth * 0.9,  // 90% of screen width
            screenHeight * 0.6, // 60% of screen height
            0x000000,
            0.8
        ).setOrigin(0.5, 0.8);

        bgRect.setDepth(0);
        this.add.text( 700, 185, "Kitty Cat\n\nTilemaps by: Kenney\nCustom sprites by: Joshua Kim-Pearson\nCode by: Joshua Kim-Pearson, Brody Vance, & Miga Miga Damdinbazar\nMusic by: Ngini Ija by 33nano\nSound effects by: Joshua Kim-Pearson using jsfxr\n\nThis game was created as a final project for CMPM120\nat UCSC during spring quarter 2025", {
            fontSize: '30px',
            color: '#f8f7fa',
            align: 'left'
        }).setOrigin(.5,.5);

        // Start Button
        const startButton = this.add.text(centerX, centerY, 'BACK TO MENU', {
            fontSize: '32px',
            backgroundColor: '#333333',
            color: '#ffffff',
            padding: { x: 20, y: 10 },
        }).setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => startButton.setScale(1.1))
            .on('pointerout', () => startButton.setScale(1))
            .on('pointerdown', () => {
                this.click.play();
                this.scene.start('mainMenu'); // Replace with your actual game scene key
            });
    }

    update() {
    }

}  