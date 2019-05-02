/* meh */


const DECIMAL_NUMBER_REGEX = /[-+]?[0-9]*\.?[0-9]+/g


const OPEN_PARAN = /\(/g
const CLOSE_PARAN = /\)/g

const TRIG_NAME_REGEX = /(cos|sin)/g
const TRIG_REGEX = new RegExp(
    OPEN_PARAN.source
	+ TRIG_NAME_REGEX.source
	+ "\\s+"
	+ DECIMAL_NUMBER_REGEX.source
	+ CLOSE_PARAN.source,
    "g"
)


const NUMBER_REGEX = new RegExp(TRIG_REGEX.source + "|" + DECIMAL_NUMBER_REGEX.source)


const extract_numbers = (input) => {
    const processed = input.replace(/\s\s+/g, " ")
	  .trim()
	  .replace(/cos /g, "cos_")
	  .replace(/sin /g, "sin_")
	  .split(" ")
	  .splice(1)
    const extracted = new Array()

    
    for (each in processed) {
	const val = processed[each]

	const matched_token = val.match(DECIMAL_NUMBER_REGEX)
	const matched = Number(matched_token[0])

	if (val.match(/cos/g)) {
	    extracted.push(Math.cos(matched))
	} else if (val.match(/sin/g)) {
	    extracted.push(Math.sin(matched))
	} else {
	    extracted.push(matched)
	}
    }
    
    return extracted
}


const tty_vec_cmd = (args) => {
    vector_stack.push(new Vector(args[0], args[1]))
    matrix_stack.push(IdentityMatrix) // sorry too lazy
    refresh()
    return "created the vector (" + args[0] + ", " + args[1] + ")"    
}


const tty_transform_cmd = (args) => {
    const m = new Matrix(args[0], args[1], args[2], args[3])
    matrix_stack.push(m)
    refresh()
    return `transformed space using the matrix: 
    [${args[0]} ${args[1]}]
    [${args[2]} ${args[3]}]`
}


const tty_io_cb = (input) => {

    vec_cmd = /(vector|vec|v)/g
    vec_reg = new RegExp(  // /^VCMD(\s+NUMBER){2}\s*$
	"^" + vec_cmd.source + "(\\s+(" + NUMBER_REGEX.source + ")){2}\\s*$"
    )

    if (input.match(vec_reg)) {
	return tty_vec_cmd(extract_numbers(input))
    }

    trans_cmd = /(transform|t)/g
    trans_reg = new RegExp(
	"^" + trans_cmd.source + "(\\s+(" + NUMBER_REGEX.source + ")){4}\\s*$"
    )
    if (input.match(trans_reg)) {
	return tty_transform_cmd(extract_numbers(input))
    }

    rot_cmd = /(rotate|rot|r)/g
    rot_reg = new RegExp("^" + rot_cmd.source + "(\\s+" + DECIMAL_NUMBER_REGEX.source + "){1}\\s*$")
    if (input.match(rot_reg)) {
	deg = extract_numbers(input)[0]
	rad = deg * (Math.PI / 180)
	return tty_transform_cmd([Math.cos(rad), -Math.sin(rad), Math.sin(rad), Math.cos(rad)])
    }

    reset_reg = /^reset\s*$/
    if (input.match(reset_reg)) {
	vector_stack.length = 0
	matrix_stack.length = 0
	refresh()
	return "setting the cosmic scale factor to 0."
    }

    soup_reg = /.*meal of the day.*/
    if (input.match(soup_reg)) {
	return "soup"
    }

    return input ? "unrecognized command or wrong arguments." : ""
}


const tinyTTY = new TinyTTY(tty_io_cb)
const tiny_tty_div = document.getElementById("tiny-tty")
tiny_tty_div.appendChild(tinyTTY.html)

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

	ctx.save()
	ctx.beginPath()
	ctx.fillStyle = "#ff3347"
	ctx.arc(0, 0, 2, 0, Math.PI * 2)
	ctx.fill()
	ctx.closePath()
	ctx.restore()
	
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
