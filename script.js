let perfil = JSON.parse(localStorage.getItem('nt_perfil')) || null;
let historial = JSON.parse(localStorage.getItem('nt_historial')) || [];
let xp = parseInt(localStorage.getItem('nt_xp')) || 0;
let aguaHoy = parseFloat(localStorage.getItem('nt_agua')) || 0;
let fatigaActual = "media";
let exerciseIndex = 0;
let restInterval;

const rutinas = {
    perder: { ej: ["Burpees", "Mountain Climbers", "Zancadas"], rest: 45 },
    recomposicion: { ej: ["Press Banca", "Sentadilla", "Peso Muerto", "Dominadas"], rest: 90 },
    ganar: { ej: ["Sentadilla Barra", "Press Militar", "Remo con Barra"], rest: 150 }
};

window.onload = () => {
    if (perfil) {
        document.getElementById('onboarding').style.display = 'none';
        generarPlanNutricional();
        calcularSuplementos();
        actualizarTodo();
    }
};

function configurarTodo() {
    const edad = document.getElementById('user-age').value;
    const peso = document.getElementById('user-weight').value;
    const objetivo = document.getElementById('user-goal').value;
    const duracion = document.getElementById('diet-duration').value;

    if(!edad || !peso) return alert("Por favor completa los datos biométricos.");

    let tmb = (10 * peso) + (6.25 * 175) - (5 * edad) + 5;
    let meta = Math.round(tmb * 1.55);
    if(objetivo === 'perder') meta -= 400;
    if(objetivo === 'ganar') meta += 400;

    perfil = { meta, objetivo, peso, waterTarget: (peso * 0.035).toFixed(1), duracion };
    localStorage.setItem('nt_perfil', JSON.stringify(perfil));
    
    document.getElementById('onboarding').style.display = 'none';
    generarPlanNutricional();
    calcularSuplementos();
    actualizarTodo();
}

function setFatiga(nivel) {
    fatigaActual = nivel;
    actualizarTodo();
}

function registrarEntreno() {
    const w = document.getElementById('lift-weight').value;
    const r = document.getElementById('lift-reps').value;
    if(!w || !r) return;

    let mult = fatigaActual === 'alta' ? 1.2 : (fatigaActual === 'baja' ? 0.7 : 1);
    xp += Math.round(((w * r) / 8) * mult);
    
    exerciseIndex = (exerciseIndex + 1) % rutinas[perfil.objetivo].ej.length;
    localStorage.setItem('nt_xp', xp);
    actualizarTodo();
    iniciarDescanso();
}

function iniciarDescanso() {
    clearInterval(restInterval);
    let seconds = rutinas[perfil.objetivo].rest;
    const display = document.getElementById('rest-time');
    restInterval = setInterval(() => {
        let m = Math.floor(seconds / 60);
        let s = seconds % 60;
        display.innerText = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
        if (seconds-- <= 0) {
            clearInterval(restInterval);
            display.innerText = "¡GO!";
        }
    }, 1000);
}

function beberAgua() {
    aguaHoy += 0.25;
    localStorage.setItem('nt_agua', aguaHoy);
    xp += 5;
    actualizarTodo();
}

function generarPlanNutricional() {
    const container = document.getElementById('dieta-container');
    const chart = document.getElementById('protein-chart');
    container.innerHTML = ""; chart.innerHTML = "";
    
    const ciclos = perfil.duracion == "7" ? 7 : 30;
    const protBase = perfil.objetivo === 'ganar' ? 1.8 * perfil.peso : 2 * perfil.peso;

    for(let i=1; i <= ciclos; i++) {
        let isCheat = i % 7 === 0;
        let pDia = isCheat ? protBase * 0.8 : protBase + (Math.random() * 10);
        
        if (i <= 8) { // Solo mostramos los primeros días para no saturar
            container.innerHTML += `
                <div class="bg-slate-900/60 p-4 rounded-2xl border ${isCheat ? 'border-yellow-500/40 shadow-lg shadow-yellow-500/5' : 'border-slate-800'} card-anim">
                    <p class="text-[9px] font-black text-cyan-500">DÍA ${i}</p>
                    <p class="text-xs font-bold mt-1 text-white">${isCheat ? '🍔 CHEAT MEAL' : '🥗 CLEAN DIET'}</p>
                    <p class="text-[10px] text-gray-500 uppercase mt-2">${Math.round(pDia)}g Proteína</p>
                </div>`;
        }

        if (i <= 7) {
            chart.innerHTML += `
                <div class="flex-1 flex flex-col items-center">
                    <div class="bg-cyan-500/40 w-full rounded-t-md" style="height: ${(pDia/2)}px"></div>
                    <span class="text-[7px] mt-1 uppercase text-gray-600">D${i}</span>
                </div>`;
        }
    }
}

