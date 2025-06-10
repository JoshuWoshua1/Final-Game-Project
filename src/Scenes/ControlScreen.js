class ControlScene extends Phaser.Scene {
    
    constructor() {
        super("controlScene");
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
            screenHeight * 0.95, // 95% of screen height
            0x000000,
            0.8
        ).setOrigin(0.5);

        bgRect.setDepth(0);
        this.centerPoint = 400
        //WASD INFO
        let akey = this.add.image(this.centerPoint -75, this.centerPoint-100, 'aKey').setScale(5);
        let dkey = this.add.image(this.centerPoint +75, this.centerPoint-100, 'dKey').setScale(5);
        let skey = this.add.image(this.centerPoint, this.centerPoint-100, 'sKey').setScale(5);
        let wkey = this.add.image(this.centerPoint, this.centerPoint-175, 'wKey').setScale(5);
        
        this.add.text( this.centerPoint, 125, "PRESS W A S D TO \nAIM YOUR CUTE CAT", {
            fontSize: '30px',
            color: '#f8f7fa',
            align: 'center'
        }).setOrigin(.5,.5);

        // SPACE BAR INFO

        let space = this.add.image(this.centerPoint, this.centerPoint+200, 'spaceKey').setScale(5);

        this.add.text( this.centerPoint, this.centerPoint+100, "PRESS SPACEBAR TO JUMP", {
            fontSize: '30px',
            color: '#f8f7fa',
            align: 'center'
        }).setOrigin(.5,.5);


        // J AND K INFO
        let jkey = this.add.image(this.centerPoint+575, this.centerPoint-100, 'jKey').setScale(5);
        let kkey = this.add.image(this.centerPoint+650, this.centerPoint-100, 'kKey').setScale(5);

        this.add.text( this.centerPoint+600, 125, "PRESS J TO SLASH ATTACK\nAND K TO SHOOT HAIRBALLS", {
            fontSize: '30px',
            color: '#f8f7fa',
            align: 'center'
        }).setOrigin(.5,.5);

        // SHIFT KEY INFO
        let shift1 = this.add.image(this.centerPoint+575, this.centerPoint+200, 'shift1').setScale(5);
        let shift2 = this.add.image(this.centerPoint+655, this.centerPoint+200, 'shift2').setScale(5);

        this.add.text( this.centerPoint+600, this.centerPoint+100, "PRESS SHIFT TO DASH", {
            fontSize: '30px',
            color: '#f8f7fa',
            align: 'center'
        }).setOrigin(.5,.5);

        // Start Button
        const startButton = this.add.text(centerX, centerY+300, 'BACK TO MENU', {
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
                this.scene.start('mainMenu');
            });
    }

    update() {  
    }
    
}  

