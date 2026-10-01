// ===== 設定 =====
const BASE_RATE = 150;          // 基準：1ドル＝150円
const MIN_RATE = 100;
const MAX_RATE = 200;
const TRAVEL_DOLLAR = 1000;     // 海外旅行で使うドル
const IMPORT_DOLLAR = 800;      // 輸入品のドル価格
const EXPORT_YEN = 3000000;     // 輸出品の日本円価格（300万円）

// ===== 画面の部品を取得 =====
const $ = (id) => document.getElementById(id);
const slider = $("rateSlider");

// 3桁カンマをつける
function comma(n) {
  return Math.round(n).toLocaleString("ja-JP");
}

// ラジオボタンで選ばれている値
function checkedValue(name) {
  return document.querySelector('input[name="' + name + '"]:checked').value;
}


// =====================================================
// モード切り替え（① まず触る ② 練習する ③ プリントを作る）
// =====================================================
const tabs = document.querySelectorAll(".tab");

function setMode(mode) {
  tabs.forEach((t) => {
    const on = t.dataset.mode === mode;
    t.classList.toggle("active", on);
    t.setAttribute("aria-selected", on ? "true" : "false");
  });
  document.querySelectorAll(".panel").forEach((p) => {
    p.hidden = p.id !== "panel-" + mode;
  });
  document.body.dataset.mode = mode; // 印刷のときに使う
}

tabs.forEach((t) => t.addEventListener("click", () => setMode(t.dataset.mode)));


// =====================================================
// ① まず触る
// =====================================================

// カード1枚を「基準 → 現在」で表示する
// key: "travel" など / unit: "円" か "ドル" / prefix: 結果の前に付ける言葉
function renderCard(key, before, after, unit, prefix) {
  const b = Math.round(before);
  const a = Math.round(after);
  const diff = a - b;

  $(key + "Before").textContent = comma(b) + unit;
  $(key + "After").textContent = comma(a) + unit;
  $(key + "Rate").textContent = slider.value + "円";

  const card = $(key + "Card");
  const result = $(key + "Result");

  if (diff === 0) {
    card.className = "card";
    result.className = "result";
    result.textContent = "基準と同じ";
    return;
  }

  const dir = diff > 0 ? "up" : "down";
  card.className = "card " + dir;
  result.className = "result " + dir;
  result.innerHTML =
    (prefix ? "<small>" + prefix + "</small><br>" : "") +
    (diff > 0 ? "⬆ " : "⬇ ") + comma(Math.abs(diff)) + unit +
    (diff > 0 ? " 高くなった" : " 安くなった");
}

// まとめの ○ / △ を表示
function setSummary(markId, good, textId, text) {
  const mark = $(markId);
  mark.textContent = good ? "○" : "△";
  mark.className = good ? "mark-good" : "mark-bad";
  $(textId).textContent = text;
}

