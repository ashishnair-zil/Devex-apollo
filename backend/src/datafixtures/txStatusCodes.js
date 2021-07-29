export default [
    {
        "status": 1,
        "description": "Pending - Dispatched"
    },
    {
        "status": 2,
        "description": "Pending - Soft-confirmed (awaiting Tx block generation)"
    },
    {
        "status": 4,
        "description": "Pending - Nonce is higher than expected"
    },
    {
        "status": 5,
        "description": "Pending - Microblock gas limit exceeded"
    },
    {
        "status": 6,
        "description": "Pending - Consensus failure in network"
    },
    {
        "status": 3,
        "description": "Confirmed"
    },
    {
        "status": 10,
        "description": "Rejected - Transaction caused math error"
    },
    {
        "status": 11,
        "description": "Rejected - Scilla invocation error"
    },
    {
        "status": 12,
        "description": "Rejected - Contract account initialization error"
    },
    {
        "status": 13,
        "description": "Rejected - Invalid source account"
    },
    {
        "status": 14,
        "description": "Rejected - Gas limit higher than shard gas limit"
    },
    {
        "status": 15,
        "description": "Rejected - Unknown transaction type"
    },
    {
        "status": 16,
        "description": "Rejected - Transaction sent to wrong shard"
    },
    {
        "status": 17,
        "description": "Rejected - Contract & source account cross-shard issue"
    },
    {
        "status": 18,
        "description": "Rejected - Code size exceeded limit"
    },
    {
        "status": 19,
        "description": "Rejected - Transaction verification failed"
    },
    {
        "status": 20,
        "description": "Rejected - Gas limit too low"
    },
    {
        "status": 21,
        "description": "Rejected - Insufficient balance"
    },
    {
        "status": 22,
        "description": "Rejected - Insufficient gas to invoke Scilla checker"
    },
    {
        "status": 23,
        "description": "Rejected - Duplicate transaction exists"
    },
    {
        "status": 24,
        "description": "Rejected - Transaction with same nonce but same/higher gas price exists"
    },
    {
        "status": 25,
        "description": "Rejected - Invalid destination address"
    },
    {
        "status": 26,
        "description": "Rejected - Failed to add contract account to state"
    },
    {
        "status": 27,
        "description": "Rejected - Nonce is lower than expected"
    },
    {
        "status": 255,
        "description": "Rejected - Internal error"
    }
]