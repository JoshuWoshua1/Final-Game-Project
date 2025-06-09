class MainMenu extends Phaser.Scene {
    constructor() {
        super('mainMenu');
    }

    create() {

        this.music = this.sound.add("song", {
            loop: true,
            volume: 0.3
        });
        this.music.play(); // creates and starts background music.

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
        

        // Title Text
        this.titleText = this.add.text(centerX, centerY - 150, 'CITTY KAT', {
            fontSize: '175px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        this.titleText.setDepth(9999);
        // Get text bounds for banner box
        const bounds = this.titleText.getBounds();
        const padding = 20;

        // Add transparent banner rectangle behind the title
        const bgRect = this.add.rectangle(
            bounds.centerX,
            bounds.centerY,
            bounds.width + padding,
            bounds.height + padding,
            0x000000,
            0.4 // Alpha (transparency) from 0 (invisible) to 1 (solid)
        ).setOrigin(0.5);
        bgRect.setDepth(9998);

        // Start Button
        const startButton = this.add.text(centerX, centerY, 'PLAY', {
            fontSize: '32px',
            backgroundColor: '#333333',
            color: '#ffffff',
            padding: { x: 20, y: 10 },
        }).setOrigin(0.5)
          .setInteractive({ useHandCursor: true })
          .on('pointerover', () => startButton.setScale(1.1))
          .on('pointerout', () => startButton.setScale(1))
          .on('pointerdown', () => {
            this.music.stop();
            this.scene.start('levelScene'); // Replace with your actual game scene key
          });

          // HOW TO Button
        const controls = this.add.text(centerX, centerY + 75, 'HOW TO PLAY', {
            fontSize: '32px',
            backgroundColor: '#333333',
            color: '#ffffff',
            padding: { x: 20, y: 10 },
        }).setOrigin(0.5)
          .setInteractive({ useHandCursor: true })
          .on('pointerover', () => controls.setScale(1.1))
          .on('pointerout', () => controls.setScale(1))
          .on('pointerdown', () => {
            this.music.stop();
            this.scene.start('controlScene'); // Replace with your actual game scene key
          });

        // Highscore Display
        const highscore = this.add.text(centerX, centerY + 150, 'HIGHSCORE: ' + window.high_score, {
            fontSize: '32px',
            backgroundColor: '#333333',
            color: '#02f53b',
            padding: { x: 20, y: 10 },
        }).setOrigin(0.5);

        // diamonds Display
        this.diamondUI = this.add.image(centerX - 135, centerY + 225, "spriteSheet", 67);
        this.diamondUI.setScale(2.5);
        this.diamondUI.setDepth(9999);
        const diamondText = this.add.text(centerX, centerY + 225, '  COLLECTED:' + window.most_diamonds +'/3', {
            fontSize: '32px',
            backgroundColor: '#333333',
            color: '#00eaff',
            padding: { x: 20, y: 10 },
        }).setOrigin(0.5);

        // Start Button
        const creditsButton = this.add.text(centerX, centerY + 300, 'CREDITS', {
            fontSize: '32px',
            backgroundColor: '#333333',
            color: '#ffffff',
            padding: { x: 20, y: 10 },
        }).setOrigin(0.5)
          .setInteractive({ useHandCursor: true })
          .on('pointerover', () => creditsButton.setScale(1.1))
          .on('pointerout', () => creditsButton.setScale(1))
          .on('pointerdown', () => {
            this.music.stop();
            this.scene.start('creditsScene'); // Replace with your actual game scene key
        });

    }
}