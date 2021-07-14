import jsonValidator from 'jsonschema';
const Validator = jsonValidator.Validator
import jsonSchema from '../jsonSchema/index.js';

class SchemaValidator {
    constructor() {
        this.validate = this.validate.bind(this);
    }

    validate(route) {
        return async function (req, res, next) {
            try {

                const reqBody = this.getRequestBody(req);

                const jsonSchemaObj = this.getJsonSchema(route, req);

                const v = new Validator();

                let err = [];

                let result = null;
                // schema validation for get functionality
                result = v.validate(reqBody, jsonSchemaObj)
                if (result) {
                    if (result.valid) {
                        next()
                    } else {
                        err = result.errors.map(function (err) {
                            return err.stack.replace(/instance./, '')
                        })
                        res.status(400).json({ 'statusCode': 400, 'message': 'error', 'error': err });
                    }
                }
            } catch (err) {
                console.error('Error in schema middleware =>', err)
                return res.status(500).json({ 'statusCode': 500, 'message': 'error', 'error': err });
            }
        }.bind(this);
    }

    getRequestBody(req) {
        switch (req.method) {
            case 'POST':
                return req.body
                break;
            case 'PUT':
                return req.body
                break;
            default:
                return req.query
        }
    }

    getJsonSchema(schema, req) {
        return jsonSchema[`${req.method.toLowerCase()}-${schema}`];
    }
}

export default new SchemaValidator();