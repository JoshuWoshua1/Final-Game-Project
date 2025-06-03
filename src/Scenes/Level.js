class Level extends Phaser.Scene {
    constructor() {
        super("levelScene");
    }

    init() {
        // variables and settings

        
    }
    preload() {
        


    }
    create() {
        
        // Make Main tilemap
        this.map = this.add.tilemap("CatMap", 18, 18, 130, 40);



        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("Tiles", "tilemap_tiles");
        this.tilesetIND = this.map.addTilesetImage("TilesIND", "tilemap_tilesIND");
        this.tilesetFRM = this.map.addTilesetImage("TilesFRM", "tilemap_tilesFRM");

        // Create a layer
        this.MainLayer = this.map.createLayer("MainLayer", [this.tileset, this.tilesetIND, this.tilesetFRM], 0, 0);
       

        // Make it collidable
        this.MainLayer.setCollisionByProperty({
            collides: true
        });


    }

    update() {


    }
    
}