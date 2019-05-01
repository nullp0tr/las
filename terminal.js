/* a miny tiny tty */

class TinyTTY {
    constructor(iocb, prompt=">>>") {
	this._prompt = prompt
	this.iocb = iocb
	this.buffer = new Array()
	this._textarea = document.createElement("textarea")
	this._textarea.className = "tiny-tty"
	this._textarea.spellcheck = false
	this._textarea.value = this._prompt + " "
	this._textarea.onkeyup = (e) => { this.onkeyup(e) }
	this._textarea.onkeydown = (e) => { this.onkeydown(e) }
	this._textarea.onfoxus = (e) => { window.scroll(0, 0) }
	this._selection_lock = this._prompt.length + 1
	this.html = this._textarea
    }

    onkeydown(event) {
	const x = window.scrollX, y = window.scrollY

	if (this._textarea.selectionStart <= this._selection_lock
	    && (event.key === "Backspace" || event.key === "Delete")) {
	    event.preventDefault()
	} else if (this._textarea.selectionStart < this._selection_lock) {
	    event.preventDefault()
	}
	switch (event.key) {
	case "Backspace":
	case "Delete":
	    break;
	case "Enter":
	    event.preventDefault()
	    break;
	}

	window.scroll(x, y)
    }

    onkeyup(event) {
	const x = window.scrollX, y = window.scrollY
	
	if (this._textarea.selectionStart < this._selection_lock) {
	    event.preventDefault()
	}
	switch (event.key) {
	case "Backspace":
	case "Delete":
	    break;
	case "Enter":
	    event.preventDefault()
	    const input_line = this._textarea.value.split(this._prompt + " ").splice(-1)[0]
	    const server_reply = this.iocb(input_line)
	    this._textarea.value += "\n"
	    if (server_reply !== "")
		this._textarea.value += server_reply + "\n"
	    this._textarea.value += this._prompt + " "
	    this._selection_lock = this._textarea.selectionStart
	    this._textarea.scrollTop = this._textarea.scrollHeight
	    break;
	    
	}
	window.scroll(x, y)
    }
}
