import { TxnModel, ContractStateModel } from "../models/model.js";
import { convertToBech16Address, convertToBech32Address, addHexPrefix, convertToDateTime, convertZilToQa } from "../util.js";

class Address {

    constructor() {
        this.searchById = this.searchById.bind(this);
        this.getBalanceByAddressId = this.getBalanceByAddressId.bind(this);
    }

    async search(req, res) { }

    async getBalance(address) {
        let tx = await TxnModel.find({
            $and: [
                { 'receipt.success': true },
                {
                    $or: [{
                        'fromAddr': address
                    },
                    {
                        'toAddr': address
                    }]
                }]
        },
            {
                toAddr: 1,
                fromAddr: 1,
                amount: 1,
                'receipt.cumulative_gas': 1,
                gasPrice: 1
            },
            {
                sort: {
                    'timestamp': 1
                }
            });

        let currentBalance = 0;

        let initialBalance = 0;

        let totalDeductBalance = 0;

        let totalFee = 0;

        await tx.map((row, idx) => {
            if (idx > 0) {
                if (row.fromAddr === address) {

                    currentBalance -= parseFloat(row.amount);

                    totalDeductBalance += parseFloat(row.amount);

                } else if (row.toAddr === address) {

                    currentBalance += parseFloat(row.amount);

                }
            } else {
                currentBalance = parseFloat(row.amount);

                initialBalance = row.amount;
            }

            totalFee += row.receipt.cumulative_gas * row.gasPrice;

            return row;
        });

        if (currentBalance) {
            currentBalance = currentBalance - totalFee;
        }

        return {
            initialBalance,
            currentBalance,
            totalDeductBalance
        }
    }

    async getBalanceByAddressId(req, res) {
        const address = convertToBech16Address(req.params.id);
        let balance = 0;
        if (req.query.contractAddr) {
            const contractAddr = convertToBech16Address(req.query.contractAddr);

            balance = await this.getFtToken(address, contractAddr);

            balance = balance && balance[0] && balance[0].balances ? parseFloat(balance[0].balances) : 0;
        } else {
            balance = await this.getBalance(address);

            balance = balance && balance.currentBalance ? balance.currentBalance : 0;
        }
        return res.json({ 'data': { 'balance': balance } });
    }

    async searchById(req, res) {
        try {
            const id = req.params.id;

            const tab = req.query.tab;

            const contractAddr = req.query.contractAddr ? convertToBech16Address(req.query.contractAddr) : null;

            const perPage = req.query.perPage ? parseInt(req.query.perPage) : parseInt(process.env.PAGE_LIMIT);

            const page = req.query.pageNum ? parseInt(req.query.pageNum) : parseInt(process.env.DEFAULT_PAGE);

            const skip = (page - 1) * perPage;

            const response = {};

            const address = convertToBech16Address(id);

            const txData = await this.getBalance(address);

            response.totalRecords = await this.getTxCount(address);

            response.balance = txData.currentBalance;

            if (tab && tab === 'tokens') {
                const tokens = await this.getTokenByAddress(address, contractAddr);

                if (tokens) {
                    response.tokens = tokens;
                }
            } else if (tab && tab === 'contracts') {
                const contracts = await this.getContractByAddress(address);

                if (contracts && contracts.length) {
                    response.contracts = contracts;
                }
            } else {
                response.txs = await this.getTxData(address, skip, perPage, req.query);

                const contractState = await this.getContractStateByAddress(address);

                if (contractState) {
                    response.state = contractState;
                }
            }

            return res.json({ 'data': response });
        } catch (err) {
            console.log(err)
            res.status(400).send({ error: err });
        }
    }

    async getTxCount(address) {
        const condition = { $or: [{ 'fromAddr': address }, { 'toAddr': address }, { 'receipt.transitions.addr': address }, { 'receipt.transitions.msg._recipient': address }, { 'contractAddr': address }] };

        return await TxnModel.count(condition);
    }

