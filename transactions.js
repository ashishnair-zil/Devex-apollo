import Api from "./datasource/api.js";
import { TxBlockModel, TxnModel, ContractStateModel, TxQueueModel } from "./mongodb/model.js";
import { range, removeValuesFromArray } from "./util.js";
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
            const lastBlockID = lastBlockInDB && lastBlockInDB.customId ? lastBlockInDB.customId + 1 : 0;
            console.log(`lastBlockID: ${lastBlockID} and latestBlockOnNetwork: ${latestBlockOnNtk}`)
            this.loadData(lastBlockID, latestBlockOnNtk);

            this.processTxns();

            this.updateStatusOfPendingTxns();
        } catch (err) {
            console.log('Error in processTransactions')
            console.log(err)
        } finally {
            setTimeout(() => this.init(), 30000);
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

                let txns = await this.api.getTxnIdByTxBlocks(blocksWithTxs);

                // console.log("txns", txns);
                // let txns = await this.api.getTxnBodiesByTxBlocks(blocksWithTxs);

                // txns = await this.api.getContractAddrFromTxID(txns);

                // const reducedTxns = txns.map(txn => txnReducer(txn));

                // const contractsChecked = await this.api.checkIfContracts(reducedTxns);

                // const contractsState = await this.getContractState(reducedTxns);

                // const finalTxns = contractsChecked.map(txn => {
                //     const blockDetails = reducedBlocks.find(block => {
                //         return parseInt(block.header.BlockNum) === txn.blockId;
                //     });
                //     return {
                //         ...txn,
                //         timestamp: parseInt(blockDetails.header.Timestamp),
                //     }
                // })

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

                // const finalTxsAdded = await new Promise((resolve, reject) =>
                //     TxnModel.insertMany(txns, { ordered: false }, function (err, result) {
                //         if (err) {
                //             if (err.code === 11000) {
                //                 resolve(err.result.result.insertedIds);
                //             } else {
                //                 reject(err);
                //             }
                //         }
                //         resolve(result);    // Otherwise resolve
                //     })
                // );

                const finalTxsAdded = await new Promise((resolve, reject) =>
                    TxQueueModel.insertMany(txns, { ordered: false }, function (err, result) {
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

                // await ContractStateModel.bulkWrite(contractsState.map(doc => ({
                //     updateOne: {
                //         filter: { address: doc.address },
                //         update: doc,
                //         upsert: true,
                //     }
                // })));

                console.log(`Added ${finalTxsAdded.length}/${txns.length} txs in the queue and ${finalBlocksAdded.length}/${txBlocks.length} blocks.`);

            } catch (err) {
                console.log('Error in processTransactions');
                console.log(err);
            }

        } else {
            console.log(`${end} is lower than ${start}`);
        }
    }

    async processTxns() {
        const txFromQueue = await TxQueueModel.find().sort({ blockId: 1 }).limit(BLOCKS_PER_REQUEST);

        if (!txFromQueue.length) {
            return true;
        }

        let tmpArr = [];
        let blockArr = {};
        txFromQueue.map((row, index) => {
            const txId = JSON.parse(row.txID);
            blockArr[row.blockId] = blockArr[row.blockId] || [];
            blockArr[row.blockId]['blockId'] = row.blockId;
            blockArr[row.blockId]['txID'] = txId;
            blockArr[row.blockId]['timestamp'] = row.timestamp;
            txId.map((r, k) => {
                tmpArr[index] = tmpArr[index] || [];
                tmpArr[index][k] = `${row.blockId}-${r}-${row.timestamp}`;
            })
        })

        const processedTxQueue = tmpArr.flat().slice(0, 50);

        let txns = await this.api.getTxn(processedTxQueue);

        txns = await this.api.getContractAddrFromTxID(txns);

        const reducedTxns = txns.map(txn => txnReducer(txn));

        const txnWithStatus = await this.api.getTxnStatusFromRxID(reducedTxns);

        const contractsChecked = await this.api.checkIfContracts(txnWithStatus);

        const contractsState = await this.getContractState(reducedTxns);

        const finalTxsAdded = await new Promise((resolve, reject) =>
            TxnModel.insertMany(contractsChecked, { ordered: false }, (err, result) => {
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

        const remainingTxQueue = await removeValuesFromArray(processedTxQueue, blockArr);

        // console.log("remainingTxQueue", remainingTxQueue);

        await TxQueueModel.bulkWrite(remainingTxQueue.map(doc => ({
            updateOne: {
                filter: { blockId: doc.blockId },
                update: doc
            }
        })));

        await TxQueueModel.remove({ txID: "[]" }).exec();

        console.log(`Added ${finalTxsAdded.length}/${txns.length} txs.`);
    }

    async updateStatusOfPendingTxns() {
        const txns = await TxnModel.find({ 'status': { $in: [1, 2, 4, 5, 6] }, 'fetchStatusCount': { $lt: 10 } }).sort({ blockId: 1 }).limit(BLOCKS_PER_REQUEST);

        if (!txns.length) {
            return true;
        }

        const txnsStatus = await this.api.getTxnStatusFromRxID(txns);

        await TxnModel.bulkWrite(txnsStatus.map(doc => ({
            updateOne: {
                filter: { ID: doc.ID },
                update: {
                    'status': doc.status,
                    'modificationState': doc.modificationState,
                    'success': doc.success,
                    'epochInserted': doc.epochInserted,
                    'epochUpdated': doc.epochUpdated,
                    'fetchStatusCount': doc.fetchStatusCount ? doc.fetchStatusCount + 1 : 1
                }
            }
        })));

        console.log(`Updated status of ${txns.length} txs.`);
    }
}

export default new Transactions();