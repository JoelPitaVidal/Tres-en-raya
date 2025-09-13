// ====== DOM ELEMENTS ======
const boardEl = document.getElementById('board');        // Game board container
const statusEl = document.getElementById('status');      // Status message (turn, winner, draw)
const restartBtn = document.getElementById('restartBtn');// Restart button
const modeBtn = document.getElementById('modeBtn');      // Switch between 2 players / AI mode
const lineIndicator = document.getElementById('lineIndicator'); // Visual line when someone wins

// ====== GAME STATE ======
let board = Array(9).fill(null); // Represents the 9 cells of the board: null | 'X' | 'O'
let current = 'X';               // Current player ('X' always starts)
let running = true;              // Game active state
let twoPlayers = true;           // true = 2 players, false = vs AI

// All possible winning combinations (rows, columns, diagonals)
const wins = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

// ====== CREATE BOARD ======
function createCells(){
  boardEl.innerHTML = ''; // Clear previous board
  for(let i=0;i<9;i++){
    const cell = document.createElement('button');
    cell.className = 'cell';
    cell.dataset.index = i; // Store cell index
    cell.setAttribute('aria-label', 'Cell ' + (i+1));
    // Events: click or keyboard input
    cell.addEventListener('click', onCellClick);
    cell.addEventListener('keydown', onCellKey);
    boardEl.appendChild(cell);
  }
}

// ====== KEYBOARD SUPPORT ======
function onCellKey(e){
  const index = Number(this.dataset.index);
  // Enter or Space acts like clicking the cell
  if(e.key === 'Enter' || e.key === ' '){
    e.preventDefault(); this.click();
  }
  // Keys 1–9 select the corresponding cell
  if(/^[1-9]$/.test(e.key)){
    const keyIndex = Number(e.key) - 1;
    const target = boardEl.querySelector('[data-index="'+keyIndex+'"]');
    target && target.click();
  }
}

// ====== HANDLE CELL CLICK ======
function onCellClick(e){
  const idx = Number(this.dataset.index);
  // Ignore if game ended or cell already filled
  if(!running || board[idx]) return;
  makeMove(idx, current);
  // If AI mode and it's now O's turn, let AI play
  if(running && !twoPlayers && current === 'O'){
    setTimeout(aiMove, 200); // Small delay for realism
  }
}

// ====== MAKE A MOVE ======
function makeMove(idx, player){
  board[idx] = player; // Update board state
  const cell = boardEl.querySelector('[data-index="'+idx+'"]');
  cell.textContent = player;             // Show symbol on the board
  cell.classList.add(player.toLowerCase()); // Add styling class (x/o)
  cell.classList.add('disabled');        // Disable cell
  checkGame();                           // Check if win/draw
  if(running){
    // Switch turn
    current = current === 'X' ? 'O' : 'X';
    updateStatus();
  }
}

// ====== UPDATE STATUS MESSAGE ======
function updateStatus(){
  statusEl.textContent = running ? ('Turn: ' + current) : statusEl.textContent;
}

// ====== CHECK WIN OR DRAW ======
function checkGame(){
  // Check winning combinations
  for(const comb of wins){
    const [a,b,c] = comb;
    if(board[a] && board[a] === board[b] && board[a] === board[c]){
      running = false;
      highlightWin(comb); // Highlight winning cells
      statusEl.textContent = '🎉 ' + board[a] + ' wins!';
      return;
    }
  }
  // Check draw (all cells filled and no winner)
  if(board.every(Boolean)){
    running = false;
    statusEl.textContent = 'Draw 🤝';
  }
}

// ====== HIGHLIGHT WINNING COMBINATION ======
function highlightWin(comb){
  comb.forEach(i=>{
    const el = boardEl.querySelector('[data-index="'+i+'"]');
    // Visual effect on winning cells
    el.style.boxShadow = '0 8px 30px rgba(0,0,0,0.6), 0 0 0 4px rgba(255,255,255,0.02) inset';
  });
  // Show animated line indicator
  lineIndicator.classList.add('show');
  setTimeout(()=> lineIndicator.classList.remove('show'), 1300);
}

// ====== SIMPLE AI MOVE ======
function aiMove(){
  if(!running) return;
  // 1) Try to win
  for(let i=0;i<9;i++) if(!board[i]){
    board[i] = 'O';
    if(isWinner('O')){ board[i] = null; return makeMove(i,'O'); }
    board[i] = null;
  }
  // 2) Block opponent
  for(let i=0;i<9;i++) if(!board[i]){
    board[i] = 'X';
    if(isWinner('X')){ board[i] = null; return makeMove(i,'O'); }
    board[i] = null;
  }
  // 3) Take center if available
  if(!board[4]) return makeMove(4,'O');
  // 4) Take a random corner if available
  const corners = [0,2,6,8].filter(i=>!board[i]);
  if(corners.length) return makeMove(corners[Math.floor(Math.random()*corners.length)],'O');
  // 5) Else, pick any random available cell
  const empties = board.map((v,i)=>v?null:i).filter(Number.isFinite);
  const pick = empties[Math.floor(Math.random()*empties.length)];
  pick !== undefined && makeMove(pick,'O');
}

// ====== CHECK IF PLAYER HAS WON ======
function isWinner(player){
  return wins.some(([a,b,c]) => board[a]===player && board[b]===player && board[c]===player);
}

// ====== RESTART GAME ======
function restart(){
  board = Array(9).fill(null);
  current = 'X';
  running = true;
  createCells();
  updateStatus();
  lineIndicator.classList.remove('show');
  // Reset styles on all cells
  document.querySelectorAll('.cell').forEach(c=> c.style.boxShadow = '');
}

// ====== EVENT LISTENERS ======
modeBtn.addEventListener('click', ()=>{
  // Switch between 2 players and AI mode
  twoPlayers = !twoPlayers;
  modeBtn.textContent = twoPlayers ? 'Mode: 2 players' : 'Mode: vs AI (easy)';
  restart();
});

restartBtn.addEventListener('click', restart);

// ====== INIT GAME ======
createCells();
updateStatus();

// Extra: Keyboard shortcut "0" to restart the game
window.addEventListener('keydown', (e)=>{
  if(e.key === '0') restart();
});
