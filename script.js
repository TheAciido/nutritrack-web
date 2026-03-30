// Usamos un nombre de memoria único para evitar conflictos con versiones viejas
const STORAGE_KEY = 'biosync_pro_data';
let perfil = JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
let xp = parseInt(localStorage.getItem('bs_xp')) || 0;
let aguaHoy = parseFloat(localStorage.getItem('bs_agua')) || 0;
let exerciseIndex = 0;
let restInterval;

const rutinas = {
    perder: ["Burpees Intensos", "Escaladores", "Zancadas con Salto", "Plancha Dinámica"],
    recomposicion: ["Press Banca", "Sentadilla", "Peso Muerto", "Dominadas"],
    ganar: ["Sentadilla con Barra", "Press Militar", "Remo con Barra", "Curl de Bíceps"]
};

// Al cargar la página
window.onload = () => {
    const onboarding = document.getElementById('onboarding');
    if (perfil) {
        // Si ya hay perfil, ocultamos el inicio directamente
        onboarding.style.display = 'none';
        actualizarTodo();
        generarPlanNutricional();
    }
};

// ESTA ES LA FUNCIÓN QUE FALLABA (CORREGIDA)
function configurarTodo() {
    console.log("Iniciando Sincronización..."); // Para debug

    const edad = document.getElementById('user-age').value;
    const peso = document.getElementById('user-weight').value;
    const act = document.getElementById('user-activity').value;
    const obj = document.getElementById('user-goal').value;
    const likes = document.getElementById('user-likes').value;

    // Validación simple
    if(!edad || !peso) {
        alert("⚠️ Por favor, introduce tu Edad y Peso para que la IA calcule tus macros.");
        return;
    }

    // Cálculos de Macros (Harris-Benedict simplificado)
    let tmb = (10 * peso) + (6.25 * 175) - (5 * edad) + 5;
    let meta = Math.round(tmb * parseFloat(act));
    
    if(obj === 'perder') meta -= 450;
    if(obj === 'ganar') meta += 500;

    // Guardar datos
    perfil = { 
        meta: meta, 
        objetivo: obj, 
        peso: parseFloat(peso), 
        waterTarget: (peso * 0.035).toFixed(1), 
        gustos: likes || "Dieta equilibrada" 
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(perfil));
    
    // EFECTO VISUAL DE SALIDA
    const onboarding = document.getElementById('onboarding');
    onboarding.style.opacity = '0';
    setTimeout(() => { 
        onboarding.style.display = 'none'; 
        // Forzamos el renderizado de la app
        actualizarTodo();
        generarPlanNutricional();
        window.scrollTo(0,0);
    }, 500);
}

// IA: ESCÁNER DE COMIDA VISUAL
function analizarComida(event) {
    const textIA = document.getElementById('ia-scan-text');
    const resultBox = document.getElementById('scan-result');
    resultBox.classList.remove('hidden');
    textIA.innerText = "> Iniciando escaneo de imagen... [OK]";

    setTimeout(() => { textIA.innerText = "> Reconociendo macronutrientes... [OK]"; }, 1000);
    setTimeout(() => {
        const cal = Math.floor(Math.random() * (650 - 350) + 350);
        const pro = Math.floor(cal / 18);
        textIA.innerHTML = `
            <span class="text-cyan-400 font-black tracking-widest uppercase text-[10px]">Análisis Completado</span><br>
            <span class="text-white font-bold italic">Plato detectado: Rico en Proteína</span><br>
            🔥 <span class="text-white">${cal} kcal</span> | 🍗 <span class="text-white">${pro}g Prot</span><br>
            <span class="text-[8px] text-gray-500 mt-2 block italic">Datos sincronizados. +40 XP</span>
        `;
        xp += 40;
        actualizarTodo();
    }, 2500);
}

