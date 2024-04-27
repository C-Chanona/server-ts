import { GearApi, ProgramMetadata } from "@gear-js/api";
import { U8aFixed } from "@polkadot/types";

export interface UnestakeParams {
    // api: GearApi;
    // metadata: ProgramMetadata;
    amount: number;
    user: string;
    source: `0x${string}`;
    messageId: `0x${string}`
}

export interface JSONMessage {
    type: string;
    amount: number;
    source: `0x${string}`;
    value: number;
}