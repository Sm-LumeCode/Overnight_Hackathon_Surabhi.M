import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';

class VoiceService {
    private isListening = false;
    private isSpeaking = false;

    constructor() {
        this.setupEventListeners();
    }

    private setupEventListeners() {
        // Voice recognition events
        Voice.onSpeechStart = () => {
            this.isListening = true;
            console.log('🎤 Speech started');
        };

        Voice.onSpeechEnd = () => {
            this.isListening = false;
            console.log('🎤 Speech ended');
        };

        Voice.onSpeechError = (error) => {
            console.error('🎤 Speech error:', error);
            this.isListening = false;
        };

        Voice.onSpeechResults = (e) => {
            console.log('🎤 Speech results:', e.value);
        };
    }

    // Start voice recognition
    async startListening(language = 'en-IN'): Promise<string> {
        try {
            console.log('🎤 Starting listening...');
            await Voice.destroy();
            
            return new Promise((resolve, reject) => {
                let timeoutId: NodeJS.Timeout | null = null;
                
                const cleanup = () => {
                    if (timeoutId) clearTimeout(timeoutId);
                    Voice.onSpeechResults = (e) => {
                        console.log('🎤 Speech results:', e.value);
                    };
                };
                
                timeoutId = setTimeout(() => {
                    cleanup();
                    reject(new Error('Listening timeout'));
                }, 10000);

                Voice.onSpeechResults = (e) => {
                    cleanup();
                    if (e.value && e.value.length > 0) {
                        resolve(e.value[0]);
                    } else {
                        reject(new Error('No speech detected'));
                    }
                };

                Voice.onSpeechError = (error) => {
                    cleanup();
                    reject(error);
                };
                
                Voice.start(language);
            });
        } catch (error) {
            console.error('🎤 Start listening error:', error);
            throw error;
        }
    }

    // Stop voice recognition
    async stopListening(): Promise<void> {
        try {
            await Voice.stop();
            this.isListening = false;
            console.log('🎤 Listening stopped');
        } catch (error) {
            console.error('🎤 Stop listening error:', error);
        }
    }

    // Speak text
    async speak(text: string, language = 'en-IN'): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                if (this.isSpeaking) {
                    Tts.stop();
                }
                
                this.isSpeaking = true;
                
                // Detect if text contains Hindi characters
                // CORRECTED: Hindi range is \u0900-\u097F
                const hindiRegex = /[\u0900-\u097F]/;
                const isHindi = hindiRegex.test(text);
                const lang = isHindi ? 'hi-IN' : language;
                
                console.log(`🔊 Speaking (${lang}):`, text.substring(0, 50) + '...');
                
                const ttsOptions = {
                    iosVoiceId: 'default',
                    rate: 0.5,
                    androidParams: {
                        KEY_PARAM_PAN: 0,
                        KEY_PARAM_VOLUME: 1,
                        KEY_PARAM_STREAM: 'STREAM_MUSIC' as const,
                    }
                };

                Tts.speak(text, ttsOptions);
                
                Tts.addEventListener('tts-finish', () => {
                    this.isSpeaking = false;
                    resolve();
                });

                Tts.addEventListener('tts-error', (event: any) => {
                    this.isSpeaking = false;
                    reject(new Error(event?.error || 'TTS error occurred'));
                });
            } catch (error) {
                this.isSpeaking = false;
                reject(error);
            }
        });
    }

    // Stop speaking
    async stopSpeaking(): Promise<void> {
        try {
            await Tts.stop();
            this.isSpeaking = false;
            console.log('🔊 Speaking stopped');
        } catch (error) {
            console.error('🔊 Stop speaking error:', error);
        }
    }

    // Check if contains Hindi
    containsHindi(text: string): boolean {
        return /[\u0900-\u097F]/.test(text);
    }

    // Check current status
    getStatus() {
        return {
            isListening: this.isListening,
            isSpeaking: this.isSpeaking,
        };
    }
}

export default new VoiceService();