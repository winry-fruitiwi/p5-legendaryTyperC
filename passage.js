// stops error generation for constants I don't use. I can choose to take it
// away if I really want to check.

// noinspection JSUnusedGlobalSymbols, JSUnusedLocalSymbols, GrazieInspection

class Passage {
    constructor(text) {
        // the passage text, plus a space at the end to stop a bug in word wrap.
        this.text = text + " "
        // the index of the character we're typing in our passage. Not yet used.
        this.index = 0
        // a list of boolean values marking if the character was correct
        this.correctList = []

        // the y-offset for the text, which will simulate scrolling.
        this.yOffset = 0

        // these are the constants!

        // the top margin for all text.
        this.TOP_MARGIN = 100

        // the place where the text starts
        this.LEFT_MARGIN = 100

        // the margin from the right edge of the bounding box to the right
        // canvas edge
        this.RIGHT_MARGIN = CARD_IMG_WIDTH + 2 * CARD_HORIZONTAL_MARGIN

        // padding for the highlight box of each character
        this.highlightBoxPadding = 3

        // the distance from the top of the canvas to the tallest character
        // in the current font, which is consola.
        this.DIST_FROM_CANVAS_TOP = this.TOP_MARGIN - textAscent() - this.TOP_MARGIN

        // the x-position where I wrap my text.
        this.LINE_WRAP_X_POS = width - CARD_IMG_WIDTH - 2 * CARD_HORIZONTAL_MARGIN

        // this is where the text starts. Ideally I'd like 50 pixels of space.
        this.TEXT_START = new p5.Vector(
            this.LEFT_MARGIN,
            this.TOP_MARGIN + this.DIST_FROM_CANVAS_TOP
        )

        // the height of each line without accounting for spacing
        this.LINE_HEIGHT = textAscent() + textDescent() + 2 * this.highlightBoxPadding

        // the spacing between lines
        this.LINE_SPACING = 30

        // the x-spacing between each letter
        this.LETTER_SPACING = 2

        // the horizontal padding for the bounding box
        this.BOUNDING_BOX_PADDINGH = 20
    }


