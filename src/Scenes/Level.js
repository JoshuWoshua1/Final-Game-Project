class Level extends Phaser.Scene {
    constructor() {
        super("levelScene");
    }

    init() {
        // basic movement variables
        this.ACCELERATION = 2000;
        this.DRAG = 4000;  // if accel < drag, instant turning. if accel > drag, sliding
        this.MAX_SPEED = 200;  //maximum speed while moving
        this.MAX_FALL_SPEED = 800; //maximum speed while falling

        this.physics.world.gravity.y = 1500;

        this.PARTICLE_VELOCITY = 50;

        this.ZOOM = 2.0;

        this.JUMP_VELOCITY = -600;
        this.isJumping = false;

        /* variable jump variables (if you hold you jump higher like mario)
        this.jumpTimer = 0;
        this.MAX_JUMP_TIME = 200;
        this.HOLD_JUMP_VELOCITY = -300; 
        */

        /* Dash variables if we need them
        this.DASH_SPEED = -1000;
        this.DASH_DURATION = 100; 
        this.DASH_COOLDOWN = 500;
        this.isDashing = false;
        this.dashTimer = 0;
        this.lastDash = 0;
        this.dashUnlock = false; 
        */ 

        // double jump varialbes used in current jumping logic, be careful removing this if you dont want it
        this.jumpCount = 0;
        this.MAX_JUMPS = 1;
        
    }
    preload() {
        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
    }

    create() {
        // Notes from Josh:
        // added my.objects to help organize
        // added some functions to reduce clutter for future coding

        // load audio here
        //
        //
        // -----------------------------------------------------------

        // Create tilemap game object & set world bounds to the map size
        this.map = this.add.tilemap("CatMap", 18, 18, 130, 40);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        // Loading tilesets into tilemap
        this.tileset = this.map.addTilesetImage("Tiles", "tilemap_tiles");
        this.tilesetIND = this.map.addTilesetImage("TilesIND", "tilemap_tilesIND");
        this.tilesetFRM = this.map.addTilesetImage("TilesFRM", "tilemap_tilesFRM");

        // Creating layers out of the tilemap in order from back to front.
        this.Paralax = this.map.createLayer("ParalaxBackground", [this.tileset, this.tilesetIND, this.tilesetFRM], 0, 0);
        this.Background = this.map.createLayer("Background", [this.tileset, this.tilesetIND, this.tilesetFRM], 0, 0);
        this.DecoWalls = this.map.createLayer("Deco&Walls", [this.tileset, this.tilesetIND, this.tilesetFRM], 0, 0);
        this.Ground = this.map.createLayer("Ground", [this.tileset, this.tilesetIND, this.tilesetFRM], 0, 0);

        // initalize animated tiles for tilemap
        this.animatedTiles.init(this.map);

        // Give the ground collision
        this.Ground.setCollisionByProperty({
            collides: true
        });

        // creation of game objects and collisions go here
        // + animations for those objects
        //
        // -----------------------------------------------------------

        // Create the player object, and set up collision with the ground
        my.sprite.player = this.physics.add.sprite(100, 100, "platformer_characters", "tile_0000.png"); //MAKE SURE TO CHANGE TO CAT WHEN SPRITE IS CREATED
        my.sprite.player.setCollideWorldBounds(true);
        this.physics.world.TILE_BIAS = 20;
        this.physics.add.collider(my.sprite.player, this.Ground);
        // future player collisions with objects / obstacles go here
        //
        //
        // -----------------------------------------------------------

        // setup for keyboard inputs
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.wKey = this.input.keyboard.addKey('W');
        this.aKey = this.input.keyboard.addKey('A');
        this.sKey = this.input.keyboard.addKey('S');
        this.dKey = this.input.keyboard.addKey('D');

        // camera setup
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25);
        this.cameras.main.setDeadzone(60, 60);
        this.cameras.main.setZoom(this.ZOOM);


        // DEBUG KEY ************************************* REMOVE ON FULL VERSION
        // debug key listener (assigned to F key)
        this.input.keyboard.on('keydown-F', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);
        // DEBUG KEY ************************************* REMOVE ON FULL VERSION
    }

    update() {
        if(this.aKey.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);

            // VFX implementation here
            //
            // -----------------------------------------------------------

        } else if(this.dKey.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);

            // VFX implementation here
            //
            // -----------------------------------------------------------

        } else { //when no button is pressed set acceleration to 0
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            // Stop VFX here
            //
            // -----------------------------------------------------------
        }

        // Jumping logic starts here
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.jumpCount < this.MAX_JUMPS) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY); // Initial burst of velocity to emulate a jump
            my.sprite.player.anims.play('jump', true);
            this.isJumping = true;
            this.jumpCount++; 
        }

        // reset total jumps when on the ground
        // remove 1 jump if player walked off a ledge before jumping
        if (my.sprite.player.body.blocked.down) {
            this.jumpCount = 0;
        } else if (this.jumpCount === 0) {
            this.jumpCount = 1;
        }

        // stops jumping when head hits ceileing or space is released
        if (Phaser.Input.Keyboard.JustUp(this.spaceKey) || my.sprite.player.body.blocked.up) {
            this.isJumping = false;
        }

        // Maximum speed limiters for falling and movement
        if (Math.abs(my.sprite.player.body.velocity.x) > this.MAX_SPEED) { // X-axis limiter
            my.sprite.player.body.velocity.x = Phaser.Math.Clamp(my.sprite.player.body.velocity.x, -this.MAX_SPEED, this.MAX_SPEED);
        }
        if (Math.abs(my.sprite.player.body.velocity.y) > this.MAX_FALL_SPEED) { // Y-axis limiter
            my.sprite.player.body.velocity.y = Phaser.Math.Clamp(my.sprite.player.body.velocity.y, -this.MAX_FALL_SPEED, this.MAX_FALL_SPEED);
        }
        
    }

    // function to create objects intended to reduce clutter in create()
    createObj(name, key, frame) {
        this.map.createFromObjects("Objects", {
            name: name,
            key: key,
            frame: frame
        });
    }
    
}