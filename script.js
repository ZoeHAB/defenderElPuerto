"use strict";

//Variables iniciales
//(me premiten reiniciar facilmente)

const initialSize = 5;
const initialBombs = initialSize * 3;
const scoreBoardSize = 10;

//Variables de control
//Pueden ir cambiando a lo largo del juego
let size, bombs, score;

//Iconos
const boatIcon = "⛵";
const waterIcon = "🌊";

//Elementos del DOM
const main = document.querySelector("main");
const scoreSpan = document.querySelector("#score");
const bombsSpan = document.querySelector("#bombs");
const modal = document.querySelector("#modal");
const scoreBoard = modal.querySelector("tbody");
const repeatButton = modal.querySelector("button");

//Creo el tablero en el scope global
const board = document.createElement("table");

//Esta función permite iniciar y reiniciar el juego
function play() {
  //Establezco las variables de control con los valores iniciales
  size = initialSize;
  bombs = initialBombs;
  score = 0;

  //Actualizo los textos
  scoreSpan.textContent = score;
  bombsSpan.textContent = bombs;

  //Me aseguro de que el modal está oculto
  modal.classList.add("closed");

  //Genero el tablero, le añado el evento (event delegation) y lo añado al DOM
  generateBoard();
  board.addEventListener("click", handleClick);

  main.append(board);
}

play();
repeatButton.addEventListener("click", play);

function generateBoard() {
  //Quito el tablero del DOM para modificarlo y borro su contenido
  board.remove();
  board.innerHTML = "";

  //Creo tantas filas como indique el tamaño
  for (let i = 0; i < size; i++) {
    let tr = document.createElement("tr");

    //Elijo una columna aleatoria para meter el barco (habra un barco por fila)
    let boatCell = Math.floor(Math.random() * size);

    //Creo tantas celdas como indica el size, el añado la clase y el texto que corresponda; y las añado a la fila
    for (let j = 0; j < size; j++) {
      let td = document.createElement("td");
      td.classList.add("hidden");

      td.textContent = j === boatCell ? boatIcon : waterIcon;

      tr.append(td);
    }

    //Añado la fila al tablero
    board.append(tr);
  }
}

//Función que controla el click con event delegation:
//El event listener lo tiene el padre para tener 1 en vez de 25. Dentro de la función comprobamos el target
function handleClick(e) {
  const { target } = e;

  //Si el elemento no tiene la clase hidden, paramos la función (no es una celda o ya se pulsó)
  if (!target.matches(".hidden")) {
    return;
  }

  //Quito la clase para que se vea
  target.classList.remove("hidden");

  //Si es un barco...
  if (target.textContent === boatIcon) {
    //Actualizamos la variable y el texto a la vez (el operador va DELANTE)
    scoreSpan.textContent = ++score;

    //Si se han encontrado todos los barcos se acaba el juego (siguiente version -> se avanza de nivel)
    if (score >= size) {
      setTimeout(gameOver, 100);
    }
  }

  //Actualizamos la variable y el texto a la vez (el operador va DELANTE)
  bombsSpan.textContent = --bombs;

  //Si no quedan bombas se acaba el juego
  if (bombs <= 0) {
    //Le añado un pequeño timeout para que le dé tiempo a refrescar el viewrport
    setTimeout(gameOver, 100);
  }
}

function gameOver() {
  //Quito el event listener al tablero para que no se pueda seguir jugando
  board.removeEventListener("click", handleClick);

  //Leo el ranking del localStorge o lo inicializo como array vacio (nullish coalescing ??)
  let ranking = JSON.parse(localStorage.getItem("ranking")) ?? [];

  //Miro cual es la puntuacion más baja o la establezco a 0 (para no añadir nuevas si no es necesario)
  let lowest = ranking[ranking.length - 1]?.score ?? 0;

  //Esta variable definirá al final si hay que guardar el ranking (hubo cambios) o no
  let update;

  //Si la puntuacion es más alta que la última, o quedan huecos, hay que actualizar el ranking
  if (score >= lowest || ranking.length < scoreBoardSize) {
    updateRanking(ranking);
    update = true;
  }

  //Vacio la tabla de puntuaciones
  scoreBoard.innerHTML = "";

  //Creo un fragment y voy metiendo cada fila
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < scoreBoardSize; i++) {
    let tr = document.createElement("tr");

    //Si la puntuacion tiene propiedad new a true, de añado la clase y le quito la propiedad para no guardarla
    //Para que no de errores uso optional chaining ?.
    if (ranking[i]?.new) {
      tr.classList.add("new");
      delete ranking[i].new;
    }

    //Relleno la fila con los datos adecuados. Si no hay, con guiones (nullish coalescing ??)
    //Para que no de errores uso optional chaining ?.
    tr.innerHTML = `
    <td>${ranking[i]?.name ?? "----"}</td>
    <td>${ranking[i]?.score ?? "----"}</td>
    `;

    fragment.append(tr);
  }

  scoreBoard.append(fragment);

  //Quito la clase al modal para que se vea
  modal.classList.remove("closed");

  //Si es necesario, actualizo el ranking en el localStorage
  if (update) {
    localStorage.setItem("ranking", JSON.stringify(ranking));
  }
}

function updateRanking(ranking) {
  //Pido el nombre con prompt y añado un nuevo objeto al array del ranking
  //La clave new me permitirá ponerle una clase para destacarla. Importante quitarla (o ponerla a false) antes de guardar en localStorage.
  const name = prompt("Introduce tu nombre");
  ranking.push({ score, name, new: true });

  //Ordeno de mayor a menor en base a la puntucaión y dejo solo las 10 primeras posiciones
  ranking.sort((a, b) => b.score - a.score);
  ranking.splice(10);
}
