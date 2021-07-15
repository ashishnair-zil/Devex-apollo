export default {
  "swagger": "2.0",
  "info": {
    "description": "This is a Block Explorer build on top of  Devex-apollo server.",
    "version": "1.0.5",
    "title": "Swagger Devex Server",
    "termsOfService": "",
    "contact": {},
    "license": {}
  },
  "host": process.env.BASE_URL,
  "basePath": "/api",
  "tags": [],
  "schemes": [
    "http",
    "https"
  ],
  "paths": {
    "/address/{addressId}": {
      "get": {
        "tags": [
          "address"
        ],
        "summary": "Find address by ID",
        "description": "Returns record of address",
        "operationId": "getAddressById",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "addressId",
            "in": "path",
            "description": "Record of address to return",
            "required": true,
            "type": "string",
            "format": "Bech32"
          },
          {
            "name": "tab",
            "in": "query",
            "description": "Record of tab to return",
            "required": false,
            "type": "string",
            "format": "tokens | contracts | transactions (Default)"
          },
          {
            "name": "contractAddr",
            "in": "query",
            "description": "Record of contractAddr to return",
            "required": false,
            "type": "string",
            "format": "Bech32"
          },
          {
            "name": "pageNum",
            "in": "query",
            "description": "Page number of records",
            "required": false,
            "type": "integer",
            "format": "int64"
          },
          {
            "name": "perPage",
            "in": "query",
            "description": "Page limit of records",
            "required": false,
            "type": "integer",
            "format": "int64"
          }
        ],
        "responses": {
          "200": {
            "description": "successful operation"
          },
          "400": {
            "description": "Invalid ID supplied"
          },
          "404": {
            "description": "Pet not found"
          }
        },
        "security": [
          {
            "api_key": [

            ]
          }
        ]
      }
    },
    "/txs/{txsId}": {
      "get": {
        "tags": [
          "transactions"
        ],
        "summary": "Find transactions by ID",
        "description": "Returns record of transactions",
        "operationId": "getTxsById",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "txsId",
            "in": "path",
            "description": "Record of transactions to return",
            "required": true,
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "description": "successful operation"
          },
          "400": {
            "description": "Invalid ID supplied"
          },
          "404": {
            "description": "Pet not found"
          }
        },
        "security": [
          {
            "api_key": [

            ]
          }
        ]
      }
    },
    "/block/{blockId}": {
      "get": {
        "tags": [
          "block"
        ],
        "summary": "Find block by ID",
        "description": "Returns record of block",
        "operationId": "getTxsById",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "blockId",
            "in": "path",
            "description": "Record of block to return",
            "required": true,
            "type": "integer"
          },
          {
            "name": "pageNum",
            "in": "query",
            "description": "Page number of records",
            "required": false,
            "type": "integer",
            "format": "int64"
          },
          {
            "name": "perPage",
            "in": "query",
            "description": "Page limit of records",
            "required": false,
            "type": "integer",
            "format": "int64"
          }
        ],
        "responses": {
          "200": {
            "description": "successful operation"
          },
          "400": {
            "description": "Invalid ID supplied"
          },
          "404": {
            "description": "Pet not found"
          }
        }
      }
    }
  }
}