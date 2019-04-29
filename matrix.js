/* some basic matrix operations */


class Vector {
    constructor(x, y) {
	this.x = x
	this.y = y
    }
}


class Matrix {
    constructor(a11, a12, a21, a22) {
	this.a11 = a11
	this.a12 = a12
	this.a21 = a21
	this.a22 = a22
    }

    equals(other) {
	return this.a11 === other.a11
	    && this.a12 === other.a12
	    && this.a21 === other.a21
	    && this.a22 === other.a22
    }
}


const ms_mul = (m, scalar) => {
    let nm = new Matrix(m.a11, m.a12, m.a21, m.a22)
    nm.a11 *= scalar
    nm.a12 *= scalar
    nm.a21 *= scalar
    nm.a22 *= scalar
    return nm
}


const mm_mul = (m1, m2) => {
    new_matrix = new Matrix(0, 0, 0, 0)
    new_matrix.a11 = m1.a11 * m2.a11 + m1.a12 * m2.a21
    new_matrix.a12 = m1.a11 * m2.a12 + m1.a12 * m2.a22
    new_matrix.a21 = m1.a21 * m2.a11 + m1.a22 * m2.a21
    new_matrix.a22 = m1.a21 * m2.a12 + m1.a22 * m2.a22
    return new_matrix
}


const mv_mul = (m, vec) => {
    x = m.a11 * vec.x + m.a12 * vec.y
    y = m.a21 * vec.x + m.a22 * vec.y
    return new Vector(x, y)
}


const mm_add = (m1, m2) => {
    nm = new Matrix(0, 0, 0, 0)
    nm.a11 = m1.a11 + m2.a11
    nm.a12 = m1.a12 + m2.a12
    nm.a21 = m1.a21 + m2.a21
    nm.a22 = m1.a22 + m2.a22
    return nm    
}


const mm_sub = (m1, m2) => {
    nm = new Matrix(0, 0, 0, 0)
    nm.a11 = m1.a11 - m2.a11
    nm.a12 = m1.a12 - m2.a12
    nm.a21 = m1.a21 - m2.a21
    nm.a22 = m1.a22 - m2.a22
    return nm    
}
