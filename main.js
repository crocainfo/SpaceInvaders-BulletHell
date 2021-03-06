
//Velocitat aliens procedural -> done
//So aumenta velocitat -> done (echo en same sitio que el anterior)
//cambiamusica (echo same sitio que el siguiente)
//fila donen punts diferents -> done
// CONSTATNES ###################################################################
var IS_CHROME = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
var CANVAS_WIDTH = 640;
var CANVAS_HEIGHT = 640;
var SPRITE_SHEET_SRC = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAEACAYAAAADRnAGAAACGUlEQVR42u3aSQ7CMBAEQIsn8P+/hiviAAK8zFIt5QbELiTHmfEYE3L9mZE9AAAAqAVwBQ8AAAD6THY5CgAAAKbfbPX3AQAAYBEEAADAuZrC6UUyfMEEAIBiAN8OePXnAQAAsLcmmKFPAQAAgHMbm+gbr3Sdo/LtcAAAANR6GywPAgBAM4D2JXAAABoBzBjA7AmlOx8AAEAzAOcDAADovTc4vQim6wUCABAYQG8QAADd4dPd2fRVYQAAANQG0B4HAABAawDnAwAA6AXgfAAAALpA2uMAAABwPgAAgPoAM9Ci/R4AAAD2dmqcEQIAIC/AiQGuAAYAAECcRS/a/cJXkUf2AAAAoBaA3iAAALrD+gIAAADY9baX/nwAAADNADwFAADo9YK0e5FMX/UFACA5QPSNEAAAAHKtCekmDAAAAADvBljtfgAAAGgMMGOrunvCy2uCAAAACFU6BwAAwF6AGQPa/XsAAADYB+B8AAAAtU+ItD4OAwAAAFVhAACaA0T7B44/BQAAANALwGMQAAAAADYO8If2+P31AgAAQN0SWbhFDwCAZlXgaO1xAAAA1FngnA8AACAeQPSNEAAAAM4CnC64AAAA4GzN4N9NSfgKEAAAAACszO26X8/X6BYAAAD0Anid8KcLAAAAAAAAAJBnwNEvAAAA9Jns1ygAAAAAAAAAAAAAAAAAAABAQ4COCENERERERERERBrnAa1sJuUVr3rsAAAAAElFTkSuQmCC';
var LEFT_KEY = 37;
var RIGHT_KEY = 39;
var SHOOT_KEY = 32;
var TEXT_BLINK_FREQ = 500;
var PLAYER_CLIP_RECT = { x: 0, y: 204, w: 62, h: 32 };
var ALIEN_BOTTOM_ROW = [ { x: 0, y: 0, w: 51, h: 34 }, { x: 0, y: 102, w: 51, h: 34 }];
var ALIEN_MIDDLE_ROW = [ { x: 0, y: 137, w: 50, h: 33 }, { x: 0, y: 170, w: 50, h: 34 }];
var ALIEN_TOP_ROW = [ { x: 0, y: 68, w: 50, h: 32 }, { x: 0, y: 34, w: 50, h: 32 }];
var ALIEN_X_MARGIN = 40;
var ALIEN_SQUAD_WIDTH = 11 * ALIEN_X_MARGIN;


// GLOBALES ###################################################################
var canvas = null;
var ctx = null;
var spriteSheetImg = null;
var bulletImg = null;
var keyStates = null;
var prevKeyStates = null;
var lastTime = 0;
var player = null;
var aliens = [];
var particlesThatgoBoooom = null;
var updateAlienLogic = false;
var alienDirection = -1;
var alienYDown = 0;
var alienCount = 0;
var wave = 1;
var hasGameStarted = false;
var battle ;
var playerDeath;
var alienDeath;
var aumentarAlienVel = 30;
var countCalls = 0;
var trackPlayerPoints = 0;
var cansioneBuenas = ["dracukeo.mp3","cumbiote.mp3","battleNight.mp3"];



