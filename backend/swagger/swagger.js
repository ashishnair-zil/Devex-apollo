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
            "name": "txsType",
            "in": "query",
            "description": "Record of filter transactions",
            "required": false,
            "type": "string",
            "format": "nfts | tokens | zil | contract-creation | contract-calls | all (Default)",
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
    "/address/balance/{addressId}": {
      "get": {
        "tags": [
          "address"
        ],
        "summary": "Get balance of address",
        "description": "Returns balance of address",
        "operationId": "getBalance",
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
          }
        ],
        "responses": {
          "200": {
            "description": "successful operation"
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
    "/address/balance/{addressId}/token/{contractAddr}": {
      "get": {
        "tags": [
          "address"
        ],
        "summary": "Get balance of address",
        "description": "Returns balance of address",
        "operationId": "getTokenBalance",
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
            "name": "contractAddr",
            "in": "path",
            "description": "Record of contractAddr to return",
            "required": true,
            "type": "string",
            "format": "Bech32"
          }
        ],
        "responses": {
          "200": {
            "description": "successful operation"
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
    "/tx/{txId}": {
      "get": {
        "tags": [
          "transactions"
        ],
        "summary": "Find transactions by ID",
        "description": "Returns record of transactions",
        "operationId": "getTxById",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "txId",
            "in": "path",
            "description": "Record of transactions to return",
            "required": true,
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "description": "successful operation"
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
    "/tx/status/{txId}": {
      "get": {
        "tags": [
          "transactions"
        ],
        "summary": "Find transactions status by ID",
        "description": "Returns status record of transactions",
        "operationId": "getTxStatusById",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "txId",
            "in": "path",
            "description": "Record of transactions to return",
            "required": true,
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "description": "successful operation"
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
    "/login": {
      "post": {
        "tags": [
          "apps"
        ],
        "summary": "Request for api token",
        "description": "",
        "operationId": "login",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "in": "body",
            "name": "body",
            "description": "Login object that needs to generate a access token.",
            "required": true,
            "schema": {
              "$ref": "#/definitions/Login"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Return api token and loggin status."
          },
          "400": {
            "description": "Invalid body object.",
          }
        }
      }
    },
    "/register": {
      "post": {
        "tags": [
          "apps"
        ],
        "summary": "Register an app in database",
        "description": "",
        "operationId": "register",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "in": "body",
            "name": "body",
            "description": "Registration object that needs to create an app in Database.",
            "required": true,
            "schema": {
              "$ref": "#/definitions/Register"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Return api token and loggin status."
          },
          "400": {
            "description": "Invalid body object.",
          }
        }
      }
    },
    "/reset-secret": {
      "post": {
        "tags": [
          "apps"
        ],
        "summary": "Reset app secret an app in database",
        "description": "",
        "operationId": "reset",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "in": "body",
            "name": "body",
            "description": "Reset object that needs to reset app secret in Database.",
            "required": true,
            "schema": {
              "$ref": "#/definitions/Reset"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Return api token and loggin status."
          },
          "400": {
            "description": "Invalid body object.",
          }
        }
      }
    }
  },
  "securityDefinitions": {
    "api_key": {
      "type": "apiKey",
      "name": "x-access-token",
      "in": "header"
    }
  },
  "definitions": {
    "Login": {
      "type": "object",
      "properties": {
        "appId": {
          "type": "integer",
          "format": "int32"
        },
        "appSecret": {
          "type": "string"
        }
      }
    },
    "Register": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        }
      }
    },
    "Reset": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "appId": {
          "type": "integer",
          "format": "int32"
        }
      }
    }
  }
}