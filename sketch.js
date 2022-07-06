/**
 *  @author
 *  @date 2022.06.27
 *
 */

let font
let instructions
let debugCorner /* output debug text in the bottom left corner of the canvas */
let championData // data from the riot API
let baseChampionString = "https://ddragon.leagueoflegends.com/cdn/12.12.1/data/en_US/champion/"
let champion = "Gwen" // the champion we want to search for in the riot API
let passage
let baseChampionImageString = "https://ddragon.leagueoflegends.com/cdn/12.12.1/img/champion/"
const CHAMPION_IMG_WIDTH = 140
const CHAMPION_HORIZONTAL_MARGIN = 150
let championImage
let correct, incorrect
let baseSpellString = "https://ddragon.leagueoflegends.com/cdn/12.12.1/img/spell/"
let currentChampionAbilityImages
let abilityImgWidth = 50
let abilityImgMargin = 10
let abilityImgYPos = 0
let item = "Liandry's Anguish"
let baseItemImgString = "https://ddragon.leagueoflegends.com/cdn/12.12.1/img/item/"
let itemImg

let itemData
let itemImgWidth = 90

let championNameList = []
let championIndex

function preload() {
    font = loadFont('data/consola.ttf')
    correct = loadSound("data/correct.wav")
    incorrect = loadSound("data/incorrect.wav")
}


function setup() {
    let cnv = createCanvas(1280, 640)
    cnv.parent('#canvas')
    colorMode(HSB, 360, 100, 100, 100)
    textFont(font, 14)

    /* initialize instruction div */
    instructions = select('#ins')
    instructions.html(`<pre>
        numpad 1 → freeze sketch</pre>`)

    debugCorner = new CanvasDebugCorner(5)

    championIndex = int(random(160))

    // ask the Riot API for data on champions with a callback
    loadJSON("https://ddragon.leagueoflegends.com/cdn/12.12.1/data/en_US/champion.json", gotData)
    // loadJSON("https://ddragon.leagueoflegends.com/cdn/12.12.1/data/en_US/item.json", gotItemJSON)
}


function gotItemJSON(data) {
    itemData = data

    for (let itemIndex in itemData["data"]) {
        print(itemIndex)

        let currentItem = itemData["data"][itemIndex]
        // print(currentItem["name"] + "\n" + currentItem["plaintext"])

        if (currentItem["name"] === item) {
            passage = new Passage(currentItem["plaintext"])

            // the current image URL
            let currentImageURL = baseItemImgString + itemIndex + ".png"

            itemImg = loadImage(currentImageURL)
        }
    }
}


function gotData(data) {
    championData = data
    let selectedChampionData = championData["data"][champion]

    for (let currentChampionIndex in championData["data"]) {
        let currentChampion = championData["data"][currentChampionIndex]
        let currentChampionName = currentChampion["id"]

        print(currentChampionName)

        championNameList.push(currentChampionName)
    }

    champion = championNameList[championIndex]

    console.log(baseChampionString + championNameList[championIndex] + ".json")

    // query JSON using basic character
    loadJSON(baseChampionString + championNameList[championIndex] + ".json", gotChampionData)
}


function gotChampionData(data) {
    currentChampionAbilityImages = []

    // the data from the current champion
    let currentChampionData = data["data"][champion]

    print(currentChampionData)

    // use a "dictionary" (or object) to keep track of current champion's
    // abilities. Objects serve a similar purpose in Javascript as
    // dictionaries in Python, which I am far more familiar with.
    let currentChampionSpellbook = {}

    for (let ability of currentChampionData["spells"]) {
        currentChampionSpellbook[ability["id"]] = ability["name"]
    }
    console.log(currentChampionSpellbook)

    passage = new Passage(currentChampionData["lore"])

    // passage.render()

    championImage = loadImage(baseChampionImageString + currentChampionData["image"]["full"])

    // there are also champion images for abilities. I need to load and display
    // them, which will also become typing later on.
    for (let abilityImage of currentChampionData["spells"]) {

        let currentSpellImage = loadImage(baseSpellString + abilityImage["image"]["full"])

        currentChampionAbilityImages.push(currentSpellImage)

        // image(currentSpellImage, random(width), random(height))
    }
}


