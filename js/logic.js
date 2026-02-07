import {
  ui,    
  STATE,
  gameState,  
  handleCorrect, 
  handleIncorrect,
  handleCellClick, 
  playSound, 
  stopTimer,
  setNumberButtonEvents,
  setState,
  showComplete,
  showGameover,
  updateLivesDisplay,
} from "./index.js";


/*========================= 
===== ゲーム盤面作成 =====
=========================*/

function initBoard() {
    gameState.board = Array.from({ length: 9 }, (_, row) =>
      Array.from({ length: 9 }, (_, col) => ({
        value: 0,
        block: Math.floor(row / 3) * 3 + Math.floor(col / 3)
      }))
    );
    
  };

//-----【FSM外】9x9のセルを作る -----
function createBoardHTML() {
  //テーブル自動作成のforループ
  ui.table.innerHTML = "";
  for (let row=0; row<9; row++) {
    
    //外側ループで各行を作成
    const tr = document.createElement("tr");
    tr.classList.add("rows");

    //内側ループで各行内のセルを作成
    for (let col=0; col<9; col++) {
      const td = document.createElement("td");

      //各セルにID(0~8)付与:カウンター変数の変動する値を入れて行列番号を入れる
      td.id = `cell-${row}-${col}`;

      //データ属性（ブロック番号:0~8）で、各セルが各セルが属するブロックを計算する                 
      //行を3で割り（切捨）、それに3を掛ける⇒上中下いずれかに分けるために0,3,6になる必要がある。
      //列を3で割る（切捨）ことで、左中右のいずれかのブロックに分けられる。     
      //⇒この行列番号を足すことで、割り振ったブロック番号に導くことが出来る。
      const block = Math.floor(row/3)*3 + Math.floor(col/3);
      td.dataset.block = block;      
            
      //各td要素をHTML上に実際に追加
      tr.appendChild(td);
    }//内側ループ

    //各tr要素をHTML上に実際に追加
    ui.table.appendChild(tr);
  }//外側forループ
}//createBoardHTML()ここまで-----------------------------------


//-----【FSM外】各セルの縦横番号を元に数字を割り振って表示する-----
function renderBoard() {
  for (let row=0; row<9; row++) {
    for (let col=0; col<9; col++) {
      const cell = document.getElementById(`cell-${row}-${col}`);
      cell.textContent = gameState.board[row][col].value === 0 ? "" : gameState.board[row][col].value;
    }
  }
}//renderBoard()ここまで-----------------------------------------


//【FSM外】ナンバーパネルの再描画（更新）関数----------------------
function updateNumberButtons() {
  const panel = document.getElementById("number-panel");//ナンバーパネルの情報を取得
  panel.innerHTML = ""; //一度全部削除

  for (let num = 1; num <= 9; num++) {
    //countsオブジェクトから各ナンバーを取得(繰り返し回数がそのままナンバーとして使用される)
    const count = gameState.counts[num];
    //ボタン要素を作成する
    const btn = document.createElement("button")
    //ボタンの文字列の表示形式を指定する（ナンバーとその残数）
    btn.innerHTML = `${num}<sup>${count}</sup>`;
    //クラスを付与する
    btn.classList.add("num-btn");
    //属性値を設定する
    btn.setAttribute("data-number", num);
    //数値パネルの残数が0なら非表示にする
    if (count === 0) btn.disabled = true;
      //実際にHTML上に表示する
      panel.appendChild(btn);
  }              

    //数字ボタンの再描画後、イベントを再登録
    setNumberButtonEvents();
}//updataNumberButtonsここまで-----------------------------


