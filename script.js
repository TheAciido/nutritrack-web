// --- ESTADO GLOBAL ---
let perfil = JSON.parse(localStorage.getItem('nt_perfil')) || null;
let historial = JSON.parse(localStorage.getItem('nt_historial')) || [];
let xp = parseInt(localStorage.getItem('nt_xp')) || 0;
let exerciseIndex = 0;

const rutinas = {
  perder: ["Burpees", "Zancadas Salto", "Mountain Climbers", "Flexiones Explosivas"],
  mantener: ["Dominadas", "Sentadilla Copa", "Press Militar", "Plancha Lateral"],
  ganar: ["Sentadilla Barra", "Press de Banca", "Peso Muerto", "Remo con Barra"]
};

const alimentos = [
  { n: "Bowl Salmón & Aguacate", c: 540, p: 35, e: "🥗" },
  { n: "Pollo con Arroz Jazmín", c: 610, p: 42, e: "🍛" },
  { n: "Tacos de Ternera Fit", c: 450, p: 28, e: "🌮" },
  { n: "Tortilla Proteica", c: 320, p: 25, e: "🍳" }
];

// --- INICIO ---
window.onload = () => {
  if (perfil) {
    document.getElementById('onboarding').style.display = 'none';
    actualizarTodo();
  }
};

function configurarTodo() {
  const edad = document.getElementById('user-age').value;
  const peso = document.getElementById('user-weight').value;
  const actividad = document.getElementById('user-activity').value;
  const objetivo = document.getElementById('user-goal').value;

  if(!edad || !peso) return alert("Rellena los datos básicos");

  let tmb = (10 * peso) + (6.25 * 175) - (5 * edad) + 5;
  let meta = Math.round(tmb * actividad);
  if(objetivo === 'perder') meta -= 400;
  if(objetivo === 'ganar') meta += 400;

  perfil = { meta, objetivo, peso };
  localStorage.setItem('nt_perfil', JSON.stringify(perfil));
  
  document.getElementById('onboarding').style.opacity = '0';
  setTimeout(() => {
    document.getElementById('onboarding').style.display = 'none';
    actualizarTodo();
  }, 500);
}

// --- GIMNASIO ---
function registrarEntreno() {
  const w = document.getElementById('lift-weight').value;
  const r = document.getElementById('lift-reps').value;
  if(!w || !r) return;

  const puntos = Math.round((w * r) / 8);
  const ex = rutinas[perfil.objetivo][exerciseIndex];
  
  xp += puntos;
  exerciseIndex = (exerciseIndex + 1) % rutinas[perfil.objetivo].length;

  historial.unshift({ type: 'GYM', name: ex, val: `${w}kg x ${r}`, sub: `+${puntos} XP`, emoji: "💪", color: "text-blue-400" });
  
  localStorage.setItem('nt_xp', xp);
  localStorage.setItem('nt_historial', JSON.stringify(historial));
  
  actualizarTodo();
  document.getElementById('lift-weight').value = "";
  document.getElementById('lift-reps').value = "";
}

// --- IA ---
document.getElementById('btn-ia').onclick = function() {
  const btn = this;
  const iaCard = document.getElementById('ia-card');
  const bar = document.getElementById('progress-bar');
  const cont = document.getElementById('progress-container');
  const status = document.getElementById('ia-status');

  btn.disabled = true;
  btn.style.opacity = "0.2";
  cont.classList.remove('hidden');
  
  const laser = document.createElement('div');
  laser.className = 'scanner-line';
  iaCard.appendChild(laser);

  let p = 0;
  const t = setInterval(() => {
    p += 2;
    bar.style.width = p + '%';
    document.getElementById('load-perc').innerText = p + '%';
    if(p == 30) status.innerText = "Escaneando densidad...";
    if(p == 70) status.innerText = "Calculando macros...";
    
    if(p >= 100) {
      clearInterval(t);
      laser.remove();
      cont.classList.add('hidden');
      btn.disabled = false;
      btn.style.opacity = "1";
      
      const res = alimentos[Math.floor(Math.random() * alimentos.length)];
      historial.unshift({ type: 'FOOD', name: res.n, val: `${res.c} kcal`, sub: `${res.p}g Prot`, emoji: res.e, color: "text-cyan-400", cal: res.c });
      localStorage.setItem('nt_historial', JSON.stringify(historial));
      actualizarTodo();
    }
  }, 30);
};

// --- CORE ---
function actualizarTodo() {
  const meta = perfil.meta;
  const calTotal = historial.filter(h => h.type === 'FOOD').reduce((acc, curr) => acc + curr.cal, 0);
  
  document.getElementById('cal-actual').innerText = calTotal;
  document.getElementById('cal-meta').innerText = `/ ${meta} kcal`;
  document.getElementById('xp-display').innerText = `${xp} XP`;
  document.getElementById('goal-text').innerText = perfil.objetivo.toUpperCase();
  document.getElementById('next-ex').innerText = rutinas[perfil.objetivo][exerciseIndex];
  
  const level = Math.floor(xp / 500) + 1;
  document.getElementById('user-level-nav').innerText = level;
  document.getElementById('xp-bar').style.width = ((xp % 500) / 500 * 100) + "%";

  renderHistorial();
}

function renderHistorial() {
  const list = document.getElementById('master-list');
  list.innerHTML = historial.map(h => `
    <div class="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex justify-between items-center card-anim">
      <div class="flex items-center gap-4">
        <span class="text-2xl">${h.emoji}</span>
        <div>
          <p class="font-bold text-sm text-white">${h.name}</p>
          <p class="text-[9px] text-gray-500 uppercase font-black">${h.type} • RECIENTE</p>
        </div>
      </div>
      <div class="text-right">
        <p class="font-black ${h.color} text-lg">${h.val}</p>
        <p class="text-[9px] text-gray-400 font-bold italic">${h.sub}</p>
      </div>
    </div>
  `).join('');
}

function exportarReporte() {
  const element = document.getElementById('capture-area');
  const opt = { filename: 'Reporte_NutriTrack.pdf', image: {type:'jpeg', quality:0.98}, html2canvas: {scale:2, backgroundColor: '#0b0f1a'}, jsPDF: {unit:'in', format:'letter', orientation:'portrait'} };
  html2pdf().set(opt).from(element).save();
}

function resetTotal() { if(confirm("¿Borrar todo?")) { localStorage.clear(); location.reload(); } }