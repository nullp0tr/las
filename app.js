/* code needs a proper full pass refactor. currently it's the product of what I call proto
 refactoring. */

const canvas = document.getElementById("pg-canvas")
canvas.style.backgroundColor = 'rgba(0, 0, 0, 1)';

const cwidth = canvas.offsetWidth
const cheight = canvas.offsetHeight
canvas.height = cheight
canvas.width = cwidth

const ctx = canvas.getContext("2d")
ctx.lineWidth = 2

const ORIGIN = [(cwidth/2), (cheight/2)]

const vectors = []
const IDENTITY_MATRIX = new Array([1,0],[0,1])
const transformations = new Array()
transformations.push(IDENTITY_MATRIX)

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


function matrix_vec_multiply(matrix, vec) {
    matrix_fst_row = matrix[0]
    matrix_snd_row = matrix[1]
    x = matrix_fst_row[0] * vec[0] + matrix_fst_row[1] * vec[1]
    y = matrix_snd_row[0] * vec[0] + matrix_snd_row[1] * vec[1]
    return [x, y]
}

function matrix_matrix_multiply(m1, m2) {
    m1_fst_row = m1[0]
    m1_snd_row = m1[1]
    m2_fst_row = m2[0]
    m2_snd_row = m2[1]
    new_matrix = [[0,0],[0,0]]
    new_matrix[0][0] = m1_fst_row[0] * m2_fst_row[0] + m1_fst_row[1] * m2_snd_row[0]
    new_matrix[0][1] = m1_fst_row[0] * m2_fst_row[1] + m1_fst_row[1] * m2_snd_row[1]
    new_matrix[1][0] = m1_snd_row[0] * m2_fst_row[0] + m1_snd_row[1] * m2_snd_row[0]
    new_matrix[1][1] = m1_snd_row[0] * m2_fst_row[1] + m1_snd_row[1] * m2_snd_row[1]
    return new_matrix
}

function matrix_matrix_add(m1, m2) {
    nm = [[0,0],[0,0]]
    nm[0][0] = m1[0][0] + m2[0][0]
    nm[0][1] = m1[0][1] + m2[0][1]
    nm[1][0] = m1[1][0] + m2[1][0]
    nm[1][1] = m1[1][1] + m2[1][1]
    return nm
}

function matrix_matrix_sub(m1, m2) {
    nm = [[0,0],[0,0]]
    nm[0][0] = m1[0][0] - m2[0][0]
    nm[0][1] = m1[0][1] - m2[0][1]
    nm[1][0] = m1[1][0] - m2[1][0]
    nm[1][1] = m1[1][1] - m2[1][1]
    return nm
}

function matrix_scalar_multiply(m, scalar) {
    let nm = [...m]
    nm[0][0] *= scalar
    nm[0][1] *= scalar
    nm[1][0] *= scalar
    nm[1][1] *= scalar
    return nm
}

function draw_vector(vec) {
    ctx.save()
    let new_vec = vec
    transformations.forEach(m => {
	new_vec = matrix_vec_multiply(m, new_vec)
    })
    x = new_vec[0]
    y = new_vec[1]

    ctx.strokeStyle = "#ffff10"
    ctx.beginPath()
    ctx.moveTo(ORIGIN[0], ORIGIN[1])
    ctx.lineTo(ORIGIN[0] + x * 20, ORIGIN[1] - (y * 20))
    ctx.stroke()
    ctx.restore()
}


function transform_space(matrix) {
    ctx.clearRect(0, 0, cwidth, cheight)
    const m = [...matrix]
    transformations.push(matrix)
    draw_grid(ctx, cwidth * 2, cheight * 2, 20, transformations)
}

function v_cmd(vec) {
    vectors.push(vec)
    transform_space(IDENTITY_MATRIX) // sorry 
}

