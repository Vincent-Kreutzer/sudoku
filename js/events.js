import { 
  addSelected, 
  checkAndConfirm,
  createBoardHTML,
  DIFFICULTY_SETTINGS,
  gameState,
  initializeCorrect,
  initBoard,  
  makePuzzle,
  removeIncorrects, 
  removeSelected, 
  renderBoard,
  STATE,
  setState,  
  solve,
  showChibiChara,  
  ui, 
  updateLivesDisplay,
  updateNumberButtons,
  updateTimer,

 } from "./index.js";



/*=========================
===== ゲームスタート機能 =====
=========================*/


//トップ画面でのボタン操作イベント
function initEvents() {
  //ここにHTML要素の取得とイベント付与のみ行う
    
  ui.difficultyBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      
      clickDifficultyBtn(btn);
    })
  });

  ui.startBtn.addEventListener("click", clickStartBtn);

  ui.retryBtns.forEach(btn => {
    btn.addEventListener("click", restartGame)
  });

  ui.homeBtns.forEach(btn => {
    btn.addEventListener("click", backToTop);
  });

}//initEventsここまで

  

//スタートボタンイベント⇒クリックで画面表示切り替え、盤面作成、状態をPLAYINGに変える。
function clickStartBtn() {  
    console.log("topContent:", ui.topContent);
    console.log("game:", ui.game);
    console.log("START clicked");
    console.log("state before:", gameState.currentState);
      
    if (gameState.currentState !== STATE.READY) return;
      
      ui.topContent.classList.add("hidden");//トップメニュー非表示
      ui.game.classList.remove("hidden");//ゲーム画面表示
      ui.startBtn.classList.remove("blink");//スタートボタンの点滅停止
      
      showChibiChara("idle");
      initBoard();
      createBoardHTML();
      solve();
      renderBoard();
      makePuzzle();
      setEditableCells();
      updateLivesDisplay();     
      updateNumberButtons();  
      

      setState(STATE.PLAYING);//状態をPLAYINGへ
      initializeCorrect();//正解数を初期化
} 
  

  
function clickDifficultyBtn(btn) {

  if (gameState.currentState !== STATE.READY) {
    console.log("difficulty ignored, state:", gameState.currentState);
    return;  
  }
  ui.difficultyBtns.forEach(b => {
    b.classList.remove("selected");
  });

  btn.classList.add("selected");
  const level = btn.dataset.difficulty;//クリックしたボタンの難易度を取得

  gameState.difficulty = level;//gameState内の難易度に↑を反映
  gameState.numToHide = DIFFICULTY_SETTINGS[level];//gameState内の問題数に反映

  //UI(btn);//ゲーム盤面に反映

  console.log(
  "[DIFF]",
  gameState.difficulty,
  gameState.numToHide
);

}


  function restartGame() {  
  clearInterval(gameState.timerInterval);//タイマーリセット
  //セル全体の状態解除
  document.querySelectorAll("td").forEach(cell => {
      cell.classList.remove("selected", "incorrect", "editable", "correct");
      cell.textContent = ""
  });

  //オーバーレイを閉じる処理
  ui.overlay.classList.add("hidden");
  ui.complete.classList.add("hidden");
  ui.gameover.classList.add("hidden");

  gameState.lifePoints = gameState.maxLifePoint;//ライフ快復
  updateLivesDisplay();//ライフポイント残数のUI更新
  initializeCorrect();//正解した問題数をリセット

  //選択状態解除
  if (gameState.selectedCell) {
    gameState.selectedCell.classList.remove("selected", "incorrect", "editable", "correct");
  }

  //セルと数字の選択解除
  gameState.selectedCell = null;
  gameState.selectedNum = null;
      
  //タイマーリセット
  document.getElementById("timer").textContent = "経過時間：0秒";
  gameState.startTime = Date.now();    
  gameState.timerInterval = setInterval(updateTimer, 1000);

  //ゲーム画面を表示(トップから来た場合)
  ui.topContent.classList.add("hidden");
   ui.game.classList.remove("hidden");

  //盤面作り直し
  initBoard();
  createBoardHTML();
  solve();
  renderBoard();
  makePuzzle();
  setEditableCells();
  updateLivesDisplay;
  updateNumberButtons();//ナンバーパネルUI更新
  

  //背景スクロール解除
  document.body.style.overflow = "auto";   
  
  setState(STATE.PLAYING);
  initializeCorrect();
  console.log("RESET clicked");
}


