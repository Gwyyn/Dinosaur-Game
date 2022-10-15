// import { updateGround } from './ground.js'


const worldElem = document.querySelector("[data-world]");
const startScreenElem = document.querySelector("[data-start-screen]");
const gameWelcomeElem = document.querySelector("[data-game-welcome]");
const scoreElem = document.querySelector("[data-score]");
const highScoreElem = document.querySelector("[data-highScore]");
const dinoElem = document.querySelector("[data-dino]");
const gameOverElem = document.querySelector("[data-game-over]");
const cactusElem = document.querySelector("[data-cactus]");
let fpsOut = document.querySelector('[data-fps]');
const groundElems = document.querySelectorAll("[data-ground]");

window.addEventListener('resize', setPixelToWorldScale);
document.addEventListener("keydown", handleStart, { once: true });
document.addEventListener("click", handleStartForMouse, { once: true });
document.addEventListener("touchstart", handleStart, { once: true });


const WORLD_WIDTH = 100;
const WORLD_HEIGHT = 30;

/************   SETTINGS GROUND   **************/
//Speed ground
const SPEED = 0.05;
//Speed scale
let speedScale;
//Boost in speed ground
const SPEED_SCALE_INCREASE = 0.00001;

/************   SETTINGS DINO   **************/
//Speed jump dino's
const SPEED_JUMP = 0.45;
//Gravity for jumps
const GRAVITY = 0.0015;

const DINO_FRAME_COUNT = 2;

const FRAME_TIME = 100;

let isJumping;
let dinoFrame;
let currentFrameTime;
let yVelocity;

/************   SETTINGS CACTUS   **************/
//Interval cactuses
const CACTUS_INTERVAL_MIN = 700;
const CACTUS_INTERVAL_MAX = 2000;

let nextCactusTime;

/************   SETTINGS SCORE   **************/
//Score
let score = 0;
let highScore = 0;
//Score storage
let scoreStorage = 0;
let speedScaleStorage = 0;

/************   SETTINGS AUDIO   **************/
let audioJump = new Audio("./static/audio/jump.wav")
let audioDead = new Audio("./static/audio/dead.wav")
let audioScoreUp = new Audio("./static/audio/scoreup.wav")

/************   SETTINGS FPS   **************/
let filterStrength = 20;
let frameTime = 0, lastLoop = new Date, thisLoop;

/************   SETTINGS other   **************/
//Check device
let isPhone = false;
//Check lost for show FPS
let isLost = false;
//For unreload page
let checkUnload = false;

//Start set pixels
setPixelToWorldScale();

//Set pexels in other Screen resolution
function setPixelToWorldScale() {
    let worldToPixelScale;
    if (window.innerWidth / window.innerHeight < WORLD_WIDTH / WORLD_HEIGHT) {
        worldToPixelScale = window.innerWidth / WORLD_WIDTH;
    } else {
        worldToPixelScale = window.innerHeight / WORLD_HEIGHT;
    }

    worldElem.style.width = `${WORLD_WIDTH * worldToPixelScale}px`
    worldElem.style.height = `${WORLD_HEIGHT * worldToPixelScale}px`
}

//If you decided refresh but changed mind and stay in tab you continue play with current score
function happenedUnload() {
    checkUnload = false;
    lastTime = null;
    speedScale = speedScaleStorage;
    score = scoreStorage;
    setupCactus();
    window.onmousemove = null;
}

//Update Animations
let lastTime = 0;
function update(time) {
    if (checkUnload) {
        if (!isPhone) {
            window.onmousemove = happenedUnload;

        } else {
            window.ontouchmove = function () {
                checkUnload = false;
                lastTime = null;
                speedScale = speedScaleStorage;
                score = scoreStorage;
                setupCactus();
                window.ontouchmove = null;
            }


        }
    }
    if (lastTime == null) {
        lastTime = time;
        window.requestAnimationFrame(update);
        return;
    }
    gameFps();
    const delta = time - lastTime;
    updateGround(delta, speedScale);
    updateDino(delta, speedScale);
    updateCactus(delta, speedScale);
    updateSpeedScale(delta);
    updateScore(delta);
    if (checkLose()) {
        return handleLose();
    }

    lastTime = time;
    window.requestAnimationFrame(update);
}

