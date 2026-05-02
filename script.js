const el = {
    input: document.getElementById('nick-input'),
    error: document.getElementById('error-message'),
    wrapper: document.getElementById('card-wrapper'),
    card: document.getElementById('player-card'),
    nick: document.getElementById('card-nick'),
    kd: document.getElementById('card-kd'),
    kills: document.getElementById('card-kills'),
    deaths: document.getElementById('card-deaths'),
    hs: document.getElementById('card-hs'),
    dmg: document.getElementById('card-dmg')
};

let isLoading = false;
let lastRequestId = 0;

function toggleError(msg) {
    if (msg) {
        el.error.innerText = msg;
        el.error.style.display = "block";
        el.wrapper.style.display = "none";
    } else {
        el.error.style.display = "none";
    }
}

async function fetchPlayerStats() {
    if (isLoading) return;

    const rawInput = el.input.value;
    const input = rawInput.trim().toLowerCase();

    if (!input) return toggleError("Lütfen bir nick girin!");

    const requestId = ++lastRequestId;
    toggleError();

    isLoading = true;
    el.input.disabled = true;

    try {
        // 'supabase' değişkeni index.html içinden gelecek
        const { data, error } = await supabase.rpc('search_player', {
            search_input: input
        });

        if (requestId !== lastRequestId) return;

        if (error || !Array.isArray(data) || data.length === 0) {
            return toggleError("Oyuncu bulunamadı!");
        }

        const player = data[0];

        const kills = player.total_kills ?? 0;
        const deaths = player.total_deaths ?? 0;
        const damage = player.total_damage ?? 0;
        const hs = player.hs_percent ?? 0;

        const kdValue = kills / (deaths || 1);
        const kd = kdValue.toFixed(2);

        el.nick.innerText = player.nick;
        el.kd.innerText = kd;
        el.kills.innerText = kills;
        el.deaths.innerText = deaths;
        el.hs.innerText = `%${hs}`;
        el.dmg.innerText = damage.toLocaleString('tr-TR');

        Object.assign(el.card.style, kdValue >= 1.5
            ? { boxShadow: "0 10px 40px rgba(250,204,21,.4)", borderColor: "#facc15" }
            : { boxShadow: "0 10px 30px rgba(0,0,0,.8)", borderColor: "#38bdf8" }
        );

        el.wrapper.style.display = 'flex';

    } catch (err) {
        if (requestId === lastRequestId) {
            toggleError("Sunucu hatası.");
        }
    } finally {
        isLoading = false;
        el.input.disabled = false;
    }
}

function downloadCard() {
    html2canvas(el.card, {
        backgroundColor: null,
        scale: 2
    })
    .then(canvas => {
        const link = document.createElement('a');
        link.download = `${el.nick.innerText}_Sehir_Efsanesi_Karti.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    })
    .catch(() => {
        toggleError("İndirme başarısız oldu.");
    });
}
