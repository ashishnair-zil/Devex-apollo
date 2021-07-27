import crypto from '@zilliqa-js/crypto'

const { getAddressFromPublicKey } = crypto

export function* range(start, end) {
  for (
    let i = start < 0 ? 0 : start;
    i <= end;
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


export const removeValuesFromArray = async (processTxns, allTxns) => {
  await processTxns.map((txn, key) => {
    const splitTxn = txn.split('-');
    const blockId = splitTxn[0];
    const ID = splitTxn[1];

    const index = allTxns[blockId]['txID'].indexOf(ID);

    if (index > -1) {
      allTxns[blockId]['txID'].splice(index, 1);
    }
  });
  let tmpArr = [];
  await Object.values(allTxns).map((r, k) => {
    tmpArr.push({
      'blockId': r.blockId,
      'txID': JSON.stringify(r.txID),
      'timestamp': r.timestamp
    });
  });
  return tmpArr;
}