// メインの更新処理（スライダーやボタンを動かすたびに呼ばれる）
function update() {
  const rate = Number(slider.value);
  const gap = rate - BASE_RATE;  // マイナスなら円高、プラスなら円安

  // 現在のレート
  $("rateValue").textContent = rate;
  slider.setAttribute("aria-valuetext", "1ドル" + rate + "円");

  // 150円と比べて円高・円安
  const judge = $("judge");
  const note = $("judgeNote");
  if (gap < 0) {
    judge.innerHTML = "<small>" + Math.abs(gap) + "円</small>円高";
    judge.className = "judge judge-high";
    note.innerHTML = "1ドルを買うのに必要な円が <b>" + Math.abs(gap) + "円少ない</b><br>→ 円の力が強い";
  } else if (gap > 0) {
    judge.innerHTML = "<small>" + gap + "円</small>円安";
    judge.className = "judge judge-low";
    note.innerHTML = "1ドルを買うのに必要な円が <b>" + gap + "円多い</b><br>→ 円の力が弱い";
  } else {
    judge.textContent = "基準と同じ";
    judge.className = "judge judge-base";
    note.innerHTML = "スライダーかボタンで、<br>レートを変えてみよう";
  }

  // プリセットボタンの「選ばれている」表示
  document.querySelectorAll(".preset").forEach((b) => {
    b.setAttribute("aria-pressed", Number(b.dataset.rate) === rate ? "true" : "false");
  });

  // A 海外旅行：1,000ドル × レート
  renderCard("travel", TRAVEL_DOLLAR * BASE_RATE, TRAVEL_DOLLAR * rate, "円", "");
  // B 輸入品：800ドル × レート
  renderCard("import", IMPORT_DOLLAR * BASE_RATE, IMPORT_DOLLAR * rate, "円", "");
  // C 輸出：3,000,000円 ÷ レート
  renderCard("export", EXPORT_YEN / BASE_RATE, EXPORT_YEN / rate, "ドル", "海外から見ると");

  // まとめ
  const table = $("summaryTable");
  const legend = $("summaryLegend");
  if (gap < 0) {
    $("summaryTitle").textContent = "150円と比べて円高になると…";
    setSummary("sumTravel", true, "sumTravelText", "旅行代が安くなる");
    setSummary("sumImport", true, "sumImportText", "輸入品が安くなりやすい");
    setSummary("sumExport", false, "sumExportText", "海外から見た価格が高くなりやすい（価格面では不利）");
    table.hidden = false;
    legend.hidden = false;
  } else if (gap > 0) {
    $("summaryTitle").textContent = "150円と比べて円安になると…";
    setSummary("sumTravel", false, "sumTravelText", "旅行代が高くなる");
    setSummary("sumImport", false, "sumImportText", "輸入品が高くなりやすい");
    setSummary("sumExport", true, "sumExportText", "海外から見た価格が安くなりやすい（価格面では有利）");
    table.hidden = false;
    legend.hidden = false;
  } else {
    $("summaryTitle").textContent = "レートを動かしてみよう";
    table.hidden = true;
    legend.hidden = true;
  }
}

// レートを指定の値にする（範囲外にならないように）
function setRate(value) {
  slider.value = Math.min(MAX_RATE, Math.max(MIN_RATE, value));
  update();
}

slider.addEventListener("input", update);
$("btnMinus").addEventListener("click", () => setRate(Number(slider.value) - 1));
$("btnPlus").addEventListener("click", () => setRate(Number(slider.value) + 1));
document.querySelectorAll(".preset").forEach((b) => {
  b.addEventListener("click", () => setRate(Number(b.dataset.rate)));
});


// =====================================================
// ② 練習する：ミニ確認問題（3問）
// =====================================================
document.querySelectorAll(".q").forEach((q) => {
  const answer = q.dataset.answer;
  const feedback = q.querySelector(".feedback");
  const buttons = q.querySelectorAll(".choices button");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // 色をいったんリセット
      buttons.forEach((b) => b.classList.remove("correct", "wrong"));

      const isCorrect = btn.textContent === answer;
      btn.classList.add(isCorrect ? "correct" : "wrong");

      if (isCorrect) {
        feedback.innerHTML = '<span class="ok">⭕ 正解！</span> ' + feedback.dataset.explain;
      } else {
        feedback.innerHTML = '<span class="ng">❌ ざんねん。</span> 正解は「' + answer + "」。" + feedback.dataset.explain;
      }
    });
  });
});


// =====================================================
// 問題を自動で作る（練習とプリントの両方で使う）
// =====================================================

// ----- 小さな道具 -----
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (list) => list[rand(0, list.length - 1)];
const shuffle = (list) => list.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((v) => v[1]);

// 100円〜200円の間で、5円きざみのレート
function randomRate() {
  return rand(20, 40) * 5;
}

// 「○円から△円になった」の2つのレート（標準用：150円以外から始まることもある）
function twoRates() {
  let from, to;
  do {
    from = Math.random() < 0.3 ? BASE_RATE : randomRate();
    to = randomRate();
  } while (Math.abs(from - to) < 10);
  return [from, to];
}

