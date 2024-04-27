"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stake = void 0;
const tslib_1 = require("tslib");
const api_1 = require("@gear-js/api");
function stake(gApi, amount) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { seed } = api_1.GearKeyring.generateSeed(`${process.env.NMONIC}`);
        const kering = yield api_1.GearKeyring.fromSeed(seed);
        const stakeExtrinsic = gApi.tx.staking.bondExtra(amount);
        yield stakeExtrinsic.signAndSend(kering, ({ status }) => {
            if (status.isInBlock) {
                console.log(status.type);
            }
            else {
                if (status.type === "Finalized") {
                    console.log(status.type);
                }
            }
        });
        return "staked";
    });
}
exports.stake = stake;