(function(){
    var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

    // The base Class (does nothing)
    this.Class = function(){};

    // Create a new Class that inherits from this class
    Class.extend = function(prop) {
        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] == "function" &&
            typeof _super[name] == "function" && fnTest.test(prop[name]) ?
                (function(name, fn){
                    return function() {
                        var tmp = this._super;

                        // Add a new ._super() method that is the same method
                        // but on the super-class
                        this._super = _super[name];

                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;

                        return ret;
                    };
                })(name, prop[name]) :
                prop[name];
        }

        // The dummy class constructor
        function Class() {
            // All construction is actually done in the init method
            if ( !initializing && this.init )
                this.init.apply(this, arguments);
        }

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;

        // And make this class extendable
        Class.extend = arguments.callee;

        return Class;
    };
})();

// Funciones Utiles ###################################################################
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

function valueInRange(value, min, max) {
    return (value <= max) && (value >= min);
}
//chacks if a has collisioned with B
function checkRectCollision(A, B) {
    var xOverlap = valueInRange(A.x, B.x, B.x + B.w) ||
        valueInRange(B.x, A.x, A.x + A.w);

    var yOverlap = valueInRange(A.y, B.y, B.y + B.h) ||
        valueInRange(B.y, A.y, A.y + A.h);
    return xOverlap && yOverlap;
}

var Point2D = Class.extend({
    init: function(x, y) {
        this.x = (typeof x === 'undefined') ? 0 : x;
        this.y = (typeof y === 'undefined') ? 0 : y;
    },

    set: function(x, y) {
        this.x = x;
        this.y = y;
    }
});