// 基本問題で使うレート（授業のボタンと同じ、きりのいい数字）
const BASIC_RATES = [100, 120, 180, 200];

// 立場の問題で使うデータ（likes＝その立場に有利になりやすい方）
const ROLES = [
  { name: "海外旅行に行く日本人", likes: "円高", why: "少ない円でドルが買えるので、旅行代が安くなりやすい。" },
  { name: "海外から商品を輸入する会社", likes: "円高", why: "輸入品の円での値段が安くなりやすい。" },
  { name: "海外へ商品を輸出する会社", likes: "円安", why: "海外から見た価格が安くなりやすく、価格面では有利になりやすい。" },
  { name: "日本に来る外国人観光客", likes: "円安", why: "外国のお金で多くの円が手に入り、日本での旅行や買い物が安くなりやすい。" }
];

const LIFE_CASES = [
  { who: "輸入小麦でパンを作るパン屋さん", likes: "円高", why: "小麦を輸入しているので、円高だと材料費が安くなりやすい。" },
  { who: "アメリカに車を売る自動車会社", likes: "円安", why: "円安だとアメリカから見た車の価格が安くなりやすく、価格面では有利になりやすい。" },
  { who: "アメリカに留学する予定の高校生", likes: "円高", why: "学費や生活費をドルで払うので、円高だと必要な円が少なくてすむ。" },
  { who: "外国人観光客がたくさん来るお土産屋さん", likes: "円安", why: "円安だと外国人にとって日本での買い物が割安になり、お客さんが増えやすい。" },
  { who: "海外製のゲーム機を買いたい人", likes: "円高", why: "輸入品なので、円高だと値段が下がりやすい。" },
  { who: "日本のアニメグッズを海外のネットで売る会社", likes: "円安", why: "円安だと海外の人から見た価格が安くなりやすく、価格面では有利になりやすい。" },
  { who: "輸入した牛肉を使う焼肉店", likes: "円高", why: "牛肉を輸入しているので、円高だと仕入れが安くなりやすい。" },
  { who: "車でガソリンをよく使う人", likes: "円高", why: "ガソリンの原料（原油）は輸入なので、円高だとガソリン代が下がりやすい。" }
];

const IMPORT_GOODS = [
  { name: "海外製のスニーカー", dollars: [80, 100, 120, 150] },
  { name: "海外製のゲーム機", dollars: [300, 400, 500] },
  { name: "輸入家具", dollars: [800, 1000, 1500] }
];

const EXPORT_GOODS = ["自動車", "工作機械", "産業用ロボット"];

// 計算問題のまちがい選択肢を作る
function makeChoices(correct, candidates, unit) {
  const wrong = shuffle(
    [...new Set(candidates.map(Math.round))].filter((v) => v > 0 && v !== correct)
  ).slice(0, 3);
  return shuffle([correct, ...wrong]).map((v) => comma(v) + unit);
}

