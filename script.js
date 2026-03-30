let perfil = JSON.parse(localStorage.getItem('nt_perfil')) || null;
let xp = parseInt(localStorage.getItem('nt_xp')) || 0;
let aguaHoy = parseFloat(localStorage.getItem('nt_agua')) || 0;
let fatigaActual = "media";
let exerciseIndex = 0;
let restInterval;

const rutinas = {
    perder: { ej: ["Burpees", "Mountain Climbers", "Zancadas Salto"], rest: 45 },
    recomposicion: { ej: ["Press Banca", "Sentadilla Pesada", "Peso Muerto", "Dominadas"], rest: 90 },
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
    const actividad = document.getElementById('user-activity').value; // <-- RECUPERADO
    const objetivo = document.getElementById('user-goal').value;
    const duracion = document.getElementById('diet-duration').value;

    if(!edad || !peso) return alert("Completa Edad y Peso para calcular tu metabolismo.");

    // Fórmula Harris-Benedict revisada
    let tmb = (10 * peso) + (6.25 * 175) - (5 * edad) + 5;
    let meta = Math.round(tmb * actividad);

    if(objetivo === 'perder') meta -= 400;
    if(objetivo === 'ganar') meta += 450;

    perfil = { 
        meta, 
        objetivo, 
        peso: parseFloat(peso), 
        waterTarget: (peso * 0.035).toFixed(1), 
        duracion 
    };
    
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

    let mult = fatigaActual === 'alta' ? 1.25 : (fatigaActual === 'baja' ? 0.75 : 1);
    xp += Math.round(((w * r) / 8) * mult);
    
    exerciseIndex = (exerciseIndex + 1) % rutinas[perfil.objetivo].ej.length;
    localStorage.setItem('nt_xp', xp);
    
    document.getElementById('lift-weight').value = "";
    document.getElementById('lift-reps').value = "";
    
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
            display.innerText = "¡LISTO!";
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
    
    const diasTotal = parseInt(perfil.duracion);
    const protBase = perfil.objetivo === 'ganar' ? 2 * perfil.peso : 2.2 * perfil.peso;

    for(let i=1; i <= diasTotal; i++) {
        let isCheat = i % 7 === 0;
        let pDia = isCheat ? protBase * 0.7 : protBase + (Math.random() * 15);
        
        // Mostrar solo los primeros 8 días en la web para no saturar la vista
        if (i <= 8) {
            container.innerHTML += `
                <div class="bg-slate-900/60 p-5 rounded-3xl border ${isCheat ? 'border-yellow-500/30' : 'border-slate-800'} card-anim">
                    <p class="text-[9px] font-black text-cyan-500 uppercase italic">Día ${i}</p>
                    <p class="text-sm font-bold mt-1 text-white">${isCheat ? '🍔 Cheat Meal Controlado' : '🥗 Nutrición Limpia'}</p>
                    <p class="text-[10px] text-gray-500 uppercase mt-2 font-bold">${Math.round(pDia)}g Proteína Estimada</p>
                </div>`;
        }
        // Gráfica de la primera semana
        if (i <= 7) {
            chart.innerHTML += `
                <div class="flex-1 flex flex-col items-center group">
                    <div class="bg-cyan-500/30 group-hover:bg-cyan-500 w-full rounded-t-lg transition-all duration-700" style="height: ${(pDia/2)}px"></div>
                    <span class="text-[7px] mt-2 uppercase text-gray-500 font-bold">D${i}</span>
                </div>`;
        }
    }
}

function calcularSuplementos() {
    document.getElementById('supps-section').classList.remove('hidden');
    const container = document.getElementById('supps-container');
    const p = perfil.peso;
    container.innerHTML = `
        <div class="bg-black/40 p-5 rounded-3xl border border-white/5">
            <span class="text-[8px] text-purple-400 font-black uppercase italic">Creatina</span>
            <p class="font-black text-xl text-white">${(p * 0.1).toFixed(1)}g / día</p>
        </div>
        <div class="bg-black/40 p-5 rounded-3xl border border-white/5">
            <span class="text-[8px] text-purple-400 font-black uppercase italic">Whey Protein</span>
            <p class="font-black text-xl text-white">~40g (Post)</p>
        </div>
        <div class="bg-black/40 p-5 rounded-3xl border border-white/5">
            <span class="text-[8px] text-purple-400 font-black uppercase italic">Cafeína</span>
            <p class="font-black text-xl text-white">${(p * 3).toFixed(0)}mg (Pre)</p>
        </div>`;
}

function ejecutarBioAnalisis() {
    const insight = document.getElementById('ia-insights');
    const waterGoal = parseFloat(perfil.waterTarget);
    let msg = "";

    if (aguaHoy < waterGoal * 0.4) msg = "🚨 CRÍTICO: Deshidratación detectada. Riesgo de calambres alto. Bebe 0.5L ahora.";
    else if (fatigaActual === 'baja') msg = "💤 CNS ALERT: Fatiga central alta. Prioriza técnica sobre carga. He ajustado tu XP un -30%.";
    else if (fatigaActual === 'alta') msg = "🔥 PEAK STATE: Estado hormonal óptimo. Tienes un bonus de +25% XP en este entreno.";
    else msg = "✅ ESTABLE: Tus niveles de energía y macros están en rango óptimo. Mantén el plan.";

    insight.innerHTML = `<span class="text-cyan-400 font-mono">></span> ${msg}`;
}

function actualizarTodo() {
    if(!perfil) return;
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
        img.className = "w-28 h-28 object-cover rounded-3xl border-2 border-cyan-500 shadow-xl card-anim";
        div.appendChild(img);
    }
    reader.readAsDataURL(e.target.files[0]);
}

function exportarReporte() {
    const opt = { 
        filename: 'Reporte_NutriTrack_Pro.pdf', 
        image: {type:'jpeg', quality:0.98}, 
        html2canvas: {scale:2, backgroundColor: '#0b0f1a'}, 
        jsPDF: {unit:'in', format:'letter', orientation:'portrait'} 
    };
    html2pdf().set(opt).from(document.getElementById('capture-area')).save();
}

function resetTotal() { 
    if(confirm("¿Estás seguro de borrar todo tu progreso y perfil?")) { 
        localStorage.clear(); 
        location.reload(); 
    } 
}
