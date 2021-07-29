import { TxStatusCodesModel } from '../models/model.js';
import txStatusCodes from './txStatusCodes.js';

class TxStatusCodeFixtures {
    async init() {
        try {
            console.log('Checking if TxStatusCodes exists.')
            txStatusCodes.map(async (row, index) => {
                TxStatusCodesModel.findOne({ status: row.status }, (err, resp) => {
                    if (!err) {
                        let addFlag = false;
                        if (!resp) {
                            resp = new TxStatusCodesModel();
                            addFlag = true;
                        }
                        resp.status = row.status;
                        resp.description = row.description;
                        resp.save(function (err) {
                            if (!err) {
                                if (addFlag)
                                    console.log(`TxStatusCodes ${row.slug} added successfully.`);
                                else
                                    console.log(`TxStatusCodes ${row.slug} updated successfully.`);
                            } else {
                                console.log("Error: could not save txStatusCodes " + err);
                            }
                        });
                    }
                });
            })
        } catch (err) {
            console.log('Error txStatusCodes fixtures', err)
        }
    }
}

export default new TxStatusCodeFixtures();