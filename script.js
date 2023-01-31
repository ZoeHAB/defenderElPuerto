"use strict";

//Variables iniciales

const initialSize = 5;
const initialBombs = initialSize * 3;
const scoreBoardSize = 10;

//Variables de control
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

const board = document.createElement("table");

function play() {
  size = initialSize;
  bombs = initialBombs;
  score = 0;

  scoreSpan.textContent = score;
  bombsSpan.textContent = bombs;

  modal.classList.add("closed");

  generateBoard();
  board.addEventListener("click", handleClick);

  main.append(board);
}

play();
repeatButton.addEventListener("click", play);

function generateBoard() {
  board.remove();
  board.innerHTML = "";

  for (let i = 0; i < size; i++) {
    let tr = document.createElement("tr");

    let boatCell = Math.floor(Math.random() * size);

    for (let j = 0; j < size; j++) {
      let td = document.createElement("td");
      td.classList.add("hidden");

      td.textContent = j === boatCell ? boatIcon : waterIcon;

      tr.append(td);
    }
    board.append(tr);
  }
}

function handleClick(e) {
  const { target } = e;

  //Si el elemento no tiene la clase hidden, paramos la función
  if (!target.matches(".hidden")) {
    return;
  }

  target.classList.remove("hidden");

  if (target.textContent === boatIcon) {
    //Actualizamos la variable y el texto a la vez (el operador va DELANTE)
    scoreSpan.textContent = ++score;

    if (score >= size) {
      setTimeout(gameOver, 100);
    }
  }

  //Actualizamos la variable y el texto a la vez (el operador va DELANTE)
  bombsSpan.textContent = --bombs;

  if (bombs <= 0) {
    setTimeout(gameOver, 100);
  }
}

function gameOver() {
  board.removeEventListener("click", handleClick);

  let ranking = JSON.parse(localStorage.getItem("ranking")) ?? [];

  let lowest = ranking[ranking.length - 1]?.score ?? 0;

  let update;

  if (score >= lowest || ranking.length < scoreBoardSize) {
    updateRanking(ranking);
    update = true;
  }

  scoreBoard.innerHTML = "";

  const fragment = document.createDocumentFragment();
  for (let i = 0; i < scoreBoardSize; i++) {
    let tr = document.createElement("tr");

    if (ranking[i]?.new) {
      tr.classList.add("new");
      delete ranking[i].new;
    }

    tr.innerHTML = `
    <td>${ranking[i]?.name ?? "----"}</td>
    <td>${ranking[i]?.score ?? "----"}</td>
    `;

    fragment.append(tr);
  }

  scoreBoard.append(fragment);

  modal.classList.remove("closed");

  if (update) {
    localStorage.setItem("ranking", JSON.stringify(ranking));
  }
}

function updateRanking(ranking) {
  const name = prompt("Introduce tu nombre");
  ranking.push({ score, name, new: true });

  ranking.sort((a, b) => b.score - a.score);

  ranking.splice(10);
}