var Rect = Class.extend({
    init: function(x, y, w, h) {
        this.x = (typeof x === 'undefined') ? 0 : x;
        this.y = (typeof y === 'undefined') ? 0 : y;
        this.w = (typeof w === 'undefined') ? 0 : w;
        this.h = (typeof h === 'undefined') ? 0 : h;
    },

    set: function(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
});



// Creacion de los objetos ###################################################################
var BaseSprite = Class.extend({
    init: function(img, x, y) {
        this.img = img;
        this.position = new Point2D(x, y);
        this.scale = new Point2D(1, 1);
        this.bounds = new Rect(x, y, this.img.width, this.img.height);
        this.doLogic = true;
    },

    update: function(dt) { },

    _updateBounds: function() {
        this.bounds.set(this.position.x, this.position.y, ~~(0.5 + this.img.width * this.scale.x), ~~(0.5 + this.img.height * this.scale.y));
    },

    _drawImage: function() {
        ctx.drawImage(this.img, this.position.x, this.position.y);
    },

    draw: function(resized) {
        this._updateBounds();

        this._drawImage();
    }
});

var SheetSprite = BaseSprite.extend({
    init: function(sheetImg, clipRect, x, y) {
        this._super(sheetImg, x, y);
        this.clipRect = clipRect;
        this.bounds.set(x, y, this.clipRect.w, this.clipRect.h);
    },

    update: function(dt) {},

    _updateBounds: function() {
        var w = ~~(0.5 + this.clipRect.w * this.scale.x);
        var h = ~~(0.5 + this.clipRect.h * this.scale.y);
        this.bounds.set(this.position.x - w/2, this.position.y - h/2, w, h);
    },

    _drawImage: function() {
        ctx.save();
        ctx.transform(this.scale.x, 0, 0, this.scale.y, this.position.x, this.position.y);
        ctx.drawImage(this.img, this.clipRect.x, this.clipRect.y, this.clipRect.w, this.clipRect.h, ~~(0.5 + -this.clipRect.w*0.5), ~~(0.5 + -this.clipRect.h*0.5), this.clipRect.w, this.clipRect.h);
        ctx.restore();

    },

    draw: function(resized) {
        this._super(resized);
    }
});

var Player = SheetSprite.extend({
    init: function() {
        this._super(spriteSheetImg, PLAYER_CLIP_RECT, CANVAS_WIDTH/2, CANVAS_HEIGHT - 70);
        this.scale.set(0.85, 0.85);
        this.lives = 7;
        this.xVel = 0;
        this.bullets = [];
        this.bulletDelayAccumulator = 0;
        this.score = 0;
    },

    reset: function() {
        this.lives = 3;
        this.score = 0;
        this.position.set(CANVAS_WIDTH/2, CANVAS_HEIGHT - 70);
    },

    shoot: function() {
        //Payer Bullet
        var bullet = new Bullet(this.position.x, this.position.y - this.bounds.h / 2, 1, 1500);
        this.bullets.push(bullet);
    },
    //velocity
    handleInput: function() {
        if (isKeyDown(LEFT_KEY)) {
            this.xVel = -275;
        } else if (isKeyDown(RIGHT_KEY)) {
            this.xVel = 275;
        } else this.xVel = 0;

        if (wasKeyPressed(SHOOT_KEY)) {
            if (this.bulletDelayAccumulator > 0.5) {
                this.shoot();
                this.bulletDelayAccumulator = 0;
            }
        }
    },
    //bullet trajctory
    updateBullets: function(dt) {
        for (var i = this.bullets.length - 1; i >= 0; i--) {
            var bullet = this.bullets[i];
            if (bullet.alive) {
                bullet.update(dt);
            } else {
                this.bullets.splice(i, 1);
                bullet = null;
            }
        }
    },

    update: function(dt) {
        // update time passed between shots
        this.bulletDelayAccumulator += dt;

        // apply x vel
        this.position.x += this.xVel * dt;

        // cap player position in screen bounds
        this.position.x = clamp(this.position.x, this.bounds.w/2, CANVAS_WIDTH - this.bounds.w/2);
        this.updateBullets(dt);
    },

    draw: function(resized) {
        this._super(resized);

        // draw bullets
        for (var i = 0, len = this.bullets.length; i < len; i++) {
            var bullet = this.bullets[i];
            if (bullet.alive) {
                bullet.draw(resized);
            }
        }
    }
});

var Bullet = BaseSprite.extend({
    init: function(x, y, direction, speed) {
        this._super(bulletImg, x, y);
        this.direction = direction;
        this.speed = speed;
        this.alive = true;
    },

    update: function(dt) {
        this.position.y -= (this.speed * this.direction) * dt;

        if (this.position.y < 0) {
            this.alive = false;
        }
    },

    draw: function(resized) {
        this._super(resized);
    }
});

var Enemy = SheetSprite.extend({
    init: function(clipRects, x, y, row) {
        this._super(spriteSheetImg, clipRects[0], x, y);
        this.clipRects = clipRects;
        this.scale.set(0.5, 0.5);
        this.alive = true;
        this.onFirstState = true;
        this.stepDelay = 1;
        this.stepAccumulator = 0;
        this.doShoot - false;
        this.bullet = null;
        this.row = row;
    },

    toggleFrame: function() {
        this.onFirstState = !this.onFirstState;
        this.clipRect = (this.onFirstState) ? this.clipRects[0] : this.clipRects[1];
    },

    shoot: function() {
        //enemy alien bullet
        this.bullet = new Bullet(this.position.x, this.position.y + this.bounds.w/2, -1, 700);
    },

    update: function(dt) {
        this.stepAccumulator += dt;

        if (this.stepAccumulator >= this.stepDelay) {
            if (this.position.x < this.bounds.w/2 + 20 && alienDirection < 0) {
                updateAlienLogic = true;
            } if (alienDirection === 1 && this.position.x > CANVAS_WIDTH - this.bounds.w/2 - 20) {
                updateAlienLogic = true;
            }
            if (this.position.y > CANVAS_WIDTH - 50) {
                //alien reach final destination
                reset();
            }

            var fireTest = Math.floor(Math.random() * (this.stepDelay + 1));
            //ENEMY fireeeeeee
            if (getRandomArbitrary(0, 300) <= 5 * (this.stepDelay + 1)) {
                this.doShoot = true;
            }
            this.position.x += 10 * alienDirection;
            this.toggleFrame();
            this.stepAccumulator = 0;
        }
        this.position.y += alienYDown;

        if (this.bullet !== null && this.bullet.alive) {
            this.bullet.update(dt);
        } else {
            this.bullet = null;
        }
    },

    draw: function(resized) {
        this._super(resized);
        if (this.bullet !== null && this.bullet.alive) {
            this.bullet.draw(resized);
        }
    }
});

//Also found this cool particle explosion :D
var ParticleExplosion = Class.extend({
    init: function() {
        this.particlePool = [];
        this.particles = [];
    },

    draw: function() {
        for (var i = this.particles.length - 1; i >= 0; i--) {
            var particle = this.particles[i];
            particle.moves++;
            particle.x += particle.xunits;
            particle.y += particle.yunits + (particle.gravity * particle.moves);
            particle.life--;

            if (particle.life <= 0 ) {
                if (this.particlePool.length < 100) {
                    this.particlePool.push(this.particles.splice(i,1));
                } else {
                    this.particles.splice(i,1);
                }
            } else {
                ctx.globalAlpha = (particle.life)/(particle.maxLife);
                ctx.fillStyle = particle.color;
                ctx.fillRect(particle.x, particle.y, particle.width, particle.height);
                ctx.globalAlpha = 1;
            }
        }
    },

    createExplosion: function(x, y, color, number, width, height, spd, grav, lif) {
        for (var i =0;i < number;i++) {
            var angle = Math.floor(Math.random()*360);
            var speed = Math.floor(Math.random()*spd/2) + spd;
            var life = Math.floor(Math.random()*lif)+lif/2;
            var radians = angle * Math.PI/ 180;
            var xunits = Math.cos(radians) * speed;
            var yunits = Math.sin(radians) * speed;

            if (this.particlePool.length > 0) {
                var tempParticle = this.particlePool.pop();
                tempParticle.x = x;
                tempParticle.y = y;
                tempParticle.xunits = xunits;
                tempParticle.yunits = yunits;
                tempParticle.life = life;
                tempParticle.color = color;
                tempParticle.width = width;
                tempParticle.height = height;
                tempParticle.gravity = grav;
                tempParticle.moves = 0;
                tempParticle.alpha = 1;
                tempParticle.maxLife = life;
                this.particles.push(tempParticle);
            } else {
                this.particles.push({x:x,y:y,xunits:xunits,yunits:yunits,life:life,color:color,width:width,height:height,gravity:grav,moves:0,alpha:1, maxLife:life});
            }

        }
    }
});




// Funciones Inicializacion ###################################################################
function initCanvas() {
    // create canvas and context
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');

    // // turn off image smoothing
    setImageSmoothing(false);

    // create our main sprite sheet img
    spriteSheetImg = new Image();
    spriteSheetImg.src = SPRITE_SHEET_SRC;
    //draws images like the bullets
    preDrawImages();

    // add event listeners and initially resize
    window.addEventListener('resize', resize);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
}

function preDrawImages() {
    var canvas = drawIntoCanvas(2, 8, function(ctx) {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    });
    //
    bulletImg = new Image();
    bulletImg.src = canvas.toDataURL();
}

function setImageSmoothing(value) {
    //makes all sprites not look like shit
    this.ctx['imageSmoothingEnabled'] = value;
    this.ctx['mozImageSmoothingEnabled'] = value;
    this.ctx['webkitImageSmoothingEnabled'] = value;
}

function initGame() {
    battle = new Audio('music/'+cansioneBuenas[2]);
    playerDeath = new Audio('music/playerDeath.mp3');
    alienDeath = new Audio('music/alienDeath.mp3');
    battle.volume = 0.1;
    battle.playbackRate = 0.7;
    playerDeath.volume = 0.5;
    alienDeath.volume = 0.5;
    battle.play();

    dirtyRects = [];
    aliens = [];
    player = new Player();
    particlesThatgoBoooom = new ParticleExplosion();
    formacionDelPelotondeAliens();
    drawBottomHud();
}

function formacionDelPelotondeAliens() {
    alienCount = 0;
    for (var i = 0, len = 5 * 11; i < len; i++) {
        var gridX = (i % 11);
        var gridY = Math.floor(i / 11);
        var clipRects;
        var row;
        switch (gridY) {
            case 0:
            case 1: clipRects = ALIEN_BOTTOM_ROW; row = "bottom"; break;
            case 2:
            case 3: clipRects = ALIEN_MIDDLE_ROW;row = "middle"; break;
            case 4: clipRects = ALIEN_TOP_ROW;row = "top"; break;
        }
        var littleFuckerAlien = new Enemy(clipRects, (CANVAS_WIDTH/2 - ALIEN_SQUAD_WIDTH/2) + ALIEN_X_MARGIN/2 + gridX * ALIEN_X_MARGIN, CANVAS_HEIGHT/3.25 - gridY * 40);
        littleFuckerAlien.row = row;
        aliens.push(littleFuckerAlien);
        alienCount++;
    }
}

function reset() {
    battle.pause();
    aliens = [];
    formacionDelPelotondeAliens();
    player.reset();
}

function init() {
    initCanvas();
    keyStates = [];
    prevKeyStates = [];
    resize();
}




// This is helpful ###################################################################
function isKeyDown(key) {
    return keyStates[key];
}

function wasKeyPressed(key) {
    return !prevKeyStates[key] && keyStates[key];
}



// Pintar y updatear ###################################################################
function updateAliens(dt) {
    if (updateAlienLogic) {
        updateAlienLogic = false;
        alienDirection = -alienDirection;
        alienYDown = 25;
    }

    for (var i = aliens.length - 1; i >= 0; i--) {
        var alien = aliens[i];
        if (!alien.alive) {
            aliens.splice(i, 1);
            alien = null;
            alienCount--;
            if (alienCount < 1) {
                //all aliens are dead
                wave++;
                formacionDelPelotondeAliens();
            }
            return;
        }
        //alien delay / velocity
        //PUNTO 1 revision
        countCalls +=1;
        if(countCalls%5000 == 0){
            if (aumentarAlienVel > 4){
                aumentarAlienVel -= 4
            }
            battle.playbackRate += 0.1;
        }
        alien.stepDelay = ((alienCount * aumentarAlienVel) - (wave * 1)) / 1000;
        if (alien.stepDelay <= 0.05) {
            alien.stepDelay = 0.05;
        }
        alien.update(dt);

        if (alien.doShoot) {
            alien.doShoot = false;
            alien.shoot();
        }
    }
    alienYDown = 0;
}

function resolveBulletEnemyCollisions() {
    var bullets = player.bullets;

    for (var i = 0, len = bullets.length; i < len; i++) {
        var bullet = bullets[i];
        //checks if any alien has been hit
        for (var j = 0, alen = aliens.length; j < alen; j++) {
            var alien = aliens[j];
            if (checkRectCollision(bullet.bounds, alien.bounds)) {
                alien.alive = bullet.alive = false;
                alienDeath.play();
                particlesThatgoBoooom.createExplosion(alien.position.x, alien.position.y, 'white', 70, 5,5,3,.15,50);
                //update player score
                // done exercice, needed to add some identificator to the alien apart from the sprite
                if(alien.row == "bottom"){
                    player.score += 10;

                }else if(alien.row == "middle"){
                    player.score +=25;

                }else if(alien.row == "top"){
                    player.score += 50;

                }
                var diff = player.score-100 - trackPlayerPoints;
                if(diff > 0){
                    trackPlayerPoints += 100;
                    battle.pause();
                    battle = new Audio("music/"+cansioneBuenas[Math.floor(getRandomArbitrary(0,cansioneBuenas.length))]);
                    battle.volume = 0.5;
                    battle.play();
                }
            }
        }
    }
}

function resolveBulletPlayerCollisions() {
    for (var i = 0, len = aliens.length; i < len; i++) {
        var alien = aliens[i];
        if (alien.bullet !== null && checkRectCollision(alien.bullet.bounds, player.bounds)) {
            if (player.lives === 0) {
                hasGameStarted = false;
                battle.pause();
            } else {
                alien.bullet.alive = false;
                playerDeath.play();
                particlesThatgoBoooom.createExplosion(player.position.x, player.position.y, 'green', 100, 8,8,6,0.001,40);
                player.position.set(CANVAS_WIDTH/2, CANVAS_HEIGHT - 70);
                player.lives--;
                break;
            }

        }
    }
}
function stopMusic() {

}
function resolveCollisions() {
    resolveBulletEnemyCollisions();
    resolveBulletPlayerCollisions();
}

function updateGame(dt) {
    //One of most important functions

    player.handleInput();
    prevKeyStates = keyStates.slice();
    player.update(dt);
    updateAliens(dt);
    resolveCollisions();
}

function drawIntoCanvas(width, height, drawFunc) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    drawFunc(ctx);
    return canvas;
}

