import Address from './controllers/address.js';
import Transaction from './controllers/transaction.js';
import Block from './controllers/block.js';
import schemaValidator from './middleware/schemaValidator.js';
import jwt from './middleware/jwtValidator.js';
import Auth from './controllers/auth.js';

export class Routes {

    constructor(express) {
        this.router = express.Router();
    }

    getRoute() {

        this.router.post('/register', schemaValidator.validate('register'), Auth.register);

        this.router.post('/login', schemaValidator.validate('login'), Auth.login);

        this.router.post('/reset-secret', schemaValidator.validate('reset'), Auth.reset);

        this.router.get('/tx/:id', jwt.validate, Transaction.searchById);

        this.router.get('/tx/status/:id',jwt.validate, Transaction.searchTxStatusById);

        this.router.get('/address/:id', jwt.validate, schemaValidator.validate('contract-address-data'), Address.searchById);

        this.router.get('/address/balance/:id', jwt.validate, Address.getBalanceByAddressId);

        this.router.get('/address/balance/:id/token/:contractAddr', jwt.validate, Address.getTokenBalanceByAddressId);

        this.router.get('/block/:id', jwt.validate, Block.searchById);

        return this.router;
    }

    init() {
        return this.getRoute();
    }
}