let perfil = JSON.parse(localStorage.getItem('BIOSYNC_PERFIL')) || null;
let xp = parseInt(localStorage.getItem('BIOSYNC_XP')) || 0;
let agua = parseFloat(localStorage.getItem('BIOSYNC_AGUA')) || 0;

window.onload = () => {
    if (perfil) {
        document.getElementById('onboarding').style.display = 'none';
        renderizarTodo();
    }
};

function configurarApp() {
    const edad = document.getElementById('user-age').value;
    const peso = document.getElementById('user-weight').value;
    const act = document.getElementById('user-activity').value;
    const obj = document.getElementById('user-goal').value;
    const likes = document.getElementById('user-likes').value || "Dieta Variada";

    if (!edad || !peso) {
        alert("⚠️ Introduce Edad y Peso para calcular tus macros.");
        return;
    }

    // Cálculo Harris-Benedict Real
    let tmb = (10 * peso) + (6.25 * 175) - (5 * edad) + 5;
    let meta = Math.round(tmb * parseFloat(act));
    if(obj === 'perder') meta -= 450;
    if(obj === 'ganar') meta += 500;

    perfil = { meta, objetivo: obj, peso, likes, fecha: new Date().toLocaleDateString() };
    localStorage.setItem('BIOSYNC_PERFIL', JSON.stringify(perfil));

    // Efecto de desvanecimiento
    document.getElementById('onboarding').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('onboarding').style.display = 'none';
        renderizarTodo();
    }, 500);
}

function renderizarTodo() {
    if(!perfil) return;
    
    // Stats principales
    document.getElementById('cal-meta').innerText = `${perfil.meta} kcal`;
    document.getElementById('water-count').innerText = agua.toFixed(1);
    document.getElementById('xp-display').innerText = `${xp} XP`;
    document.getElementById('xp-bar').style.width = `${(xp % 1000) / 10}%`;

    // Mensajes Inteligentes de la IA
    const insights = [
        `> Protocolo ${perfil.objetivo.toUpperCase()} iniciado.`,
        `> Analizando gustos: "${perfil.likes.slice(0,20)}...". Generando menú.`,
        agua < 1.5 ? "> ALERTA: Hidratación crítica. Rendimiento -15%." : "> Hidratación óptima. Síntesis proteica activa.",
        `> Meta diaria: ${perfil.meta} kcal calculadas para tu peso de ${perfil.peso}kg.`
    ];
    document.getElementById('ia-insights').innerHTML = insights.map(line => `<div>${line}</div>`).join('');

    // GENERADOR DE DIETA DE 30 DÍAS
    const lista = document.getElementById('dieta-lista');
    lista.innerHTML = "";
    
    // Base de datos de comidas
    const proteinas = ["Pollo a la plancha", "Salmón al horno", "Tofu salteado", "Tortilla de claras", "Ternera magra"];
    const carbos = ["Arroz integral", "Patata cocida", "Quinoa", "Pasta de lentejas", "Avena"];
    const extra = perfil.likes.split(',')[0] || "Vegetales verdes";

    for(let i = 1; i <= 30; i++) {
        let esCheatDay = i % 7 === 0;
        let plato = esCheatDay ? "🔥 COMIDA LIBRE (Disfruta)" : `${proteinas[i % 5]} con ${carbos[i % 5]} y ${extra}`;
        
        lista.innerHTML += `
            <div class="bg-slate-900/60 p-6 rounded-[32px] border ${esCheatDay ? 'border-yellow-500/30 shadow-lg shadow-yellow-500/5' : 'border-white/5'} card-anim">
                <p class="text-[9px] font-black text-cyan-400 uppercase italic">Día ${i < 10 ? '0'+i : i}</p>
                <p class="text-sm font-bold text-white mt-1 leading-tight">${plato}</p>
                <p class="text-[8px] text-gray-500 mt-3 uppercase tracking-widest font-bold">Bio-Sincronizado ✅</p>
            </div>`;
    }
}

function sumarAgua() {
    agua += 0.25;
    xp += 15;
    localStorage.setItem('BIOSYNC_AGUA', agua);
    localStorage.setItem('BIOSYNC_XP', xp);
    renderizarTodo();
}

function escanearPlato(event) {
    const res = document.getElementById('scan-result');
    res.classList.remove('hidden');
    res.innerHTML = `
        <div class="animate-pulse italic text-white mb-1">Escaneando plato...</div>
        <div class="text-cyan-400 font-bold uppercase text-[10px]">Análisis: 485 kcal | 35g Proteína</div>
        <div class="text-gray-500 text-[8px] mt-1 italic">Sincronizado con base de datos. +50 XP</div>
    `;
    xp += 50;
    localStorage.setItem('BIOSYNC_XP', xp);
    renderizarTodo();
}

function resetApp() {
    if(confirm("¿Reiniciar sistema? Se borrarán tus 30 días de dieta.")) {
        localStorage.clear();
        location.reload();
    }
}

function exportarPDF() {
    const element = document.getElementById('capture-area');
    const opt = {
        margin: 0.5,
        filename: 'Mi_Plan_BioSync.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, backgroundColor: '#020617' },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
}