function fillText(text, x, y, color, fontSize) {
    if (typeof color !== 'undefined') ctx.fillStyle = color;
    if (typeof fontSize !== 'undefined') ctx.font = fontSize + 'px Play';
    ctx.fillText(text, x, y);
}

function fillCenteredText(text, x, y, color, fontSize) {
    var metrics = ctx.measureText(text);
    fillText(text, x - metrics.width/2, y, color, fontSize);
}

function fillBlinkingText(text, x, y, blinkFreq, color, fontSize) {
    if (~~(0.5 + Date.now() / blinkFreq) % 2) {
        fillCenteredText(text, x, y, color, fontSize);
    }
}

function drawBottomHud() {
    ctx.fillStyle = '#02ff12';
    ctx.fillRect(0, CANVAS_HEIGHT - 30, CANVAS_WIDTH, 2);
    fillText(player.lives + ' x ', 10, CANVAS_HEIGHT - 7.5, 'white', 20);
    ctx.drawImage(spriteSheetImg, player.clipRect.x, player.clipRect.y, player.clipRect.w,
        player.clipRect.h, 45, CANVAS_HEIGHT - 23, player.clipRect.w * 0.5,
        player.clipRect.h * 0.5);
    fillText('Wave: ', CANVAS_WIDTH - 115, CANVAS_HEIGHT - 7.5);
    fillBlinkingText(wave, CANVAS_WIDTH - 25, CANVAS_HEIGHT - 7.5, TEXT_BLINK_FREQ);
    fillCenteredText('SCORE: ' + player.score, CANVAS_WIDTH/2, 20);
}

