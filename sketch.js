/**
 *  @author 
 *  @date 2022.05.
 *
 */

let font
let instructions
let debugCorner /* output debug text in the bottom left corner of the canvas */
let championData // data from the riot API
let baseChampionString = "https://ddragon.leagueoflegends.com/cdn/12.12.1/data/en_US/champion/"
let champion = "Ahri" // the champion we want to search for in the riot API


function preload() {
    font = loadFont('data/consola.ttf')
}


function setup() {
    let cnv = createCanvas(600, 300)
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
    print(data["data"][champion]["title"])
}

function draw() {
    background(234, 34, 24)

    /* debugCorner needs to be last so its z-index is highest */
    debugCorner.setText(`frameCount: ${frameCount}`, 2)
    debugCorner.setText(`fps: ${frameRate().toFixed(0)}`, 1)
    debugCorner.show()

    if (frameCount > 3000)
        noLoop()
}


function keyPressed() {
    /* stop sketch */
    if (keyCode === 97) { /* numpad 1 */
        noLoop()
        instructions.html(`<pre>
            sketch stopped</pre>`)
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