import { TxnModel } from "../models/model.js";
import { convertToBech32Address, addHexPrefix, stripHexPrefix, convertToDateTime, convertZilToQa } from "../util.js";

class Transaction {

    constructor() {
        this.search = this.search.bind(this);
    }

    async search(req, res) { }

    async searchById(req, res) {
        try {
            const txId = stripHexPrefix(req.params.id);
            let tx = await TxnModel.findOne({ 'ID': txId });
            if (tx) {
                tx.fee = tx.receipt.cumulative_gas * tx.gasPrice;
                tx.date = convertToDateTime(tx.timestamp);
                tx.ID = addHexPrefix(tx.ID);
            } else {
                tx = [];
            }
            return res.json({ 'data': tx });
        } catch (err) {
            console.log(err)
            res.status(400).send({ error: err });
        }
    }
}

export default new Transaction();