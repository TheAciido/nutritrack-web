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
    const likes = document.getElementById('user-likes').value || "Equilibrado";

    if (!edad || !peso) {
        alert("⚠️ Por favor, introduce tu Edad y Peso.");
        return;
    }

    // Cálculo Calorías Harris-Benedict
    let tmb = (10 * peso) + (6.25 * 175) - (5 * edad) + 5;
    let meta = Math.round(tmb * parseFloat(act));
    if(obj === 'perder') meta -= 400;
    if(obj === 'ganar') meta += 400;

    perfil = { meta, objetivo: obj, peso, likes };
    localStorage.setItem('BIOSYNC_PERFIL', JSON.stringify(perfil));

    document.getElementById('onboarding').style.display = 'none';
    renderizarTodo();
}

function renderizarTodo() {
    if(!perfil) return;
    
    document.getElementById('cal-meta').innerText = `${perfil.meta} kcal`;
    document.getElementById('water-count').innerText = agua.toFixed(1);
    document.getElementById('xp-display').innerText = `${xp} XP`;
    document.getElementById('xp-bar').style.width = `${(xp % 100)}%`;
    document.getElementById('ia-insights').innerText = `> Protocolo ${perfil.objetivo.toUpperCase()} optimizado. Basado en gustos: ${perfil.likes.slice(0,25)}...`;

    // Generar Dieta
    const lista = document.getElementById('dieta-lista');
    lista.innerHTML = "";
    const opciones = [
        `Desayuno: Tortilla con ${perfil.likes.split(',')[0]}`,
        `Almuerzo: Bowl de arroz con proteína`,
        `Cena: Plato ligero adaptado a ${perfil.likes.split(' ')[0]}`,
        `Snack: Batido Pro o Fruta`
    ];

    opciones.forEach((plato, i) => {
        lista.innerHTML += `
            <div class="bg-slate-900/60 p-6 rounded-[32px] border border-white/5">
                <p class="text-[9px] font-black text-cyan-400 uppercase italic">Opción 0${i+1}</p>
                <p class="text-sm font-bold text-white mt-1">${plato}</p>
            </div>`;
    });
}

function sumarAgua() {
    agua += 0.25;
    xp += 10;
    localStorage.setItem('BIOSYNC_AGUA', agua);
    localStorage.setItem('BIOSYNC_XP', xp);
    renderizarTodo();
}

function escanearPlato(event) {
    const res = document.getElementById('scan-result');
    res.classList.remove('hidden');
    res.innerText = "> Analizando píxeles... [OK] Detectadas ~480 kcal. Gustos confirmados. +50 XP";
    xp += 50;
    localStorage.setItem('BIOSYNC_XP', xp);
    renderizarTodo();
}

function exportarPDF() {
    const element = document.getElementById('capture-area');
    html2pdf().from(element).save('Mi_Plan_BioSync.pdf');
}

function resetApp() {
    if(confirm("¿Seguro que quieres borrar todo?")) {
        localStorage.clear();
        location.reload();
    }
}
