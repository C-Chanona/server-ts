"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Handler = void 0;
const tslib_1 = require("tslib");
const api_1 = require("@gear-js/api");
class Handler {
    constructor(meta, gApi) {
        this.source = process.env.SOURCE;
        this.metadata = meta;
        this.gApi = gApi;
        const { seed } = api_1.GearKeyring.generateSeed(`${process.env.NMONIC}`);
        this.seed = seed;
    }
    stake(amount) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const stakeExtrinsic = this.gApi.tx.staking.bondExtra(amount);
            yield this.signer(stakeExtrinsic, () => { });
            return "staked";
        });
    }
    unestake(params) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const unestakeExtrinsic = this.gApi.tx.staking.unbond(params.amount);
            yield this.signer(unestakeExtrinsic, () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                let unlocking = (yield this.gApi.query.staking.ledger(`${process.env.PUBLIC_KEY}`)).unwrap().unlocking.toHuman();
                let era = unlocking[1].era;
                let currentEra = (yield this.gApi.query.staking.currentEra()).unwrap();
                let payload = {
                    "UpdateUnestake": [
                        params.user,
                        era,
                        Math.round((((era - currentEra) * 12) / 24)),
                    ]
                };
                let extrinsic = yield this.messageExtrinsic(payload, this.seed);
                yield this.signer(extrinsic, () => { });
            }));
        });
    }
    withdraw(payload) {
    }
    signer(messageExtrinsic, continueWith) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const kering = yield api_1.GearKeyring.fromSeed(this.seed);
            yield messageExtrinsic.signAndSend(kering, ({ status }) => {
                if (status.isInBlock) {
                    console.log(status.type);
                }
                else {
                    if (status.type === "Finalized") {
                        console.log(status.type);
                        continueWith();
                    }
                }
            });
        });
    }
    calculateGasLimit(payload, seed) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            var _a;
            return (_a = this.gApi) === null || _a === void 0 ? void 0 : _a.program.calculateGas.handle(seed, this.source, payload, 0, false, this.metadata);
        });
    }
    messageExtrinsic(payload, seed) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const gas = yield this.calculateGasLimit(payload, seed).catch(error => console.log(error));
            const message = {
                destination: this.source,
                payload,
                gasLimit: BigInt(((_b = (_a = gas === null || gas === void 0 ? void 0 : gas.toHuman().min_limit) === null || _a === void 0 ? void 0 : _a.toString().replace(/,/g, '')) !== null && _b !== void 0 ? _b : '0')),
                value: 0,
            };
            return (_c = this.gApi) === null || _c === void 0 ? void 0 : _c.message.send(message, this.metadata);
        });
    }
}
exports.Handler = Handler;
