import { __awaiter } from "tslib";
import { GearKeyring } from "@gear-js/api";
// import { AnyJson } from "@polkadot/types/types";
// import { SubmittableExtrinsic } from "@polkadot/api/types";
// import { ISubmittableResult } from "@polkadot/types/types";
let gApi;
let meta;
function calculateGasLimit(payload, seed) {
    return __awaiter(this, void 0, void 0, function* () {
        return gApi === null || gApi === void 0 ? void 0 : gApi.program.calculateGas.handle(seed, process.env.SOURCE, payload, 0, false, meta);
    });
}
export function messageExtrinsic(payload, seed) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const gas = yield calculateGasLimit(payload, seed);
        const message = {
            destination: process.env.SOURCE,
            payload,
            gasLimit: BigInt(((_b = (_a = gas === null || gas === void 0 ? void 0 : gas.toHuman().min_limit) === null || _a === void 0 ? void 0 : _a.toString().replace(/,/g, '')) !== null && _b !== void 0 ? _b : '0')),
            value: 0,
        };
        return gApi === null || gApi === void 0 ? void 0 : gApi.message.send(message, meta);
    });
}
export function unestake(api, metadata, voucher_id, amount, user, source, messageId) {
    return __awaiter(this, void 0, void 0, function* () {
        gApi = api;
        meta = metadata;
        const { seed } = GearKeyring.generateSeed(`${process.env.NMONIC}`);
        const kering = yield GearKeyring.fromSeed(seed);
        const unestakeExtrinsic = gApi.tx.staking.unbond(amount);
        let ledger, era, currentEra;
        console.log("unestakeExtrinsic: ", unestakeExtrinsic);
        const vocuherTx = gApi.voucher.call(voucher_id, { SendMessage: unestakeExtrinsic });
        yield unestakeExtrinsic.signAndSend(kering, (_a) => __awaiter(this, [_a], void 0, function* ({ status }) {
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
                            user,
                            era,
                            Math.round((((era - currentEra) * 12) / 24)),
                        ]
                    };
                    let extrinsic = yield messageExtrinsic(payload, seed);
                    const vocuherTx = gApi.voucher.call(voucher_id, { SendMessage: extrinsic });
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
