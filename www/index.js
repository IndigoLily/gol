// Use ES module import syntax to import functionality from the module
// that we have compiled.
//
// Note that the `default` import is an initialization function which
// will "boot" the module and make it ready to use. Currently browsers
// don't support natively imported WebAssembly as an ES module, but
// eventually the manual initialization won't be required!
import init, { Universe } from './pkg/gol.js';

let cell_size = 3;

const cnv = document.getElementById("gol");
const ctx = cnv.getContext("2d");

const calcDim = dim => Math.ceil(dim / cell_size);

let width = calcDim(window.innerWidth);
let height = calcDim(window.innerHeight);

cnv.width = cell_size * width;
cnv.height = cell_size * height;

//const getIndex = (x, y) => x + y * width;

const drawCell = (x, y) => {
    ctx.fillRect(
	x * cell_size,
	y * cell_size,
	cell_size,
	cell_size,
    );
}

init('./pkg/gol.wasm').then(wasm => {
    const universe = Universe.new(width, height);

    const drawCells = () => {
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

	cnv.width = cell_size * width;
	cnv.height = cell_size * height;

	universe.resize(width, height);

	drawCells(true);
    };

    const renderLoop = () => {
	ctx.fillStyle = '#00000020';
	ctx.fillRect(0,0,cnv.width,cnv.height);

	ctx.fillStyle = `hsl(${(Date.now()/30000*360)%360}, 100%, 50%)`;
	//ctx.fillStyle = '#fff';

	universe.tick();

	drawCells(false);

	requestAnimationFrame(renderLoop);
    };

    resize();
    requestAnimationFrame(renderLoop);

    window.addEventListener('resize', resize);
    window.addEventListener('click', () => universe.reset());
    window.addEventListener('keydown', key => {
	switch (key.code) {
	    case "ArrowUp":
		cell_size += 1;
		resize();
		break;
	    case "ArrowDown":
		if (cell_size > 1) {
		    cell_size -= 1;
		    resize();
		}
		break;
	}
    });
});