function draw() {
    background(234, 34, 24)

    if (frameCount > 3000)
        noLoop()

    rectMode(CORNER)
    if (passage)
        passage.render()

    if (championImage) {
        const IMAGE_START_POS = new p5.Vector(
            passage.LINE_WRAP_X_POS + CHAMPION_HORIZONTAL_MARGIN,
            passage.TEXT_START.y
        )

        championImage.resize(CHAMPION_IMG_WIDTH, 0)

        image(championImage, IMAGE_START_POS.x, IMAGE_START_POS.y)
    }

    if (currentChampionAbilityImages) {
        for (let abilityImageIndex in currentChampionAbilityImages) {
            let abilityImage = currentChampionAbilityImages[abilityImageIndex]
            let abilityImgStartXPos = (abilityImageIndex) * (abilityImgWidth + abilityImgMargin)

            abilityImage.resize(abilityImgWidth, 0)

            image(abilityImage, abilityImgStartXPos, abilityImgYPos)
        }
    }

    if (itemImg) {
        const IMAGE_START_POS = new p5.Vector(
            passage.LINE_WRAP_X_POS + CHAMPION_HORIZONTAL_MARGIN,
            passage.TEXT_START.y
        )

        itemImg.resize(itemImgWidth, 0)

        image(itemImg, IMAGE_START_POS.x, IMAGE_START_POS.y)
    }

    showDebugCorner()
}


// an extra function to reduce confusion and clutter
function showDebugCorner() {
    /* debugCorner needs to be last so its z-index is highest */
    debugCorner.setText(`frameCount: ${frameCount}`, 2)
    debugCorner.setText(`fps: ${frameRate().toFixed(0)}`, 1)
    debugCorner.show()
}


function keyPressed() {
    /* stop sketch */
    if (keyCode === ESCAPE) {
        noLoop()
        instructions.html(`<pre>
            sketch stopped</pre>`)
        return
    }

    if (keyCode === 100 || keyCode === LEFT_ARROW) { /* numpad 4/left arrow */
        championIndex -= 1

        loadJSON("https://ddragon.leagueoflegends.com/cdn/12.12.1/data/en_US/champion.json", gotData)

        return
    }

    if (keyCode === 101 || keyCode === 93) { /* numpad 5 or context menu */
        championIndex = int(random(championNameList.length))

        loadJSON("https://ddragon.leagueoflegends.com/cdn/12.12.1/data/en_US/champion.json", gotData)

        return
    }

    if (keyCode === 104 || keyCode === UP_ARROW) { /* numpad 8/up arrow */
        championIndex += 10

        loadJSON("https://ddragon.leagueoflegends.com/cdn/12.12.1/data/en_US/champion.json", gotData)

        return
    }

    if (keyCode === 98 || keyCode === DOWN_ARROW) { /* numpad 2/down arrow */
        championIndex -= 10

        loadJSON("https://ddragon.leagueoflegends.com/cdn/12.12.1/data/en_US/champion.json", gotData)

        return
    }

    if (keyCode === 102 || keyCode === RIGHT_ARROW) { /* numpad 6/right arrow */
        championIndex += 1

        loadJSON("https://ddragon.leagueoflegends.com/cdn/12.12.1/data/en_US/champion.json", gotData)

        return
    }

    if (keyCode === SHIFT ||
        keyCode === ALT ||
        keyCode === CONTROL ||
        keyCode === TAB ||
        keyCode === ESCAPE
    ) {
        return
    }

    else if (keyCode === ENTER) {
        key = "\n"
    }

    if (key === passage.getCurrentChar()) {
        correct.play()
        passage.setCorrect()
    }
    else {
        incorrect.play()
        passage.setIncorrect()
    }
}


/** 🧹 shows debugging info using text() 🧹 */
class CanvasDebugCorner {
    constructor(lines) {
        this.size = lines
        this.debugMsgList = [] /* initialize all elements to empty string */
        for (let i in lines)
            this.debugMsgList[i] = ''
    }

    setText(text, index) {
        if (index >= this.size) {
            this.debugMsgList[0] = `${index} ← index>${this.size} not supported`
        } else this.debugMsgList[index] = text
    }

    show() {
        textFont(font, 14)
        strokeWeight(1)

        const LEFT_MARGIN = 10
        const DEBUG_Y_OFFSET = height - 10 /* floor of debug corner */
        const LINE_SPACING = 2
        const LINE_HEIGHT = textAscent() + textDescent() + LINE_SPACING

        /* semi-transparent background */
        fill(0, 0, 0, 50)
        rectMode(CORNERS)
        rect(
            0, height,
            width, DEBUG_Y_OFFSET - LINE_HEIGHT * this.debugMsgList.length
        )

        fill(0, 0, 100, 100) /* white */
        strokeWeight(0)

        for (let index in this.debugMsgList) {
            const msg = this.debugMsgList[index]
            text(msg, LEFT_MARGIN, DEBUG_Y_OFFSET - LINE_HEIGHT * index)
        }
    }
}

// prevents the context menu from showing up, even when the document
// context menu key is pressed (which I use for scrolling the card list).
document.oncontextmenu = function() {
    return false;
}
