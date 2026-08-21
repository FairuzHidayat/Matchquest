const gameData = {
  algebra: [
    {q:"Sederhanakan: 3x + 5x − 2x", a:["5x","6x","7x","8x"], c:1},
    {q:"Jika 2x + 6 = 16, maka x = …", a:["4","5","6","8"], c:1},
    {q:"Hasil dari (x + 3)(x − 3) adalah …", a:["x² + 9","x² − 9","x² − 6x + 9","x² + 6x + 9"], c:1},
    {q:"Jika f(x)=2x+1, maka f(5)= …", a:["9","10","11","12"], c:2},
    {q:"Akar persamaan x² − 5x + 6 = 0 adalah …", a:["1 dan 6","2 dan 3","−2 dan −3","3 dan 5"], c:1}
  ],
  limit: [
    {q:"lim x→2 (x² − 4)/(x − 2) = …", a:["2","3","4","6"], c:2},
    {q:"lim x→3 (2x + 1) = …", a:["5","6","7","8"], c:2},
    {q:"lim x→0 sin(x)/x = …", a:["0","1","∞","Tidak ada"], c:1},
    {q:"lim x→1 (x³ − 1)/(x − 1) = …", a:["1","2","3","4"], c:2},
    {q:"lim x→∞ (3x²+1)/(x²−2) = …", a:["0","1","2","3"], c:3}
  ],
  geometry: [
    {q:"Luas segitiga dengan alas 12 cm dan tinggi 8 cm = …", a:["24","40","48","96"], c:2},
    {q:"Diagonal persegi sisi 6 cm adalah …", a:["6","6√2","12","18"], c:1},
    {q:"Volume kubus dengan rusuk 4 cm = …", a:["16","32","64","96"], c:2},
    {q:"Jumlah sudut dalam segitiga = …", a:["90°","180°","270°","360°"], c:1},
    {q:"Jika jari-jari lingkaran 7 cm, luasnya (π=22/7) = …", a:["44","88","154","308"], c:2}
  ]
};

const topicNames = {algebra:"ALJABAR", limit:"LIMIT", geometry:"GEOMETRI", mixed:"MIXED ARENA"};
const topicColors = {algebra:"#a995ff", limit:"#6fe7d7", geometry:"#ffcf6e", mixed:"#f4f5fb"};

let topic = "mixed";
let questions = [];
let qIndex = 0, score = 0, streak = 0, level = 1;
let gameRunning = false, answered = false, timer = 30, timerId = null;

const $ = id => document.getElementById(id);

function buildQuestionPool(mode){
  if(mode === "mixed"){
    // Ensure every round contains all three subjects
    const a = [...gameData.algebra].sort(()=>Math.random()-.5).slice(0,2).map(x=>({...x, topic:"algebra"}));
    const l = [...gameData.limit].sort(()=>Math.random()-.5).slice(0,2).map(x=>({...x, topic:"limit"}));
    const g = [...gameData.geometry].sort(()=>Math.random()-.5).slice(0,2).map(x=>({...x, topic:"geometry"}));
    return [...a,...l,...g].sort(()=>Math.random()-.5).slice(0,5);
  }
  return [...gameData[mode]].sort(()=>Math.random()-.5).slice(0,5).map(x=>({...x, topic:mode}));
}

function pickTopic(name){
  topic = name;
  document.querySelector("#challenge").scrollIntoView({behavior:"smooth"});
  startGame();
}

document.querySelectorAll(".topic-play").forEach(btn =>
  btn.addEventListener("click", ()=>pickTopic(btn.dataset.topic))
);

function startGame(){
  questions = buildQuestionPool(topic);
  qIndex=0; score=0; streak=0; timer=30; gameRunning=true; answered=false;
  $("xpValue").textContent=score;
  $("streakValue").textContent=streak;
  $("levelValue").textContent=level;
  $("gameTitle").textContent=`QUEST #001 · ${topicNames[topic]}`;
  $("startGame").disabled=true;
  $("nextQuestion").disabled=true;
  showQuestion();
  startTimer();
}

function startTimer(){
  clearInterval(timerId);
  timer=30;
  $("timeValue").textContent=timer;
  timerId=setInterval(()=>{
    timer--;
    $("timeValue").textContent=timer;
    if(timer<=0){
      clearInterval(timerId);
      endRound(true);
    }
  },1000);
}

function showQuestion(){
  answered=false;
  const item=questions[qIndex];
  $("gameTag").textContent=topicNames[item.topic];
  $("gameTag").style.color=topicColors[item.topic];
  $("gameTag").style.borderColor=topicColors[item.topic] + "55";
  $("questionTitle").textContent=`Question ${qIndex+1} / ${questions.length}`;
  $("questionText").textContent=`Materi: ${topicNames[item.topic]}. Pilih jawaban paling tepat.`;
  $("questionBox").textContent=item.q;

  const choices=$("choices");
  choices.innerHTML="";
  item.a.forEach((answer,i)=>{
    const btn=document.createElement("button");
    btn.className="choice";
    btn.textContent=answer;
    btn.addEventListener("click",()=>answerQuestion(i));
    choices.appendChild(btn);
  });
}

function answerQuestion(index){
  if(!gameRunning || answered) return;
  answered=true;

  const item=questions[qIndex];
  const buttons=[...document.querySelectorAll(".choice")];
  buttons.forEach(b=>b.disabled=true);
  buttons[item.c].classList.add("correct");

  if(index===item.c){
    streak++;
    const gained=100+(streak-1)*25;
    score+=gained;
    $("rewardText").textContent=`+${gained} XP · ${topicNames[item.topic]} benar`;
  }else{
    streak=0;
    buttons[index].classList.add("wrong");
    $("rewardText").textContent=`+0 XP · Jawaban ${topicNames[item.topic]} salah`;
  }

  level=Math.max(1,Math.floor(score/500)+1);
  $("xpValue").textContent=score;
  $("streakValue").textContent=streak;
  $("levelValue").textContent=level;
  $("heroScore").textContent=`${score} XP`;
  $("nextQuestion").disabled=false;
}

$("nextQuestion").addEventListener("click",()=>{
  if(!answered) return;
  qIndex++;
  if(qIndex>=questions.length) endRound(false);
  else {
    $("nextQuestion").disabled=true;
    showQuestion();
  }
});

$("startGame").addEventListener("click",startGame);

function endRound(timeUp){
  gameRunning=false;
  clearInterval(timerId);
  $("startGame").disabled=false;
  $("nextQuestion").disabled=true;

  $("resultModal").classList.add("show");
  $("resultTitle").textContent=timeUp ? "Waktu habis!" : "Quest complete!";
  $("resultScore").textContent=`${score} XP`;

  const seen=[...new Set(questions.map(q=>topicNames[q.topic]))].join(" · ");
  $("resultText").textContent=
    `Ronde ${topicNames[topic]} selesai. Materi yang diuji: ${seen}. `+
    `Kamu menyelesaikan ${Math.min(qIndex+1,questions.length)} soal dengan streak terakhir ${streak}.`;
}

$("closeModal").addEventListener("click",()=>$("resultModal").classList.remove("show"));
$("heroScore").textContent="0 XP";


document.querySelectorAll(".world-btn").forEach(btn => {
  btn.addEventListener("click", () => pickTopic(btn.dataset.topic));
});

// Mobile navigation
const mobileNavToggle = document.getElementById("mobileNavToggle");
const navLinks = document.getElementById("navLinks");

if (mobileNavToggle && navLinks) {
  mobileNavToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => navLinks.classList.remove("open"));
  });
}
