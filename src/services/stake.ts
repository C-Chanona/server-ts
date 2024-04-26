import { GearApi, GearKeyring } from "@gear-js/api";

export async function stake(gApi: GearApi, amount: number) {
    const { seed } = GearKeyring.generateSeed(`${process.env.NMONIC}`);
    const kering = await GearKeyring.fromSeed(seed);
    const stakeExtrinsic = gApi.tx.staking.bondExtra(amount);
    await stakeExtrinsic.signAndSend(
        kering, ({ status }) => {
            if (status.isInBlock) {
                console.log(status.type);
            } else {
                if (status.type === "Finalized") {
                    console.log(status.type);
                }
            }
        }
    )

    return "staked"
}