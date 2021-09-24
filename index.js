// Use ES module import syntax to import functionality from the module
// that we have compiled.
//
// Note that the `default` import is an initialization function which
// will "boot" the module and make it ready to use. Currently browsers
// don't support natively imported WebAssembly as an ES module, but
// eventually the manual initialization won't be required!
import init, { Universe } from './pkg/gol.js';

let grid = false;

const CELL_SIZE = 4;
//const GRID_COLOUR = "#000";

const cnv = document.getElementById("gol");
const ctx = cnv.getContext("2d");

const calcDim = dim => Math.ceil(dim / CELL_SIZE);

let width = calcDim(window.innerWidth);
let height = calcDim(window.innerHeight);

cnv.width = CELL_SIZE * width + grid;
cnv.height = CELL_SIZE * height + grid;

init('./pkg/gol.wasm').then(wasm => {
    const universe = Universe.new(width, height);

    /*
    const drawGrid = () => {
	ctx.beginPath();
	ctx.fillStyle = GRID_COLOUR;

	for (let i = 0; i <= width; i++) {
	    ctx.fillRect(i * CELL_SIZE, 0, 1, CELL_SIZE * height);
	}

	for (let i = 0; i <= height; i++) {
	    ctx.fillRect(0, i * CELL_SIZE, CELL_SIZE * width, 1);
	}

	ctx.stroke();
    }
    */

    //const getIndex = (x, y) => x + y * width;

    const drawCells = () => {
	const drawCell = (x, y) => {
	    ctx.fillRect(
		x * CELL_SIZE,
		y * CELL_SIZE,
		CELL_SIZE - grid,
		CELL_SIZE - grid,
	    );
	}

	const alivePtr = universe.alive_ptr();
	const aliveLen = universe.alive_len();
	const alive = new Uint32Array(wasm.memory.buffer, alivePtr, aliveLen);

	for (let dx = 0, dy = 1; dy < alive.length; dx += 2, dy += 2) {
	    drawCell(alive[dx], alive[dy]);
	}
    };

    const resize = () => {
	width = calcDim(window.innerWidth);
	height = calcDim(window.innerHeight);

	cnv.width = CELL_SIZE * width + grid;
	cnv.height = CELL_SIZE * height + grid;

	universe.resize(width, height);

	drawCells(true);
    };

    const renderLoop = () => {
	ctx.fillStyle = '#00000020';
	ctx.fillRect(0,0,cnv.width,cnv.height);

	ctx.fillStyle = `hsl(${(Date.now()/30000*360)%360}, 100%, 50%)`;

	universe.tick();

	drawCells(false);

	requestAnimationFrame(renderLoop);
    };

    resize();
    requestAnimationFrame(renderLoop);

    window.addEventListener('resize', resize);
    window.addEventListener('click', () => { grid = !grid; resize() });
});
