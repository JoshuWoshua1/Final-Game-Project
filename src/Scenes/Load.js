class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");
        // Load tilemap information
        this.load.image("tilemap_tiles", "tilemap_packed.png");  // Packed basic tilemap
        this.load.image("tilemap_tilesFRM", "tilemap_packedFRM.png");  // Packed Farm tilemap
        this.load.image("tilemap_tilesIND", "tilemap_packedIND.png");  // Packed Industrial tilemap

        this.load.tilemapTiledJSON("CatMap", "CatMap.tmj");  // Tilemap in JSON

    }

    create() {
         this.scene.start("levelScene");
    }

    update() {
    }
}