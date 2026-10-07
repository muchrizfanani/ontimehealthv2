import { Platform } from 'react-native';

// Emulator Android mencapai host lewat 10.0.2.2; simulator iOS & web lewat localhost.
// Untuk perangkat fisik (Expo Go): ganti DEFAULT_HOST dengan IP LAN mesin ini,
// contoh '192.168.1.7' (lihat IP pada URL exp:// saat expo start).
const DEFAULT_HOST = Platform.select({ android: '10.0.2.2', default: 'localhost' });

// Port 3001 dipakai karena 3000 sudah ditempati project lain (LapanganKu) di mesin ini.
export const API_BASE_URL = `http://${DEFAULT_HOST}:3001`;
