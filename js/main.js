
/*====================
===== import =====
====================*/

import {
  cleanupPlaying,  
  initEvents,
  initUI,  
  STATE,
  addPlayingEvents,
  gameState,
  updateTimer
} from "./index.js";


/*====================
===== DOM読込時の処理 =====
====================*/

let prevState = null;

//DOM取得、
document.addEventListener("DOMContentLoaded", () => {
  initUI();//DOM取得と
  initEvents();//トップ画面のボタンのクリックイベント
});

//状態毎に関数を実行
function onStateChange() {
  const state = gameState.currentState;
  console.log("[ENTER]", prevState, "->", gameState.currentState);

  

  console.log("[TRACE] currentState =", gameState.currentState);
  console.log("[TRACE] STATE.PLAYING =", STATE.PLAYING);
  console.log("[TRACE] equals?", gameState.currentState === STATE.PLAYING);

  switch (state) {

    case STATE.READY:
      console.log("STATE READY");       
      break;

    case STATE.PLAYING:
      console.log("[SETUP] add events & timer");
      cleanupPlaying();

      gameState.startTime = Date.now();
      gameState.timerInterval = setInterval(updateTimer, 1000);      
      addPlayingEvents();
      break;
    
      case STATE.GAME_OVER:
      console.log("STATE CHANGED GAME_OVER");         
      break;
      
    case STATE.CLEARED:
      console.log("STATE CHANGED CLEARED");          
      break;  
  }
  prevState = gameState.currentState;
}



export {
  onStateChange
}