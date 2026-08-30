/* ============================================================
   DXビンゴラリー - JavaScript 完全統合版
   （PDF 1〜13枚の内容をすべて統合）
============================================================ */

/* ------------------------------------------------------------
   ビンゴマスのデータ
------------------------------------------------------------ */
const bingoData = [
    { icon: "🤖", title: "AI検査", desc: "AIによる画像検査技術" },
    { icon: "🏭", title: "工場DX", desc: "スマートファクトリー化" },
    { icon: "🔧", title: "設備保全", desc: "予兆検知と自動保守" },

    { icon: "📡", title: "IoT連携", desc: "センサー情報の統合管理" },
    { icon: "⭐", title: "FREE", desc: "中央は無料スタンプ", free: true },
    { icon: "🛡️", title: "品質保証", desc: "データで品質を守る" },

    { icon: "🧪", title: "材料分析", desc: "化学分析とデータ管理" },
    { icon: "📦", title: "物流DX", desc: "自動搬送と最適化" },
    { icon: "🌱", title: "環境技術", desc: "CO2削減と省エネ" }
];

/* ------------------------------------------------------------
   ビンゴ成立ライン（横3・縦3・斜め2）
------------------------------------------------------------ */
const bingoLines = [
    [0,1,2], [3,4,5], [6,7,8],   // 横
    [0,3,6], [1,4,7], [2,5,8],   // 縦
    [0,4,8], [2,4,6]             // 斜め
];

/* ------------------------------------------------------------
   状態管理
------------------------------------------------------------ */
let stamped = new Set();
// ★保存データを復元する
const saved = localStorage.getItem("stamped");
if (saved) {
    stamped = new Set(JSON.parse(saved));
}

let bingoCount = 0;

/* ------------------------------------------------------------
   初期化処理
------------------------------------------------------------ */
function init() {
    const grid = document.getElementById("bingoGrid");
    grid.innerHTML = "";

    bingoData.forEach((cell, index) => {
        const div = document.createElement("div");
        div.className = "bingo-cell";

        // ★ここを追加する（QRコード用のID）
        div.dataset.id = index + 1;  
        // 既存の index は内部処理用にそのまま残す
        div.dataset.index = index;


        if (cell.free) {
            div.classList.add("free");
            stamped.add(index);
        }
       // ★保存されたスタンプ状態を反映する
　　　　if (stamped.has(index)) {
    　　　　div.classList.add("stamped");
　　　　}


        div.innerHTML = `
            <div class="cell-icon">${cell.icon}</div>
            <div class="cell-title">${cell.title}</div>
            <div class="cell-desc">${cell.desc}</div>
            <div class="stamp-badge">✔</div>
        `;

        div.addEventListener("click", () => toggleStamp(index));
        div.addEventListener("click", () => showContentModal(index));

        grid.appendChild(div);
    });

    updateUI();
}
// ★スタンプ状態を保存する
localStorage.setItem("stamped", JSON.stringify([...stamped]));

// URLパラメータから id を取得して該当マスを開く
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (id) {
    const targetCell = document.querySelector(`.bingo-cell[data-id='${id}']`);
    if (targetCell) {

        // ★内部状態も更新する（これが重要）
        const index = Number(id) - 1;
        stamped.add(index);
　　　　// ★保存する
　　　　localStorage.setItem("stamped", JSON.stringify([...stamped]));

        // 見た目も更新
        targetCell.classList.add("stamped");

        // ★これが抜けていた（ビンゴ判定とUI更新）
        checkBingo();
        updateUI();
    }
}

/* ------------------------------------------------------------
   スタンプ ON/OFF
------------------------------------------------------------ */
function toggleStamp(index) {
    const cell = document.querySelector(`.bingo-cell[data-index="${index}"]`);

    if (bingoData[index].free) return;

    if (stamped.has(index)) {
        stamped.delete(index);
        cell.classList.remove("stamped");
    } else {
        stamped.add(index);
        cell.classList.add("stamped");
    }

    checkBingo();
    updateUI();
}

/* ------------------------------------------------------------
   モーダル表示（マス説明）
------------------------------------------------------------ */
function showContentModal(index) {
    const cell = bingoData[index];
    if (cell.free) return;

    document.getElementById("modalIcon").textContent = cell.icon;
    document.getElementById("modalTitle").textContent = cell.title;
    document.getElementById("modalDesc").textContent = cell.desc;

    document.getElementById("modalOverlay").classList.add("active");
}

