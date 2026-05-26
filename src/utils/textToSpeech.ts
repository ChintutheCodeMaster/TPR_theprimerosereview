
export const speakText = async (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      console.error('Text-to-speech not supported');
      reject(new Error('Text-to-speech not supported'));
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice =>
      voice.name.includes('female') ||
      voice.name.includes('Samantha') ||
      voice.name.includes('Google UK English Female')
    );

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;

    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));

    window.speechSynthesis.speak(utterance);
  });
};

window.speechSynthesis?.getVoices();

if (typeof window !== 'undefined') {
  setTimeout(() => {
    window.speechSynthesis?.getVoices();
  }, 100);
}