function touchcheckUnload() {

    checkUnload = false;
    lastTime = null;
    speedScale = 1;
    score = scoreStorage;
    setupCactus();
    window.removeEventListener("touchmove", touchcheckUnload)
}

//Logic boost speed
function updateSpeedScale(delta) {
    speedScale += delta * SPEED_SCALE_INCREASE
}

//Count score
function updateScore(delta) {
    score += delta * 0.01;
    scoreElem.textContent = 'Score: ' + Math.floor(score);
    localStorage.getItem('highScore') > 0 ? highScore = localStorage.getItem('highScore') : highScore = 0;
    highScoreElem. textContent = 'High score:' + highScore;

    if (Math.floor(score) % 100 == 0) {
        if (Math.floor(score) == 0) {
            audioScoreUp.valume = 0;
        } else {
            audioScoreUp.valume = 0.5;
            audioScoreUp.play();
        }

    }
}

//Start/Stop logic
function handleStart(eo) {
    eo = eo || window.event;
    if (eo.altKey || eo.button == 0) return;
    lastTime = null;
    speedScale = 1;
    score = 0;
    fpsOut.innerHTML ="Fps: " + 0;
    isLost = false;
    setupGround();
    setupDino();
    setupCactus();
    gameWelcomeElem.classList.add("hide");
    gameOverElem.classList.add("hide");
    startScreenElem.classList.add("hide");
    window.requestAnimationFrame(update);
}
//Start/Stop logic for combo keys
function handleStartForMouse(eo) {
    eo = eo || window.event;
    if (eo.altKey && eo.button == 0) {
        lastTime = null;
        speedScale = 1;
        score = 0;
        isLost = false;
        setupGround();
        setupDino();
        setupCactus();
        gameWelcomeElem.classList.add("hide");
        gameOverElem.classList.add("hide");
        startScreenElem.classList.add("hide");
        window.requestAnimationFrame(update);
    }
}

//Update Grounds
function setupGround() {
    setCustomProperty(groundElems[0], "--left", 0)
    setCustomProperty(groundElems[1], "--left", 300)
}
function updateGround(delta, speedScale) {
    groundElems.forEach(ground => {
        incrementCustomProperty(ground, "--left", delta * speedScale * SPEED * -1)


        if (getCustomProperty(ground, "--left") <= -300) {
            incrementCustomProperty(ground, "--left", 600)
        }
    })
}


//For write css property
function getCustomProperty(elem, prop) {
    return parseFloat(getComputedStyle(elem).getPropertyValue(prop)) || 0
}
function setCustomProperty(elem, prop, value) {
    elem.style.setProperty(prop, value)
}
function incrementCustomProperty(elem, prop, inc) {
    setCustomProperty(elem, prop, getCustomProperty(elem, prop) + inc)
}

//Settings Dino
function setupDino() {
    isJumping = false;
    dinoFrame = 0;
    currentFrameTime = 0;
    yVelocity = 0;
    setCustomProperty(dinoElem, "--bottom", 0)
    document.removeEventListener("keydown", onJump)
    document.removeEventListener("touchstart", onJumpTouch)
    document.addEventListener("keydown", onJump)
    document.addEventListener("touchstart", onJumpTouch)
}

function updateDino(delta, speedScale) {
    handleRun(delta, speedScale)
    handleJump(delta)
}

function handleRun(delta, speedScale) {
    if (isJumping) {
        dinoElem.src = `./static/dino-stationary.png`
        return;
    }

    if (currentFrameTime >= FRAME_TIME) {
        dinoFrame = (dinoFrame + 1) % DINO_FRAME_COUNT;
        dinoElem.src = `./static/dino-run-${dinoFrame}.png`;
        currentFrameTime -= FRAME_TIME;
    }
    currentFrameTime += delta * speedScale
}

function handleJump(delta) {
    if (!isJumping) {
        return
    }

    incrementCustomProperty(dinoElem, "--bottom", yVelocity * delta)

    if (getCustomProperty(dinoElem, "--bottom") <= 0) {
        setCustomProperty(dinoElem, "--bottom", 0);
        isJumping = false;
    }

    yVelocity -= delta * GRAVITY;
}