function drawAliens(resized) {
    // a??ade todos los aliens en el array
    for (var i = 0; i < aliens.length; i++) {
        var alien = aliens[i];
        alien.draw(resized);
    }
}

function drawGame(resized) {
    player.draw(resized);
    drawAliens(resized);
    particlesThatgoBoooom.draw();
    drawBottomHud();
}

function drawStartScreen() {
    fillCenteredText("Marcianitos BulletHell Edition", CANVAS_WIDTH/2, CANVAS_HEIGHT/2.75, '#FFFFFF', 36);
    fillBlinkingText("Pulsa enter para Empezar", CANVAS_WIDTH/2, CANVAS_HEIGHT/2, 500, '#FFFFFF', 36);
}

function animate() {
    //time since opened
    var now = window.performance.now();
    var dt = now - lastTime;
    // dt = interval, resets to 100
    if (dt > 100) dt = 100;
    //inicia la partida si le ha dado al enter
    if (wasKeyPressed(13) && !hasGameStarted) {
        initGame();
        hasGameStarted = true;
    }

    if (hasGameStarted) {
        updateGame(dt / 1000);
    }

    ctx.fillStyle = 'PURPLE';
    //Si descomentas la siguiente linea el juego se vuelve muy divertido
    // ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    if (hasGameStarted) {
        drawGame(false);
    } else {
        drawStartScreen();
    }
    lastTime = now;
    requestAnimationFrame(animate);
}




// Event listener function ###################################################################
//I found this function to resize the canvas to full view
function resize() {
    var w = window.innerWidth;
    var h = window.innerHeight;

    // calculate the scale factor to keep a correct aspect ratio
    var scaleFactor = Math.min(w / CANVAS_WIDTH, h / CANVAS_HEIGHT);

    if (IS_CHROME) {
        canvas.width = CANVAS_WIDTH * scaleFactor;
        canvas.height = CANVAS_HEIGHT * scaleFactor;
        setImageSmoothing(false);
        ctx.transform(scaleFactor, 0, 0, scaleFactor, 0, 0);
    } else {
        // resize the canvas css properties
        canvas.style.width = CANVAS_WIDTH * scaleFactor + 'px';
        canvas.style.height = CANVAS_HEIGHT * scaleFactor + 'px';
    }
}

function onKeyDown(e) {
    e.preventDefault();
    keyStates[e.keyCode] = true;
}

function onKeyUp(e) {
    e.preventDefault();
    keyStates[e.keyCode] = false;
}


// Empieza el juego ###################################################################
window.onload = function() {

    init();
    animate();
};