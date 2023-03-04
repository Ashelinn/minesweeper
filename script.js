let size = 16; // размер поля 16Х16
let bombFrequency = 0.2; // процент бомб
let tileSize = 30; //размер ячейки

const board = document.querySelectorAll('.board')[0];
let tiles;
let boardSize;

const restartBtn = document.querySelectorAll('.btn')[0]; //перезапуск игры
const endscreen = document.querySelectorAll('.endscreen')[0] //сообщение о победе/проигрыше

let bombs = [];
let numbers = [];
let numberColors = ['#3498db', '#2ecc71', '#e74c3c', '#9b59b6', '#f1c40f', '#1abc9c', '#34495e', '#7f8c8d',];
let endscreenContent = {win: 'You won!', loose: 'Game over'};

let gameOver = false;

//Вывод
let bomb_count = document.querySelector('#bombs');
let smile = document.querySelector('#smile');
const timeEl = document.querySelector('#time');
const timerEl = document.querySelector('#timer');
let time = 2400;
let timer = 0;

/* Очистка игрового поля, перезапуск игры */
const clear = () => {
	/*
	gameOver = false;
	bombs = [];
	numbers = [];
	endscreen.innerHTML = '';
	endscreen.classList.remove('show');
	tiles.forEach(tile => {
		tile.remove();
	});
	smile.classList.toggle('img_normal');
	smile.classList.remove('img_loose');
	smile.classList.remove('img_win');
	*/
	window.location.reload();
	setup();
}

function decreaseTime() {
    if (time === 0) {
        endGame();
    } else {
        let current = --time;
		let min = Math.trunc(current/60);
		let sec = current % 60;
		if (sec < 10) {
            sec = `0${sec}`;
        }
		timeEl.innerHTML = `${min}:${sec}`;
    }
}

function increaseTime() {
    if (!gameOver) {
        let current = ++timer;
		let min = Math.trunc(current/60);
		let sec = current % 60;
		if (sec < 10) {
            sec = `0${sec}`;
        }
		if (min < 10) {
            min = `0${min}`;
        }
		timerEl.innerHTML = `${min}:${sec}`;
    }
}

/* Логика игры */
const setup = () => {
	//время
	setInterval(decreaseTime, 1000);
	setInterval(increaseTime, 1000);
    //поле игры
	for (let i = 0; i < Math.pow(size, 2); i++) {
		const tile = document.createElement('div');
		tile.classList.add('tile');
		board.appendChild(tile);
	}
	tiles = document.querySelectorAll('.tile');
	boardSize = Math.sqrt(tiles.length);
	board.style.width = boardSize * tileSize + 'px';
	
	document.documentElement.style.setProperty('--tileSize', `${tileSize}px`);
	document.documentElement.style.setProperty('--boardSize', `${boardSize * tileSize}px`);
	
	let x = 0;
	let y = 0;
	tiles.forEach((tile, i) => {
		tile.setAttribute('data-tile', `${x},${y}`);

		// расстановка бомб
		let random_boolean = Math.random() < bombFrequency;
		if (random_boolean) {
			bombs.push(`${x},${y}`);
			if (x > 0) numbers.push(`${x-1},${y}`);
			if (x < boardSize - 1) numbers.push(`${x+1},${y}`);
			if (y > 0) numbers.push(`${x},${y-1}`);
			if (y < boardSize - 1) numbers.push(`${x},${y+1}`);
			
			if (x > 0 && y > 0) numbers.push(`${x-1},${y-1}`);
			if (x < boardSize - 1 && y < boardSize - 1) numbers.push(`${x+1},${y+1}`);
			
			if (y > 0 && x < boardSize - 1) numbers.push(`${x+1},${y-1}`);
			if (x > 0 && y < boardSize - 1) numbers.push(`${x-1},${y+1}`);
		}
		
		x++;
		if (x >= boardSize) {
			x = 0;
			y++;
		}
				
		/* клик правой кнопкой */
		tile.oncontextmenu = function(e) {
			e.preventDefault();
			flag(tile);
		}
		
		/* клик левой кнопкой  */
		tile.addEventListener('click', function(e) {
			clickTile(tile);
		});
	});
	console.log(bombs.length);
	let count = bombs.length;
	bomb_count.innerHTML = count;

	window.bomb_count_g = {
		all_bombs: count
	}
	
	numbers.forEach(num => {
		let coords = num.split(',');
		let tile = document.querySelectorAll(`[data-tile="${parseInt(coords[0])},${parseInt(coords[1])}"]`)[0];
		let dataNum = parseInt(tile.getAttribute('data-num'));
		if (!dataNum) dataNum = 0;
		tile.setAttribute('data-num', dataNum + 1);
	});
}

