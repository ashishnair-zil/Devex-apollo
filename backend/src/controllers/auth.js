import { AppModel } from "../models/model.js";
import { encrypt, makeSalt, Md5 } from "../util.js";
import { success, error } from '../http/restResponse.js';
import jwt from 'jsonwebtoken';


class Auth {
    constructor() { }

    async register(req, res) {
        try {
            const app = new AppModel();

            app.name = req.body.name;

            app.appId = Number(new Date());

            const encrptSecret = encrypt(`${app.name},${app.appId},${makeSalt()}`);

            app.appSecret = Md5(encrptSecret);

            const result = await app.save();

            result.appSecret = encrptSecret;

            res.status(200).json(success(result));
        } catch (e) {
            console.log("Error: ", e);
            if (e.code === 11000) {
                res.status(400).json(error(400, "error", e.message));
            } else {
                res.status(500).json(error(500, 'Something went wrong.'));
            }
        }
    }

    async login(req, res) {
        try {
            const result = await AppModel.findOne({ 'appId': req.body.appId, 'appSecret': Md5(req.body.appSecret), 'status': 'active', }, { 'name': 1, 'appId': 1 });

            if (result) {

                let token = jwt.sign({ 'name': result.name, 'appId': result.appId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_TOKEN_LIFE });

                token = encrypt(token);

                const response = {
                    'loggedin': true,
                    'token': token
                };
                res.status(200).json(success(response));
            } else {
                res.status(401).json(error(401, 'Authentication failed.'));
            }

        } catch (e) {
            console.log("Error: ", e);
            res.status(500).json(error(500, 'Something went wrong.'));
        }
    }

    async reset(req, res) {
        try {
            const result = await AppModel.findOne({ 'appId': req.body.appId, 'name': req.body.name, 'status': 'active', }, { 'name': 1, 'appId': 1, "appSecret": 1 });
            if (!result) {
                return res.status(404).json(error(404, 'App not found'));
            }

            const encrptSecret = encrypt(`${result.name},${result.appId},${makeSalt()}`);

            result.appSecret = Md5(encrptSecret);

            const response = await result.save();

            response.appSecret = encrptSecret;

            res.status(200).json(success(response));
        } catch (e) {
            console.log("Error: ", e);
            res.status(500).json(error(500, 'Something went wrong.'));
        }
    }
}

export default new Auth();