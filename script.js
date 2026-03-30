let data = JSON.parse(localStorage.getItem('BIO_DATA')) || null;
let xp = 0;
let water = 0;

window.onload = () => {
    if (data) {
        document.getElementById('onboarding').style.display = 'none';
        update();
    }
};

function iniciar() {
    const age = document.getElementById('u-age').value;
    const weight = document.getElementById('u-weight').value;
    const act = document.getElementById('u-act').value;
    const goal = document.getElementById('u-goal').value;
    const likes = document.getElementById('u-likes').value || "Dieta Variada";

    if (!age || !weight) {
        alert("Faltan datos");
        return;
    }

    let cal = Math.round(((10 * weight) + (6.25 * 175) - (5 * age) + 5) * parseFloat(act));
    if(goal === 'perder') cal -= 400;
    if(goal === 'ganar') cal += 400;

    data = { cal, goal, likes };
    localStorage.setItem('BIO_DATA', JSON.stringify(data));

    document.getElementById('onboarding').style.display = 'none';
    update();
}

function update() {
    if(!data) return;
    
    document.getElementById('res-cal').innerText = `${data.cal} kcal`;
    document.getElementById('res-water').innerText = water.toFixed(1);
    document.getElementById('res-xp').style.width = `${xp % 100}%`;
    document.getElementById('ia-insights').innerText = `> Protocolo ${data.goal.toUpperCase()} activo. Gustos: ${data.likes.slice(0,20)}...`;

    const container = document.getElementById('res-dieta');
    container.innerHTML = "";
    
    // Generar 30 días
    for(let i=1; i<=30; i++) {
        let isCheat = i % 7 === 0;
        container.innerHTML += `
            <div class="bg-slate-900/60 p-5 rounded-3xl border ${isCheat ? 'border-yellow-500/30' : 'border-white/5'}">
                <p class="text-[9px] font-black text-cyan-400 uppercase">Día ${i}</p>
                <p class="text-sm font-bold text-white mt-1">${isCheat ? '🔥 COMIDA LIBRE' : 'Proteína + Carbo + ' + data.likes.split(' ')[0]}</p>
            </div>`;
    }
}

function addWater() {
    water += 0.25;
    xp += 10;
    update();
}

function reset() {
    if(confirm("¿Borrar?")) {
        localStorage.clear();
        location.reload();
    }
}

function pdf() {
    const area = document.getElementById('capture-area');
    html2pdf().from(area).save('BioSync_Plan.pdf');
}
