"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unestake = exports.messageExtrinsic = void 0;
const tslib_1 = require("tslib");
const api_1 = require("@gear-js/api");
let gApi;
let meta;
const source = process.env.SOURCE;
function calculateGasLimit(payload, seed) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return gApi === null || gApi === void 0 ? void 0 : gApi.program.calculateGas.handle(seed, source, payload, 0, false, meta);
    });
}
function messageExtrinsic(payload, seed) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const gas = yield calculateGasLimit(payload, seed).catch(error => console.log(error));
        const message = {
            destination: source,
            payload,
            gasLimit: BigInt(((_b = (_a = gas === null || gas === void 0 ? void 0 : gas.toHuman().min_limit) === null || _a === void 0 ? void 0 : _a.toString().replace(/,/g, '')) !== null && _b !== void 0 ? _b : '0')),
            value: 0,
        };
        return gApi === null || gApi === void 0 ? void 0 : gApi.message.send(message, meta);
    });
}
exports.messageExtrinsic = messageExtrinsic;
function unestake(gApi, metadata, params) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        gApi = gApi;
        meta = metadata;
        const { seed } = api_1.GearKeyring.generateSeed(`${process.env.NMONIC}`);
        const kering = yield api_1.GearKeyring.fromSeed(seed);
        const unestakeExtrinsic = gApi.tx.staking.unbond(params.amount);
        let ledger, era, currentEra;
        yield unestakeExtrinsic.signAndSend(kering, (_a) => tslib_1.__awaiter(this, [_a], void 0, function* ({ status }) {
            if (status.isInBlock) {
                console.log(status.type);
            }
            else {
                if (status.type === "Finalized") {
                    console.log(status.type);
                    ledger = yield gApi.query.staking.ledger(`${process.env.PUBLIC_KEY}`);
                    if (ledger) {
                        let unlocking = ledger.unwrap().unlocking.toHuman();
                        era = unlocking[1].era;
                    }
                    else {
                        return new Promise((resolve, reject) => {
                            reject("something went wrong with the ledger.");
                        });
                    }
                    currentEra = (yield gApi.query.staking.currentEra()).unwrap();
                    console.log("era: ", era, "currentEra: ", currentEra.toString());
                    let payload = {
                        "UpdateUnestake": [
                            params.user,
                            era,
                            Math.round((((era - currentEra) * 12) / 24)),
                        ]
                    };
                    let extrinsic = yield messageExtrinsic(payload, seed);
                    yield extrinsic.signAndSend(kering, ({ status }) => {
                        if (status.isInBlock) {
                            console.log(status.type);
                        }
                        else {
                            if (status.type === "Finalized") {
                                console.log(status.type);
                            }
                        }
                    });
                }
            }
        }));
    });
}
exports.unestake = unestake;