// ----- 問題を1つ作る -----
// type: "judge" / "calc" / "effect" / "life"
// level: "basic"（基本） / "standard"（標準）
// 返す形：{ text, hint, choices, answer, explain, blankUnit }
//   blankUnit があれば、プリントでは「答え：＿＿＿円」の書きこみ式にする
function makeQuestion(type, level) {
  const basic = level === "basic";

  // ----- 円高・円安の判定 -----
  if (type === "judge") {
    let from, to;
    if (basic) {
      from = BASE_RATE;
      to = pick(BASIC_RATES.concat([110, 130, 140, 160, 170, 190]));
    } else {
      [from, to] = twoRates();
    }
    const high = to < from;
    const gap = Math.abs(from - to);
    const word = high ? "円高" : "円安";
    return {
      text: "1ドル＝" + from + "円 から 1ドル＝" + to + "円 になった。" + (basic ? "150円と比べて" : "前と比べて") + " 円高？ 円安？",
      hint: basic ? "" : "ヒント：150円ではなく、前のレート（" + from + "円）と比べよう",
      choices: ["円高", "円安"],
      answer: word,
      explain: "前の" + from + "円と比べて、1ドルを買うのに必要な円が" + gap + "円" +
        (high ? "少なくなった → 円の力が強くなった。" : "多くなった → 円の力が弱くなった。") + "だから" + word + "。"
    };
  }

  // ----- 旅行・輸入・輸出の金額 -----
  if (type === "calc") {
    const kind = pick(["travel", "import", "export"]);

    // 基本：計算はせず「高くなる？安くなる？」を考える
    if (basic) {
      const to = pick(BASIC_RATES);
      const high = to < BASE_RATE;
      const word = high ? "円高" : "円安";
      const head = "1ドル＝150円 から " + to + "円 になった（" + word + "）。";

      if (kind === "export") {
        // 360万円なら、100〜200円のどのレートでも割り切れる
        const yen = 3600000;
        const ans = high ? "高くなる" : "安くなる";
        return {
          text: head + "日本の" + pick(EXPORT_GOODS) + "（360万円）を輸出する。海外から見たドルの値段は？",
          hint: "",
          choices: ["高くなる", "安くなる"],
          answer: ans,
          explain: word + "なので、同じ360万円でもドルにすると" + (high ? "多く" : "少なく") + "なる。（" +
            comma(yen / BASE_RATE) + "ドル → " + comma(yen / to) + "ドル）海外から見た価格が" + ans + "。"
        };
      }

      let dollars, what;
      if (kind === "travel") {
        dollars = 1000;
        what = "アメリカ旅行（1,000ドル）の費用は、日本円で見ると？";
      } else {
        const g = pick(IMPORT_GOODS);
        dollars = pick(g.dollars);
        what = g.name + "（" + comma(dollars) + "ドル）を輸入すると、日本円での値段は？";
      }
      const ans = high ? "安くなる" : "高くなる";
      return {
        text: head + what,
        hint: "",
        choices: ["高くなる", "安くなる"],
        answer: ans,
        explain: word + "なので、1ドルに必要な円が" + (high ? "少ない" : "多い") + "。（" +
          comma(dollars * BASE_RATE) + "円 → " + comma(dollars * to) + "円）だから" + ans + "。"
      };
    }

    // 標準：金額を計算する
    const rate = rand(10, 20) * 10; // 100〜200円、10円きざみ

    if (kind === "export") {
      const dollars = pick([10000, 15000, 20000, 25000, 30000]);
      const yen = dollars * rate;
      return {
        text: "日本の会社が " + comma(yen / 10000) + "万円 の" + pick(EXPORT_GOODS) + "を輸出する。1ドル＝" + rate + "円のとき、海外から見たドル価格は？",
        hint: "ヒント：円 ÷ 1ドルの円",
        choices: makeChoices(dollars, [dollars * 10, dollars / 10, yen / BASE_RATE, dollars + 5000, dollars - 5000], "ドル"),
        answer: comma(dollars) + "ドル",
        explain: comma(yen) + "円 ÷ " + rate + "円 ＝ " + comma(dollars) + "ドル",
        blankUnit: "ドル"
      };
    }

    let dollars, what;
    if (kind === "travel") {
      dollars = pick([300, 500, 800, 1000, 1200, 1500, 2000]);
      what = "アメリカ旅行で " + comma(dollars) + "ドル 使うと";
    } else {
      const g = pick(IMPORT_GOODS);
      dollars = pick(g.dollars);
      what = g.name + "（" + comma(dollars) + "ドル）を輸入すると";
    }
    const yen = dollars * rate;
    return {
      text: "1ドル＝" + rate + "円のとき、" + what + "、日本円でいくら？",
      hint: "ヒント：ドル × 1ドルの円",
      choices: makeChoices(yen, [yen * 10, yen / 10, dollars * (rate + 10), dollars * (rate - 10), dollars * BASE_RATE], "円"),
      answer: comma(yen) + "円",
      explain: comma(dollars) + "ドル × " + rate + "円 ＝ " + comma(yen) + "円",
      blankUnit: "円"
    };
  }

  // ----- 影響を考える（有利？不利？） -----
  if (type === "effect") {
    // 5回に1回くらい「どちらがいつでも良い？」を出す
    if (Math.random() < 0.2) {
      return {
        text: "円高と円安は、どちらがいつでも良い？",
        hint: "",
        choices: ["円高", "円安", "立場によって違う"],
        answer: "立場によって違う",
        explain: "旅行する人や輸入する会社には円高、輸出する会社には円安が、価格面で有利になりやすい。"
      };
    }
    const role = pick(ROLES);
    const dir = pick(["円高", "円安"]);
    const good = dir === role.likes;
    return {
      text: dir + "になると、「" + role.name + "」にとって 有利？ 不利？",
      hint: "",
      choices: ["有利になりやすい", "不利になりやすい"],
      answer: good ? "有利になりやすい" : "不利になりやすい",
      explain: role.name + "は、" + role.likes + "が有利になりやすい。" + role.likes + "だと" + role.why
    };
  }

  // ----- 生活の例で考える -----
  const c = pick(LIFE_CASES);
  const answerOf = (dir) => (dir === c.likes ? "有利になりやすい" : "不利になりやすい");
  const reason = "「" + c.who + "」は" + c.likes + "が有利になりやすい。" + c.why;

  if (basic) {
    const dir = pick(["円高", "円安"]);
    return {
      text: dir + "になると、「" + c.who + "」にとって 有利？ 不利？",
      hint: "",
      choices: ["有利になりやすい", "不利になりやすい"],
      answer: answerOf(dir),
      explain: reason
    };
  }

  const [from, to] = twoRates();
  const dir = to < from ? "円高" : "円安";
  return {
    text: "1ドル＝" + from + "円 から " + to + "円 になった。「" + c.who + "」にとって 有利？ 不利？",
    hint: "ヒント：まず円高か円安かを考えよう",
    choices: ["有利になりやすい", "不利になりやすい"],
    answer: answerOf(dir),
    explain: from + "円→" + to + "円は" + dir + "。" + reason
  };
}

