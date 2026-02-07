import {
  finalizeCell,
  gameState, 
  STATE,
  setState,
    
  updateNumberButtons,
  updateCountState
} from "./index.js";

export const ui = {};//空のオブジェクト定義、関数でスタートメニューを内蔵する

//関数内でDOMを取得する
function initUI() {

  ui.board = document.querySelector('#board');
  ui.game = document.getElementById("game");

  ui.topMenu = document.querySelector("#top-menu");//各難易度とスタートボタン
  ui.difficultyBtns = document.querySelectorAll(".difficulty-btn");
  ui.startBtn = document.getElementById("start-btn");
  ui.retryBtns = document.querySelectorAll(".retry-btn");
  ui.homeBtns = document.querySelectorAll(".home-btn");

  ui.table = document.getElementById("sudoku");
  ui.panel = document.getElementById("number-panel");

  ui.overlayImage = document.getElementById("overlay-image");//オーバーレイ画像の表示
  ui.overlay = document.getElementById("overlay");
  ui.complete = document.getElementById("complete-screen");
  ui.gameover = document.getElementById("gameover-screen");

}


//ちびキャラクリックで照れモーション
let chibiLocked = false;
//状態に応じたヴィクトリアの表情表示(FSM従属)
function showVictoriaEmotion(type) {
  if (gameState.currentState !== STATE.PLAYING) return;
  //クリックで表示するちびきゃらgifを時限で変更する
  //正解不正解時に、表示するちびキャラgifを時限で変更する
  if (type === "correct") {
    //ここに表示するちびキャラのURLをいれる！
  }
}

//【FSM従属サブシステム】
function stopTimer() {
  clearInterval(gameState.timerInterval);
}


//【FSM従属サブシステム】
function updateTimer() {
  const now = Date.now();//現在の時間
  const elapsed = Math.floor((now - gameState.startTime) / 1000);//経過時間
  document.getElementById("timer").textContent = `経過時間:${elapsed}秒`;
}

//【演出】効果音再生（FSM従属）
function playSound(type) {
  switch(type) {
    case "correct":
    const correctSound = new Audio("sounds/correct.mp3");
      correctSound.play();
      break;

    case "incorrect":
      const incorrectSound = new Audio("sounds/incorrect.mp3");
      incorrectSound.play();
      break;

    case "clear":
      const clearSound = new Audio();
      clearSound.play();
      break;

    case "gameover":
      const gameoverSound = new Audio();
      gameoverSound.play();
      break;
  }
}

//【FEEDBACK】正解時の演出
function handleCorrect(cell) {                
  
  if (!cell) return;

  //正解セルを確定して編集不能にする
  cell.classList.remove("editable", "selected");//正解セルを固定化
  cell.classList.add("correct", "cell-correct");//正解セルにcorrect属性付与  

  //セル・数字を選択前の状態に戻す
  gameState.selectedCell = null;//盤面の選択解除
  gameState.selectedNum = null;//数字パネルの選択解除
  finalizeCell();//セルのイベントを解除して完全に操作できないようにする

  //★showCorrectGIF();//正解時の演出発火GIF作成の上イベント登録すること★

  /*正解演出のcorrectクラスを外すだけ
  setTimeout(() => {
    if (cell) cell.classList.remove("correct");
  }, 700);
  */
  playSound("correct");
  console.log("[TRACE] handleCorrect end");
}    


//incorrect付与と誤答数字の保存のみ
function handleIncorrect(cell, num) {
  console.log("handleIncorrect run");
  if (!cell) return;

  cell.classList.add("incorrect");//誤答cellにincorrect属性を付与する  
  cell.dataset.wrongNum = num;//誤答情報保存：セルに入れた誤答をカスタムデータ型で保存 
  playSound("incorrect");
}


//【FSM外】お手付き回数の減少を管理する関数-----------------------------
function updateLivesDisplay() {
  const livesDiv = document.getElementById("lives");//HTML上のライフの表示箇所の要素を取得
  livesDiv.innerHTML = "❤".repeat(gameState.lifePoints)+"🤍".repeat(gameState.maxLifePoint-gameState.lifePoints);
}

//【UI操作】セルの誤答状態を解除する
function removeIncorrects() {  
  document.querySelectorAll(".incorrect").forEach(cell => {
      //実際に使用した数字の情報を保存
    const wrongNum = parseInt(cell.dataset.wrongNum, 10);//←10進数を意味する。
        
    cell.classList.remove("incorrect");//incorrect除去
    cell.textContent = "";//セルに表示された誤答を消す
    delete cell.dataset.wrongNum;//誤答セル解除：明示的に消さないと残る

    //cell.classList.add("editable");//editable付与    
    updateCountState(wrongNum, +1);//数字増減をデータ上で更新
    updateNumberButtons();
    gameState.selectedNum = null;//数字の選択解除
    

  })
}

//【UI操作】クリックされたセルを選択状態にする
function addSelected(cell) {      
  gameState.selectedCell = cell;       
  cell.classList.add("selected");    
} 

//【UI操作】セルの選択を解除する関数
function removeSelected(){    
  if (gameState.selectedCell) {
    gameState.selectedCell.classList.remove("selected");
    gameState.selectedCell = null;
  }
}  

//【FSM外】トップへ戻る機能



//【RESULT】オーバーレイの表示...クリアかゲームオーバー画面を表示する
function showOverlay(type) {  

  ui.overlay.classList.remove("hidden");
  ui.complete.classList.add("hidden");
  ui.gameover.classList.add("hidden");

  //クリア、ゲームオーバーに応じてhiddenを除去
  if (type === "gameover") {
    ui.gameover.classList.remove("hidden");
  }
  
  else if (type === "complete") {
    ui.complete.classList.remove("hidden");
  } 
  else {
    console.warn("showOverlay: unknown type =", type);
  }
}


//ゲームオーバー演出機能---------------------------  

  //【RESULT】ゲームオーバー画面を表示、トップに戻る・リトライを選択させる
  function showGameover() {
    console.log("GAME OVER triggered")
    stopTimer();//タイマー停止
    gameState.lifePoints = gameState.maxLifePoint;//ライフ初期化
    updateLivesDisplay();
    //secectedCellからclassを除去
    if (gameState.selectedCell) {
      gameState.selectedCell.classList.remove("selected", "incorrect", "editable", "correct");
    }
    gameState.selectedCell = null;//セルの選択解除
    gameState.selectedNum = null;//数字の選択解除
    document.body.style.overflow = "hidden";
    showOverlay("gameover");//ゲームオーバーのオーバーレイ表示     
  };


//【RESULT】クリア演出機能-------------------
function showComplete() {
  console.log("CLEAR triggered")
  
  //クリア時のoverlayを表示させる
  stopTimer();//タイマー停止

  if (gameState.selectedCell) {
    gameState.selectedCell.classList.remove("selected", "incorrect", "editable", "correct");
  }
  gameState.selectedCell = null;//セルの選択解除
  gameState.selectedNum = null;//数字の選択解除
  document.body.style.overflow = "hidden";//画面をロック
  showOverlay("complete");//クリアのオーバーレイ表示 
}

export {  
  
  initUI,
  showVictoriaEmotion,
  playSound,
  handleCorrect,
  handleIncorrect,
  removeIncorrects,
  addSelected,
  removeSelected,
  stopTimer,
  updateTimer,
  showOverlay,
  showGameover,
  showComplete,
  updateLivesDisplay
};
