'use strict';

const _ = require('lodash');
const uuid = require('../util/uuid');

let h;
let w;
let offx;
let offy;


/**
 * A lookup table for directions
 */
const DIRECTIONS = ['up', 'right', 'down', 'left'];

/**
 * The `Entity` class is the base class for all game entities.
 * It needs to have to following properties
 *  
 *  - Health    (Upto the child class to define)
 *  - Weapon
 *  - Inventory @todo
 *  - Factions @todo
 * 
 * It also cannot step outside world bounds.
 *  
 * @param {number} x - The x coordinate of `Entity` on the canvas
 * @param {number} y - The y coordinate of `Entity` on the canvas
 * @param {string} key - The key to the loaded spritesheet
 * 
 * @see Phaser.Sprite
 */
function Entity(x, y, key) {
    Phaser.Sprite.call(this, game, x, y, key);

    game.add.existing(this);
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.collideWorldBounds = true;
    /**
     * Direction initialized to down. 
     * Must be changed only when new direction is chosen.
     */
    this.direction = 'down';

    /**
     * Begin with no weapon.
     * 
     * @todo: The weapons can be stored as an object with attributes.
     */
    this.weapon = null;

    /**
     * Miscellaneous attributes. 
     */
    this.speed = 65;
    this.sprintSpeed = 170;

    // Set the default animations
    this.setAnimations();
    game.physics.enable(this, Phaser.Physics.ARCADE);

    /**
     *  hitbox fix 
     */
    this.body.height = this.body.height / 2;
    this.body.width = this.body.width / 2;
    this.body.offset.x += this.body.width / 2;
    this.body.offset.y += this.body.height;


    // Set size constants
    h = this.body.height;
    w = this.body.width;
    offx = this.body.offset.x;
    offy = this.body.offset.y;

    /**
     * States.
     * State can be 'idling', 'walking', 'attacking'
     */
    this.state = 'idling';
    this.idleTimer = 0;
    this.directionLimiter = 0;

    /**
     * Type and ID
     */
    this.type = 'generic';
    this.id = uuid();
}

Entity.prototype = Object.create(Phaser.Sprite.prototype);
Entity.prototype.constructor = Entity;

/**
 * Set the animations of the `Entity`.
 * 
 * 
 * @param {object} frames - Object containing the animation frames
 */
Entity.prototype.setAnimations = function(frames) {
    if (frames !== undefined) {
        // Do something with frames
    }; // Else set to default animations

    /**
     * Adding animations for the `Entity`.
     * 
     * 1 sprite sheet contains every movement.
     * You target sections of the sprite sheet by using array[0...n],
     * where 0 is the top left corner of the image and n is the bottom
     * right corner of the image. Spritesheets and their corresponding integers
     * count left to right, top to bottom.
     */

     this.animations.add('idle_up', [104], 10, true);
     this.animations.add('idle_right', [143], 10, true);
     this.animations.add('idle_down', [130], 10, true);
     this.animations.add('idle_left', [117], 10, true);

     this.animations.add('die', [260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 271, 271,
                                 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271,
                                 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271,
                                 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271,
                                 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271,
                                 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271,
                                 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 272],
                                 25,
                                 false);


    this.animations.add('walk_up',
                        [105, 106, 107, 108, 109, 110, 111, 112],
                        10, true);
    this.animations.add('walk_down',
                        [131, 132, 133, 134, 135, 136, 137, 138],
                        10, true);
    this.animations.add('walk_left',
                        [118, 119, 120, 121, 122, 123, 124, 125],
                        10, true);
    this.animations.add('walk_right',
                        [144, 145, 146, 147, 148, 149, 150, 151],
                        10, true);

    this.animations.add('slash_up',
                        [156, 157, 158, 159, 160, 161],
                        10, true);
    this.animations.add('slash_down',
                        [182, 183, 184, 185, 186, 187],
                        10, true);
    this.animations.add('slash_left',
                        [169, 170, 171, 172, 173, 174],
                        10, true);
    this.animations.add('slash_right',
                        [195, 196, 197, 198, 199, 200],
                        10, true);
};


/**
 * Method to move any `Entity`
 * 
 * The parameter `direction` has to be one of 'up', 'down', 'left' or 'right'.
 * 
 * Another option is to use:
 * 
 *  1. UP
 *  2. RIGHT
 *  3. DOWN
 *  4. LEFT 
 * 
 * @param {string|number} direction 
 * @param {Boolean} sprint - Whether to sprint or not
 */
