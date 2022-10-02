import * as PIXI from "pixi.js";
const width = 30 * 32;
const height = 20 * 32;
var app = new PIXI.Application({ width: width + 32, height: height + 32, backgroundColor: 0x1099bb });
class snakeNode {
    constructor(sprite, dontMove = 1, head = false) {
        this.sprite = sprite;
        this.next = null;
        this.head = head;
        this.dontMove = dontMove;
    }
}
class snakeItem {
    constructor(sprite, head = false) {
        this.head = new snakeNode(sprite, 0, head);
        this.tail = this.head;
        this.length = 0;
    }
    addNode(sprite) {
        let oldFirst = this.head.next;
        this.head.next = new snakeNode(sprite);
        this.head.next.next = oldFirst;
        this.length++;
    }
    removeTailNode(container) {
        if (this.length == 0) {
            return;
        }
        let current = this.head;
        for (let i = 0; i < this.length - 1; i++) {
            current = current.next;
        }
        console.log(container);
        container.removeChild(current.next.sprite);
        console.log(container);
        current.next.sprite = null;
        current.next = null;
        this.tail = current;
        this.length--;
    }
}
class foodItem {
    constructor(sprite) {
        this.sprite = sprite;
    }
    setPosition(x, y) {
        this.sprite.x = x;
        this.sprite.y = y;
    }
    checkEat(snake) {
        if (this.sprite.x == snake.head.sprite.x && this.sprite.y == snake.head.sprite.y) {
            return true;
        }
        return false;
    }
    placeFood() {
        //random placement every 32 pixels
        this.sprite.x = Math.floor(Math.random() * ((width + 32) / 32)) * 32 - width / 2;
        this.sprite.y = Math.floor(Math.random() * ((height + 32) / 32)) * 32 - height / 2;
    }
}
window.onload = () => {
    document.body.appendChild(app.view);
    const container = new PIXI.Container();
    app.stage.addChild(container);
    // Create a new texture
    const texture = PIXI.Texture.from('images/snake.png');
    const snakeHead = new PIXI.Sprite(texture);
    var snake = new snakeItem(snakeHead, true);
    let foodTexture = PIXI.Texture.from('images/pig.png');
    const foodSprite = new PIXI.Sprite(foodTexture);
    let food = new foodItem(foodSprite);
    // Create a 5x5 grid of bunnies
    const arrowDown = keyboard("ArrowDown");
    const removeNodeKey = keyboard("c");
    const eatNodeKey = keyboard("e");
    const addNodeKey = keyboard("a");
    const placeFoodKey = keyboard("p");
    const arrowUp = keyboard("ArrowUp");
    const arrowLeft = keyboard("ArrowLeft");
    const arrowRight = keyboard("ArrowRight");
    let direction = 'right';
    snake.head.sprite.rotation = 3 * Math.PI / 2;
    arrowDown.press = () => {
        if (direction != 'up') {
            snake.head.sprite.rotation = 0;
            direction = 'down';
        }
    };
    arrowUp.press = () => {
        if (direction != 'down') {
            snake.head.sprite.rotation = Math.PI;
            direction = 'up';
        }
    };
    arrowLeft.press = () => {
        if (direction != 'right') {
            snake.head.sprite.rotation = Math.PI / 2;
            direction = 'left';
        }
    };
    arrowRight.press = () => {
        if (direction != 'left') {
            snake.head.sprite.rotation = 3 * Math.PI / 2;
            direction = 'right';
        }
    };
    addNodeKey.press = () => {
        console.log("a pressed");
        addTail(snake, direction);
        container.addChild(snake.head.next.sprite);
    };
    removeNodeKey.press = () => {
        console.log("c pressed");
        snake.removeTailNode(container);
    };
    eatNodeKey.press = () => {
        console.log("e pressed");
        eat(snake, direction, container);
    };
    placeFoodKey.press = () => {
        console.log("p pressed");
    };
    snakeHead.zIndex = 1000;
    container.addChild(snakeHead);
    // Move container to the center
    container.x = app.screen.width / 2 + 16;
    container.y = app.screen.height / 2 + 16;
    // Center bunny sprite in local container coordinates
    container.pivot.x = container.width / 2;
    container.pivot.y = container.height / 2;
    snakeHead.anchor.x = 0.5;
    snakeHead.anchor.y = 0.5;
    container.addChild(foodSprite);
    foodSprite.anchor.x = 0.5;
    foodSprite.anchor.y = 0.5;
    food.placeFood();
    let speed = 25;
    let time = 0;
    // Listen for animate update
    app.ticker.add((delta) => {
        // rotate the container!
        // use delta to create frame-independent transform
        time += 1;
        if (time === speed) {
            moveTail(snake, container, direction);
            moveHead(snake, direction);
            if (food.checkEat(snake)) {
                food.placeFood();
                eat(snake, direction, container);
            }
            else if (checkDead(snake)) {
                alert("You died!");
                location.reload();
            }
            console.log(snake.head.sprite.x);
            console.log(snake.head.sprite.y);
            time = 0;
        }
    });
};
function keyboard(value) {
    const key = {
        value: value,
        isDown: false,
        isUp: true,
        press: undefined,
        release: undefined,
        downHandler: null,
        upHandler: null,
        unsubscribe: null
    };
    //The `downHandler`
    key.downHandler = (event) => {
        if (event.key === key.value) {
            if (key.isUp && key.press) {
                key.press();
            }
            key.isDown = true;
            key.isUp = false;
            event.preventDefault();
        }
    };
    //The `upHandler`
    key.upHandler = (event) => {
        if (event.key === key.value) {
            if (key.isDown && key.release) {
                key.release();
            }
            key.isDown = false;
            key.isUp = true;
            event.preventDefault();
        }
    };
    //Attach event listeners
    const downListener = key.downHandler.bind(key);
    const upListener = key.upHandler.bind(key);
    window.addEventListener("keydown", downListener, false);
    window.addEventListener("keyup", upListener, false);
    // Detach event listeners
    key.unsubscribe = () => {
        window.removeEventListener("keydown", downListener);
        window.removeEventListener("keyup", upListener);
    };
    return key;
}
function eat(snake, direction, container) {
    let big = PIXI.Texture.from('images/tailbig.png');
    addTail(snake, direction);
    container.addChild(snake.head.next.sprite);
    snake.head.next.sprite.zIndex = 0;
    snake.head.next.sprite.texture = big;
}
function addTail(snake, direction) {
    const texture = PIXI.Texture.from('images/tail.png');
    const tailSprite = new PIXI.Sprite(texture);
    tailSprite.anchor.x = 0.5;
    tailSprite.anchor.y = 0.5;
    if (direction === 'right') {
        tailSprite.x = snake.head.sprite.x;
        tailSprite.y = snake.head.sprite.y;
    }
    else if (direction === 'left') {
        tailSprite.x = snake.head.sprite.x;
        tailSprite.y = snake.head.sprite.y;
    }
    else if (direction === 'up') {
        tailSprite.x = snake.head.sprite.x;
        tailSprite.y = snake.head.sprite.y;
    }
    else if (direction === 'down') {
        tailSprite.x = snake.head.sprite.x;
        tailSprite.y = snake.head.sprite.y;
    }
    tailSprite.rotation = snake.head.sprite.rotation;
    snake.addNode(tailSprite);
}
function moveHead(snake, direction) {
    if (direction === 'left') {
        snake.head.sprite.x -= 32;
        if (snake.head.sprite.x <= -width / 2 - 32) {
            snake.head.sprite.x = width / 2;
        }
    }
    if (direction === 'right') {
        snake.head.sprite.x += 32;
        if (snake.head.sprite.x > width / 2) {
            snake.head.sprite.x = -width / 2;
        }
    }
    if (direction === 'up') {
        snake.head.sprite.y -= 32;
        if (snake.head.sprite.y <= -height / 2 + -32) {
            snake.head.sprite.y = height / 2;
        }
    }
    if (direction === 'down') {
        snake.head.sprite.y += 32;
        if (snake.head.sprite.y > height / 2) {
            snake.head.sprite.y = -height / 2;
        }
    }
}
function moveTail(snake, container, direction) {
    if (snake.head.next != null) {
        addTail(snake, direction);
        container.addChild(snake.head.next.sprite);
        snake.removeTailNode(container);
    }
}
function checkDead(snake) {
    if (snake.head.next != null) {
        let current = snake.head;
        for (let i = 0; i < snake.length; i++) {
            if (current.next != null) {
                if (snake.head.sprite.x === current.next.sprite.x && snake.head.sprite.y === current.next.sprite.y) {
                    return true;
                }
                current = current.next;
            }
        }
    }
    return false;
}
//# sourceMappingURL=script.js.map