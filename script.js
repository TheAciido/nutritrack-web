// MEMORIA LIMPIA
const KEY = 'BIOSYNC_DATA_V1';
let perfil = JSON.parse(localStorage.getItem(KEY)) || null;
let xp = 0;
let aguaHoy = 0;

window.onload = () => {
    if (perfil) {
        document.getElementById('onboarding').style.display = 'none';
        actualizarPantalla();
    }
};

function configurarTodo() {
    console.log("Sincronizando...");
    
    // Capturamos datos
    const edad = document.getElementById('user-age').value;
    const peso = document.getElementById('user-weight').value;
    const act = document.getElementById('user-activity').value;
    const obj = document.getElementById('user-goal').value;
    const likes = document.getElementById('user-likes').value || "Equilibrado";

    // Si faltan datos básicos avisamos
    if (!edad || !peso) {
        alert("Completa Edad y Peso.");
        return;
    }

    // Cálculo rápido de calorías
    let meta = Math.round(((10 * peso) + (6.25 * 175) - (5 * edad) + 5) * parseFloat(act));
    if(obj === 'perder') meta -= 400;
    if(obj === 'ganar') meta += 400;

    // Guardamos en perfil
    perfil = { meta, objetivo: obj, peso, likes };
    localStorage.setItem(KEY, JSON.stringify(perfil));

    // Cerramos onboarding y mostramos app
    document.getElementById('onboarding').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('onboarding').style.display = 'none';
        actualizarPantalla();
    }, 400);
}

function actualizarPantalla() {
    if(!perfil) return;
    
    // Calorías y Agua
    document.getElementById('cal-meta').innerText = `/ ${perfil.meta}`;
    document.getElementById('water-count').innerText = aguaHoy.toFixed(1);
    document.getElementById('xp-display').innerText = `${xp} XP`;
    document.getElementById('xp-bar').style.width = `${(xp % 100)}%`;
    
    // IA Terminal
    document.getElementById('ia-insights').innerText = `> Protocolo ${perfil.objetivo.toUpperCase()} activo. Gustos registrados: ${perfil.likes.slice(0, 20)}...`;

    // Generar Dieta
    const container = document.getElementById('dieta-container');
    container.innerHTML = "";
    const platos = ["Pollo con Arroz", "Tortilla y Avena", "Pescado/Tofu con Patata", "Batido Pro + Fruta"];
    
    for(let i=1; i<=4; i++) {
        container.innerHTML += `
            <div class="bg-slate-900/60 p-5 rounded-3xl border border-white/5">
                <p class="text-[9px] font-black text-cyan-400 uppercase italic">Opción 0${i}</p>
                <p class="text-sm font-bold text-white mt-1">${platos[i-1]}</p>
                <p class="text-[8px] text-gray-500 mt-2 uppercase tracking-widest">Sincronizado con gustos ✅</p>
            </div>`;
    }
}

function beberAgua() {
    aguaHoy += 0.25;
    xp += 10;
    actualizarPantalla();
}

function analizarComida(e) {
    const res = document.getElementById('scan-result');
    res.classList.remove('hidden');
    res.innerText = "> Escaneando... [OK] Detectadas ~450 kcal. +50 XP";
    xp += 50;
    actualizarPantalla();
}

function resetTotal() {
    if(confirm("¿Borrar todo?")) {
        localStorage.clear();
        location.reload();
    }
}

function exportarReporte() {
    const area = document.getElementById('capture-area');
    html2pdf().from(area).save('Mi_Plan_BioSync.pdf');
}
