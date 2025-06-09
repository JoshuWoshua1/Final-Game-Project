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

        this.ZOOM = 3.0;

        this.PARTICLE_VELOCITY = 50;

        this.JUMP_VELOCITY = -500;
        this.isJumping = false;

        // Dash variables
        this.DASH_SPEED = 1000;
        this.DASH_DURATION = 100;
        this.DASH_COOLDOWN = 900;
        this.isDashing = false;
        this.dashTimer = 0;
        this.lastDash = 0;
        this.dashUnlock = true;

        // double jump varialbes used in current jumping logic
        this.jumpCount = 0;
        this.MAX_JUMPS = 1;

        // vairables for attacks
        this.SWIPE_COOLDOWN = 300; // milliseconds between attacks
        this.lastSwipeTime = 0;
        this.activeSlash = null; // helper for moving slash hitbox with player movement
        this.SPIT_COOLDOWN = 700; //milliseconds between ranged attacks
        this.lastSpitTime = 0;

        this.damage = 1;
        this.playerHP = 5;  // maximum hp of 5
        this.alreadyDead = false;

        this.invincible = false;
        this.invincibleDuration = 1500;
        this.flickerTimer = 0;
        this.flickerInterval = 100;

        this.diamonds = 0;
        this.score = 0;
    }
    preload() {
        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
    }

    create() {
        // load audio here
        this.clangSound = this.sound.add("clang");
        this.eatSound = this.sound.add("eat");
        this.hitSound = this.sound.add("hit");
        this.healSound = this.sound.add("heal");
        this.powerUpSound = this.sound.add("powerUp");
        this.killSound = this.sound.add("kill");
        this.music = this.sound.add("song", {
            loop: true,
            volume: 0.3
        });
        this.music.play(); // creates and starts background music.
        this.dashSound = this.sound.add("dash");
        this.jumpSound = this.sound.add("jump");
        this.slashSound = this.sound.add("slash");
        this.spitSound = this.sound.add("spit");
        this.diamondSound = this.sound.add("diamond");

        // Create tilemap game object & set world bounds to the map size
        this.Bbackground = this.add.tilemap("Background", 18, 18, 6, 30);
        this.map = this.add.tilemap("CatMap", 18, 18, 130, 40);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        // Loading tilesets into tilemap
        this.tileset = this.map.addTilesetImage("Tiles", "tilemap_tiles");
        this.tilesetIND = this.map.addTilesetImage("TilesIND", "tilemap_tilesIND");
        this.tilesetFRM = this.map.addTilesetImage("TilesFRM", "tilemap_tilesFRM");
        this.tilesetEXT = this.map.addTilesetImage("TilesEXT", "tilemap_tilesEXT");
        this.tilesetBG = this.Bbackground.addTilesetImage("Background", "tilemap_tilesBG");

        // Creating layers out of the tilemap in order from back to front.
        this.BigBG = this.Bbackground.createLayer("bigBackground", [this.tilesetBG], 0, 0);
        this.BigBG.setScale(5);
        this.BigBG.setScrollFactor(0.2, 0.1); //set paralax scrolling
        this.Paralax = this.map.createLayer("ParalaxBackground", [this.tileset, this.tilesetIND, this.tilesetFRM, this.tilesetEXT], 0, 0);
        this.darkOverlay = this.add.rectangle(
            0, 0,
            this.map.widthInPixels,
            this.map.heightInPixels,
            0x000000,
            0.2
        ).setOrigin(0, 0);
        this.Background = this.map.createLayer("Background", [this.tileset, this.tilesetIND, this.tilesetFRM, this.tilesetEXT], 0, 0);
        this.DecoWalls = this.map.createLayer("Deco&Walls", [this.tileset, this.tilesetIND, this.tilesetFRM, this.tilesetEXT], 0, 0);
        this.Ground = this.map.createLayer("Ground", [this.tileset, this.tilesetIND, this.tilesetFRM, this.tilesetEXT], 0, 0);
        this.Paralax.setScrollFactor(0.5, 0.5); //set paralax scrolling
        this.Paralax.setScale(3);

        // initalize animated tiles for tilemap
        this.animatedTiles.init(this.map);

        // Give the ground collision
        this.Ground.setCollisionByProperty({
            collides: true
        });

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

        my.vfx.pogo = this.add.particles(0, 0, "kenny-particles", {
            frame: "star_08.png",
            lifespan: 150,
            quantity: 1,
            scale: { start: 0.09, end: 0 },
            alpha: { start: 1, end: 0 },
        });my.vfx.pogo.stop();
        my.vfx.pogo.setDepth(10);

        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_01.png', 'smoke_02.png', 'smoke_03.png'],
            random: true,
            scale: {start: 0.01, end: 0.08},
            maxAliveParticles: 20,
            lifespan: 200,
            alpha: {start: 0.7, end: 0.1}, 
        }); my.vfx.walking.stop();

        my.vfx.jump = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_01.png', 'smoke_02.png', 'smoke_03.png'],
            random: true,
            scale: {start: 0.08, end: 0.08},
            lifespan: 500,
            alpha: {start: 0.7, end: 0.1}, 
            speedX: { min: -50, max: 50 },
            quantity: 20
        }); my.vfx.jump.stop();

        my.vfx.powerUpCollect = this.add.particles(0,0, "spriteSheet_EXT", {
            frame: 103,
            random: true,
            scale: { start: 0.6, end: 0.4 },
            lifespan: 300,
            alpha: { start: 1, end: 0 },
            speed: { min: 100, max: 200 },
            angle: { min: 0, max: 360 },
            gravityY: 300,
            quantity: 2,
            rotate: { min: -180, max: 180 }
        }); my.vfx.powerUpCollect.stop();

        my.vfx.kibble = this.add.particles(0,0, "spriteSheet_FRM", {
            frame: 104,
            random: true,
            scale: { start: 0.6, end: 0.4 },
            lifespan: 300,
            alpha: { start: 1, end: 0 },
            speed: { min: 100, max: 200 },
            angle: { min: 0, max: 360 },
            gravityY: 300,
            quantity: 2,
            rotate: { min: -180, max: 180 }
        }); my.vfx.kibble.stop();

        my.vfx.diamond = this.add.particles(0,0, "spriteSheet", {
            frame: 67,
            random: true,
            scale: { start: 0.6, end: 0.4 },
            lifespan: 300,
            alpha: { start: 1, end: 0 },
            speed: { min: 100, max: 200 },
            angle: { min: 0, max: 360 },
            gravityY: 300,
            quantity: 2,
            rotate: { min: -180, max: 180 }
        }); my.vfx.diamond.stop();

        my.vfx.kill = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_01.png', 'smoke_02.png', 'smoke_03.png'],
            random: true,
            speed: { min: -400, max: 400 },
            scale: { start: 0.1, end: 0.05 },
            lifespan: 300,
            quantity: 20,
            alpha: { start: 1, end: 0 },
        }); my.vfx.kill.stop();

        my.vfx.poof = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_01.png', 'smoke_02.png', 'smoke_03.png'],
            random: true,
            speed: { min: -100, max: 100 },
            scale: { start: 0.1, end: 0.05 },
            lifespan: 200,
            quantity: 10,
            alpha: { start: 1, end: 0 },
        }); my.vfx.poof.stop();

        my.vfx.dash = this.add.particles(0, 0, "kenny-particles", {
            frame: ['spark_07.png'],
            scale: {start: 0.15, end: 0.05},
            lifespan: 200,
            alpha: {start: 0.4, end: 0}, 
        }); my.vfx.dash.stop();

        //---------------------------------------------

        // Create the player object, and set up collision with the ground
        my.sprite.player = this.physics.add.sprite(50, 630, "cats", "Cat_1.png");
        my.sprite.player.setCollideWorldBounds(true);
        this.physics.world.TILE_BIAS = 20;
        this.physics.add.collider(my.sprite.player, this.Ground);

        // creation of game objects and collisions for those go here
        my.object.Sushi = this.createObj("Sushi", "spriteSheet_EXT", 103);
        my.object.Kibble = this.createObj("Kibble", "spriteSheet_FRM", 104);
        my.object.Spike = this.createObj("Spike", "spriteSheet", 68);
        my.object.Bed = this.createObj("Bed", "spriteSheet", 156);
        my.object.Hazard = this.map.createFromObjects("Objects", {
            name: "Hazard"
        });
        my.object.Diamond = this.createObj("Diamond", "spriteSheet", 67);
        my.object.Button = this.createObj("Button", "spriteSheet", 148);
        my.object.Lock = this.createObj("Lock", "spriteSheet", 28);
        my.object.Home = this.createObj("Home", "spriteSheet", 156);

        // Enable Physics on Objects
        my.object.Sushi.forEach(o => this.physics.add.existing(o, true));
        my.object.Kibble.forEach(o => this.physics.add.existing(o, true));
        my.object.Spike.forEach(o => this.physics.add.existing(o, true));
        my.object.Bed.forEach(o => this.physics.add.existing(o, true));
        my.object.Hazard.forEach(o => {this.physics.add.existing(o, true); o.setVisible(false);}); //creates invisible hitboxes for miscelanious hazards
        my.object.Diamond.forEach(o => {this.physics.add.existing(o, true);});
        my.object.Button.forEach(o => {
            this.physics.add.existing(o, true);
            o.setData("LockLink", o.getData("LockLink"));
            o.setData("activated", false);  // track activation state
        });
        my.object.Lock.forEach(o => {
            this.physics.add.existing(o, true);
            o.setData("LockLink", o.getData("LockLink"));
        });
        my.object.Home.forEach(o => this.physics.add.existing(o, true));

        
        // groups for objects
        this.kibbleGroup = this.add.group(my.object.Kibble);
        this.sushiGroup = this.add.group(my.object.Sushi);
        this.spikeGroup = this.add.group(my.object.Spike);
        this.bedGroup = this.add.group(my.object.Bed);
        this.slashGroup = this.physics.add.group(); //phsyics group to handle attack hitbox
        this.projectiles = this.physics.add.group(); // physics group to handle ranged attack hitbox
        this.enemies = this.physics.add.group(); //group for enemies
        this.hazardGroup = this.add.group(my.object.Hazard);
        this.diamondGroup = this.add.group(my.object.Diamond);
        this.buttonGroup = this.add.group(my.object.Button);
        this.lockGroup = this.add.group(my.object.Lock);

        //change hitbox for spikes if they are flipped or not
        this.spikeGroup.getChildren().forEach(spike => {
            const flipdX = spike.flipX;
            const flipdY = spike.flipY;
            let wid = 18; let hei = 4; let offX = 0; let offY = 14;
            if (flipdX) {
                offX = spike.width - wid - offX;
            }
            if (flipdY) {
                offY = spike.height - hei - offY;
            }
            spike.body.setSize(wid, hei);
            spike.body.setOffset(offX, offY);
        });
        
        // Create score text (fixed to camera)
        this.scoreText = this.add.text(162 * this.ZOOM, 110 * this.ZOOM, 'Score: 0', {
             fontSize: '72px',
             fontFamily: 'Verdana',
             color: '#41f500', 
             stroke: '#000000',
             strokeThickness: 10,
             padding: { x: 10, y: 5 },
        });
        this.scoreText.setScale(0.2);
        // This makes the text stay in the same position on screen regardless of camera movement
        this.scoreText.setScrollFactor(0);
        this.scoreText.setDepth(9999); // Ensure it's always on top

        // Create diamond count text
        this.diamondText = this.add.text(162 * this.ZOOM, 116 * this.ZOOM, '    : 0/3', {
             fontSize: '72px',
             fontFamily: 'Verdana',
             color: '#00f5fa', 
             stroke: '#000000',
             strokeThickness: 10,
             padding: { x: 10, y: 5 },
        });
        this.diamondUI = this.add.image(166 * this.ZOOM, 120 * this.ZOOM, "spriteSheet", 67);

        this.diamondUI.setScale(1.66);
        this.diamondUI.setScrollFactor(0);
        this.diamondUI.setDepth(9999);
        this.diamondText.setScale(0.2);
        this.diamondText.setScrollFactor(0);
        this.diamondText.setDepth(9999);

        //Create health Bar
        this.healthBarBg = this.add.graphics(); // border of hp bar
        this.healthBarBg.fillStyle(0x000000, 0.6);
        this.healthBarBg.fillRect(162* this.ZOOM, 102 * this.ZOOM, 206, 26);

        this.healthBar = this.add.graphics(); // actual hp bar
        this.healthBar.fillStyle(0x41f500, 1);

        this.healthBar.setScrollFactor(0);
        this.healthBarBg.setScrollFactor(0);
        this.healthBar.setDepth(9998);
        this.healthBarBg.setDepth(9997);

        this.drawHealthBar(); // initailly call to create health bar

        this.dashCooldownUI = this.add.graphics(); //radial dash timer
        this.dashCooldownUI.setScrollFactor(0);
        this.dashCooldownUI.setDepth(9996);

        // enemy handling and pathing
        let enemyObjects = this.map.filterObjects("Objects", obj => obj.name === "Enemy");
        let pathPoints = this.map.filterObjects("Objects", obj => obj.name === "Path");

        //enemy setup
        enemyObjects.forEach((enemyObj) => {
            // Grab custom properties
            const enemyPathID = enemyObj.properties.find(p => p.name === "PathID")?.value; //Path ID
            const enemyColor = enemyObj.properties.find(p => p.name === "Color")?.value; //Color
            
            let enemy;

            if (enemyColor === "orange") {  // if orange cat do this
                enemy = this.physics.add.sprite(enemyObj.x+10, enemyObj.y-10, "cats", "Cat_6.png");
                enemy.anims.play('walkOrange', true);
                enemy.enemyHp = 4;
                enemy.speed = 50;
                enemy.points = 200;
            } else if (enemyColor === "black") { // if black cat do this
                enemy = this.physics.add.sprite(enemyObj.x+10, enemyObj.y-10, "cats", "Cat_8.png");
                enemy.anims.play('walkBlack', true);
                enemy.enemyHp = 8;
                enemy.speed = 35;
                enemy.points = 400;
            }
            enemy.setCollideWorldBounds(true);
            this.physics.add.collider(enemy, this.Ground);

            // Get matching path points
            const matchedPoints = pathPoints.filter(p => {
                return p.properties.find(prop => prop.name === "PathID")?.value === enemyPathID;
            });

            // Find first and second pathing points
            const firstPoint = matchedPoints.find(p => p.properties.find(prop => prop.name === "first")?.value === true);
            const secondPoint = matchedPoints.find(p => p !== firstPoint);

            // Store pathing info in enemy object
            enemy.patrol = {
                points: [
                    new Phaser.Math.Vector2(firstPoint.x+10, firstPoint.y-10),
                    new Phaser.Math.Vector2(secondPoint.x+10, secondPoint.y-10)
                ],
                current: 1
            };

            // Flip the sprite based on movement direction
            enemy.updateDirection = () => {
                const target = enemy.patrol.points[enemy.patrol.current];
                enemy.setFlipX(enemy.x > target.x);
            };

            enemy.updateDirection();
            this.enemies.add(enemy);

            enemy.body.setAllowGravity(true);
        });

        
        // player collisions with objects / obstacles go here
        this.physics.add.collider(my.sprite.player, this.lockGroup); // collision with locks

        // collision handling for Sushi powerup
        this.physics.add.overlap(my.sprite.player, this.sushiGroup, (obj1, obj2) => {
            obj2.destroy(); 
            this.eatSound.play({
                volume: 0.4
            });

            // vfx for collecting powerup  
            my.vfx.powerUpCollect.start()
            my.vfx.powerUpCollect.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            my.vfx.powerUpCollect.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            this.time.delayedCall(100, () => {
                this.powerUpSound.play({
                    volume: 0.4
                });
                my.vfx.powerUpCollect.stop();
            });

            // Run function that affects stats and runs vfx
            this.time.addEvent({
                callback: () => this.PowerUp(),
            });
            
            // add to score
            this.updateScore(100);
        });

        this.physics.add.overlap(my.sprite.player, this.kibbleGroup, (obj1, obj2) => { // collision handling for Kibble
            obj2.destroy(); 
            this.eatSound.play({
                volume: 0.22
            });

            my.vfx.kibble.start()
            my.vfx.kibble.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            my.vfx.kibble.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            this.time.delayedCall(100, () => {
                my.vfx.kibble.stop();
            }); 
            
            // add to score
            this.updateScore(10);
        });

        this.physics.add.overlap(my.sprite.player, this.diamondGroup, (obj1, obj2) => { // collecting diamonds
            obj2.destroy(); 
            this.diamondSound.play({
                volume: 0.4
            });

            my.vfx.diamond.start()
            my.vfx.diamond.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            my.vfx.diamond.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            this.time.delayedCall(100, () => {
                my.vfx.diamond.stop();
            }); 
            
            // add to score
            this.updateScore(500);
            // update total diamond count
            this.updateDiamond(1);
        });

        this.physics.add.overlap(this.projectiles, this.buttonGroup, (button, projectile) => { // Button collision with spit
            if (button.getData("activated")) return;
            button.setData("activated", true);
            projectile.destroy();

            const linkID = button.getData("LockLink");

            // make the button press down after hit
            button.setFrame(149);

            // Find and destroy matching locks
            my.object.Lock.forEach(lock => {
                if (lock.getData("LockLink") === linkID) {
                    lock.destroy();
                }
            });
        });

        this.physics.add.overlap(my.sprite.player, this.bedGroup, (player, bed) => { // heal player and stop movement for a second when in bed
            if (!this.lastBedHeal || this.time.now - this.lastBedHeal > 5000) {
                this.lastBedHeal = this.time.now;
                this.healing = true;
                this.healSound.play({
                    volume: 0.4
                });
                player.anims.play('idle', true);
                this.playerHP = 5;
                this.drawHealthBar();
                player.x = bed.x;
                player.y = bed.y-10;

                player.setVelocity(0, 0);
                player.setAcceleration(0, 0);
                player.body.moves = false;
                
                this.time.delayedCall(2000, () => {
                    this.healing = false;
                    player.body.moves = true;
                });
            }
        });

        this.physics.add.overlap(my.sprite.player, my.object.Home, (player, home) => { // end game and stop player movement when in final bed
            if (!this.lastBedHeal || this.time.now - this.lastBedHeal > 5000) {
                this.lastBedHeal = this.time.now;
                this.healing = true;
                this.healSound.play({
                    volume: 0.4
                });
                player.anims.play('idle', true);
                this.playerHP = 5;
                this.drawHealthBar();
                player.x = home.x;
                player.y = home.y-10;

                player.setVelocity(0, 0);
                player.setAcceleration(0, 0);
                player.body.moves = false;
                this.time.delayedCall(1000, () => {
                    this.scene.pause();
                    this.music.stop();
                    this.scene.launch('winScene')
                });
            }
        });

        this.physics.add.collider(this.projectiles, this.Ground, (projectile, tile) => { // projectiles breaking when hitting ground
            // add vfx puff when projectile hits ground
            my.vfx.poof.emitParticleAt(
                projectile.x,
                projectile.y,
            );
            projectile.destroy();
        });

        this.physics.add.overlap(this.slashGroup, this.enemies, (slash, enemy) => { // attacking enemy with slash
            enemy.enemyHp -= this.damage;
            this.hitSound.play({
                volume: 0.4
            });
            my.vfx.poof.emitParticleAt(
                (slash.x + enemy.x) / 2,
                (slash.y + enemy.y) / 2,
            );
            slash.destroy();
            if (this.downSlash) {
                my.sprite.player.setVelocityY(-550);
            }
            if (enemy.enemyHp <= 0) {
                my.vfx.kill.emitParticleAt(
                    enemy.x,
                    enemy.y,
                );
                this.killSound.play({
                    volume: 0.4
                });
                this.updateScore(enemy.points);
                enemy.destroy();
            }
        });

        this.physics.add.overlap(this.projectiles, this.enemies, (proj, enemy) => { // attacking enemy with projectile
            enemy.enemyHp -= this.damage;
            this.hitSound.play({
                volume: 0.4
            });
            my.vfx.poof.emitParticleAt(
                proj.x,
                proj.y,
            );
            proj.destroy();
            if (enemy.enemyHp <= 0) {
                this.killSound.play({
                    volume: 0.4
                });
                my.vfx.kill.emitParticleAt(
                    enemy.x,
                    enemy.y,
                );
                this.updateScore(enemy.points);
                enemy.destroy();
            }
        });

        this.physics.add.collider(this.slashGroup, this.spikeGroup, (spike, slash) => { // pogoing off of a spike with slash
            slash.destroy();
            if (this.downSlash) {
                my.sprite.player.setVelocityY(-550);
            }
            this.clangSound.play({
                volume: 0.4
            });
            my.vfx.pogo.emitParticleAt(spike.body.center.x, spike.body.center.y);
        });

        this.physics.add.collider(my.sprite.player, this.spikeGroup, (player, spike) => { // player hitting spike
            if (this.invincible) return;  // Skip if invincible
            this.invincible = true;
            this.hitSound.play({
                volume: 0.4
            });

            this.playerHP -= 1;
            this.flickerHealth();
            my.sprite.player.setVelocityY(-450);
            // Invincibility frames
            this.time.delayedCall(this.invincibleDuration, () => {
                this.invincible = false;
            });
        });

        this.physics.add.collider(my.sprite.player, this.enemies, (player, enemy) => { // player colliding with enemy
            if (this.invincible) return;  // Skip if invincible
            this.invincible = true;
            this.hitSound.play({
                volume: 0.4
            });

            this.playerHP -= 1;
            this.flickerHealth();

            // Invincibility frames
            this.time.delayedCall(this.invincibleDuration, () => {
                this.invincible = false;
            });
        });

        this.physics.add.overlap(my.sprite.player, this.hazardGroup, (player, hazard) => { // player colliding with any hazard object
            if (this.invincible) return;
            this.invincible = true;
            this.hitSound.play({
                volume: 0.4
            });

            this.playerHP -= 1;
            this.flickerHealth();

            // Invincibility frames
            this.time.delayedCall(this.invincibleDuration, () => {
                this.invincible = false;
            });
        });

        // setup for keyboard inputs
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
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
    }

    update() {
        // constant variables for update
        // Collisions with Walls
        const onWallLeft = my.sprite.player.body.blocked.left;
        const onWallRight = my.sprite.player.body.blocked.right;
        const onWall = onWallLeft || onWallRight;
        const onGround = my.sprite.player.body.blocked.down
        const onRoof = my.sprite.player.body.blocked.up

        if (!this.healing) { // turns movement keys off while sitting in bed
            if (this.aKey.isDown) {
                my.sprite.player.setAccelerationX(-this.ACCELERATION);
                my.sprite.player.setFlip(true, false);
                if (!my.sprite.player.anims.isPlaying || my.sprite.player.anims.currentAnim.key === 'idle' || my.sprite.player.anims.currentAnim.key === 'walk') {
                    my.sprite.player.anims.play('walk', true);
                }

                // VFX
                my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
                my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
                if (my.sprite.player.body.blocked.down || onWall) {
                    my.vfx.walking.start();
                } else {
                    my.vfx.walking.stop();
                }
                

            } else if (this.dKey.isDown) {
                my.sprite.player.setAccelerationX(this.ACCELERATION);
                my.sprite.player.resetFlip();
                if (!my.sprite.player.anims.isPlaying || my.sprite.player.anims.currentAnim.key === 'idle' || my.sprite.player.anims.currentAnim.key === 'walk') {
                    my.sprite.player.anims.play('walk', true);
                }

                // VFX
                my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
                my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
                if (my.sprite.player.body.blocked.down || onWall) {
                    my.vfx.walking.start();
                } else {
                    my.vfx.walking.stop();
                }

            } else { //when no button is pressed set acceleration to 0
                my.sprite.player.setAccelerationX(0);
                my.sprite.player.setDragX(this.DRAG);
                if (!my.sprite.player.anims.isPlaying || my.sprite.player.anims.currentAnim.key === 'idle' || my.sprite.player.anims.currentAnim.key === 'walk') {
                    my.sprite.player.anims.play('idle', true);
                }
                
                // Stop VFX
                my.vfx.walking.stop();
            }
        }

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
        }

        // Jumping logic starts here
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.jumpCount < this.MAX_JUMPS) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY); // Initial burst of velocity to emulate a jump
            my.sprite.player.anims.play('jump', true);
            this.isJumping = true;
            this.jumpCount++;

            // wall jump segment
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

            // jumping vfx
            my.vfx.jump.emitParticleAt(
                my.sprite.player.x,
                my.sprite.player.y + my.sprite.player.displayHeight / 2  // emit below feet
            );
            // jumping sound fx
            this.jumpSound.play({
                volume: 0.2
            });
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

        // Wall Climbing Logic
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

        // swipe attack
        const swipe_now = this.time.now;
        if (Phaser.Input.Keyboard.JustDown(this.jKey) && swipe_now - this.lastSwipeTime > this.SWIPE_COOLDOWN) {
            this.lastSwipeTime = swipe_now;
            let vfxEmitter = null;
            let angle = 0;
            let offsetX = 0;
            let offsetY = 0;

            my.sprite.player.anims.play('attack', true); //play attack animation on player
            this.slashSound.play({ // play attack sound
                volume: 0.2
            });

             if (this.wKey.isDown) {
                offsetY = -20;
                vfxEmitter = my.vfx.upSlash;
                angle = -180;
            } else if (this.sKey.isDown) {
                this.downSlash = true;
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
            this.activeSlash = this.slashGroup.create(
                my.sprite.player.x + offsetX,
                my.sprite.player.y + offsetY,
                null
            );
            this.activeSlash.setVisible(false);
            this.activeSlash.body.allowGravity = false;
            this.activeSlash.offsetX = offsetX;
            this.activeSlash.offsetY = offsetY;

            this.activeSlash.setVisible(false);          // Invisible hitbox
            this.activeSlash.body.allowGravity = false;

            // Set hitbox size based on slash direction
            if (angle === -90 || angle === 90) {
                this.activeSlash.setSize(50, 40); // horizontal slash
            } else if (angle === 0) {
                this.activeSlash.setSize(40, 50); // downwards-vertical slash
            } else {
                this.activeSlash.setSize(40, 50); // upwards-verticle slash
            }

            // Auto-destroy hitbox and reset flags
            this.time.delayedCall(100, () => {
                this.downSlash = false;
                if (this.activeSlash && this.activeSlash.destroy) this.activeSlash.destroy();
            });
            this.time.delayedCall(1000, () => {
                my.sprite.player.anims.play('idle', true);
            });
            
        }

        // allows slash hitbox to move with player for better game feel
        if (this.activeSlash) {
            this.activeSlash.setPosition(
                my.sprite.player.x + this.activeSlash.offsetX,
                my.sprite.player.y + this.activeSlash.offsetY
            );
        }
        
        // ranged attack
        const spit_now = this.time.now;
        if (Phaser.Input.Keyboard.JustDown(this.kKey) && spit_now - this.lastSpitTime > this.SPIT_COOLDOWN) {
            this.lastSpitTime = spit_now;
            this.spitSound.play({
                volume: 0.2
            });
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

            let projectile = this.projectiles.create( // create spit projectile
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
        if (Phaser.Input.Keyboard.JustDown(this.shiftKey) && !this.isDashing && dash_now - this.lastDash > this.DASH_COOLDOWN) {
            this.isDashing = true;
            this.dashTimer = 0;
            this.lastDash = dash_now;

            //audio
            this.dashSound.play({
                volume: 0.4
            });

            //vfx
            my.vfx.dash.startFollow(
                my.sprite.player,
                my.sprite.player.displayWidth / 2 * -1, // offset to appear behind
                0,
                false
            );
            my.vfx.dash.start();

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
                my.vfx.dash.stop();
            }
        }

        // dash cooldown UI element
        const timeSinceDash = this.time.now - this.lastDash;
        const cooldownRatio = Phaser.Math.Clamp(timeSinceDash / this.DASH_COOLDOWN, 0, 1);
        this.drawDashUI(1 - cooldownRatio);

        this.enemies.getChildren().forEach(enemy => {
            const target = enemy.patrol.points[enemy.patrol.current];
            const direction = target.x > enemy.x ? 1 : -1;

            // Only move left or right, gravity handles Y
            enemy.setVelocityX(direction * enemy.speed);

            // Flip sprite based on direction
            enemy.setFlipX(direction < 0);

            // Switch direction when close enough
            if (Phaser.Math.Distance.Between(enemy.x, enemy.y, target.x, target.y) < 4) {
                enemy.patrol.current = (enemy.patrol.current + 1) % 2;
                enemy.updateDirection();
            }
        });

        //sprite flicker when i-frames are active
        if (this.invincible && !this.alreadyDead) {
            this.flickerTimer += this.game.loop.delta;

            if (this.flickerTimer >= this.flickerInterval) {
                my.sprite.player.visible = !my.sprite.player.visible; // toggle visibility
                this.flickerTimer = 0;
            }
        } else if (!this.alreadyDead) {
            my.sprite.player.visible = true; // make sure it's visible when not invincible
        }

        if (this.playerHP <= 0 && !this.alreadyDead) { // kills the player once upon reaching 0 hp
            this.alreadyDead = true //added this so vfx and death sound dont spam while at 0 hp
            this.killSound.play({
                volume: 0.5
            });
            my.vfx.kill.emitParticleAt(
                my.sprite.player.x,
                my.sprite.player.y,
            );
            my.sprite.player.visible = false;;
        }

        if (this.playerHP <= 0) { // calls for game end upon hitting 0 hp
            this.time.delayedCall(250, () => {
                this.scene.pause();
                this.music.stop();
                this.scene.launch('deathScene')
            });
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

    // function to apply power up and its overlay
    PowerUp() {
        //up the power of the jump
        this.JUMP_VELOCITY -= 100;
        this.MAX_SPEED += 100;

        // up the power of attacks
        this.SWIPE_COOLDOWN = 150; // milliseconds between attacks
        this.SPIT_COOLDOWN = 350; //milliseconds between ranged attacks

        this.damage = 2;

        // add effects while in power up
        const overlay = this.add.sprite(0, 0, 'spriteSheet_RAINBOW').setScrollFactor(0);
        overlay.setPosition(this.cameras.main.centerX, this.cameras.main.centerY);
        overlay.displayWidth = this.cameras.main.width;
        overlay.displayHeight = this.cameras.main.height;

        overlay.setDepth(1000);
        overlay.play('rainbow_anim');
        overlay.setAlpha(.5);

        // stop power up by reseting attributes
        this.time.delayedCall(5000, () => {
            this.JUMP_VELOCITY += 100;
            this.MAX_SPEED -= 100;
            this.SWIPE_COOLDOWN = 300; // milliseconds between attacks
            this.SPIT_COOLDOWN = 700; //milliseconds between ranged attacks

            this.damage = 1;

            overlay.stop();
            overlay.setVisible(false);
        });
    }

    updateScore(num) { //function to update score and change the graphic at the same time
        this.score += num;
        this.scoreText.setText('Score: ' + this.score);
        if (this.score > high_score) {
            window.high_score = this.score;

        }
    }

    updateDiamond(num) { //function to update diamond count and change the graphic at the same time
        this.diamonds += num;
        this.diamondText.setText('    : ' + this.diamonds + '/3');
        if (this.diamonds > most_diamonds) {
            window.most_diamonds = this.diamonds;
        }
    }

    drawHealthBar() { // updates the health bar in accordance to this.playerHP
        this.healthBar.clear();

        const maxHP = 5;
        const barWidth = 200;
        const barHeight = 20;
        const hpRatio = Phaser.Math.Clamp(this.playerHP / maxHP, 0, 1);

        this.healthBar.fillStyle(0x00ff00);
        this.healthBar.fillRect(163* this.ZOOM, 103 * this.ZOOM, barWidth * hpRatio, barHeight);
    }

    flickerHealth() { //flicker hp bar red and green
        this.healthBar.clear();
        this.healthBar.fillStyle(0xff0000);
        this.healthBar.fillRect(163* this.ZOOM, 103 * this.ZOOM, (this.playerHP / 5) * 200, 20);

        this.time.delayedCall(50, () => {
            this.drawHealthBar();
            this.time.delayedCall(50, () => {
                this.healthBar.clear();
                this.healthBar.fillStyle(0xff0000);
                this.healthBar.fillRect(163* this.ZOOM, 103 * this.ZOOM, (this.playerHP / 5) * 200, 20);
                this.time.delayedCall(50, () => {
                    this.drawHealthBar();
                });
            });
        });
    }

    drawDashUI(cooldownRatio) { // draws the radial dash cooldown
        const centerX = 226 * this.ZOOM;
        const centerY = 116 * this.ZOOM;
        const radius = 10;

        this.dashCooldownUI.clear();

        if (cooldownRatio < 1) {
            this.dashCooldownUI.fillStyle(0x000000, 0.5);  // background circle
            this.dashCooldownUI.fillCircle(centerX, centerY, radius+2);

            this.dashCooldownUI.fillStyle(0x11aaaa, 1);  // pie color
            this.dashCooldownUI.slice(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - cooldownRatio), false);
            this.dashCooldownUI.fillPath();
        }
    }
}