    // displays the passage
    render() {
        // set the font size
        textSize(24)

        // the number of lines in my program. Increments as I find enters
        // and line wrapping sections (generally whenever I wrap a line).
        let lines = 0

        // this is where our text will be drawn. It can always be modified.
        let cursor = this.TEXT_START.copy()

        // the height of the viewport, measured in lines
        let viewportHeight = 6

        // number of lines we've typed
        let linesTyped

        // a list of character positions, for use while showing the current
        // word bar. Later you can retrieve a character and get its position.
        let charPosList = []

        // translate the entire expression by the y-offset. However, we need
        // to make it negative, or else we'd be scrolling downward!
        push()
        translate(0, -this.yOffset)

        for (let i = 0; i < this.text.length; i++) {
            // retrieve our current character and display it
            let currentChar = this.text[i]

            // append the current position to our character position list
            charPosList.push(cursor.copy())

            if (i === this.index) {
                strokeWeight(2.5)
                stroke(0, 0, 100)

                // we add the text descent so that our bar is right under
                // the character if it has a descent, and otherwise hovering
                // comfortably below.
                line(
                    cursor.x,
                    cursor.y + textDescent(),
                    cursor.x + textWidth(currentChar),
                    cursor.y + textDescent()
                )

                linesTyped = lines

                noStroke()
            }

            // if the current letter will go past our line wrap x position,
            // we need to wrap our text around. Currently, my program is
            // incapable of retaining words and spacing. Later, I'll fix that.
            // if (textWidth(currentChar) + cursor.x >= this.LINE_WRAP_X_POS) {
            //     this.#wrapCursor(cursor)
            // } // This is character wrap. Now I'll work on word wrap.

            fill(0, 0, 100)
            text(currentChar, cursor.x, cursor.y)

            // the rounding radius for the highlight box
            let highlightCornerRoundRadius = 3

            // if the correct list contains my index, check correctList[i].
            if (i < this.correctList.length) {
                if (this.correctList[i] === true) {
                    fill(89, 100, 78, 30)
                } else {
                    fill(0, 66, 78, 30)
                }

                rect(
                    cursor.x,
                    cursor.y - textAscent() - this.highlightBoxPadding,
                    textWidth(currentChar),
                    textAscent() + textDescent() + this.highlightBoxPadding,
                    highlightCornerRoundRadius
                )
            }

            if (currentChar === "\n") {
                lines++
                this.#wrapCursor(cursor)
                continue
            }

            // if the current letter is a space, we can find the next space.
            if (currentChar === " ") {
                // if we don't increment i by one, this will return i
                let nextSpace = this.text.indexOf(" ", i + 1)

                // find the substring from our current delimiter to the next
                let currentWord = this.text.substring(
                    i, nextSpace
                )

                if (textWidth(currentWord) + cursor.x >= this.LINE_WRAP_X_POS) {
                    lines++
                    this.#wrapCursor(cursor)

                    // prevents extra unnecessary wrapping
                    continue
                }
            }

            // increment our cursor's x-position.
            cursor.x += textWidth(currentChar) + this.LETTER_SPACING
        }

        // show the current word bar.
        this.#showCurrentWordBar(charPosList)

        pop()

        // the height of each line, including the spacing
        let lineHeightPlusSpacing = this.LINE_SPACING + this.LINE_HEIGHT

        // the bounding box's top y-value, which is necessary for
        // calculating the bottom value. Or I could just translate.
        const BOX_TOP_Y = this.TOP_MARGIN - textAscent() - this.LINE_SPACING

        // the bottom of the bounding box based on the top of the box. Could
        // potentially be changed into a constant, but it simplifies code
        // dramatically.
        const BOX_BOTTOM_Y = viewportHeight * lineHeightPlusSpacing + BOX_TOP_Y

        // set the lines that should be scrolled to the appropriate formula
        // result.
        let linesScrolled = linesTyped - viewportHeight + 2

        // if the lines scrolled is negative, set it to 0.
        if (linesScrolled < 0) {
            linesScrolled = 0
        }

        this.yOffset = linesScrolled * lineHeightPlusSpacing

        noFill()
        noStroke()

        fill(237, 37, 20)

        // outer shape is clockwise, inner shape is counterclockwise
        beginShape();

        // the outer shape should have the entire canvas inside
        vertex(width, 0)
        vertex(width, height)
        vertex(0, height)
        vertex(0, 0)

        beginContour()

        // the inner shape is the bounding box, with all of the coordinates
        // from my old quadrilateral. I should have used a rectangle instead
        // of a quadrilateral, but my intention was to test all of the points.
        vertex(
            this.LEFT_MARGIN - this.BOUNDING_BOX_PADDINGH,
            BOX_TOP_Y
        )
        vertex(
            this.LEFT_MARGIN - this.BOUNDING_BOX_PADDINGH,
            BOX_BOTTOM_Y
        )
        vertex(
            width - this.RIGHT_MARGIN + this.BOUNDING_BOX_PADDINGH,
            BOX_BOTTOM_Y
        )
        vertex(
            width - this.RIGHT_MARGIN + this.BOUNDING_BOX_PADDINGH,
            BOX_TOP_Y
        )
        endContour()

        endShape(CLOSE)

        // print(BOX_BOTTOM_Y)
    }


    // have we finished the current passage?
    finished() {
        return this.index === this.text.length - 1
    }


    // return whatever character we're at based on our index
    getCurrentChar() {
        let currentChar = this.text[this.index]

        // if the current character is a bullet point, return * instead
        if (currentChar === "•") {
            return "*"
        }

        // sometimes the character is an — and the user can type a hyphen.
        else if (currentChar === "—") {
            return "-"
        }

        return currentChar
    }


