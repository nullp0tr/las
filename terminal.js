/*! terminal.js v2.0 | (c) 2014 Erik Österberg | https://github.com/eosterberg/terminaljs */

/* this needs cleaning big time */


var Terminal = (function() {
    // PROMPT_TYPE
    var PROMPT_INPUT = 1,
        PROMPT_PASSWORD = 2,
        PROMPT_CONFIRM = 3

    var fireCursorInterval = function(inputField, terminalObj) {
        var cursor = terminalObj._cursor
        setTimeout(function() {
            if (inputField.parentElement && terminalObj._shouldBlinkCursor) {
                cursor.style.visibility = cursor.style.visibility === 'visible' ? 'hidden' : 'visible'
                fireCursorInterval(inputField, terminalObj)
            } else {
                cursor.style.visibility = 'visible'
            }
        }, 1000)
    }

    var firstPrompt = true;
    promptInput = function(terminalObj, message, PROMPT_TYPE, callback) {
        var shouldDisplayInput = (PROMPT_TYPE === PROMPT_INPUT)
        var inputField = document.createElement('input')

        inputField.style.position = 'absolute'
        inputField.style.zIndex = '-100'
        inputField.style.outline = 'none'
        inputField.style.border = 'none'
        inputField.style.opacity = '0'
        inputField.style.fontSize = '0.2em'

        terminalObj._inputLine.textContent = ''
        terminalObj._input.style.display = 'block'
	const x = window.scrollX, y = window.scrollY
        terminalObj.html.appendChild(inputField)
	window.scroll(x, y)
	setTimeout(function() {window.scrollTo(x, y)},100)
        fireCursorInterval(inputField, terminalObj)

        if (message.length) terminalObj.print(PROMPT_TYPE === PROMPT_CONFIRM ? message + ' (y/n)' : message)

        inputField.onblur = function() {
            terminalObj._cursor.style.display = 'none'
        }

        inputField.onfocus = function() {
//            inputField.value = terminalObj._inputLine.textContent
            terminalObj._cursor.style.display = 'inline'
        }

        terminalObj.html.onclick = function() {
	    const x = window.scrollX, y = window.scrollY;
	    inputField.focus({preventScroll: true})
	    window.scroll(x, y);
	    setTimeout(function() {window.scrollTo(x, y);},100)
        }

        inputField.onkeydown = function(e) {
            if (e.which === 37 || e.which === 39 || e.which === 38 || e.which === 40 || e.which === 9) {
                e.preventDefault()
            } else if (shouldDisplayInput && e.which !== 13) {
                setTimeout(function() {
                    terminalObj._inputLine.textContent = inputField.value
                }, 1)
            }
        }
        inputField.onkeyup = function(e) {
            if (PROMPT_TYPE === PROMPT_CONFIRM || e.which === 13) {
		e.preventDefault()
                terminalObj._input.style.display = 'none'
                var inputValue = inputField.value
		inputField.value = ""

		//buff		if (terminalObj._output.lastChild.clientHeight * termi
		if (terminalObj._output.children.length >= 7) {
		    child = terminalObj._output.childNodes[0]
		    terminalObj._output.removeChild(child)
		}
		terminalObj._output.lastChild.textContent = ">>> " + inputValue
                if (typeof(callback) === 'function') {
                    if (PROMPT_TYPE === PROMPT_CONFIRM) {
                        callback(inputValue.toUpperCase()[0] === 'Y' ? true : false)
                    } else callback(inputValue)
                }
            }
        }
        if (firstPrompt) {
            firstPrompt = false
            setTimeout(function() {
		const x = window.scrollX, y = window.scrollY;
		inputField.focus({preventScroll: true})
		window.scroll(x, y);
		setTimeout(function() {window.scrollTo(x, y);},100)
            }, 50)
        } else {
	    const x = window.scrollX, y = window.scrollY;
//	    inputField.focus({preventScroll: true})
	    window.scroll(x, y);
	    setTimeout(function() {window.scrollTo(x, y);},100)
        }
    }

    var TerminalConstructor = function(id) {
        this.html = document.createElement('div')
        this.html.className = 'Terminal'
        if (typeof(id) === 'string') {
            this.html.id = id
        }

        this._innerWindow = document.createElement('div')
        this._output = document.createElement('p')
        this._inputLine = document.createElement('span') //the span element where the users input is put
        this._cursor = document.createElement('span')
        this._input = document.createElement('p') //the full element administering the user input, including cursor
	this._input.innerHTML = "&nbsp;"
        this._shouldBlinkCursor = true

        this.print = function(message) {
            const newLine = document.createElement('div')
	    newLine.style.display = "flex"
            newLine.textContent = message
	    newLine.appendChild(this._input)
            this._output.appendChild(newLine)
        }

        this.aPrint = function(message) {
	    const oldLine = this._output.lastChild
	    oldLine.textContent += message + '\n'
//	    this.print(message)
//            c = this._output.lastChild
//            c.textContent += message
        }

        this.input = function(message, callback) {
            promptInput(this, message, PROMPT_INPUT, callback)
        }

        this.password = function(message, callback) {
            promptInput(this, message, PROMPT_PASSWORD, callback)
        }

        this.confirm = function(message, callback) {
            promptInput(this, message, PROMPT_CONFIRM, callback)
        }

        this.clear = function() {
            this._output.innerHTML = ''
        }

        this.sleep = function(milliseconds, callback) {
            setTimeout(callback, milliseconds)
        }

        this.setTextSize = function(size) {
            this._output.style.fontSize = size
            this._input.style.fontSize = size
        }

        this.setTextColor = function(col) {
            this.html.style.color = col
            this._cursor.style.background = col
        }

        this.setBackgroundColor = function(col) {
            this.html.style.background = col
        }

        this.setWidth = function(width) {
            this.html.style.width = width
        }

        this.setHeight = function(height) {
            this.html.style.height = height
        }

        this.blinkingCursor = function(bool) {
            bool = bool.toString().toUpperCase()
            this._shouldBlinkCursor = (bool === 'TRUE' || bool === '1' || bool === 'YES')
        }

        this._input.appendChild(this._inputLine)
        this._input.appendChild(this._cursor)
        this._innerWindow.appendChild(this._output)
//        this._innerWindow.appendChild(this._input)
        this.html.appendChild(this._innerWindow)

        this.setBackgroundColor('black')
        this.setTextColor('white')
        this.setTextSize('1em')
        this.setWidth('100%')
        this.setHeight('100%')

        this.html.style.fontFamily = 'Monaco, Courier'
        this.html.style.margin = '0'
        this._innerWindow.style.padding = '10px'
        this._input.style.margin = '0'
        this._output.style.margin = '0'
        this._cursor.style.background = 'white'
        this._cursor.innerHTML = 'C' //put something in the cursor..
        this._cursor.style.display = 'none' //then hide it
        this._input.style.display = 'none'
    }

    return TerminalConstructor
}())
