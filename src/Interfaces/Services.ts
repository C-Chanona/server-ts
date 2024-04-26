import { GearApi, ProgramMetadata } from "@gear-js/api";
import { U8aFixed } from "@polkadot/types";

export interface IUnestake {
    api: GearApi;
    metadata: ProgramMetadata;
    voucher_id: `0x${string}`;
    amount: number;
    user: string;
    source: U8aFixed;
    messageId: `0x${string}`
}