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
let champion = "Aatrox" // the champion we want to search for in the riot API
let passage
const CARD_IMG_WIDTH = 340
const CARD_HORIZONTAL_MARGIN = 50

function preload() {
    font = loadFont('data/consola.ttf')
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

    // ask the Riot API for data on champions with a callback
    loadJSON("https://ddragon.leagueoflegends.com/cdn/12.12.1/data/en_US/champion.json", gotData)

    // initialize the passage with a name
    passage = new Passage("ABCDEFGHIJKLMNOPQRSTUVQXYZ")
}

function gotData(data) {
    championData = data
    let selectedChampionData = championData["data"][champion]

    print(selectedChampionData)

    let selectedChampionName = selectedChampionData["name"]

    print(selectedChampionName)

    // query JSON using basic character
    loadJSON(baseChampionString + selectedChampionName + ".json", gotChampionData)

    // currently commented out for testing above
    // // loop through the data segment of championData, and print champion names
    // for (let champion in championData["data"]) {
    //     console.log(champion)
    // }
}

function gotChampionData(data) {
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
}

function draw() {
    background(234, 34, 24)

    // if (frameCount > 3000)
    //     noLoop()

    rectMode(CORNER)
    passage.render()

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

    // if (keyCode === 100 || keyCode === LEFT_ARROW) { /* numpad 4/left arrow */
    //     currentCardIndex--
    //     currentCardIndex = constrain(
    //         currentCardIndex, 0, scryfall["data"].length - 1
    //     )
    //
    //     updateCard()
    //     return
    // }
    //
    // if (keyCode === 101 || keyCode === 93) { /* numpad 5 or context menu */
    //     currentCardIndex = int(random(0, scryfall["data"].length - 1))
    //
    //     updateCard()
    //     return
    // }
    //
    // if (keyCode === 104 || keyCode === UP_ARROW) { /* numpad 8/up arrow */
    //     currentCardIndex += 10
    //     currentCardIndex = constrain(
    //         currentCardIndex, 0, scryfall["data"].length - 1
    //     )
    //
    //     updateCard()
    //     return
    // }
    //
    // if (keyCode === 98 || keyCode === DOWN_ARROW) { /* numpad 2/down arrow */
    //     currentCardIndex -= 10
    //     currentCardIndex = constrain(
    //         currentCardIndex, 0, scryfall["data"].length - 1
    //     )
    //
    //     updateCard()
    //     return
    // }
    //
    // if (keyCode === 102 || keyCode === RIGHT_ARROW) { /* numpad 6 */
    //     currentCardIndex++
    //     currentCardIndex = constrain(
    //         currentCardIndex, 0, scryfall["data"].length - 1
    //     )
    //
    //     updateCard()
    //     return
    // }

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
        // correct.play()
        passage.setCorrect()
    }
    else {
        // incorrect.play()
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