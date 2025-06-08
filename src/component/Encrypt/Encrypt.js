import CryptoJS from 'crypto-js';

// SECRET_KEY harus diakses sebagai string, jadi pakai tanda kutip:
const SECRET_KEY = import.meta.env.VITE_ENCRYPT;

export function encryptData(data) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
}

export function decryptData(ciphertext) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decryptedData);
}