    // advance after pushing true onto this.correctList
    setCorrect() {
        this.correctList.push(true)
        this.advance()
    }


    // advance after pushing false onto our correctList
    setIncorrect() {
        this.correctList.push(false)
        this.advance()
    }


    // advance our current character
    advance() {
        // if we haven't finished the passage, increment this.index.
        if (!this.finished()) {
            this.index++
        }
        //
        //     // otherwise, execute the if statement in keyPressed that increments
        // // the current index and overwrites the passage with a new one.
        // else {
        //     if (currentCardIndex === cardList.length - 1) {
        //         currentCardIndex = 0
        //     } else {
        //         currentCardIndex++
        //     }
        //
        //     updateCard()
        // }
    }


    /* from here, there will only be private methods */


    // increase y, reset x
    #wrapCursor(cursor) {
        // the height of each line, including the spacing
        let lineHeightPlusSpacing = this.LINE_SPACING + this.LINE_HEIGHT

        cursor.x = this.TEXT_START.x
        cursor.y += lineHeightPlusSpacing
    }


    // show the bar over our current word
    #showCurrentWordBar(charPosList) {
        /* find variables */

        // padding between a word and the current word bar
        let currentWordBarPadding = 5


        /* find the two spaces/newlines on either side of the index. */

        // find the indices of the last space and the last newline.
        let lastSpace = this.text.lastIndexOf(' ', this.index - 1)
        let lastNewline = this.text.lastIndexOf('\n', this.index - 1)

        // then we find which number is smaller using the max function!
        // However, we can shorten the algorithm from 7 lines to 3 by adding
        // one to the result. This clever hack happens to work; if neither a
        // space nor newline exists behind the index, then max will return
        // -1 and adding one will make it 0. Otherwise, it'll return one
        // plus whichever index was larger.
        let leftDelimiterPlusOne = max(lastNewline, lastSpace) + 1

        // find the next space and newline, then compare the two indices
        // using min
        let nextSpace = this.text.indexOf(' ', this.index)
        let nextNewline = this.text.indexOf('\n', this.index)

        // we have to check if the next space or the next newline does not
        // exist! Otherwise, if one value is -1, the result of min will be -1.
        if (nextSpace === -1) {
            nextSpace = this.text.length - 1
        }

        if (nextNewline === -1) {
            nextNewline = this.text.length - 1
        }

        let rightDelimiter = min(nextSpace, nextNewline)

        /* find the current word, including the right delimiter */


        // the left delimiter exclusion/inclusion takes care of itself.
        let charPosLeftDelimiter = charPosList[leftDelimiterPlusOne]

        // find the character position of the right delimiter, then add the
        // text width of a space to the right delimiter because that's not
        // included otherwise.
        let charPosRightDelimiter = charPosList[rightDelimiter]
        charPosRightDelimiter.x += textWidth(' ')

        stroke(0, 0, 100)
        strokeWeight(3)

        // draw a line from the x-position of the left delimiter to the
        // x-position of the right delimiter. However, the y-coordinate
        // should be the y-coordinate of the index to avoid diagonal lines.
        // Also I should subtract a text ascent because the line will start at
        // the base of the text instead of hovering above.

        // This expression is so long that I'm breaking it up!
        let indexPositionY = (
            charPosList[this.index].y -
            textAscent() -
            currentWordBarPadding
        )

        line(
            charPosLeftDelimiter.x,
            indexPositionY,
            charPosRightDelimiter.x,
            indexPositionY
        )

        noStroke() // reset the stroke so that it doesn't carry over
    }


    // show the cursor of the letter we're currently on. TODO not implemented
    #showTextCursor(char_pos) {

    }


    // wrap cursor if position is over LINE_WRAP_X_POS. TODO not implemented
    #handleNewLines() {

    }

    // TODO not implemented or commented
    #showHighlightBox(i, cursor) {

    }
}
