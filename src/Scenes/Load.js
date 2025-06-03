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
        this.load.atlas("cats", "/characters/Cat_Sprites.png", "/characters/Cat_Sprites.json");

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
            frames: [
                { key: 'cats', frame: 'Cat_3.png' },
                { key: 'cats', frame: 'Cat_1.png' }
            ],
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "cats",
            frames: [
                { frame: "Cat_1.png" },
                { frame: "Cat_2.png"}
            ],
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "cats",
            frames: [
                { frame: "Cat_3.png" }
            ],
        });
        // ********** TEMPORARY UNTIL CAT SPRITE IS MADE **********


        // ends this scene, starts game
         this.scene.start("levelScene");
    }

    update() {
    }
}