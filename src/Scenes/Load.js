class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters and enemies
        // ********** TEMPORARY UNTIL CAT SPRITE IS MADE **********
        this.load.atlas("platformer_characters", "/characters/tilemap-characters-packed.png", "/characters/tilemap-characters-packed.json");
        // ********** TEMPORARY UNTIL CAT SPRITE IS MADE **********

        // Load tilemap information
        this.load.image("tilemap_tiles", "/tilemaps/tilemap_packed.png");  // Packed basic tilemap
        this.load.image("tilemap_tilesFRM", "/tilemaps/tilemap_packedFRM.png");  // Packed Farm tilemap
        this.load.image("tilemap_tilesIND", "/tilemaps/tilemap_packedIND.png");  // Packed Industrial tilemap
        this.load.tilemapTiledJSON("CatMap", "/tilemaps/CatMap.tmj");  // Tilemap in JSON

        // Load VFX
        this.load.multiatlas("Kenny-particles", "/vfx/kenny-particles.json")

    }

    create() {

        // ********** TEMPORARY UNTIL CAT SPRITE IS MADE **********
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0001.png" }
            ],
        });
        // ********** TEMPORARY UNTIL CAT SPRITE IS MADE **********


        // ends this scene, starts game
         this.scene.start("levelScene");
    }

    update() {
    }
}