function backToTop() {   
  
  //オーバーレイを閉じる処理
  ui.overlay.classList.add("hidden");//overlay隠す
  ui.complete.classList.add("hidden");
  ui.gameover.classList.add("hidden");  
  ui.game.classList.add("hidden");//ゲーム画面隠す
  ui.topContent.classList.remove("hidden");//トップメニュー表示
  ui.difficultyBtns.forEach(btn => btn.classList.remove("selected"));
  document.body.style.overflow = "auto";//クリア・ゲームオーバーで固定したスクロールを復活


  clearInterval(gameState.timerInterval);//タイマーリセット
  //セル全体の状態解除
    document.querySelectorAll("td").forEach(cell => {
        cell.classList.remove("selected", "incorrect", "editable", "correct");
        cell.textContent = ""
    });

  //バックエンド初期化
  gameState.lifePoints = gameState.maxLifePoint;//ライフ快復
  updateLivesDisplay();//ライフポイント残数のUI更新
  initializeCorrect();//正解した問題数をリセット
  //選択状態解除
  if (gameState.selectedCell) {
    gameState.selectedCell.classList.remove("selected", "incorrect", "editable", "correct");
  }
  
  gameState.selectedCell = null;//セルの選択解除
  gameState.selectedNum = null;//数字の選択解除
      
  //タイマーリセット
  document.getElementById("timer").textContent = "経過時間：0秒";
  gameState.startTime = Date.now();    
  gameState.timerInterval = setInterval(updateTimer, 1000);

  //盤面作り直し
  initBoard();
  createBoardHTML();
  solve();
  renderBoard();
  makePuzzle();
  setEditableCells();
  updateLivesDisplay;
  updateNumberButtons();//ナンバーパネルUI更新
  

  setState(STATE.READY);
  initializeCorrect();
  console.log("BACK TO TOP clicked");
}//backToTopここまで






//incorrectとselectedを除去、付与は無し
function handleCellClick(e) {
  if (gameState.currentState !== STATE.PLAYING) return;//関数の発動条件
  
   const cell = e.currentTarget;
  if (!cell.classList.contains("editable")) return;
  console.log("handleCellClick fired", e.currentTarget.id);

  removeIncorrects();//不正解状態解除
  removeSelected();//セルの選択解除

  addSelected(e.currentTarget);//クリックしたセルを選択状態にする
}


function handleNumClick(e) {
  console.log(
  "NUM CLICK",
  "state:", gameState.currentState,
  "selectedCell:", gameState.selectedCell,
  "selectedNum(before):", gameState.selectedNum
  );

  const btn = e.currentTarget;

  if (gameState.currentState !== STATE.PLAYING) return;//関数の発動条件
  gameState.selectedNum = Number(btn.dataset.number);//selectedNum更新
  checkAndConfirm();
}


//セル・ナンバーパネルクリック時のイベント登録
function addPlayingEvents() {  
  console.log("[trace] addPlayingEvents");
  //セルクリック時
  document.querySelectorAll(".editable, .incorrect").forEach(cell => {
    cell.addEventListener("click", handleCellClick);
  });

  //ナンバーパネルクリック時
  document.querySelectorAll(".num-btn").forEach(btn => {
    btn.addEventListener("click", handleNumClick)   
  });
}

//セル・ナンバーパネルクリック時のイベント解除
function removePlayingEvents(e) {
  document.querySelectorAll(".editable, .incorrect").forEach(cell => {
    cell.removeEventListener("click", handleCellClick);
  });

  document.querySelectorAll(".num-btn").forEach(btn => {
    btn.removeEventListener("click", handleNumClick);
  });
}

//盤面上の編集可能セルをリセットする
function setEditableCells() {
  //if (gameState.currentState !== STATE.PLAYING) return;
  //.editable要素をもつセルに処理をする
  document.querySelectorAll(".editable, .incorrect").forEach(cell=> {              
    
    cell.classList.remove("incorrect");
    delete cell.dataset.wrongNum;

       
  });
} //function setEditableCellsここまで--------------


//ナンバーパネルにイベント付与⇒handleNumClick実行
function setNumberButtonEvents() {
  document.querySelectorAll(".num-btn").forEach(btn=> {
    btn.addEventListener("click", handleNumClick);       
  });            
}//setNumberButtonEventsここまで--------------------------


//難易度選択機能




function onChibiClick() {
  if (gameState.currentState !== STATE.PLAYING) return;//状態playing中のみにイベント限定
  if (chibiLocked) return;//ちびキャラがすでにロック状態なら何もしない
  console.log("state:", currentState);
  chibiLocked = true;//ロックする
  playShyMotion();//照れモーション実行

  setTimeout(() => {
    chibiLocked = false;
  }, 600);
}


/*==================================
=====【FSM外】ゲームリセット機能 =====
===================================*/



   

//=========================================


export {
  
  backToTop,
  addPlayingEvents,
  clickDifficultyBtn,
  handleCellClick,
  initEvents, 
  onChibiClick,
  restartGame,  
  removePlayingEvents,
  setNumberButtonEvents
  
};