import { GearApi, GearKeyring, ProgramMetadata } from "@gear-js/api";
import { U8aFixed } from "@polkadot/types-codec";

let gApi: GearApi;
let meta: ProgramMetadata;

async function calculateGasLimit(payload: any, seed: any) {
    return gApi?.program.calculateGas.handle(
        seed,
        process.env.SOURCE as `0x${string}`, 
        payload, 
        0,      
        false, 
        meta,
    );
}

export async function messageExtrinsic(payload: any, seed: string) {
    const gas = await calculateGasLimit(payload, seed);
    const message = {
        destination: process.env.SOURCE as `0x${string}`,
        payload,
        gasLimit: BigInt((gas?.toHuman().min_limit?.toString().replace(/,/g, '') ?? '0')),
        value: 0,
    }

    return gApi?.message.send(message, meta);
}

export async function unestake(api: GearApi, metadata: ProgramMetadata, voucher_id: `0x${string}`, amount: number, user: string, source: U8aFixed, messageId: `0x${string}`) {
    gApi = api;
    meta = metadata;
    const { seed } = GearKeyring.generateSeed(`${process.env.NMONIC}`);
    const kering = await GearKeyring.fromSeed(seed);
    const unestakeExtrinsic = gApi.tx.staking.unbond(amount) as any;
    let ledger: any, era: any, currentEra: any;
    
    await unestakeExtrinsic.signAndSend(
        kering, async ({ status }: any) => {
            if (status.isInBlock) {
                console.log(status.type);
            } else {
                if (status.type === "Finalized") {
                    console.log(status.type);
                    ledger = await gApi.query.staking.ledger(`${process.env.PUBLIC_KEY}`);
                    if (ledger) {
                        let unlocking: any = ledger.unwrap().unlocking.toHuman();
                        era = unlocking[1].era;
                    } else {
                        return new Promise((resolve, reject) => {
                            reject("something went wrong with the ledger.");
                        });
                    }
                    currentEra = (await gApi.query.staking.currentEra()).unwrap();
                    console.log("era: ", era, "currentEra: ", currentEra.toString());

                    let payload = {
                        "UpdateUnestake": [
                            user,
                            era,
                            Math.round((((era - currentEra) * 12) / 24)),
                        ]
                    }

                    let extrinsic = await messageExtrinsic(payload, seed)
                        
                    await extrinsic.signAndSend(
                        kering, ({ status }) => {
                            if (status.isInBlock) {
                                console.log(status.type);
                            } else {
                                if (status.type === "Finalized") {
                                    console.log(status.type)    
                                }
                            }
                        }     
                    );
                }
            }
        }
    );
}