Entity.prototype.moveInDirection = function(direction, sprint) {
    if (this.state !== 'attacking') {
        this.state = 'walking';
        let speed = this.speed;
        let animSpeed = 10;
        if (sprint) {
            speed = this.sprintSpeed;
            animSpeed = 30;
        }
        this.animations.currentAnim.speed = animSpeed;

        let dir = '';
        if (_.isString(direction) && _.includes(DIRECTIONS, direction)) {
            dir = direction.toLowerCase();
        } else if (_.isNumber(direction) && _.inRange(direction, 0, 4)) {
            dir = DIRECTIONS[direction];
        } else {
            console.log(direction);
            console.error('Invalid direction');
            return;
        }

        switch (dir) {
            case 'up':
                this.body.velocity.y = -speed;
                this.body.velocity.x = 0;
                this.direction = 'up';
                break;
            case 'down':
                this.body.velocity.y = speed;
                this.body.velocity.x = 0;
                this.direction = 'down';
                break;
            case 'right':
                this.body.velocity.x = speed;
                this.body.velocity.y = 0;
                this.direction = 'right';
                break;
            case 'left':
                this.body.velocity.x = -speed;
                this.body.velocity.y = 0;
                this.direction = 'left';
                break;
            default:
                console.error('Invalid direction');
                return;
        }
        this.animations.play('walk_' + dir, animSpeed, true);
        this.adjustHitbox('walk');
    }
};

Entity.prototype.idleHere = function() {
    this.state = 'idling';
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    this.animations.play('idle_' + this.direction, 1, false);
    this.adjustHitbox('idle');
};

Entity.prototype.attack = function() {
    self = this;
    console.log('attacking');
    this.state = 'attacking';
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    this.animations.play('slash_' + this.direction, 20, false).onComplete.add(function() {
        // this.animations.frame
        console.log('attack finished');
       self.idleHere();
    });
    this.adjustHitbox('slash');
};

Entity.prototype.die = function() {
    // const self = this;
    this.state = 'dead';
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    this.animations.play('die', 10, false);
    const self = this;
    setTimeout(function() {
        self.kill();
    }, 5000);
};

/*
*  This function changes the size of the Entity's hit box based on what
*  action they are performing and what direction they are facing.
*/
Entity.prototype.adjustHitbox = function(state) {
    switch (state) {
        case ('walk'):
            this.body.height = h;
            this.body.width = w;
            this.body.offset.y = offy;
            this.body.offset.x = offx;
            break;
        case ('idle'):
            this.body.height = h;
            this.body.width = w;
            this.body.offset.y = offy;
            this.body.offset.x = offx;
            break;
        case ('slash'):
            switch (this.direction) {
                case ('up'):
                    this.body.height = 1.5 * h;
                    this.body.offset.y = h / 2;
                    break;
                case ('down'):
                    this.body.height = 1.5 * h;
                    break;
                case ('right'):
                    this.body.width = 1.5 * w;
                    break;
                case ('left'):
                    this.body.width = 1.5 * w;
                    this.body.offset.x = offx - (w / 2);
                    break;
            }
            break;
    }
};

/**
 * Set the direction of the sprite
 * 
 * @param {string|number} direction 
 */
Entity.prototype.setDirection= function(direction) {
    if (_.isString(direction) && _.includes(DIRECTIONS, direction)) {
        this.direction = direction.toLowerCase();
    } else if (_.isNumber(direction) && _.inRange(direction, 1, 5)) {
        this.direction = DIRECTIONS[direction];
    } else {
        console.error('Invalid direction');
    }
};

Entity.prototype.serialize = function() {
    let obj = {};
    obj.id = this.id;
    obj.x = this.x;
    obj.y = this.y;
    obj.key = this.key;
    obj.alive = this.alive;
    obj.type = this.type;
    return obj;
};

/**
 * Return the Name of the function.
 * This is a hack and should be used only for debugging.
 * 
 * @return {string}
 */
Entity.prototype.toString = function() {
    let funcNameRegex = /function (.{1,})\(/;
    let results = (funcNameRegex).exec((this).constructor.toString());
    return (results && results.length > 1) ? results[1] : '';
 };


/**
 * Get the center of the Hitbox of the entity
 * 
 * @return {Object} - Point with x and y
 */
Entity.prototype.trueXY = function() {
    const self = this;
    return {
        x: self.x + self.body.width/2 + self.body.offset.x,
        y: self.y + self.body.height/2 + self.body.offset.y,
    };
};


/**
 * Entity module.
 * @module: entity/Entity
 */
module.exports = Entity;
