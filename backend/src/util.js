import crypto from '@zilliqa-js/crypto'
import moment from 'moment-timezone';
import pkg from '@zilliqa-js/util';
const { BN, units } = pkg;

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