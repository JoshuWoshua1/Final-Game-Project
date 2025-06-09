class DeathScene extends Phaser.Scene {
    constructor() {
        super('deathScene');
    }

    create() {
        const screenWidth = this.sys.game.config.width;
        const screenHeight = this.sys.game.config.height;

        // Box size
        const boxWidth = 600;
        const boxHeight = 400;

        // Background rectangle (slightly transparent)
        const background = this.add.rectangle(
            screenWidth / 2,
            screenHeight / 2,
            boxWidth,
            boxHeight,
            0x87ceeb,
            0.6
        ); 
        background.setOrigin(0.5);

        // Outline rectangle
        const outline = this.add.graphics();
        outline.lineStyle(4, 0xffffff, 1);
        outline.strokeRect(
            (screenWidth - boxWidth) / 2,
            (screenHeight - boxHeight) / 2,
            boxWidth,
            boxHeight
        );

        const centerX = this.sys.game.config.width / 2;
        const centerY = this.sys.game.config.height / 2;

        // Add "You Died!" text
        const winText = this.add.text(centerX, centerY - 120, 'You Died!', {
            fontSize: '100px',
            fontFamily: 'Arial',
            color: '#d60217', 
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5);

        const buttonStyle = {
            fontSize: '32px',
            color: '#000000',
            backgroundColor: '#ffffff',
            padding: { x: 20, y: 10 },
            fixedWidth: 200,
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2
        };

        // Restart Button
        const restartButton = this.add.text(centerX, centerY + 80, 'Restart', buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => restartButton.setScale(1.1))
            .on('pointerout', () => restartButton.setScale(1))
            .on('pointerdown', () => {
                this.scene.stop('levelScene');
                this.scene.start('levelScene');
            });

        // Main Menu Button
        const menuButton = this.add.text(centerX, centerY, 'Main Menu', buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => menuButton.setScale(1.1))
            .on('pointerout', () => menuButton.setScale(1))
            .on('pointerdown', () => {
                this.scene.stop('levelScene');
                this.scene.stop('winScene');
                this.scene.start('mainMenu');
            });
    }
}