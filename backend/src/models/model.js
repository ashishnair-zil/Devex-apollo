/* Schema references types in Zilliqa-js-sdk */
import mongoose from "mongoose";

const Schema = mongoose.Schema;

let TxBlockHeader = new Schema({
  BlockNum: {
    type: String,
    unique: true,
  },
  DSBlockNum: String,
  GasLimit: String,
  GasUsed: String,
  MbInfoHash: String,
  MinerPubKey: String,
  NumMicroBlocks: Number,
  NumTxns: Number,
  PrevBlockHash: String,
  Rewards: String,
  StateDeltaHash: String,
  StateRootHash: String,
  Timestamp: { type: String, index: true },
  Version: Number,
});

let MicroBlockInfo = new Schema({
  MicroBlockHash: String,
  MicroBlockShardId: Number,
  MicroBlockTxnRootHash: String,
});

let TxBlockBody = new Schema({
  BlockHash: String,
  HeaderSign: String,
  MicroBlockInfos: [MicroBlockInfo],
});

let TxBlock = new Schema({
  customId: {
    type: Number,
    unique: true,
  },
  body: TxBlockBody,
  header: TxBlockHeader,
  txnHashes: [String],
});

// Receipt Schema
let ExceptionEntry = new Schema({
  line: Number,
  message: String,
});

let EventParam = new Schema({
  vname: String,
  type: String,
  value: Schema.Types.Mixed,
});

let EventLogEntry = new Schema({
  address: String,
  _eventname: String,
  params: [EventParam],
});

let TransitionMsg = new Schema({
  _amount: String,
  _recipient: { type: String, index: true },
  _tag: { type: String, index: true },
  params: [EventParam],
});

let TransitionEntry = new Schema({
  accepted: Boolean,
  addr: { type: String, index: true },
  depth: Number,
  msg: TransitionMsg,
});

let TxnReceipt = new Schema({
  accepted: Boolean,
  cumulative_gas: String,
  epoch_num: String,
  event_logs: [EventLogEntry],
  exceptions: [ExceptionEntry],
  success: Boolean,
  transitions: [TransitionEntry],
  error: Schema.Types.Mixed,
});

let TxTransitionMsg = new Schema({
  _amount: String,
  _recipient: { type: String, index: true },
  _tag: { type: String, index: true },
  params: Schema.Types.Mixed,
});

let TxTransition = new Schema({
  msg: TxTransitionMsg,
  accepted: Boolean,
  addr: { type: String, index: true },
  depth: Number,
});

let ContractState = new Schema({
  address: { type: String, index: true },
  params: Schema.Types.Mixed,
  state: Schema.Types.Mixed,
});

let TxStatusCodes = new Schema({
  status: { type: Number, index: true },
  description: String
});

let Txn = new Schema({
  customId: {
    type: String,
    unique: true,
  },
  ID: {
    type: String,
    unique: true,
  },
  amount: String,
  gasLimit: String,
  gasPrice: String,
  code: String,
  data: Schema.Types.Mixed,
  nonce: String,
  receipt: TxnReceipt,
  senderPubKey: String,
  signature: String,
  fromAddr: { type: String, index: true },
  toAddr: { type: String, index: true },
  contractAddr: String,
  type: String,
  version: String,
  timestamp: { type: Number, index: true },
  blockId: Number,
  transitions: [TxTransition],
  modificationState: Number,
  status: Number,
  success: Boolean,
  epochInserted: String,
  epochUpdated: String
});

let Apps = new Schema({
  name: { type: String, unique: true },
  appId: { type: Number, index: true },
  appSecret: String,
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

export const TransitionModel = mongoose.model("Transition", TxTransition);
export const TxnModel = mongoose.model("Txn", Txn);
export const TxBlockModel = mongoose.model("Block", TxBlock);
export const ContractStateModel = mongoose.model("State", ContractState);
export const AppModel = mongoose.model("Apps", Apps);
export const TxStatusCodesModel = mongoose.model("TxStatusCodes", TxStatusCodes);
