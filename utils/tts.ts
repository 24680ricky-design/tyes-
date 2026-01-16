export const speak = (text: string) => {
    if (!window.speechSynthesis) return;

    // Cancel existing speech to prevent queue buildup
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-TW';
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;

    // Try to select a Chinese voice
    const voices = window.speechSynthesis.getVoices();
    const chineseVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('TW') || v.name.includes('Google') && v.name.includes('Chinese'));
    if (chineseVoice) {
        utterance.voice = chineseVoice;
    }

    window.speechSynthesis.speak(utterance);
};