function parse(user_input) {
    let cmd = user_input.trim()

    if (cmd.startsWith("v")) {
	split_cmd = cmd.split(" ")
	args = split_cmd.slice(1, split_cmd.length)
	if (args.length != 2) {
	    // parsing error! 
	    return
	}
	v_cmd([args[0], args[1]])
    }

    else if (cmd.startsWith("t")) {
	split_cmd = cmd.split(" ")
	args = split_cmd.slice(1, split_cmd.length)

	if (args.length != 4) {
	    // parsing error!
	    return
	}
	transform_space([[args[0], args[1]], [args[2], args[3]]])
    }

    else if (cmd === "reset") {
	transformations.length = 0
	transformations.push(IDENTITY_MATRIX)
	ctx.clearRect(0, 0, cwidth, cheight)
	draw_grid(ctx, cwidth, cheight, 20, transformations)
    }

    else if (cmd == "rot") {
	transform_space(
	    [[Math.cos(Math.PI / 2), -Math.sin(Math.PI / 2)],
	     [Math.sin(Math.PI / 2), Math.cos(Math.PI / 2)]]
	)
    }
}

var draw_grid = function(ctx, w, h, step, transformations) {

    COUNTER_MAX = 100

    const drawFrame = function(x, counter=1) {
	ctx.save()
	ctx.beginPath();
	ctx.clearRect(0,0, cwidth, cheight)
	let latest_matrix = IDENTITY_MATRIX
	ctx.setTransform(latest_matrix[0][0], latest_matrix[1][0], latest_matrix[0][1], latest_matrix[1][1], ORIGIN[0], ORIGIN[1])

	for (let i=0; i < transformations.length - 1; i++) {
	    m = transformations[i]
	}
	transformations.slice(0, transformations.length - 1).forEach((m) => {	
	    ctx.setTransform(m[0][0], m[1][0], m[0][1], m[1][1], ORIGIN[0], ORIGIN[1])
	    latest_matrix = matrix_matrix_multiply(latest_matrix, m)
	})

	latest_matrix_scale = [
	    Math.sqrt(latest_matrix[0][0]**2 + latest_matrix[1][0]**2),
	    Math.sqrt(latest_matrix[0][1]**2 + latest_matrix[1][1]**2),
	]

	if (latest_matrix[0][0] < 0 || latest_matrix[1][0] < 0) {
	    latest_matrix_scale[0] *= -1
	}

	if (latest_matrix[0][1] < 0 || latest_matrix[1][1] < 0) {
	    latest_matrix_scale[1] *= -1
	}

	if (transformations.length - 1 >= 0) {
	    let mm = transformations[transformations.length - 1]

	    let m1 = matrix_matrix_multiply(latest_matrix, mm)
	    let m = matrix_matrix_add(
		latest_matrix,
		matrix_scalar_multiply(
		    matrix_matrix_sub(m1, latest_matrix),
		    counter/COUNTER_MAX
		)
	    )

	    ctx.setTransform(m[0][0], m[1][0], m[0][1], m[1][1], ORIGIN[0], ORIGIN[1])
	}

	_w = step * Math.round(w/step)
	for (var x=-_w;x<=_w;x+=step) {
            ctx.moveTo(x, -h);
            ctx.lineTo(x, h);
	}
	ctx.strokeStyle = '#1fabc3';
	ctx.lineWidth = 1;

	_h = step * Math.round(h/step)
	for (var y=-_h;y<=_h;y+=step) {
            ctx.moveTo(-w, y);
            ctx.lineTo(w, y);
	}

	ctx.stroke()

	ctx.beginPath()
	vectors.forEach((v) => {
	    const x = v[0]
	    const y = v[1]

	    ctx.strokeStyle = "#ffff10"
	    ctx.moveTo(0, 0)
	    ctx.lineTo(x * 20, -(y * 20))
	    
	})

	ctx.stroke();

	ctx.beginPath()
	ctx.arc(0, 0, 2, 0, 2 * Math.PI)
	ctx.fillStyle = "#ff0000"
	ctx.fill()

	ctx.restore()

	if (counter < COUNTER_MAX) {
	    window.requestAnimationFrame(() => drawFrame(x, counter+1))
	}
    }

    window.requestAnimationFrame(drawFrame)
};


draw_grid(ctx, cwidth*2, cheight*2, 20, transformations)
