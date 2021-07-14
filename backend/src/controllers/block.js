import { TxBlockModel, TxnModel } from "../models/model.js";
import { convertToDateTime, pubKeyToHex, addHexPrefix, convertToBech32Address } from "../util.js";

class Block {
    constructor() { }

    async searchById(req, res) {
        let result = await TxBlockModel.findOne({ 'customId': req.params.id });

        const perPage = req.query.perPage ? req.query.perPage : parseInt(process.env.PAGE_LIMIT);

        const page = req.query.pageNum ? req.query.pageNum : parseInt(process.env.DEFAULT_PAGE);

        const skip = (page - 1) * perPage;

        let response = {};
        if (result) {
            response._id = result._id;
            response.customId = result.customId;
            response.blockHash = result.body.BlockHash;
            response.date = convertToDateTime(result.header.Timestamp);
            response.gasLimit = result.header.GasLimit;
            response.gasUsed = result.header.GasUsed;
            response.numTxns = result.header.NumTxns;
            response.miner = convertToBech32Address(addHexPrefix(pubKeyToHex(result.header.MinerPubKey)));
            response.dsBlock = result.header.DSBlockNum
            response.microBlock = {};
            result.body.MicroBlockInfos.map((row) => {
                response.microBlock[row.MicroBlockShardId] = row.MicroBlockHash
            })

            let transactions = await TxnModel.find({ 'blockId': req.params.id }).limit(perPage).skip(skip).sort({ 'timestamp': -1 });

            response.txs = {};

            response.txs.totalRecords = await TxnModel.count({ 'blockId': req.params.id });

            response.numOfPages = Math.ceil(response.txs.totalRecords / perPage);

            response.txs.items = await transactions.map((row) => {
                return {
                    ID: addHexPrefix(row.ID),
                    toAddr: row.toAddr,
                    fromAddr: row.fromAddr,
                    amount: row.amount,
                    fee: row.receipt.cumulative_gas * row.gasPrice
                }
            })
        }

        return res.json({ 'data': response });
    }
}

export default new Block();