//For eventListener
function onJump(eo) {
    eo = eo || window.event;
    if (eo.code !== "Space" && eo.key !== "ArrowUp" || isJumping) {
        return
    }
    audioJump.play();
    yVelocity = SPEED_JUMP;
    isJumping = true;
}
//For eventListener touchstart
function onJumpTouch() {
    if (isJumping) {
        return
    }
    audioJump.play();
    yVelocity = SPEED_JUMP;
    isJumping = true;
    isPhone = true;
}

//Settings Dino
function setupCactus() {
    nextCactusTime = CACTUS_INTERVAL_MIN;
    document.querySelectorAll("[data-cactus]").forEach(cactus => {
        cactus.remove();
    })
}

function updateCactus(delta, speedScale) {
    document.querySelectorAll("[data-cactus]").forEach(cactus => {
        incrementCustomProperty(cactus, "--left", delta * speedScale * SPEED * -1)
        if (getCustomProperty(cactus, "--left") <= -100) {
            cactus.remove();
        }
    })
    if (nextCactusTime <= 0) {
        createCactus();
        nextCactusTime = randomNumberBetween(CACTUS_INTERVAL_MIN, CACTUS_INTERVAL_MAX) / speedScale
    }
    nextCactusTime -= delta;
}

function createCactus() {
    const cactus = document.createElement("img")
    cactus.dataset.cactus = true
    cactus.src = "static/cactus.png";
    cactus.classList.add("cactus");
    setCustomProperty(cactus, "--left", 100)
    worldElem.append(cactus)
}

function randomNumberBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);

}

//Get X and Y cactuses
function getCactusRects() {
    return [...document.querySelectorAll("[data-cactus]")].map(cactus => {
        return cactus.getBoundingClientRect();
    })
}
//Get X and Y dino
function getDinoRect() {
    return dinoElem.getBoundingClientRect();
}

//Check lose you or not
function checkLose() {
    const dinoRect = getDinoRect();
    return getCactusRects().some(rect => isCollision(rect, dinoRect))
}
// Collision with dino and cactus
function isCollision(rect1, rect2) {
    return (rect1.left < rect2.right &&
        rect1.top < rect2.bottom &&
        rect1.right > rect2.left &&
        rect1.bottom > rect2.top)
}
//If you lose and not press key continue
function handleLose() {
    try {
        audioDead.play();
        isLost = true;
        window.navigator.vibrate(1000);
        if(Math.floor(score) > Math.floor(highScore))
            localStorage.setItem('highScore', Math.floor(score));
        dinoElem.src = "static/dino-lose.png"
        setTimeout(() => {
            document.addEventListener("keydown", handleStart, { once: true });
            document.addEventListener("click", handleStartForMouse, { once: true });
            document.addEventListener("touchstart", handleStart, { once: true });
            gameOverElem.classList.remove("hide");
            startScreenElem.classList.remove("hide");
        }, 100)
    }
    catch (e) {
        console.log(e.message)
    }
}

//Request when you refresh or close tab
window.onbeforeunload = function (evt) {
    var message = "";
    if (typeof evt == "undefined") {
        evt = window.event;
    }
    if (evt) {
        evt.returnValue = message;
        scoreStorage = score;
        speedScaleStorage = speedScale;
        checkUnload = true;
        update(lastTime);
    }
    return message;
}


//Count FPS
function gameFps() {
    let thisFrameTime = (thisLoop = new Date) - lastLoop;
    frameTime += (thisFrameTime - frameTime) / filterStrength;
    lastLoop = thisLoop;
}
//Show FPS 
setInterval(function () {
    let fpsVariable = (1000 / frameTime).toFixed(1)
    if(fpsVariable === 'Infinity'){
        fpsVariable = '0';
        fpsOut.innerHTML ="Fps: " + fpsVariable;
    }

    if (isLost) {
        fpsOut.innerHTML ="Fps: " + 0;
    } else {
        fpsOut.innerHTML =  "Fps: " + fpsVariable;
    }
    

}, 100);