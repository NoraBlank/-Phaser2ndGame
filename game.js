//створюємо середовище
var config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 400 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

//змінні
var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var worldwidth = 9600;
var life = 5;
var game = new Phaser.Game(config);

//завантажуємо асети
function preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.image('rock', 'assets/rock.png');
    this.load.image('lef', 'assets/lef.png');
    this.load.image('mid', 'assets/mid.png');
    this.load.image('rig', 'assets/rig.png');
    this.load.image('cross', 'assets/cross.png');
}

function create() {
    this.add.tileSprite(0, 0, worldwidth, 1080, "sky").setOrigin(0, 0);


    //платформа підлаштовується під розміри
    platforms = this.physics.add.staticGroup();
    for (var x = 0; x < worldwidth; x = x + 400) {
        console.log(x)
        platforms.create(x, 1000, 'ground').setOrigin(0, 0).refreshBody().setScale(2.4);
    }

    //рандомні платформи
    for (var x = 0; x < worldwidth; x = x + Phaser.Math.Between(600, 700)) {
        var y = Phaser.Math.FloatBetween(700, 93 * 10)
        platforms.create(x, y, 'lef');
        var i;
        for (i = 1; i < Phaser.Math.Between(0, 5); i++) {
            platforms.create(x + 100 * i, y, 'mid');
        }
        platforms.create(x + 100 * i, y, 'rig');
    }

    //створення камінців                                 
    rock = this.physics.add.staticGroup();
    for (var x = 400; x < worldwidth; x = x + Phaser.Math.FloatBetween(300, 1600)) {
        console.log('x-' + x)
        rock.create(x, 1080 - 80, 'rock').setOrigin(0, 1).setScale(Phaser.Math.FloatBetween(0.5, 1)).refreshBody();
    }

    //створення хрестів
    cross = this.physics.add.staticGroup();
    for (var x = 400; x < worldwidth; x = x + Phaser.Math.FloatBetween(300, 1600)) {
        console.log('x-' + x)
        cross.create(x, 1080 - 80, 'cross').setOrigin(0, 1).setScale(Phaser.Math.FloatBetween(0.5, 1)).refreshBody();
    }

    player = this.physics.add.sprite(100, 450, 'dude');
    player.setBounce(0.2);



    //камера
    this.cameras.main.setBounds(0, 0, worldwidth, window.innerHeight);
    this.physics.world.setBounds(0, 0, worldwidth, window.innerHeight);
    this.cameras.main.startFollow(player)

    //анімація
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });


    cursors = this.input.keyboard.createCursorKeys();


    stars = this.physics.add.group({
        key: 'star',
        repeat: 1200,
        setXY: { x: 12, y: 0, stepX: 150 }
    });

    stars.children.iterate(function (child) {


        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });

    bombs = this.physics.add.group();

    //рахунок
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#fff' }).setScrollFactor(0);


    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);
    this.physics.add.collider(player, bombs, hitBomb, null, this);
    
    //лінія життя
    function showLife() {
        var lifeLine = "Hearts" 
        for ( var i = 0; i < life; i++){
            lifeLine +='💜'
        }
        return lifeLine
    }
    //бомби
    lifeText = this.add.text(1500, 50, showLife(), {fontSize: '40px', fill:'fff'}).setOrigin(0,0).setScrollFactor(0);
    function hitBomb(player, bomb) {
        bomb.disableBody(true, true);
        life -= 1;
        lifeText.setText(showLife());
        console.log('bomb')
        if(life == 0){
            this.physics.pause();
            gameOver = true;
        }
    }
    
   
}

function update() {
    //переміщення та анімація
    if (gameOver) {
        return;
    }

    if (cursors.left.isDown) {
        player.setVelocityX(-250);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(250);

        player.anims.play('right', true);
    }
    else {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-500);
    }

    if(score == 250) {
        this.physics.pause();
        gameOver = true; 
        console.log("++")
    } 
}

//збір зірок
function collectStar(player, star) {
    star.disableBody(true, true);
    score += 10;
    scoreText.setText('Score: ' + score);
    var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
    var bomb = bombs.create(x, 16, 'bomb');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
}

