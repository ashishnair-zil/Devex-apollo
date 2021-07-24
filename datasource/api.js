/* 
  API for Zilliqa network
  
  Available async functions:
  1) getLatestTxBlock(): Number
  2) getTxBlock(blockNum: Number): TxBlockObj
  3) getTxnBodiesByTxBlock(blockNum: Number): Array<TransactionObj>
  4) isContractAddr(addr: String): Boolean
*/

import fetch from "node-fetch";
import { stripHexPrefix } from "../util.js";

import zilp from "@zilliqa-js/zilliqa";
const { Zilliqa } = zilp;

class Api {
  constructor(networkUrl = "https://api.zilliqa.com/") {
    this.networkUrl = networkUrl;
    this.Zilliqa = new Zilliqa(this.networkUrl);
  }

  // Get latest tx block number
  async getLatestTxBlock() {
    const response = await fetch(this.networkUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: "1",
        jsonrpc: "2.0",
        method: "GetNumTxBlocks",
        params: [""],
      }),
    });
    const parsedRes = await response.json();
    return parsedRes.result;
  }

  // Get tx block with transactions
  async getTxBlock(blockNum) {
    const response = await fetch(this.networkUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: "1",
        jsonrpc: "2.0",
        method: "GetTxBlock",
        params: [`${blockNum}`],
      }),
    });
    const parsedRes = await response.json();
    return parsedRes.result;
  }

  async checkIfContracts(txns) {
    const data = txns.map(txn => {
      return {
        id: "1",
        jsonrpc: "2.0",
        method: "GetSmartContractInit",
        params: [`${stripHexPrefix(txn.toAddr)}`],
      }
    });

    const response = await fetch(this.networkUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const parsedRes = await response.json();

    return txns.map((txn, index) => {
      return {
        ...txn,
        type: txn.type !== 'contract-creation' && !parsedRes[index].error ? 'contract-call' : 'payment'
      }
    });
  }


  async getTxBlocks(blocks) {

    const data = blocks.map(block => {
      return {
        id: "1",
        jsonrpc: "2.0",
        method: "GetTxBlock",
        params: [`${block}`],
      }
    });

    const response = await fetch(this.networkUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const parsedRes = await response.json();
    return parsedRes.map(item => {
      return item.result
    });
  }
  // Get transaction bodies by tx block
  async getTxnBodiesByTxBlock(blockNum) {
    const response = await fetch(this.networkUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: "1",
        jsonrpc: "2.0",
        method: "GetTxnBodiesForTxBlock",
        params: [`${blockNum}`],
      }),
    });
    const parsedRes = await response.json();
    return parsedRes.result;
  }

  // Get transaction bodies by tx block
  async getTxnBodiesByTxBlocks(blocks) {
    if (!blocks.length) {
      return blocks;
    }
    const data = blocks.map(block => {
      return {
        id: "1",
        jsonrpc: "2.0",
        method: "GetTxnBodiesForTxBlock",
        params: [`${block.header.BlockNum}`],
      }
    })
    const response = await fetch(this.networkUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const parsedRes = await response.json();
    const reducedTxs = parsedRes.map(txresult => {
      return txresult.result;
    }).flat();

    return reducedTxs;
  }

  /* Until we find a better way to differentiate an account address from a smart contract address, we will differentiate based
  on the the response error message if any */
  async isContractAddr(addr) {
    const response = await fetch(this.networkUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: "1",
        jsonrpc: "2.0",
        method: "GetSmartContractInit",
        params: [`${stripHexPrefix(addr)}`],
      }),
    });
    const parsedRes = await response.json();
    if (!parsedRes.error) return true;
    else if (parsedRes.error.message === "Address not contract address")
      return false;
    else return false;
  }

  async getContractState(txns) {
    const addrArr = [];
    const data = txns.map((txn, index) => {
      let toAddr = txn.toAddr && txn.toAddr !== '0x0000000000000000000000000000000000000000' ? txn.toAddr : (txn.contractAddr ? txn.contractAddr : txn.toAddr);
      addrArr[index] = toAddr;
      return {
        id: "1",
        jsonrpc: "2.0",
        method: "GetSmartContractState",
        params: [`${stripHexPrefix(toAddr)}`],
      }
    });

    const response = await fetch(this.networkUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const parsedRes = await response.json();

    const contractArr = [];
    await txns.map((txn, index) => {
      if (!parsedRes[index].error) {
        let contractobj = {};
        contractobj['address'] = addrArr[index]
        contractobj['state'] = parsedRes[index] && parsedRes[index].result ? parsedRes[index].result : {};
        contractArr.push(contractobj);
      }
    });
    return { addrArr, contractArr };
  }

  async getContractAddrFromTxID(txns) {
    if (!txns.length) {
      return txns;
    }
    const data = txns.map((txn) => {
      if (txn && txn.toAddr && txn.toAddr === "0000000000000000000000000000000000000000") {
        return {
          id: txn.ID,
          jsonrpc: "2.0",
          method: "GetContractAddressFromTransactionID",
          params: [`${stripHexPrefix(txn.ID)}`],
        }
      }
    });

    const response = await fetch(this.networkUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const parsedRes = await response.json();
    const txArr = [];
    parsedRes.map((row) => {
      txArr[row.id] = row.result
    })
    // console.log("txArr", txArr)
    txns.map((row) => {
      if (txArr[row.ID]) {
        // console.log("txArr[row.ID]", txArr[row.ID])
        row.contractAddr = `0x${txArr[row.ID]}`;
      }
    })
    // console.log("txns", txns)
    return txns;
  }

  async getContractParams(addrs) {
    const addrArr = [];
    const data = addrs.map((addr, index) => {
      addrArr[index] = addr;
      return {
        id: "1",
        jsonrpc: "2.0",
        method: "GetSmartContractInit",
        params: [`${stripHexPrefix(addr)}`],
      }
    });

    const response = await fetch(this.networkUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const parsedRes = await response.json();

    const contractArr = [];
    await addrs.map((addr, index) => {
      if (!parsedRes[index].error) {
        let contractobj = {};
        contractobj['address'] = addrArr[index]
        contractobj['params'] = parsedRes[index] && parsedRes[index].result ? parsedRes[index].result : {};
        contractArr.push(contractobj);
      }
    });
    return contractArr;
  }
}

export default Api;
