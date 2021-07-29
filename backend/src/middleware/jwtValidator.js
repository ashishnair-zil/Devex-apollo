/* eslint-disable max-len */
import jwt from 'jsonwebtoken';
import { error } from '../http/restResponse.js';
import { decryt } from '../util.js';

class JwtValidator {
    async validate(req, res, next) {
        try {
            let token = req.headers['x-access-token'] || req.headers['authorization'];
            if (token && token.startsWith('Bearer ')) {
                // Remove Bearer from string
                token = token.slice(7, token.length);
            }
            if (token) {
                jwt.verify(decryt(token), process.env.JWT_SECRET, (err, decoded) => {
                    if (err) {
                        return res.status(401).json(error(401, 'Token is not valid'));
                    } else {
                        req.decoded = decoded;
                        next();
                    }
                });
            } else {
                return res.status(400).json(error(400, 'Auth token is not supplied'));
            }
        } catch (e) {
            return res.status(500).json(error(500, 'Something went wrong while decoding token.'));
        }
    }
}

export default new JwtValidator();