// 「すべて」のときは種類をランダムに選ぶ
function makeQuestionOf(selected, level) {
  const type = selected === "all" ? pick(["judge", "calc", "effect", "life"]) : selected;
  return makeQuestion(type, level);
}


// =====================================================
// ② 練習する：自動で出る問題
// =====================================================
const practice = { solved: 0, correct: 0, lastText: "", level: "basic", type: "all" };

function showPractice() {
  let q;
  do {
    q = makeQuestionOf(practice.type, practice.level);
  } while (q.text === practice.lastText); // 同じ問題が続かないように
  practice.lastText = q.text;

  $("practiceBox").hidden = false;
  $("practiceText").textContent = q.text;
  $("practiceHint").textContent = q.hint;
  $("practiceFeedback").innerHTML = "";
  $("btnNext").hidden = true;
  $("practiceCount").textContent = practice.solved === 0
    ? "練習中"
    : practice.solved + "問中 " + practice.correct + "問正解";

  const box = $("practiceChoices");
  box.innerHTML = "";
  q.choices.forEach((label) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    btn.addEventListener("click", () => answerPractice(q, btn));
    box.appendChild(btn);
  });
}

function answerPractice(q, clicked) {
  const buttons = $("practiceChoices").querySelectorAll("button");
  const isCorrect = clicked.textContent === q.answer;

  // 1回答えたら、ボタンは押せなくする（正解のボタンは緑にする）
  buttons.forEach((b) => {
    b.disabled = true;
    if (b.textContent === q.answer) b.classList.add("correct");
  });
  if (!isCorrect) clicked.classList.add("wrong");

  practice.solved++;
  if (isCorrect) practice.correct++;
  $("practiceCount").textContent = practice.solved + "問中 " + practice.correct + "問正解";

  $("practiceFeedback").innerHTML = isCorrect
    ? '<span class="ok">⭕ 正解！</span> ' + q.explain
    : '<span class="ng">❌ ざんねん。</span> 正解は「' + q.answer + "」。" + q.explain;

  $("btnNext").hidden = false;
  $("btnNext").focus();
}