//【FSM外】Fisher-Yatesシャッフル法（セルの並べ替え）------------------
function shuffle(array) {
  for (let i = array.length - 1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}//shuffle()ここまで------------------------------------------------


//【FSM外】値の合法チェック---------------------------------------------------
function isSafe(row,col,num) {
         
  //行チェック（ある行だけを確認するため、確認したい行を抽出して新しい配列を作る）
  const targetRow = gameState.board[row].map(cell=>cell.value);
  if (targetRow.includes(num)) return false;
          
          
  //列チェック（boardから繰返し処理で同列の値を取得して新しい列を作り、確認）
  const targetCol = gameState.board.map(r=>r[col].value);
  if (targetCol.includes(num)) return false;
          
  //ブロックチェック:ある行列のブロックナンバーを取得
  const blockNum = Math.floor(row / 3) * 3 + Math.floor(col / 3);
  const blockValues = [];          
          
  //2重ループで各セルに対する処理を実行
  //ある行列のセルのブロックナンバーが対象と同じであるとき、
    
  for (let i=0;i<9;i++) {
    for (let j=0;j<9;j++) {
      if (gameState.board[i][j].block === blockNum) {
        blockValues.push(gameState.board[i][j].value);
      }
    }
  }
    
  //同ブロック内のセルに対象と同じ数字があれば、falseを返す
  if (blockValues.includes(num)) return false;
  return true;
}//isSafe()ここまで------------------------------------------


//【FSM外】solve()再起バックトラックで盤面完成--------------------------------
function solve() {
  for (let row=0;row<9;row++) {
    for (let col=0; col<9; col++) {
      //もしセルの値が0なら、
      if (gameState.board[row][col].value === 0) {
        let numbers = shuffle([1,2,3,4,5,6,7,8,9]);
        for (let num of numbers) {
          if (isSafe(row,col,num)) {
            gameState.board[row][col].value = num;
            if (solve()) return true;
            gameState.board[row][col].value = 0; //バックトラック
          }//isSafe()のif文
        }//num of numbersのfor文
        return false; //どの数字もなければfalseを返す
      }//boardのif文
    }//colのif文
  }//rowのif文
  return true; //全部埋めたらtrue
}//solve()ここまで--------------------------------------------


/* ================
===== 問題作成 =====
===================*/

//【FSM外】makePuzzle():空白マス作成、editable化-----------------------------------
function makePuzzle() {  

  //まずcountsを初期化
  for (let i = 1; i <= 9; i++) {
    gameState.counts[i] = 0;
  }
  
  const allCells = [];//81個のセル全てを入れる配列
       
  const solutionBoard = [];//正解盤面用に二次元配列を作成

  //盤面のランダム化、81個のセルを取得してまとめて配列に入れる。
  for (let row=0; row<9; row++) {
    for (let col=0; col<9; col++) {
      //allCellsに全セルのHTML要素を入れてセル情報を取得する
      allCells.push(document.getElementById(`cell-${row}-${col}`))              
    };//内ループ
  };//外ループ
            
  //上の処理で一纏めにしたセル群をシャッフルして別の配列に入れる
  const shuffledCells = shuffle(allCells);            
            
  //シャッフルしたセルを正解盤面の配列に入れる（＝盤面のランダム化）
  for (let row=0; row<9; row++) {
    //大ループで9つの一次配列を作る。
    solutionBoard[row] = [];
    //小ループで二次配列としてシャッフルしたセルを入れる
    for (let col=0; col<9; col++) {
      solutionBoard[row][col] = shuffledCells[row][col]
    }
  }

  //その中から最初のx個（難易度別問題数）を空白にし、別に答えとして保管
  for (let i=0; i<gameState.numToHide; i++) {
    //シャッフルされたセルを先頭から問題の数だけ取り出す。
    const cell = shuffledCells[i];             
    //さらにそのセルから答えとなる数字をint型で取り出す。              
    const answer = Number(cell.innerText);              
              
    //セルに必要なデータを与える。
    //答えとなる数字をカスタムデータ化してセルに持たせる
    cell.dataset.answer = answer;              
    //選択肢である数字の個数を増やす
    gameState.counts[answer]++;//カウントだけ更新、値の保存無し              
    //セルのテキストを空白にする
    cell.innerText = "";
    //問題セルにeditable属性を加えてクリックできるようにする
    cell.classList.add("editable");    
  }
  //問題盤面作成ここまで

  //数字パネルに出現数を表示する            
  //まずパネル表示箇所のHTML要素を取得する

  //ループ処理で非表示の数字だけを表示させる
  for (let num=0; num<9; num++) {
    //countsオブジェクトの中身を取り出していく
    const count = gameState.counts[num];
    //各数字の値が入っているなら（＝問題化されているなら）、
    if (count > 0) {
    //HTML上にボタンを作成する
      const btn = document.createElement("button");

      //数字+上付きで出現数を表示する
      btn.innerHTML = `${num}<sup>${count}</sup>`;
      //btnにクラスを付与する
      btn.classList.add("num-btn")
      //btnにカスタムデータを付与する
      btn.setAttribute("data-number", num);
             
      //HTML上に実際に上記の要素を追加する
      ui.panel.appendChild(btn);
    }            
  }
}
//makePuzzle()ここまで---------------------------------------



//【ゲームロジック】

//セルを固定化するためにイベント処理をできなくする
function finalizeCell(cell) { cell => {
  cell.removeEventListener("click", handleCellClick);
}
}

//正解カウントをリセットする
function initializeCorrect() {
  gameState.correctCount = 0;
}

//正解時に正解カウントを⁺1する
function accumulateCorrect() {
  gameState.correctCount++;
}

//【ゲームロジック】セルと数字の個別正誤判定（クリア/ゲームオーバーの判定なし）
function checkAndConfirm() {  
  console.log(
  "[check and confirm]",
  "cell:", gameState.selectedCell,
  "num", gameState.selectedNum
);
  if (gameState.currentState !== STATE.PLAYING) return;

  //入力チェック：selectedCellとselectedNumが揃っているか
  if (gameState.selectedCell && gameState.selectedNum !== null) {

    //正解データ取得：選択セルの持つ正解数字を代入しておく
    const correct = gameState.selectedCell.dataset.answer;

    console.log(
      "[COMPARE]",
      "selectedNum =", gameState.selectedNum,
      typeof gameState.selectedNum,
      "correct =", correct,
      typeof correct
    );

    //UI反映（仮入力）：選択数字をselectedCellへ⇒ユーザーが選択した数字を見せる
    gameState.selectedCell.textContent = gameState.selectedNum;
    
    //使用した数字を減らし、且つ表示に反映する    
    updateCountState(gameState.selectedNum, -1);//使用した数字をデータ上減らす      
    updateNumberButtons();//数字残基の表示を更新する    

    
    //正誤判定〇：handleCorrect実行
    if (gameState.selectedNum === parseInt(correct)) {     
            
      handleCorrect(gameState.selectedCell); 
      accumulateCorrect();//正解数置き場に+1する
      notifyTurnResult("correct");                  

      
    //正誤判定：回答が不正解の場合
    } else {      
      /*incorrect付与、誤答数字そのまま表示wrongNum保存、ライフ減少、効果音鳴らす*/
      handleIncorrect(gameState.selectedCell, gameState.selectedNum);
      //updateCountState(gameState.selectedNum, +1);
      decrementLifeAndUpdateUI();       
      updateLivesDisplay();
      notifyTurnResult("incorrect");
      
    }
  }  //checkAndConform()ここまで
}

//個別の正解不正解の判定からクリア・ゲームオーバーを判定する
function notifyTurnResult(result) {
  if (gameState.currentState !== STATE.PLAYING) return;

   //結果が不正解の処理
  if (result === "incorrect") {
    //ライフが0の時の処理
    if (gameState.lifePoints === 0) {
      setState(STATE.GAME_OVER);
      showGameover(); 
      return;     
    }
  }  

  //結果が正解の処理
  if (result === "correct") {
    //盤面が完成した時の処理
    if (isPuzzleComplete()) {
      setState(STATE.CLEARED);
      showComplete();
      return;
    }  
  } 
}


//【FSM外】全マスが埋まっているかを確認する----------------------
  function isPuzzleComplete() {        
    
    if (gameState.currentState !== STATE.PLAYING) return;

    for (const cell of document.querySelectorAll("td")) {
      //editable(操作可能)かincorrect(間違い)のセルがあればfalseを返す
      if (
        cell.classList.contains("editable") ||
        cell.classList.contains("incorrect")
      ) return false;
    }  
    return true;//全セルが埋まっていたらtrueを返す、ここまでが責務  
  }


//【ロジック/UI】ライフ減少、表示に反映(FSM非依存)
function decrementLifeAndUpdateUI(){
  gameState.lifePoints--;
  updateLivesDisplay();        
}  

//ユーザーの操作に応じてナンバーパネルの数字を更新する。
  //【ロジック/UI】数字残基の更新（FSM非依存）
function updateCountState(num, delta) {
//関数停止条件:対象ナンバーが空の場合に減算は出来ない
if (delta < 0 && gameState.counts[num] === 0) return;
//それ以外の場合に対象ナンバーを増減する
gameState.counts[num] += delta;
updateNumberButtons();
}




export {
  checkAndConfirm,
  createBoardHTML,
  decrementLifeAndUpdateUI,
  finalizeCell,
  initBoard,
  initializeCorrect,
  isPuzzleComplete,
  makePuzzle,
  notifyTurnResult,
  renderBoard,  
  solve, 
  updateCountState,
  updateNumberButtons
  
}