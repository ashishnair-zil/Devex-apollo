import { TxnModel, TxStatusCodesModel } from "../models/model.js";
import { convertToBech32Address, addHexPrefix, stripHexPrefix, convertToDateTime, convertZilToQa } from "../util.js";
import { success, error } from '../http/restResponse.js';
class Transaction {

    constructor() {
        this.searchTxStatusById = this.searchTxStatusById.bind(this);
    }

    async searchById(req, res) {
        try {
            const txId = stripHexPrefix(req.params.id);

            const tx = await TxnModel.findOne({ 'ID': txId });

            let response = {};
            if (tx) {
                response = JSON.parse(JSON.stringify(tx));
                response.fee = tx.receipt.cumulative_gas * tx.gasPrice;
                response.date = convertToDateTime(tx.timestamp);
            }
            res.json(success(response));
        } catch (err) {
            console.log(err)
            res.status(400).send({ error: err });
        }
    }

    async searchTxStatusById(req, res) {
        try {
            const txId = stripHexPrefix(req.params.id);

            const tx = await TxnModel.findOne({ 'ID': txId }, { 'status': 1, 'ID': 1, 'success': 1 });

            const response = {};
            if (tx) {
                const txStatusList = await this.getStatusList();
                response.success = tx.success;
                response.status = tx.status;
                response.statusReason = txStatusList && txStatusList[tx.status] ? txStatusList[tx.status].description : undefined;
            }
            res.status(200).json(success(response));
        } catch (err) {
            console.log("Error:", err)
            res.status(400).send({ error: err });
        }
    }

    async getStatusList() {
        const result = await TxStatusCodesModel.find();
        const statusArr = [];
        result.map((row) => {
            statusArr[row.status] = row;
        })
        return statusArr;
    }
}

export default new Transaction();