function calcularSuplementos() {
    document.getElementById('supps-section').classList.remove('hidden');
    const container = document.getElementById('supps-container');
    const p = perfil.peso;
    container.innerHTML = `
        <div class="bg-black/40 p-4 rounded-2xl">
            <span class="text-[8px] text-purple-400 font-bold uppercase">Creatina</span>
            <p class="font-black text-lg">${(p * 0.1).toFixed(1)}g / día</p>
        </div>
        <div class="bg-black/40 p-4 rounded-2xl">
            <span class="text-[8px] text-purple-400 font-bold uppercase">Proteína Suplementaria</span>
            <p class="font-black text-lg">1.5 - 2 scoops</p>
        </div>
        <div class="bg-black/40 p-4 rounded-2xl">
            <span class="text-[8px] text-purple-400 font-bold uppercase">Multivitamínico</span>
            <p class="font-black text-lg">Con Desayuno</p>
        </div>`;
}

function ejecutarBioAnalisis() {
    const insight = document.getElementById('ia-insights');
    const waterGoal = parseFloat(perfil.waterTarget);
    let msg = "";

    if (aguaHoy < waterGoal * 0.5) msg = "⚠️ HIDRATACIÓN: Nivel crítico. Tu rendimiento caerá un 15% en series de alta intensidad. Bebe ahora.";
    else if (fatigaActual === 'baja') msg = "💤 CNS FATIGUE: Sistema nervioso saturado. He reducido tus objetivos de XP hoy. Enfócate en el descanso.";
    else if (fatigaActual === 'alta') msg = "🔥 MODO BESTIA: Biomarcadores en pico. Es el momento ideal para buscar un Récord Personal (PR).";
    else msg = "✅ OPTIMIZADO: Plan nutricional y físico en equilibrio. Mantén el ritmo actual.";

    insight.innerHTML = `<span class="text-cyan-400 font-mono">></span> ${msg}`;
}

function actualizarTodo() {
    if(!perfil) return;
    document.getElementById('cal-actual').innerText = 0; // Conectar con historial si existe
    document.getElementById('cal-meta').innerText = `/ ${perfil.meta} kcal`;
    document.getElementById('water-count').innerText = aguaHoy.toFixed(1);
    document.getElementById('water-target').innerText = perfil.waterTarget;
    document.getElementById('xp-display').innerText = `${xp} XP`;
    document.getElementById('user-level-nav').innerText = Math.floor(xp / 500) + 1;
    document.getElementById('xp-bar').style.width = `${((xp % 500) / 500) * 100}%`;
    document.getElementById('next-ex').innerText = rutinas[perfil.objetivo].ej[exerciseIndex];
    ejecutarBioAnalisis();
}

function previewFoto(e) {
    const reader = new FileReader();
    reader.onload = function(){
        const div = document.getElementById('foto-preview');
        const img = document.createElement('img');
        img.src = reader.result;
        img.className = "w-24 h-24 object-cover rounded-xl border border-cyan-500 shadow-lg shadow-cyan-500/20";
        div.appendChild(img);
    }
    reader.readAsDataURL(e.target.files[0]);
}

function exportarReporte() {
    const opt = { filename: 'NutriTrack_Pro_Report.pdf', image: {type:'jpeg', quality:0.98}, html2canvas: {scale:2, backgroundColor: '#0b0f1a'}, jsPDF: {unit:'in', format:'letter', orientation:'portrait'} };
    html2pdf().set(opt).from(document.getElementById('capture-area')).save();
}

function resetTotal() { if(confirm("¿Borrar todos los datos?")) { localStorage.clear(); location.reload(); } }
