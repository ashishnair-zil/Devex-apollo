import Address from './controllers/address.js';
import Transaction from './controllers/transaction.js';
import Block from './controllers/block.js';
import schemaValidator from './middleware/schemaValidator.js';

export class Routes {

    constructor(express) {
        this.router = express.Router();
    }

    getRoute() {

        this.router.get('/txs/:id', Transaction.searchById);

        this.router.get('/address/:id', schemaValidator.validate('contract-address-data'), Address.searchById);

        this.router.get('/address/balance/:id', Address.getBalanceByAddressId);

        this.router.get('/block/:id', Block.searchById);

        return this.router;
    }

    init() {
        return this.getRoute();
    }
}