/* Расстановка флагов */
const flag = (tile) => {
	if (gameOver) return;
	if (!tile.classList.contains('tile--checked')) {
		if (!tile.classList.contains('tile--flagged')) {
			tile.innerHTML = '🚩';
			tile.classList.add('tile--flagged');
			bomb_count.innerHTML = --bomb_count_g.all_bombs;
		} else {
			if (!tile.classList.contains('tile--marked')) {
				tile.innerHTML = '?';
				tile.classList.add('tile--marked');
				bomb_count.innerHTML = ++bomb_count_g.all_bombs;
			} else {
				tile.innerHTML = '';
				tile.classList.remove('tile--flagged');
				tile.classList.remove('tile--marked');
			}
		}
	}
}


/* Проверка на наличие бомбы */
const clickTile = (tile) => {
	if (gameOver) return;
	if (tile.classList.contains('tile--checked') || tile.classList.contains('tile--flagged') || tile.classList.contains('tile--marked')) return;
	let coordinate = tile.getAttribute('data-tile');
	if (bombs.includes(coordinate)) {
		endGame(tile);
	} else {
		/* есть ли поблизости бомба */
		let num = tile.getAttribute('data-num');
		if (num != null) {
			tile.classList.add('tile--checked');
			tile.innerHTML = num;
			tile.style.color = numberColors[num-1];
			setTimeout(() => {
				checkVictory();
			}, 100);
			return;
		}
		
		checkTile(tile, coordinate);
	}
	tile.classList.add('tile--checked');
}


/* Правильное нажатие */
const checkTile = (tile, coordinate) => {
	let coords = coordinate.split(',');
	let x = parseInt(coords[0]);
	let y = parseInt(coords[1]);
	
	/* Проверка соседних плиток */
	setTimeout(() => {
		if (x > 0) {
			let targetW = document.querySelectorAll(`[data-tile="${x-1},${y}"`)[0];
			clickTile(targetW, `${x-1},${y}`);
		}
		if (x < boardSize - 1) {
			let targetE = document.querySelectorAll(`[data-tile="${x+1},${y}"`)[0];
			clickTile(targetE, `${x+1},${y}`);
		}
		if (y > 0) {
			let targetN = document.querySelectorAll(`[data-tile="${x},${y-1}"]`)[0];
			clickTile(targetN, `${x},${y-1}`);
		}
		if (y < boardSize - 1) {
			let targetS = document.querySelectorAll(`[data-tile="${x},${y+1}"]`)[0];
			clickTile(targetS, `${x},${y+1}`);
		}
		
		if (x > 0 && y > 0) {
			let targetNW = document.querySelectorAll(`[data-tile="${x-1},${y-1}"`)[0];
			clickTile(targetNW, `${x-1},${y-1}`);
		}
		if (x < boardSize - 1 && y < boardSize - 1) {
			let targetSE = document.querySelectorAll(`[data-tile="${x+1},${y+1}"`)[0];
			clickTile(targetSE, `${x+1},${y+1}`);
		}
		
		if (y > 0 && x < boardSize - 1) {
			let targetNE = document.querySelectorAll(`[data-tile="${x+1},${y-1}"]`)[0];
			clickTile(targetNE, `${x+1},${y-1}`);
		}
		if (x > 0 && y < boardSize - 1) {
			let targetSW = document.querySelectorAll(`[data-tile="${x-1},${y+1}"`)[0];
			clickTile(targetSW, `${x-1},${y+1}`);
		}
	}, 10);
	
}


/* Нажата бомба. конец игры */
const endGame = (tile) => {
	endscreen.innerHTML = endscreenContent.loose;
	endscreen.classList.add('show');
	gameOver = true;
	tiles.forEach(tile => {
		let coordinate = tile.getAttribute('data-tile');
		if (bombs.includes(coordinate)) {
			tile.classList.remove('tile--flagged');
			tile.classList.remove('tile--marked');
			tile.classList.add('tile--checked', 'tile--bomb');
			tile.innerHTML = '💣';
		}
	});
	smile.classList.add('img_loose');
	smile.classList.remove('img_normal');
}

/* Выигрыш */
const checkVictory = () => {
	let win = true;
	tiles.forEach(tile => {
		let coordinate = tile.getAttribute('data-tile');
		if (!tile.classList.contains('tile--checked') && !bombs.includes(coordinate)) win = false;
	});
	if (win) {
		smile.classList.remove('img_normal');
		smile.classList.add('img_win');
		endscreen.innerHTML = endscreenContent.win;
		endscreen.classList.add('show');
		gameOver = true;
	}
}


/* запуск игры */
setup();

/* Новая игра */
restartBtn.addEventListener('click', function(e) {
	e.preventDefault();
	clear();
});