    async getTxData(address, skip, perPage, filters = null) {
        try {
            let tx = {};
            let condition = {}

            if (filters && filters.txsType && filters.txsType === 'nfts') {
                condition = {
                    $and: [
                        {
                            $or: [
                                { 'fromAddr': address },
                                { 'toAddr': address },
                                { 'receipt.transitions.addr': address },
                                { 'receipt.transitions.msg._recipient': address },
                                { 'contractAddr': address }]
                        },
                        { "receipt.transitions.msg.params.vname": "token_id" }
                    ]
                };
            } else if (filters && filters.txsType && filters.txsType === 'tokens') {
                condition = {
                    $and: [
                        {
                            $or: [
                                { 'fromAddr': address },
                                { 'toAddr': address },
                                { 'receipt.transitions.addr': address },
                                { 'receipt.transitions.msg._recipient': address },
                                { 'contractAddr': address }]
                        },
                        { "receipt.transitions.msg.params.vname": "amount" }
                    ]
                };
            } else if (filters && filters.txsType && (filters.txsType === 'normal' || filters.txsType === 'zil')) {
                condition = {
                    $and: [
                        {
                            $or: [
                                { 'fromAddr': address },
                                { 'toAddr': address },
                                { 'receipt.transitions.addr': address },
                                { 'receipt.transitions.msg._recipient': address },
                                { 'contractAddr': address }]
                        },
                        { "toAddr": { $ne: '0x0000000000000000000000000000000000000000' } },
                        { "type": "payment" }
                    ]
                };
            } else if (filters && filters.txsType && (filters.txsType === 'contractCreation' || filters.txsType === 'contract-creation')) {
                condition = {
                    $and: [
                        {
                            $or: [
                                { 'fromAddr': address },
                                { 'toAddr': address },
                                { 'receipt.transitions.addr': address },
                                { 'receipt.transitions.msg._recipient': address },
                                { 'contractAddr': address }]
                        },
                        { "toAddr": { $eq: '0x0000000000000000000000000000000000000000' } }
                    ]
                };
            } else if (filters && filters.txsType && (filters.txsType === 'contract' || filters.txsType === 'contract-calls')) {
                condition = {
                    $and: [
                        {
                            $or: [
                                { 'fromAddr': address },
                                { 'toAddr': address },
                                { 'receipt.transitions.addr': address },
                                { 'receipt.transitions.msg._recipient': address },
                                { 'contractAddr': address }]
                        },
                        { "type": "contract-call" }
                    ]
                };
            } else {
                condition = { $or: [{ 'fromAddr': address }, { 'toAddr': address }, { 'receipt.transitions.addr': address }, { 'receipt.transitions.msg._recipient': address }, { 'contractAddr': address }] };
            }

            tx.totalRecords = await TxnModel.count(condition);

            tx.numOfPages = Math.ceil(tx.totalRecords / perPage);

            tx.items = await TxnModel.find(condition).limit(perPage).skip(skip).sort({ 'timestamp': -1 });

            tx.items = await tx.items.map((row) => {
                row = JSON.parse(JSON.stringify(row));
                row.opsType = address == row.fromAddr ? 'out' : 'in';
                row.fee = row.receipt.cumulative_gas * row.gasPrice;
                row.date = convertToDateTime(row.timestamp);
                row.ID = addHexPrefix(row.ID);
                row.fromAddr = row.fromAddr;
                row.toAddr = row.toAddr;
                return row;
            })
            return tx;
        } catch (err) {
            console.log(err)
            return err;
        }
    }

    async getTokenByAddress(address, contractAddr = null) {
        const result = {};

        const nftToken = await this.getNftToken(address, contractAddr);

        if (nftToken.length) {
            result.nftToken = nftToken;
        }

        const ftTokens = await this.getFtToken(address, contractAddr);

        if (ftTokens.length) {
            result.ftTokens = ftTokens;
        }

        return result;
    }

    async getNftToken(address, contractAddr = null) {
        try {
            const condition = { "state.token_owners": { $exists: true }, "state.token_id_count": { $exists: true } };

            if (contractAddr) {
                condition.address = contractAddr;
            }

            const result = await ContractStateModel.aggregate([
                { $match: condition },
                {
                    "$addFields": {
                        "token_owners": {
                            "$map": {
                                "input": {
                                    "$filter": {
                                        "input": { "$objectToArray": "$state.token_owners" },
                                        "as": "el",
                                        "cond": { $eq: ['$$el.v', address] }
                                    }
                                },
                                "in": "$$this.k"
                            }
                        }
                    }
                },
                { $match: { "token_owners.0": { $exists: true } } }
            ]);
            const resultArr = [];

            result.map((row) => {
                resultArr.push({
                    'address': row.address,
                    'params': row.params,
                    'nfts': row.token_owners
                });
                return row;
            });
            return resultArr;
        } catch (err) {
            return err;
        }
    }

    async getFtToken(address, contractAddr = null) {
        try {
            const condition = { "state.total_supply": { $exists: true }, "state.balances": { $exists: true } };

            if (contractAddr) {
                condition.address = contractAddr;
            }

            const result = await ContractStateModel.aggregate([
                { $match: condition },
                {
                    "$addFields": {
                        "balances": {
                            "$map": {
                                "input": {
                                    "$filter": {
                                        "input": { "$objectToArray": "$state.balances" },
                                        "as": "el",
                                        "cond": { $eq: ['$$el.k', address] }
                                    }
                                },
                                "in": "$$this.v"
                            }
                        }
                    }
                },
                { $match: { "balances.0": { $exists: true } } },
            ]);

            const resultArr = [];
            result.map((row) => {
                resultArr.push({
                    'address': row.address,
                    'params': row.params,
                    'balances': row.balances.length && row.balances[0] ? row.balances[0] : 0
                });
                return row;
            });
            return resultArr;
        } catch (err) {
            return err;
        }
    }

    async getContractByAddress(address) {

        const condition = { 'fromAddr': address, 'toAddr': '0x0000000000000000000000000000000000000000' };

        // tx.totalRecords = await TxnModel.count(condition);

        // tx.numOfPages = Math.ceil(tx.totalRecords / perPage);

        let tx = await TxnModel.find(condition).sort({ 'timestamp': -1 });
        tx = JSON.parse(JSON.stringify(tx));

        const txArr = [];
        await tx.map((row) => {
            txArr[row.contractAddr] = row.contractAddr;
        })


        const contractState = await ContractStateModel.find({ address: { $in: Object.keys(txArr) } });
        const contractArr = [];
        await contractState.map((row) => {
            contractArr[row.address] = row;
        })


        tx = await tx.map((row) => {
            if (contractArr[row.contractAddr]) {
                row.state = contractArr[row.contractAddr];
            }

            return row;
        })

        return tx;

    }

    async getContractStateByAddress(address) {
        try {
            return await ContractStateModel.findOne({ address: address });
        } catch (err) {
            return err;
        }
    }
}

export default new Address();