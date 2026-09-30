// ===== Синтез речи в браузере =====
// Весь код в отдельном файле app.js

const synth = window.speechSynthesis;
const textInput = document.getElementById('textInput');
const voiceSelect = document.getElementById('voiceSelect');
const speakBtn = document.getElementById('speakBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const stopBtn = document.getElementById('stopBtn');
const statusEl = document.getElementById('status');

let voices = [];

// Загружаем список доступных голосов системы
function loadVoices() {
    voices = synth.getVoices();
    voiceSelect.innerHTML = '';
    voices.forEach((voice, i) => {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });
    statusEl.textContent = `Загружено голосов: ${voices.length}`;
}

// Список голосов загружается асинхронно
if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = loadVoices;
}
loadVoices();

// Обновляем состояние кнопок
function updateButtons(speaking, paused) {
    speakBtn.disabled = speaking;
    pauseBtn.disabled = !speaking || paused;
    resumeBtn.disabled = !paused;
    stopBtn.disabled = !speaking;
}

// Озвучивание текста
speakBtn.addEventListener('click', () => {
    if (synth.speaking) synth.cancel();

    const text = textInput.value.trim();
    if (!text) {
        statusEl.textContent = 'Введите текст для озвучки.';
        return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const selectedIndex = voiceSelect.value;
    if (selectedIndex !== '') {
        utterance.voice = voices[selectedIndex];
    }

    utterance.onstart = () => {
        statusEl.textContent = 'Идёт озвучка...';
        updateButtons(true, false);
    };
    utterance.onend = () => {
        statusEl.textContent = 'Озвучка завершена.';
        updateButtons(false, false);
    };
    utterance.onerror = (event) => {
        statusEl.textContent = `Ошибка: ${event.error}`;
        updateButtons(false, false);
    };

    synth.speak(utterance);
});

// Пауза
pauseBtn.addEventListener('click', () => {
    if (synth.speaking && !synth.paused) {
        synth.pause();
        statusEl.textContent = 'Пауза.';
        updateButtons(true, true);
    }
});

// Продолжить
resumeBtn.addEventListener('click', () => {
    if (synth.paused) {
        synth.resume();
        statusEl.textContent = 'Продолжаем озвучку...';
        updateButtons(true, false);
    }
});

// Стоп
stopBtn.addEventListener('click', () => {
    synth.cancel();
    statusEl.textContent = 'Остановлено.';
    updateButtons(false, false);
});