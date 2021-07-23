import Api from "./datasource/api.js";
import { TxBlockModel, TxnModel, ContractStateModel } from "./mongodb/model.js";
import { range } from "./util.js";
import { txBlockReducer, txnReducer, transitionReducer } from "./mongodb/reducer.js";
const BLOCKS_PER_REQUEST = parseInt(process.env.BLOCKS_PER_REQUEST);

class Transactions {

    constructor() {
        this.init = this.init.bind(this);
        this.loadData = this.loadData.bind(this);
        this.api = new Api(process.env.NETWORK_URL);
    }

    async init() {
        try {
            console.log('Process Transactions is running..');
            const latestBlockOnNtk = await this.api.getLatestTxBlock();
            const lastBlockInDB = await TxBlockModel.findOne({ customId: { $lt: 20000000 } }, { customId: 1 }).sort({ customId: -1 }).limit(1);
            const lastBlockID = lastBlockInDB && lastBlockInDB.customId ? lastBlockInDB.customId : 0;
            console.log(`lastBlockID: ${lastBlockID} and latestBlockOnNetwork: ${latestBlockOnNtk}`)
            this.loadData(lastBlockID, latestBlockOnNtk);
        } catch (err) {
            console.log('Error in processTransactions')
            console.log(err)
        } finally {
            setTimeout(() => this.init(), 5000);
        }
    }

    async getContractState(reducedTxns) {

        const { addrArr, contractArr } = await this.api.getContractState(reducedTxns);

        const isStateExist = await ContractStateModel.find({ 'address': { $in: addrArr } }, { address: 1, params: 1 });

        const tmpParamArr = [];
        isStateExist.map((row) => {
            tmpParamArr[row.address] = row.params;
        });

        const paramEmptyArr = [];
        let i = 0
        await contractArr.map((row) => {
            if (tmpParamArr[row.address]) {
                row.params = tmpParamArr[row.address];
            } else {
                paramEmptyArr[i] = row.address;
                i++;
            }
            return row;
        })

        const paramsArr = await this.api.getContractParams(paramEmptyArr);

        const tmpParamArr1 = [];
        paramsArr.map((row) => {
            tmpParamArr1[row.address] = row.params;
        })

        await contractArr.map((row, index) => {
            if (tmpParamArr1[row.address]) {
                row.params = tmpParamArr1[row.address];
            }
            return row;
        })

        return contractArr;
    }

    async loadData(start, end) {
        if (start < end) {

            try {
                let blocksPerRequest = BLOCKS_PER_REQUEST;
                if (start + blocksPerRequest > end) {
                    blocksPerRequest = Math.abs(end - start);
                }

                const blocksRange = [...range(start, start + blocksPerRequest)];

                const txBlocks = await this.api.getTxBlocks(blocksRange);

                const reducedBlocks = txBlocks.map(block => txBlockReducer(block));

                const blocksWithTxs = reducedBlocks.filter(block => block.header.NumTxns !== 0);

                let txns = await this.api.getTxnBodiesByTxBlocks(blocksWithTxs);

                txns = await this.api.getContractAddrFromTxID(txns);

                const reducedTxns = txns.map(txn => txnReducer(txn));

                const contractsChecked = await this.api.checkIfContracts(reducedTxns);

                const contractsState = await this.getContractState(reducedTxns);

                const finalTxns = contractsChecked.map(txn => {
                    const blockDetails = reducedBlocks.find(block => {
                        return parseInt(block.header.BlockNum) === txn.blockId;
                    });
                    return {
                        ...txn,
                        timestamp: parseInt(blockDetails.header.Timestamp),
                    }
                })

                const finalBlocksAdded = await new Promise((resolve, reject) =>
                    TxBlockModel.insertMany(reducedBlocks, { ordered: false }, function (err, result) {
                        if (err) {
                            if (err.code === 11000) {
                                resolve(err.result.result.insertedIds);
                            } else {
                                reject(err);
                            }
                        }
                        resolve(result);    // Otherwise resolve
                    })
                )

                const finalTxsAdded = await new Promise((resolve, reject) =>
                    TxnModel.insertMany(finalTxns, { ordered: false }, function (err, result) {
                        if (err) {
                            if (err.code === 11000) {
                                resolve(err.result.result.insertedIds);
                            } else {
                                reject(err);
                            }
                        }
                        resolve(result);    // Otherwise resolve
                    })
                );

                await ContractStateModel.bulkWrite(contractsState.map(doc => ({
                    updateOne: {
                        filter: { address: doc.address },
                        update: doc,
                        upsert: true,
                    }
                })));

                console.log(`Added ${finalTxsAdded.length}/${txns.length} txs and ${finalBlocksAdded.length}/${txBlocks.length} blocks.`);

            } catch (err) {
                console.log('Error in processTransactions');
                console.log(err);
            }

        } else {
            console.log(`${end} is lower than ${start}`);
        }
    }
}

export default new Transactions();