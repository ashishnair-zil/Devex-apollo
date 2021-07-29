import crypto from '@zilliqa-js/crypto'
import moment from 'moment-timezone';
import pkg from '@zilliqa-js/util';
const { BN, units } = pkg;
import CryptoJS from 'crypto-js';

const { getAddressFromPublicKey, toBech32Address, fromBech32Address } = crypto

export function* range(start, end) {
  for (
    let i = start < 0 ? 0 : start;
    i < end;
    i++) {
    yield i
  }
}

// Strips hex prefix if exists
export const stripHexPrefix = (inputHex) => {
  if (inputHex.substring(0, 2) === '0x')
    return inputHex.substring(2)
  return inputHex
}

// Add hex prefix if not already
export const addHexPrefix = (inputHex) => {
  if (inputHex.substring(0, 2) !== '0x')
    return '0x' + inputHex
  return inputHex
}

export const pubKeyToHex = (pubKey) => {
  return stripHexPrefix(getAddressFromPublicKey(pubKey)).toLowerCase()
}

export const convertToBech32Address = (address) => {
  return toBech32Address(address);
}

export const convertToBech16Address = (address) => {
  return fromBech32Address(address).toLowerCase();
}

export const convertToDateTime = (date) => {
  return moment(parseInt(date) / 1000).tz("Asia/Singapore").format('YYYY-MM-DD HH:mm:ss a');
}

export const convertZilToQa = (amountInZil) => {
  try {
    return parseFloat(units.fromQa(new BN(amountInZil), units.Units.Zil).toString());
  } catch (err) {
    console.log(err);
    console.log('Error converting amount to QA')
  }
}

export const encrypt = (text) => {
  return CryptoJS.AES.encrypt(text, process.env.APP_SECRET).toString();
}

export const decryt = (text) => {
  const bytes = CryptoJS.AES.decrypt(text, process.env.APP_SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export const makeSalt = () => {
  return Math.round(new Date().valueOf() * Math.random());
}

export const Md5 = (text) => {
  return CryptoJS.MD5(text).toString();
}