$("btnPractice").addEventListener("click", () => {
  practice.solved = 0;
  practice.correct = 0;
  practice.level = checkedValue("practiceLevel");
  practice.type = $("practiceType").value;
  showPractice();
  $("practiceBox").scrollIntoView({ behavior: "smooth", block: "nearest" });
});
$("btnNext").addEventListener("click", showPractice);


// =====================================================
// ③ プリントを作る（5問 / 10問 ＋ 解答・解説）
// =====================================================
const TYPE_NAMES = { judge: "円高・円安の判定", calc: "旅行・輸入・輸出の金額", effect: "影響を考える", life: "生活の例で考える" };
const LEVEL_NAMES = { basic: "基本", standard: "標準" };

// 出題の組み合わせ（「すべて」のとき）
const SHEET_PLANS = {
  5: ["judge", "calc", "effect", "life", "life"],
  10: ["judge", "judge", "calc", "calc", "calc", "effect", "effect", "life", "life", "life"]
};

function makeSheetQuestions(selected, level, count) {
  const plan = selected === "all" ? SHEET_PLANS[count] : Array(count).fill(selected);

  const list = [];
  plan.forEach((type) => {
    let q, tries = 0;
    do {
      q = makeQuestion(type, level);
      tries++;
    } while (list.some((x) => x.text === q.text) && tries < 30); // 同じ問題をさける
    list.push(q);
  });
  return list;
}

function escapeHtml(s) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function buildSheet() {
  const selected = $("printType").value;
  const level = checkedValue("printLevel");
  const count = Number(checkedValue("printCount"));
  const qs = makeSheetQuestions(selected, level, count);

  const range = selected === "all" ? "" : TYPE_NAMES[selected] + "・";
  const subtitle = "（" + range + LEVEL_NAMES[level] + "・" + count + "問）";

  let html =
    '<h2 class="sheet-title">円高・円安 自習プリント' + subtitle + "</h2>" +
    '<p class="sheet-name">　　年　　組　　番　名前＿＿＿＿＿＿＿＿＿＿＿＿</p>' +
    '<ol class="sheet-list">';

  qs.forEach((q) => {
    html += "<li><p>" + escapeHtml(q.text) + "</p>";
    if (q.hint) html += '<p class="sheet-hint">' + escapeHtml(q.hint) + "</p>";
    if (q.blankUnit) {
      html += '<p class="sheet-blank">答え：＿＿＿＿＿＿＿＿＿＿ ' + q.blankUnit + "</p>";
    } else {
      html += '<p class="sheet-choice">（ ' + q.choices.map(escapeHtml).join(" ・ ") + " ）に○をつけよう</p>";
    }
    html += "</li>";
  });
  html += "</ol>";

  html += '<div class="answer-page"><h2 class="sheet-title">解答と解説' + subtitle + '</h2><ol class="sheet-list answers">';
  qs.forEach((q) => {
    html += "<li><b>" + escapeHtml(q.answer) + "</b><br>" + escapeHtml(q.explain) + "</li>";
  });
  html += '</ol><p class="sheet-point">円高・円安は、立場によってメリットとデメリットが違う</p>' +
    '<p class="sheet-note">実際の価格は為替以外の要因にも影響されます。この教材では為替だけを変化させています。</p></div>';

  $("printSheet").innerHTML = html;
  $("printArea").hidden = false;
}

$("btnPrint").addEventListener("click", () => {
  buildSheet();
  $("printArea").scrollIntoView({ behavior: "smooth" });
});
$("btnRemake").addEventListener("click", buildSheet);
$("btnDoPrint").addEventListener("click", () => window.print());


// ===== 最初の表示 =====
setMode("touch");
update();
