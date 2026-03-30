let perfil = JSON.parse(localStorage.getItem('BS_P')) || null;
let xp = parseInt(localStorage.getItem('BS_X')) || 0;
let water = parseFloat(localStorage.getItem('BS_W')) || 0;
let exIdx = 0;
let timer;

const rutinas = {
    perder: ["Burpees", "Zancadas Salto", "Plancha", "Jumping Jacks"],
    recomposicion: ["Sentadilla", "Press Banca", "Remo con Barra", "Peso Muerto"],
    ganar: ["Sentadilla Pesada", "Press Militar", "Dominadas", "Curl Bíceps"]
};

window.onload = () => { if(perfil) render(); };

function iniciarBioSync() {
    const age = document.getElementById('u-age').value;
    const weight = document.getElementById('u-weight').value;
    const act = document.getElementById('u-act').value;
    const goal = document.getElementById('u-goal').value;
    const likes = document.getElementById('u-likes').value || "Equilibrado";

    if(!age || !weight) return alert("Completa tus datos");

    let cal = Math.round(((10 * weight) + (6.25 * 175) - (5 * age) + 5) * parseFloat(act));
    if(goal === 'perder') cal -= 450;
    if(goal === 'ganar') cal += 450;

    perfil = { cal, goal, likes, weight };
    localStorage.setItem('BS_P', JSON.stringify(perfil));
    render();
}

function render() {
    if(!perfil) return;
    document.getElementById('onboarding').style.display = 'none';
    document.getElementById('res-cal').innerText = `${perfil.cal}`;
    document.getElementById('res-water').innerText = water.toFixed(1);
    document.getElementById('xp-num').innerText = `${xp} XP`;
    document.getElementById('res-xp').style.width = `${(xp % 1000) / 10}%`;
    document.getElementById('gym-ex').innerText = rutinas[perfil.goal][exIdx];
    
    document.getElementById('ia-insights').innerHTML = `
        > Objetivo: ${perfil.goal.toUpperCase()} | Gustos Detectados: ${perfil.likes.slice(0,30)}...<br>
        > ${water < 2 ? "🔴 Bebe más agua para quemar grasa." : "🟢 Hidratación perfecta."}`;

    const dieta = document.getElementById('res-dieta');
    dieta.innerHTML = "";
    const proteinas = ["Pollo", "Atún", "Ternera", "Tofu", "Huevos"];
    
    for(let i=1; i<=30; i++) {
        let isCheat = i % 7 === 0;
        dieta.innerHTML += `
            <div class="bg-slate-900/60 p-6 rounded-3xl border ${isCheat ? 'border-yellow-500/30 shadow-lg' : 'border-white/5'}">
                <p class="text-[9px] font-black text-cyan-400 uppercase italic">Día ${i}</p>
                <p class="text-sm font-bold text-white mt-1">${isCheat ? '🔥 COMIDA LIBRE' : proteinas[i%5] + ' con Arroz y ' + perfil.likes.split(' ')[0]}</p>
            </div>`;
    }
}

function addWater() { water += 0.25; xp += 10; save(); render(); }

function logGym() {
    if(!document.getElementById('g-peso').value) return alert("Pon el peso");
    xp += 50;
    exIdx = (exIdx + 1) % rutinas[perfil.goal].length;
    document.getElementById('g-peso').value = "";
    document.getElementById('g-reps').value = "";
    save(); render(); startTimer();
}

function startTimer() {
    clearInterval(timer);
    let s = 60;
    timer = setInterval(() => {
        let m = Math.floor(s/60); let sec = s%60;
        document.getElementById('timer').innerText = `0${m}:${sec < 10 ? '0' : ''}${sec}`;
        if(s-- <= 0) { clearInterval(timer); alert("¡Siguiente serie!"); }
    }, 1000);
}

function escanearComida() {
    const r = document.getElementById('scan-res');
    r.classList.remove('hidden');
    r.innerText = "> Análisis IA: Plato detectado. 450 kcal | 30g Prot. +50 XP";
    xp += 50; save(); render();
}

function save() {
    localStorage.setItem('BS_X', xp);
    localStorage.setItem('BS_W', water);
}

function resetApp() { if(confirm("¿Borrar todo?")) { localStorage.clear(); location.reload(); } }

function exportarPDF() {
    const area = document.getElementById('capture-area');
    html2pdf().set({ margin: 0.5, filename: 'BioSync_Plan.pdf', html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } }).from(area).save();
}
