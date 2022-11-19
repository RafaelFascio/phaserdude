import Phaser from 'phaser';
import React, { useEffect, useState } from 'react';

function App() {
    const [listo, setListo] = useState(true);

    useEffect(() => {

        var config = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 300 },
                    debug: false
                }
            },
            scene: {
                preload: preload,
                create: create,
                update: update
            }
        };
        var game = new Phaser.Game(config);
        game.events.on("LISTO", setListo);

        return () => {
            setListo(false);
            game.destroy(true);
        }
    }, [listo]);

    function preload() {
        this.load.image('fondo', 'img/fondo.png');
        this.load.image('base', 'img/plataforma.png');
        this.load.image('estrella', 'img/estrella.png');
        this.load.image('bomba', 'img/bomba.png');
        this.load.spritesheet('pj', 'img/pj.png',{ frameWidth: 32, frameHeight: 48 }
        );
    }
    var bases;
    var player;
    var cursors;
    var estrellas;
    var score = 0;
    var scoreText;
    var bombas;
    var gameOver = false;

    function create() {
        this.add.image(400, 300, 'fondo');
        bases = this.physics.add.staticGroup();
        bases.create(400, 550, 'base').setScale(2).refreshBody();
        bases.create(600, 400, 'base');
        bases.create(50, 250, 'base');
        bases.create(750, 220, 'base');
        player = this.physics.add.sprite(100, 450, 'pj');
        player.setBounce(0.2);
        player.setCollideWorldBounds(true);
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('pj', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('pj', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'turn',
            frames: [{ key: 'pj', frame: 4 }],
            frameRate: 20
        });
        cursors = this.input.keyboard.createCursorKeys();
        estrellas = this.physics.add.group({
            key: 'estrella',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });
        estrellas.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });
        bombas = this.physics.add.group();
        scoreText = this.add.text(16, 16, 'Puntaje: 0', { fontSize: '32px', fill: '#000' });
        this.physics.add.collider(player, bases);
        this.physics.add.collider(estrellas, bases);
        this.physics.add.collider(bombas, bases);
        this.physics.add.overlap(player, estrellas, collectStar, null, this);
        this.physics.add.collider(player, bombas, hitBomb, null, this);
    }

    function update() {

        if (gameOver) {
            return;
        }
        if (cursors.left.isDown) {
            player.setVelocityX(-200);
            player.anims.play('left', true);
        } else if (cursors.right.isDown) {
            player.setVelocityX(200);
            player.anims.play('right', true);
        } else {
            player.setVelocityX(0);
            player.anims.play('turn');
        }
        if (cursors.up.isDown && player.body.touching.down) {
            player.setVelocityY(-330);
        }
    }

    function collectStar(player, star) {
        star.disableBody(true, true);
        score += 1;
        scoreText.setText('Puntaje: ' + score);
        if (estrellas.countActive(true) === 0) {
            estrellas.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
            });
            var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
            var bomb = bombas.create(x, 16, 'bomba');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            bomb.allowGravity = false;
        }
    }

    function hitBomb(player, bomb) {
        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play('turn');
        gameOver = true;
    }
}

export default App;