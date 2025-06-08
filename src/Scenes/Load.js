class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters and enemies
        this.load.atlas("cats", "/characters/Cat_Sprites.png", "/characters/Cat_Sprites.json");

        // Load tilemap information
        this.load.image("tilemap_tiles", "/tilemaps/tilemap_packed.png");  // Packed basic tilemap
        this.load.image("tilemap_tilesFRM", "/tilemaps/tilemap_packedFRM.png");  // Packed Farm tilemap
        this.load.image("tilemap_tilesIND", "/tilemaps/tilemap_packedIND.png");  // Packed Industrial tilemap
        this.load.image("tilemap_tilesEXT", "/tilemaps/tilemap_packedEXT.png");  // Packed Extras tilemap
        this.load.image("tilemap_tilesBG", "/tilemaps/tilemap-backgrounds_packed.png");  // Packed background tilemap

        this.load.tilemapTiledJSON("CatMap", "/tilemaps/CatMap.tmj");  // Tilemap in JSON
        this.load.tilemapTiledJSON("Background", "/tilemaps/Background.tmj");  // Tilemap in JSON

        // Load VFX
        this.load.multiatlas("kenny-particles", "vfx/kenny-particles-0.json", "assets/vfx/");
        // load spirtesheets
        this.load.spritesheet("spriteSheet", "/tilemaps/tilemap_packed.png",{
            frameWidth: 18,
           frameHeight: 18
        }); 
        this.load.spritesheet("spriteSheet_EXT", "/tilemaps/tilemap_packedEXT.png",{
            frameWidth: 18,
           frameHeight: 18
        }); 
        this.load.spritesheet("spriteSheet_FRM", "/tilemaps/tilemap_packedFRM.png",{
            frameWidth: 18,
            frameHeight: 18
        });
        this.load.spritesheet("spriteSheet_RAINBOW", "/vfx/rainbow_SpriteSheet.png",{
            frameWidth: 500,
            frameHeight: 325
        });

        // Load Sound
        this.load.audio("clang", "sounds/pogo.wav");
        this.load.audio("eat", "sounds/catNom.wav");
        this.load.audio("hit", "sounds/hitHurt.wav");
        this.load.audio("powerUp", "sounds/powerUp.wav");
        this.load.audio("heal", "sounds/heal.wav");
        this.load.audio("kill", "sounds/explosion.wav");
        this.load.audio("song", "sounds/ngini-ija-18489.wav");
        this.load.audio("jump", "sounds/jump.wav");
        this.load.audio("dash", "sounds/dash.wav");
        this.load.audio("slash", "sounds/swing.wav");
        this.load.audio("spit", "sounds/spit.wav");
        this.load.audio("diamond", "sounds/diamond.wav");
    }

    create() {

        // walk cycle for player cat
        this.anims.create({
            key: 'walk',
            frames: [
                { key: 'cats', frame: 'Cat_3.png' },
                { key: 'cats', frame: 'Cat_1.png' }
            ],
            frameRate: 15,
            repeat: -1
        });

        // idle anim for player cat
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

        // jump anim for player cat
        this.anims.create({
            key: 'jump',
            defaultTextureKey: "cats",
            frames: [
                { frame: "Cat_3.png" }
            ],
        });

        // melee attack anim for player cat
        this.anims.create({
            key: 'attack',
            defaultTextureKey: "cats",
            frames: [
                { frame: "Cat_4.png" },
                { frame: "Cat_4.png" },
                { frame: "Cat_4.png" }
            ],
            frameRate: 24
        });

        // ranged attack anim for player cat
        this.anims.create({
            key: 'spit',
            defaultTextureKey: "cats",
            frames: [
                { frame: "Cat_5.png" },
                { frame: "Cat_5.png" },
                { frame: "Cat_5.png" }
            ],
            frameRate: 30
        });
        
        // walk cycle for orange cat enemy
        this.anims.create({
            key: 'walkOrange',
            frames: [
                { key: 'cats', frame: 'Cat_7.png' },
                { key: 'cats', frame: 'Cat_6.png' }
            ],
            frameRate: 10,
            repeat: -1
        });

        // walk cycle for black cat enemy
        this.anims.create({
            key: 'walkBlack',
            frames: [
                { key: 'cats', frame: 'Cat_9.png' },
                { key: 'cats', frame: 'Cat_8.png' }
            ],
            frameRate: 7,
            repeat: -1
        });
        
        // Rainbow Animation for CatNip PowerUp 
        this.anims.create({
            key: 'rainbow_anim',
            frames: this.anims.generateFrameNumbers('spriteSheet_RAINBOW', { start: 0, end: 19 }),
            frameRate: 10,
            repeat: -1
        });


        // ends this scene, starts game
         this.scene.start("levelScene");
    }

    update() {
    }
}