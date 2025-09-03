// Tic Tac Toe with Two Modes + Adjustable AI Difficulty
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const modeRadios = document.querySelectorAll('input[name="mode"]');
const difficultyBox = document.getElementById('difficultyBox');
const difficultySelect = document.getElementById('difficulty');

let board = Array(9).fill('');
let currentPlayer = 'X';
let gameActive = true;
let vsAI = false;
let difficulty = 'hard'; // easy | medium | hard

const WIN_COMBOS = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function createBoard(){
  boardEl.innerHTML = '';
  board.forEach((val, idx) => {
    const cell = document.createElement('button');
    cell.className = 'cell' + (val ? ' taken' : '');
    cell.setAttribute('role','gridcell');
    cell.setAttribute('aria-label', `Cell ${idx+1}`);
    cell.dataset.index = idx;
    cell.textContent = val;
    cell.addEventListener('click', onCellClick, { once: true });
    boardEl.appendChild(cell);
  });
}

function onCellClick(e){
  const idx = Number(e.currentTarget.dataset.index);
  if(!gameActive || board[idx]) return;
  makeMove(idx, currentPlayer);

  if(vsAI && gameActive && currentPlayer === 'O'){
    setTimeout(aiTurn, 380); // small delay for UX
  }
}

function makeMove(idx, player){
  board[idx] = player;
  const btn = boardEl.querySelector(`[data-index="${idx}"]`);
  if(btn){
    btn.textContent = player;
    btn.classList.add('taken');
    btn.style.transform = 'scale(0.92)';
    requestAnimationFrame(() => { btn.style.transform = ''; });
  }

  const win = getWinningLine(board, player);
  if(win){
    highlightWin(win);
    statusEl.textContent = `🎉 Player ${player} wins!`;
    gameActive = false;
    return;
  }

  if(isFull(board)){
    statusEl.textContent = "😮 It's a Tie!";
    gameActive = false;
    return;
  }

  currentPlayer = player === 'X' ? 'O' : 'X';
  statusEl.textContent = vsAI && currentPlayer === 'O' ? "Computer's turn 🤖" : `Player ${currentPlayer}'s turn`;
}

function isFull(b){ return b.every(v => v); }

function getWinningLine(b, player){
  return WIN_COMBOS.find(line => line.every(i => b[i] === player)) || null;
}

function highlightWin(line){
  line.forEach(i => {
    const c = boardEl.querySelector(`[data-index="${i}"]`);
    if(c) c.classList.add('win');
  });
}

// ---------- AI ----------
function aiTurn(){
  let idx;
  if(difficulty === 'easy'){
    idx = randomMove(board);
  }else if(difficulty === 'medium'){
    // 50% optimal, 50% random
    idx = Math.random() < 0.5 ? bestMove(board, 'O') : randomMove(board);
  }else{
    idx = bestMove(board, 'O'); // hard
  }
  makeMove(idx, 'O');
}

function emptyIndices(b){
  const out = [];
  for(let i=0;i<9;i++) if(!b[i]) out.push(i);
  return out;
}

function randomMove(b){
  const avail = emptyIndices(b);
  return avail[Math.floor(Math.random()*avail.length)];
}

function bestMove(b, player){
  return minimax(b.slice(), player).index;
}

function minimax(b, player){
  const avail = emptyIndices(b);

  // terminal states relative to 'b'
  if(getWinningLine(b, 'X')) return { score: -10 };
  if(getWinningLine(b, 'O')) return { score: 10 };
  if(avail.length === 0)   return { score: 0 };

  const moves = [];
  for(const i of avail){
    const move = { index: i };
    b[i] = player;

    if(player === 'O'){
      move.score = minimax(b, 'X').score;
    }else{
      move.score = minimax(b, 'O').score;
    }

    b[i] = '';
    moves.push(move);
  }

  // choose best based on player
  if(player === 'O'){
    let bestScore = -Infinity, best = 0;
    for(let i=0;i<moves.length;i++){
      if(moves[i].score > bestScore){ bestScore = moves[i].score; best = i; }
    }
    return moves[best];
  }else{
    let bestScore = Infinity, best = 0;
    for(let i=0;i<moves.length;i++){
      if(moves[i].score < bestScore){ bestScore = moves[i].score; best = i; }
    }
    return moves[best];
  }
}

// ---------- Controls ----------
resetBtn.addEventListener('click', resetGame);

modeRadios.forEach(r => {
  r.addEventListener('change', (e) => {
    vsAI = e.target.value === 'ai';
    difficultyBox.style.display = vsAI ? 'flex' : 'none';
    difficultyBox.setAttribute('aria-hidden', String(!vsAI));
    resetGame();
  });
});

difficultySelect.addEventListener('change', (e) => {
  difficulty = e.target.value;
  // Don't reset progress abruptly; only affect AI's next choices
});

function resetGame(){
  board = Array(9).fill('');
  currentPlayer = 'X';
  gameActive = true;
  statusEl.textContent = "Player X's turn";
  createBoard();
}

// init
createBoard();
