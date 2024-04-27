import { GearApi, ProgramMetadata, GearKeyring } from "@gear-js/api";
import { UnestakeParams } from "../Interfaces/Services";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { ISubmittableResult } from '@polkadot/types/types';

export class Handler {

    private gApi: GearApi;
    private metadata: ProgramMetadata;
    private source: `0x${string}` = process.env.SOURCE as `0x${string}`;    
    private seed: `0x${string}`;
    
     constructor(meta: ProgramMetadata, gApi: GearApi){
        this.metadata = meta;
        this.gApi = gApi;
        const { seed } = GearKeyring.generateSeed(`${process.env.NMONIC}`);
        this.seed = seed;
    }

    public async stake(amount: number) {
        const stakeExtrinsic = this.gApi.tx.staking.bondExtra(amount);
        await this.signer(stakeExtrinsic, () => {});
        return "staked"
    }

    public async unestake(params: UnestakeParams) {
        const unestakeExtrinsic = this.gApi.tx.staking.unbond(params.amount);
        await this.signer(unestakeExtrinsic, async () => {
            let unlocking: any = (await this.gApi.query.staking.ledger(`${process.env.PUBLIC_KEY}`)).unwrap().unlocking.toHuman();
            let era = unlocking[1].era;
            let currentEra: any = (await this.gApi.query.staking.currentEra()).unwrap();
    
            let payload = {
                "UpdateUnestake": [
                    params.user,
                    era,
                    Math.round((((era - currentEra) * 12) / 24)),
                ]
            }
    
            let extrinsic = await this.messageExtrinsic(payload, this.seed) as any
            await this.signer(extrinsic, () => {});
        });
    }

    public withdraw(payload: any) {

    }

    private async signer(messageExtrinsic: SubmittableExtrinsic<"promise">, continueWith: Function) {
        const kering = await GearKeyring.fromSeed(this.seed);

        await messageExtrinsic.signAndSend(
            kering, ({status}) => {
                if (status.isInBlock) {
                    console.log(status.type);
                } else {
                    if (status.type === "Finalized") {
                        console.log(status.type)
                        continueWith();  
                    }
                }
            }
        );
    }

    private async calculateGasLimit(payload: any, seed: any) {
        return this.gApi?.program.calculateGas.handle(
            seed,
            this.source,
            payload, 
            0,      
            false, 
            this.metadata,
        );
    }

    private async messageExtrinsic(payload: any, seed: string) {
        const gas = await this.calculateGasLimit(payload, seed).catch(error => console.log(error));
        const message = {
            destination: this.source,
            payload,
            gasLimit: BigInt((gas?.toHuman().min_limit?.toString().replace(/,/g, '') ?? '0')),
            value: 0,
        }
    
        return this.gApi?.message.send(message, this.metadata);
    }
}