class Level extends Phaser.Scene {
    constructor() {
        super("levelScene");
    }

    init() {
        // basic movement variables
        this.ACCELERATION = 2000;
        this.DRAG = 4000;  // if accel < drag, instant turning. if accel > drag, sliding
        this.MAX_SPEED = 150;  // maximum speed while moving
        this.MAX_FALL_SPEED = 800; // maximum speed while falling

        this.physics.world.gravity.y = 1500; // gravity setup

        this.ZOOM = 2.0;

        this.JUMP_VELOCITY = -500;
        this.isJumping = false;

        /* variable jump variables (if you hold you jump higher like mario)
        this.jumpTimer = 0;
        this.MAX_JUMP_TIME = 200;
        this.HOLD_JUMP_VELOCITY = -300; 
        */

        // Dash variables
        this.DASH_SPEED = 1000;
        this.DASH_DURATION = 100;
        this.DASH_COOLDOWN = 500;
        this.isDashing = false;
        this.dashTimer = 0;
        this.lastDash = 0;
        this.dashUnlock = true;

        // double jump varialbes used in current jumping logic, be careful removing this if you dont want it
        this.jumpCount = 0;
        this.MAX_JUMPS = 1;

        // vairables for attacks
        this.SWIPE_COOLDOWN = 400; // milliseconds between attacks
        this.lastSwipeTime = 0;
        this.SPIT_COOLDOWN = 150; //milliseconds between ranged attacks
        this.lastSpitTime = 0;
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
        this.tilesetEXT = this.map.addTilesetImage("TilesEXT", "tilemap_tilesEXT");

        // Creating layers out of the tilemap in order from back to front.
        this.Paralax = this.map.createLayer("ParalaxBackground", [this.tileset, this.tilesetIND, this.tilesetFRM], 0, 0);
        this.Background = this.map.createLayer("Background", [this.tileset, this.tilesetIND, this.tilesetFRM], 0, 0);
        this.DecoWalls = this.map.createLayer("Deco&Walls", [this.tileset, this.tilesetIND, this.tilesetFRM], 0, 0);
        this.Ground = this.map.createLayer("Ground", [this.tileset, this.tilesetIND, this.tilesetFRM], 0, 0);
        this.Paralax.setScrollFactor(0.5, 0.5); //set paralax scrolling

        // initalize animated tiles for tilemap
        this.animatedTiles.init(this.map);

        // Give the ground collision
        this.Ground.setCollisionByProperty({
            collides: true
        });

        // Create the player object, and set up collision with the ground
        my.sprite.player = this.physics.add.sprite(100, 100, "platformer_characters", "tile_0000.png"); //MAKE SURE TO CHANGE TO CAT WHEN SPRITE IS CREATED
        my.sprite.player.setCollideWorldBounds(true);
        this.physics.world.TILE_BIAS = 20;
        this.physics.add.collider(my.sprite.player, this.Ground);

        // creation of game objects and collisions for those go here
        my.object.Sushi = this.createObj("Sushi", "spriteSheet_EXT", 103);
        my.object.Kibble = this.createObj("Kibble", "spriteSheet_FRM", 104);

        // Enable Physics on Objects
        
        my.object.Sushi.forEach(o => this.physics.add.existing(o, true));
        my.object.Kibble.forEach(o => this.physics.add.existing(o, true));
        
        // groups for objects
        this.kibbleGroup = this.add.group(my.object.Kibble);
        this.sushiGroup = this.add.group(my.object.Sushi);
        this.slashGroup = this.physics.add.group(); //phsyics group to handle attack hitbox
        this.projectiles = this.physics.add.group(); // physics group to handle ranged attack hitbox


        
        // + animations for those objects
        //
        // -----------------------------------------------------------

        
        // future player collisions with objects / obstacles go here
        //
        // collision handling for Sushi powerup
        
        this.physics.add.overlap(my.sprite.player, this.sushiGroup, (obj1, obj2) => {
            obj2.destroy(); 
        });

        // collision handling or Kibble coin
        this.physics.add.overlap(my.sprite.player, this.kibbleGroup, (obj1, obj2) => {
            obj2.destroy(); 
        });
        
        //
        // -----------------------------------------------------------

        // setup for keyboard inputs
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.controlKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);
        this.wKey = this.input.keyboard.addKey('W');
        this.aKey = this.input.keyboard.addKey('A');
        this.sKey = this.input.keyboard.addKey('S');
        this.dKey = this.input.keyboard.addKey('D');
        this.jKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
        this.kKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);

        // camera setup
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25);
        this.cameras.main.setDeadzone(60, 60);
        this.cameras.main.setZoom(this.ZOOM);

        // VFX go here
        my.vfx.downSlash = this.add.particles(0, 0, "kenny-particles", { //VFX for down attack slash
            frame: "twirl_01.png",
            lifespan: 150,
            quantity: 5,
            scale: { start: 0.1, end: 0.1 },
            alpha: { start: 1, end: 0.1 },
            speed: 0,
            rotate: { start: 90, end: 90 }
        }); my.vfx.downSlash.stop();
        my.vfx.upSlash = this.add.particles(0, 0, "kenny-particles", { //VFX for up attack slash
            frame: "twirl_01.png",
            lifespan: 150,
            quantity: 5,
            scale: { start: 0.1, end: 0.1 },
            alpha: { start: 1, end: 0.1 },
            speed: 0,
            rotate: { start: 270, end: 270 }
        }); my.vfx.upSlash.stop();
        my.vfx.rightSlash = this.add.particles(0, 0, "kenny-particles", { //VFX for right attack slash
            frame: "twirl_01.png",
            lifespan: 150,
            quantity: 5,
            scale: { start: 0.1, end: 0.1 },
            alpha: { start: 1, end: 0.1 },
            speed: 0,
            rotate: { start: 0, end: 0 }
        }); my.vfx.rightSlash.stop();
        my.vfx.leftSlash = this.add.particles(0, 0, "kenny-particles", { //VFX for right attack slash
            frame: "twirl_01.png",
            lifespan: 150,
            quantity: 5,
            scale: { start: 0.1, end: 0.1 },
            alpha: { start: 1, end: 0.1 },
            speed: 0,
            rotate: { start: 180, end: 180 }
        }); my.vfx.leftSlash.stop();


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
            my.sprite.player.setFlip(true, false);
            if (!my.sprite.player.anims.isPlaying || my.sprite.player.anims.currentAnim.key === 'idle' || my.sprite.player.anims.currentAnim.key === 'walk') {
                my.sprite.player.anims.play('walk', true);
            }

            // VFX implementation here
            //
            // -----------------------------------------------------------

        } else if(this.dKey.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.resetFlip();
            if (!my.sprite.player.anims.isPlaying || my.sprite.player.anims.currentAnim.key === 'idle' || my.sprite.player.anims.currentAnim.key === 'walk') {
                my.sprite.player.anims.play('walk', true);
            }
            // VFX implementation here
            //
            // -----------------------------------------------------------

        } else { //when no button is pressed set acceleration to 0
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            if (!my.sprite.player.anims.isPlaying || my.sprite.player.anims.currentAnim.key === 'idle' || my.sprite.player.anims.currentAnim.key === 'walk') {
                my.sprite.player.anims.play('idle', true);
            }
            
            // Stop VFX here
            //
            // -----------------------------------------------------------d
        }

        // Collisions with Walls
        const onWallLeft = my.sprite.player.body.blocked.left;
        const onWallRight = my.sprite.player.body.blocked.right;
        const onWall = onWallLeft || onWallRight;
        const onGround = my.sprite.player.body.blocked.down
        const onRoof = my.sprite.player.body.blocked.up

        // WALL STICK / SLIDE
        if (onWall && !onGround && !this.wallJump) {
            my.sprite.player.body.setAllowGravity(true);  // Gravity enabled
            my.sprite.player.body.gravity.y = 200;        // Light gravity to allow slow slide
            if (!this.dKey.isDown && !this.aKey.isDown) {
                my.sprite.player.setVelocityY(50);        // Passive sliding down
            }

            // Wall sticking angle and flag
            if (onWallRight) {
                this.rightStick = true;
                this.leftStick = false;
                my.sprite.player.angle = -90;
            } else if (onWallLeft) {
                this.leftStick = true;
                this.rightStick = false;
                my.sprite.player.angle = -270;
            }
        } else {
            // Reset wall stick if not on wall or just jumped off
            this.leftStick = false;
            this.rightStick = false;
            my.sprite.player.angle = 0;
            my.sprite.player.body.gravity.y = 800;  // Default gravity
        }

        // Jumping logic starts here
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.jumpCount < this.MAX_JUMPS) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY); // Initial burst of velocity to emulate a jump
            my.sprite.player.anims.play('jump', true);
            this.isJumping = true;
            this.jumpCount++;
            if (onWall) {
                this.wallJump = true; // Set wallJump to true when on wall
                if (onWallLeft) {
                    my.sprite.player.body.setVelocityX(-this.JUMP_VELOCITY+200); // jump off to the right
                    this.leftStick = false;
                    this.rightStick = false;
                } else if (onWallRight) {
                    my.sprite.player.body.setVelocityX(this.JUMP_VELOCITY-200); // jump off to the left
                    this.leftStick = false;
                    this.rightStick = false;
                }
            }
        }

        if (!onWall) {  // If not on wall walljump is false
            this.wallJump = false;
        }
        

        // reset total jumps when on the ground
        // remove 1 jump if player walked off a ledge before jumping
        if (onGround || onWall) {
            this.jumpCount = 0;
        } else if (this.jumpCount === 0) {
            this.jumpCount = 1;
        }

        // stops jumping when head hits ceileing or space is released
        if (Phaser.Input.Keyboard.JustUp(this.spaceKey) || onRoof) {
            this.isJumping = false;
           
        }

        // Maximum speed limiters for falling and movement
        if (Math.abs(my.sprite.player.body.velocity.x) > this.MAX_SPEED && !this.wallJump && !this.isDashing) { // X-axis limiter
            my.sprite.player.body.velocity.x = Phaser.Math.Clamp(my.sprite.player.body.velocity.x, -this.MAX_SPEED, this.MAX_SPEED);
        }
        if (Math.abs(my.sprite.player.body.velocity.y) > this.MAX_FALL_SPEED) { // Y-axis limiter
            my.sprite.player.body.velocity.y = Phaser.Math.Clamp(my.sprite.player.body.velocity.y, -this.MAX_FALL_SPEED, this.MAX_FALL_SPEED);
        }

        // Wall Climbing Logic >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        if (onWall || this.rightStick || this.leftStick) {
            if (!this.wallJump && (this.dKey.isDown || this.aKey.isDown)) { 
            my.sprite.player.body.setVelocityY(-100);
            } else if (this.rightStick || this.leftStick) {
                my.sprite.player.body.setVelocityY(-5);
            }
            if(onWallRight || this.rightStick == true){
                this.rightStick = true;
                my.sprite.player.angle =- 90;

            }
            if(onWallLeft || this.leftStick){
                this.leftStick = true;
                my.sprite.player.angle =- 270;

            }
        } else {
            this.leftStick = false;
            this.rightStick = false;
            my.sprite.player.angle =- 0;
        }
        // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

        // object collisions

        // swipe attack
        const swipe_now = this.time.now;
        if (Phaser.Input.Keyboard.JustDown(this.jKey) && swipe_now - this.lastSwipeTime > this.SWIPE_COOLDOWN) {
            this.lastSwipeTime = swipe_now;
            let vfxEmitter = null;
            let angle = 0;
            let offsetX = 0;
            let offsetY = 0;

            my.sprite.player.anims.play('attack', true); //play attack animation on player

             if (this.wKey.isDown) {
                offsetY = -20;
                vfxEmitter = my.vfx.upSlash;
                angle = -180;
            } else if (this.sKey.isDown) {
                offsetY = 20;
                vfxEmitter = my.vfx.downSlash;
                angle = 0;
            } else {
                // Left or right
                if (my.sprite.player.flipX) {
                    offsetX = -20;
                    vfxEmitter = my.vfx.leftSlash;
                    angle = 90;
                } else {
                    offsetX = 20;
                    vfxEmitter = my.vfx.rightSlash;
                    angle = -90;
                }
            }

            // Emit particles
            vfxEmitter.emitParticleAt(
                my.sprite.player.x + offsetX,
                my.sprite.player.y + offsetY
            );

            // Create invisible hitbox
            const slashHitbox = this.slashGroup.create(
                my.sprite.player.x + offsetX,
                my.sprite.player.y + offsetY,
                null
            );

            slashHitbox.setVisible(false);          // Invisible hitbox
            slashHitbox.body.allowGravity = false;

            // Set hitbox size based on slash direction
            if (angle === -90 || angle === 90) {
                slashHitbox.setSize(50, 40); // horizontal slash
            } else {
                slashHitbox.setSize(40, 50); // vertical slash
            }

            // Auto-destroy hitbox and reset flags
            this.time.delayedCall(150, () => {
                if (slashHitbox && slashHitbox.destroy) slashHitbox.destroy();
            });
            this.time.delayedCall(1000, () => {
                my.sprite.player.anims.play('idle', true);
            });
            
        }
        
        // ranged attack
        const spit_now = this.time.now;
        if (Phaser.Input.Keyboard.JustDown(this.kKey) && spit_now - this.lastSpitTime > this.SPIT_COOLDOWN) {
            this.lastSpitTime = spit_now;
            let velocityX = 0;
            let velocityY = 0;
            let offsetX = 0;
            let offsetY = 0;

            my.sprite.player.anims.play('spit', true); //play spit attack animation on player

            // Shoot up if W is held
            if (this.wKey.isDown) {
                velocityY = -300;
                offsetY = -20;
            } else if (this.sKey.isDown) {
                velocityY = 300;
                offsetY = 20;
            } else {
                // Shoot forward
                velocityX = my.sprite.player.flipX ? -300 : 300;
                offsetX = my.sprite.player.flipX ? -20 : 20;
            }

            let projectile = this.projectiles.create(
                my.sprite.player.x + offsetX,
                my.sprite.player.y + offsetY,
                'spriteSheet',
                16
            );

            projectile.body.allowGravity = false;
            projectile.setVelocity(velocityX, velocityY);
            projectile.setSize(10, 10);

            this.time.delayedCall(1000, () => {
                my.sprite.player.anims.play('idle', true);
                if (projectile && projectile.destroy) projectile.destroy();
            });
        }

        // dashing
        const dash_now = this.time.now;
        // Start dash if control is pressed, player is not already dashing, and cooldown passed
        if (Phaser.Input.Keyboard.JustDown(this.controlKey) && !this.isDashing && dash_now - this.lastDash > this.DASH_COOLDOWN) {
            this.isDashing = true;
            this.dashTimer = 0;
            this.lastDash = dash_now;

            console.log('blah')

            //audio
            //
            //-----

            //vfx
            //
            //------

            // Disable gravity
            my.sprite.player.body.allowGravity = false;
            // Set dash velocity based on facing direction
            const direction = my.sprite.player.flipX ? -1 : 1;
            my.sprite.player.setVelocityX(this.DASH_SPEED * direction);
        }

        // During dash
        if (this.isDashing) {
            this.dashTimer += this.game.loop.delta;
            my.sprite.player.setVelocityY(0)
            this.isJumping = false;

            if (this.dashTimer >= this.DASH_DURATION) {
                this.isDashing = false;
                my.sprite.player.body.allowGravity = true;
                //vfx stop
                //
                //-----
            }
        }
    }

    // function to create objects intended to reduce clutter in create()
    createObj(name, key, frame) {
        return this.map.createFromObjects("Objects", {
            name: name,
            key: key,
            frame: frame
        });
    }
    
}