function generarPlanNutricional() {
    const container = document.getElementById('dieta-container');
    if(!container) return;
    const likes = (perfil.gustos || "").toLowerCase();
    container.innerHTML = "";

    const menusBase = [
        "Bowl de Arroz, Pollo y Aguacate",
        "Salmón al horno con Patata Dulce",
        "Pasta Integral con Atún y Tomate",
        "Tortilla de Claras con Espinacas"
    ];

    let platoEspecial = likes.split(',')[0] || "Plato Proteico Mix";

    for(let i=1; i <= 8; i++) {
        let esCheat = i % 7 === 0;
        let plato = esCheat ? "🔥 Cheat Meal (Libre)" : (i % 2 === 0 ? menusBase[Math.floor(Math.random()*4)] : `Especial: ${platoEspecial}`);
        
        container.innerHTML += `
            <div class="bg-slate-900/60 p-6 rounded-[32px] border ${esCheat ? 'border-yellow-500/20 shadow-lg shadow-yellow-500/5' : 'border-white/5'} card-anim">
                <p class="text-[9px] font-black text-cyan-500 uppercase tracking-widest italic">Día 0${i}</p>
                <p class="text-sm font-bold text-white mt-2 leading-tight">${plato}</p>
                <p class="text-[8px] text-gray-500 mt-3 uppercase font-bold tracking-tighter italic">Personalizado ✅</p>
            </div>`;
    }
}

function registrarEntreno() {
    const w = document.getElementById('lift-weight').value;
    const r = document.getElementById('lift-reps').value;
    if(!w || !r) return;

    xp += Math.round((w * r) / 7);
    exerciseIndex = (exerciseIndex + 1) % rutinas[perfil.objetivo].length;
    localStorage.setItem('bs_xp', xp);
    
    document.getElementById('lift-weight').value = "";
    document.getElementById('lift-reps').value = "";
    actualizarTodo();
    iniciarDescanso();
}

function iniciarDescanso() {
    clearInterval(restInterval);
    let seconds = perfil.objetivo === 'ganar' ? 120 : 60;
    const display = document.getElementById('rest-time');
    restInterval = setInterval(() => {
        let m = Math.floor(seconds / 60); let s = seconds % 60;
        display.innerText = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
        if (seconds-- <= 0) { clearInterval(restInterval); display.innerText = "¡GO!"; }
    }, 1000);
}

function beberAgua() {
    aguaHoy += 0.25;
    localStorage.setItem('bs_agua', aguaHoy);
    xp += 10;
    actualizarTodo();
}

function actualizarTodo() {
    if(!perfil) return;
    
    // Actualizar textos básicos
    document.getElementById('cal-meta').innerText = `/ ${perfil.meta} kcal`;
    document.getElementById('water-count').innerText = aguaHoy.toFixed(1);
    document.getElementById('water-target').innerText = perfil.waterTarget;
    document.getElementById('xp-display').innerText = `${xp} XP`;
    
    // Barra de XP
    const bar = document.getElementById('xp-bar');
    if(bar) bar.style.width = `${((xp % 500) / 500) * 100}%`;
    
    // Ejercicio
    const exText = document.getElementById('next-ex');
    if(exText) exText.innerText = rutinas[perfil.objetivo][exerciseIndex];
    
    // Bio-análisis
    let info = aguaHoy < 1.5 ? "🔴 Hidratación baja: Rendimiento muscular en riesgo." : "🟢 Hidratación óptima: Síntesis de proteína activa.";
    const insight = document.getElementById('ia-insights');
    if(insight) insight.innerText = `> ${info} | Analizando gustos: ${perfil.gustos.slice(0,15)}...`;
}

function exportarReporte() {
    const area = document.getElementById('capture-area');
    html2pdf().set({ 
        margin: 0.5, 
        filename: 'Reporte_BioSync_Pro.pdf', 
        image: { type: 'jpeg', quality: 0.98 }, 
        html2canvas: { scale: 2, backgroundColor: '#020617' }, 
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } 
    }).from(area).save();
}

function resetTotal() { 
    if(confirm("¿Reiniciar todo el protocolo BioSync? Se borrará tu progreso.")) { 
        localStorage.clear(); 
        location.reload(); 
    } 
}
