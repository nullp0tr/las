/* meh */


const IdentityMatrix = new Matrix(1, 0, 0, 1)

const canvas = document.getElementById("pg-canvas")
canvas.style.backgroundColor = 'rgba(0, 0, 0, 1)';

const cwidth = canvas.offsetWidth
const cheight = canvas.offsetHeight
canvas.height = cheight
canvas.width = cwidth

const ctx = canvas.getContext("2d")
ctx.lineWidth = 4

const Origin = new Vector(cwidth/2, cheight/2)

const vector_stack = new Array()

const matrix_stack = new Array()

const inputDiv = document.getElementById("input-cmd-div")
term = new Terminal()
inputDiv.appendChild(term.html)

const term_input_handler = (x) => {
    const cmd = x.trim()
    if (cmd.length)
	parse(cmd)
    term.input(">>> ", term_input_handler)
}

term.input(">>> ", term_input_handler)


const strk_draw_vector = (vec, step=20) => {
    ctx.strokeStyle = "#cfc364"
    ctx.lineWidth = 1.5
    ctx.moveTo(0, 0)
    ctx.lineTo(vec.x * step, -(vec.y * step))
}


const fill_draw_vector_hat = (vec, step=20) => {
    ctx.fillStyle = "#ff6347"
    ctx.arc(vec.x * step, -(vec.y * step), 2, 0, Math.PI * 2)
}


const parse = (user_input) => {
    let cmd = user_input.trim()

    if (cmd.startsWith("v")) {
	split_cmd = cmd.split(" ")
	args = split_cmd.slice(1, split_cmd.length)
	if (args.length != 2) {
	    // parsing error! 
	    return
	}
	vector_stack.push(new Vector(args[0], args[1]))
	matrix_stack.push(IdentityMatrix) // sorry to lazy
	refresh()
    }

    else if (cmd.startsWith("t")) {
	split_cmd = cmd.split(" ")
	args = split_cmd.slice(1, split_cmd.length)

	if (args.length != 4) {
	    // parsing error!
	    return
	}
	m = new Matrix(args[0], args[1], args[2], args[3])
	matrix_stack.push(m)
	refresh()
    }

    else if (cmd === "reset") {
	matrix_stack.length = 0
	vector_stack.length = 0
	refresh()
    }

    else if (cmd == "rot") {
	rot90_matrix = new Matrix(
	    Math.cos(Math.PI / 2), -Math.sin(Math.PI / 2),
	    Math.sin(Math.PI / 2), Math.cos(Math.PI / 2)
	)
	matrix_stack.push(rot90_matrix)
	refresh()
    }
}


const apply_animated_transforms = (ctx, w, h, matrices, counter=100, cmax=100, step=20) => {
    let blm = IdentityMatrix  // before last matrix
    ctx.setTransform(blm.a11, blm.a21, blm.a12, blm.a22, Origin.x, Origin.y)
    matrices.slice(0, matrices.length - 1).forEach((m) => {
	ctx.setTransform(m.a11, m.a21, m.a12, m.a22, Origin.x, Origin.y)
	blm = mm_mul(blm, m)
    })

    let pm = null
    if (matrices.length - 1 >= 0) {
	let lm = matrices.slice(-1).pop()  // last matrix
	pm = mm_mul(blm, lm)  // product matrix aka. transformations from I

	//  im = blm + ((pm - blm) * counter/COUNTER_max)
	let im = mm_add(blm, ms_mul(mm_sub(pm, blm), counter/cmax))
	ctx.setTransform(im.a11, im.a21, im.a12, im.a22, Origin.x, Origin.y)
    }

    return pm
}


const refresh_space = (ctx, w, h, matrices, step=20) => {
    counter = 1
    cmax = 100
    const frame = (x, c=counter) => {
	ctx.clearRect(0, 0, cwidth, cheight)

	ctx.beginPath()
	strk_draw_grid(ctx, w, h, color="grey")
	ctx.stroke()
	ctx.closePath()

	ctx.save()
	const product = apply_animated_transforms(ctx, w, h, matrices, c, cmax)
	ctx.beginPath()
	strk_draw_grid(ctx, w, h)
	ctx.stroke()
	ctx.closePath()

	// global state leakage : will restore purity at some point
	vector_stack.forEach(v => {
	    ctx.save()
	    ctx.beginPath()
	    strk_draw_vector(v)
	    ctx.stroke()
	    ctx.closePath()
	    ctx.restore()
	})

	vector_stack.forEach(v => {
	    ctx.save()
	    ctx.beginPath()
	    fill_draw_vector_hat(v)
	    ctx.fill()
	    ctx.closePath()
	    ctx.restore()
	})

	ctx.restore()
	if (c < cmax) {
	    c += 1
	    window.requestAnimationFrame((x) => frame(x, c))
	} else {
	    // too lazy to properly handle floats right now, though
	    // this is better than nothing
	    if (product && product.equals(IdentityMatrix)) {
		matrix_stack.length = 0
	    }
	}
    }
    window.requestAnimationFrame(frame)
}


const strk_draw_grid = (ctx, w, h, color="#1fabc3", step=20) => {
    ctx.strokeStyle = color
    ctx.lineWidth = 1
    
    const width = step * Math.round(w/step)
    for (let x = -width; x <= width; x += step) {
        ctx.moveTo(x, -h);
        ctx.lineTo(x, h);
    }


    const height = step * Math.round(h/step)
    for (let y = -height; y <= height; y += step) {
        ctx.moveTo(-w, y);
        ctx.lineTo(w, y);
    }    
}


const refresh = () => {
    refresh_space(ctx, cwidth * 2, cheight * 2, matrix_stack)
}


refresh()
