// ====== ELEMENTOS DEL DOM ======
const boardEl = document.getElementById('board');        // Contenedor del tablero de juego
const statusEl = document.getElementById('status');      // Mensaje de estado (turno, ganador, empate)
const restartBtn = document.getElementById('restartBtn');// Botón de reinicio
const modeBtn = document.getElementById('modeBtn');      // Cambiar entre 2 jugadores / modo IA
const lineIndicator = document.getElementById('lineIndicator'); // Línea visual cuando alguien gana

// ====== ESTADO DEL JUEGO ======
let board = Array(9).fill(null); // Representa las 9 celdas del tablero: null | 'X' | 'O'
let current = 'X';               // Jugador actual ('X' siempre empieza)
let running = true;              // Estado activo del juego
let twoPlayers = true;           // true = 2 jugadores, false = contra IA

// Todas las combinaciones posibles de victoria (filas, columnas, diagonales)
const wins = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

// ====== CREAR TABLERO ======
function createCells(){
  boardEl.innerHTML = ''; // Limpiar tablero anterior
  for(let i=0;i<9;i++){
    const cell = document.createElement('button');
    cell.className = 'cell';
    cell.dataset.index = i; // Guardar índice de la celda
    cell.setAttribute('aria-label', 'Celda ' + (i+1));
    // Eventos: clic o teclado
    cell.addEventListener('click', onCellClick);
    cell.addEventListener('keydown', onCellKey);
    boardEl.appendChild(cell);
  }
}

// ====== SOPORTE DE TECLADO ======
function onCellKey(e){
  const index = Number(this.dataset.index);
  // Enter o Space actúan como un clic en la celda
  if(e.key === 'Enter' || e.key === ' '){
    e.preventDefault(); this.click();
  }
  // Teclas 1–9 seleccionan la celda correspondiente
  if(/^[1-9]$/.test(e.key)){
    const keyIndex = Number(e.key) - 1;
    const target = boardEl.querySelector('[data-index="'+keyIndex+'"]');
    target && target.click();
  }
}

// ====== MANEJAR CLIC EN CELDA ======
function onCellClick(e){
  const idx = Number(this.dataset.index);
  // Ignorar si el juego terminó o la celda ya está llena
  if(!running || board[idx]) return;
  makeMove(idx, current);
  // Si está en modo IA y ahora es turno de O, dejar que la IA juegue
  if(running && !twoPlayers && current === 'O'){
    setTimeout(aiMove, 200); // Pequeño retraso para realismo
  }
}

// ====== REALIZAR MOVIMIENTO ======
function makeMove(idx, player){
  board[idx] = player; // Actualizar estado del tablero
  const cell = boardEl.querySelector('[data-index="'+idx+'"]');
  cell.textContent = player;             // Mostrar símbolo en la celda
  cell.classList.add(player.toLowerCase()); // Añadir clase de estilo (x/o)
  cell.classList.add('disabled');        // Deshabilitar celda
  checkGame();                           // Comprobar si hay victoria o empate
  if(running){
    // Cambiar turno
    current = current === 'X' ? 'O' : 'X';
    updateStatus();
  }
}

// ====== ACTUALIZAR MENSAJE DE ESTADO ======
function updateStatus(){
  statusEl.textContent = running ? ('Turno: ' + current) : statusEl.textContent;
}

// ====== COMPROBAR VICTORIA O EMPATE ======
function checkGame(){
  // Comprobar combinaciones ganadoras
  for(const comb of wins){
    const [a,b,c] = comb;
    if(board[a] && board[a] === board[b] && board[a] === board[c]){
      running = false;
      highlightWin(comb); // Resaltar celdas ganadoras
      statusEl.textContent = '🎉 ' + board[a] + ' gana!';
      return;
    }
  }
  // Comprobar empate (todas las celdas llenas y sin ganador)
  if(board.every(Boolean)){
    running = false;
    statusEl.textContent = 'Empate 🤝';
  }
}

// ====== RESALTAR COMBINACIÓN GANADORA ======
function highlightWin(comb){
  comb.forEach(i=>{
    const el = boardEl.querySelector('[data-index="'+i+'"]');
    // Efecto visual en las celdas ganadoras
    el.style.boxShadow = '0 8px 30px rgba(0,0,0,0.6), 0 0 0 4px rgba(255,255,255,0.02) inset';
  });
  // Mostrar línea animada
  lineIndicator.classList.add('show');
  setTimeout(()=> lineIndicator.classList.remove('show'), 1300);
}

// ====== MOVIMIENTO SIMPLE DE IA ======
function aiMove(){
  if(!running) return;
  // 1) Intentar ganar
  for(let i=0;i<9;i++) if(!board[i]){
    board[i] = 'O';
    if(isWinner('O')){ board[i] = null; return makeMove(i,'O'); }
    board[i] = null;
  }
  // 2) Bloquear al oponente
  for(let i=0;i<9;i++) if(!board[i]){
    board[i] = 'X';
    if(isWinner('X')){ board[i] = null; return makeMove(i,'O'); }
    board[i] = null;
  }
  // 3) Tomar el centro si está disponible
  if(!board[4]) return makeMove(4,'O');
  // 4) Tomar una esquina aleatoria si está disponible
  const corners = [0,2,6,8].filter(i=>!board[i]);
  if(corners.length) return makeMove(corners[Math.floor(Math.random()*corners.length)],'O');
  // 5) Si no, elegir cualquier celda disponible al azar
  const empties = board.map((v,i)=>v?null:i).filter(Number.isFinite);
  const pick = empties[Math.floor(Math.random()*empties.length)];
  pick !== undefined && makeMove(pick,'O');
}

// ====== COMPROBAR SI UN JUGADOR HA GANADO ======
function isWinner(player){
  return wins.some(([a,b,c]) => board[a]===player && board[b]===player && board[c]===player);
}

// ====== REINICIAR JUEGO ======
function restart(){
  board = Array(9).fill(null);
  current = 'X';
  running = true;
  createCells();
  updateStatus();
  lineIndicator.classList.remove('show');
  // Reiniciar estilos en todas las celdas
  document.querySelectorAll('.cell').forEach(c=> c.style.boxShadow = '');
}

// ====== EVENTOS ======
modeBtn.addEventListener('click', ()=>{
  // Cambiar entre 2 jugadores y modo IA
  twoPlayers = !twoPlayers;
  modeBtn.textContent = twoPlayers ? 'Modo: 2 jugadores' : 'Modo: vs IA (fácil)';
  restart();
});

restartBtn.addEventListener('click', restart);

// ====== INICIALIZAR JUEGO ======
createCells();
updateStatus();

// Extra: Atajo de teclado "0" para reiniciar el juego
window.addEventListener('keydown', (e)=>{
  if(e.key === '0') restart();
});