function closeModal() {
    document.getElementById("modalOverlay").classList.remove("active");
}

/* ------------------------------------------------------------
   ビンゴ判定
------------------------------------------------------------ */
function checkBingo() {
    let newBingo = 0;

    document.querySelectorAll(".bingo-cell").forEach(c => {
        c.classList.remove("bingo-line");
    });

    bingoLines.forEach(line => {
        if (line.every(i => stamped.has(i))) {
            newBingo++;
            line.forEach(i => {
                document.querySelector(`.bingo-cell[data-index="${i}"]`)
                    .classList.add("bingo-line");
            });
        }
    });

    if (newBingo > bingoCount) {
        bingoCount = newBingo;
        showCelebration();
        showBingoModal(newBingo);
    }

    updatePrizes();
}

/* ------------------------------------------------------------
   ビンゴ達成モーダル
------------------------------------------------------------ */
function showBingoModal(count) {
    document.getElementById("modalIcon").textContent = "🎉";
    document.getElementById("modalTitle").textContent = "ビンゴ達成！";
    document.getElementById("modalDesc").textContent = `ビンゴが ${count} 列達成されました！`;

    document.getElementById("modalOverlay").classList.add("active");
}

/* ------------------------------------------------------------
   紙吹雪演出
------------------------------------------------------------ */
function showCelebration() {
    const area = document.getElementById("celebration");

    for (let i = 0; i < 50; i++) {
        const c = document.createElement("div");
        c.className = "confetti";
        c.style.left = Math.random() * 100 + "%";
        c.style.setProperty("--hue", Math.random());
        area.appendChild(c);

        setTimeout(() => c.remove(), 4000);
    }
}

/* ------------------------------------------------------------
   UI更新（スタンプ数・ビンゴ数・ドット）
------------------------------------------------------------ */
function updateUI() {
    document.getElementById("stampCount").textContent = stamped.size;
    document.getElementById("bingoCount").textContent = bingoCount;

    const dots = document.getElementById("bingoDots");
    dots.innerHTML = "";

    for (let i = 0; i < 3; i++) {
        const d = document.createElement("div");
        d.className = "bingo-dot";
        if (i < bingoCount) d.classList.add("active");
        dots.appendChild(d);
    }
}

/* ------------------------------------------------------------
   景品アンロック
------------------------------------------------------------ */
function updatePrizes() {
    const prizeList = document.getElementById("prizeList");

    const prizes = [
        { icon: "🎨", name: "ステッカー", desc: "1列達成でもらえる！", need: 1 },
        { icon: "📁", name: "クリアファイル", desc: "2列達成でもらえる！", need: 2 },
        { icon: "🎁", name: "ミニグッズ", desc: "3列達成でもらえる！", need: 3 },
        { icon: "⭐", name: "特製グッズセット", desc: "コンプリート達成！", need: 4 }
    ];

    prizeList.innerHTML = "";

    prizes.forEach(p => {
        const div = document.createElement("div");
        div.className = "prize-item";

        if (bingoCount >= p.need) {
            div.classList.add("achieved");
        } else {
            div.classList.add("locked");
        }

        div.innerHTML = `
            <div class="prize-icon">${p.icon}</div>
            <div class="prize-info">
                <div class="prize-name">${p.name}</div>
                <div class="prize-desc">${p.desc}</div>
            </div>
            <div class="prize-check">${bingoCount >= p.need ? "✔" : "…"}</div>
        `;

        prizeList.appendChild(div);
    });
}

/* ------------------------------------------------------------
   リセット処理
------------------------------------------------------------ */
function resetBingo() {
    if (!confirm("ビンゴをリセットしますか？")) return;

    stamped.clear();
    bingoCount = 0;

    init();
}

/* ------------------------------------------------------------
   モーダル外クリックで閉じる
------------------------------------------------------------ */
document.getElementById("modalOverlay").addEventListener("click", function(e) {
    if (e.target === this) closeModal();
});

/* ------------------------------------------------------------
   ページ読み込み時に初期化
------------------------------------------------------------ */
init();  // ← まずマスを作る

// ★そのあとで URLパラメータ処理を実行する
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (id) {
    const targetCell = document.querySelector(`.bingo-cell[data-id='${id}']`);
    if (targetCell) {
        const index = Number(id) - 1;
        stamped.add(index);
        targetCell.classList.add("stamped");
        checkBingo();
        updateUI();
    }
}

