"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: {
                x: 0,
                y: 0
            }
        }
    },
    width: 1440,
    height: 900,
    scene: [Load, Level]
}

var score = 0;
var cursors;
const SCALE = 2.0;
var my = {sprite: {}, text: {}, vfx: {}, object: {}};

const game = new Phaser.Game(config);