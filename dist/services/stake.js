import { __awaiter } from "tslib";
import { GearKeyring } from "@gear-js/api";
export function stake(gApi, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        const { seed } = GearKeyring.generateSeed(`${process.env.NMONIC}`);
        const kering = yield GearKeyring.fromSeed(seed);
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
