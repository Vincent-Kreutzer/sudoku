import {
  removePlayingEvents,
  onStateChange
} from "./index.js"

/* 状態定義(FSM=状態管理)以下3種
READY
  トップメニュー表示
  難易度選択OK
  START押せる
  盤面操作は不可（＝イベント付けない）

PLAYING
  盤面操作OK（セル/数字）
  タイマー動く

LOCKED
  演出中・クリア画面・ゲームオーバー画面
  盤面操作は不可（入力させない）
*/


const STATE = {
  READY: "READY",
  PLAYING: "PLAYING",
  GAME_OVER: "GAME_OVER",  
  CLEARED: "CLEARED"  
};

const DIFFICULTY_SETTINGS = {
  easy: 10,
  normal: 25,
  hard: 35,
};


const gameState = {
  currentState: STATE.READY, //現在の状態
  
  board: [],
  selectedCell: null,
  selectedNum: null,

  lifePoints: 3,
  maxLifePoint: 3,
  startTime: Date.now(),
  timerInterval: null,

  difficulty: "normal", //難易度の初期値
  numToHide: 20, //空白セルの数
  clearCount: 0,

  counts : {1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0},

};

//状態変更を行う⇒状態毎に異なる処理を実行させる(onStateChange())
function setState(state) {
  console.log("[TRACE] setState ->",state);
  gameState.currentState = state;
  gameState.nextState = state;
  onStateChange();
}

//状態毎の設定を初期化する
function cleanupPlaying() {
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = null;    
  }
  removePlayingEvents();
}



export {
  STATE,
  DIFFICULTY_SETTINGS,
  gameState, 
  cleanupPlaying,
  setState,
};