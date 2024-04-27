import { GearApi, ProgramMetadata } from "@gear-js/api";
import { UnestakeParams, JSONMessage } from "./Interfaces/Services";
import { AnyJson } from "@polkadot/types/types";
import { Hex } from "./utils/hex";
import { Handler } from "./services/handler";

export class Server {
    private messages: Set<string>;
    private meta: ProgramMetadata;
    private gApi: GearApi;
    private Handler: Handler;

    constructor(gApi: GearApi) {
        this.meta = ProgramMetadata.from(`${process.env.META}`);
        this.messages = new Set();
        this.gApi = gApi;
        this.Handler = new Handler(this.meta, this.gApi);
    }

    public subscribeToEvent() {
        this.gApi.gearEvents.subscribeToGearEvent('UserMessageSent', this.handleUserMessageSentEvent.bind(this));
    }

    private handleStake(amount: number) {
        this.Handler.stake(amount);
    }

    private handleUnestake(payloadObject: any, user: string, source: `0x${string}`, id: `0x${string}`) {
        let uParams: UnestakeParams = {
            amount: payloadObject.amount * 1000000000000,
            user: user,
            source: source,
            messageId: id
        }
        this.Handler.unestake(uParams);
    }

    private handleWithdraw(payload: AnyJson) {
        this.Handler.withdraw(payload);
    }

    private handleUserMessageSentEvent({ data: { message: { id, source, destination, payload, value, details } } }: any) {
        console.log(id.toHuman())
        let message = id.toHuman().toString();

        if (!this.messages.has(message)) {
            this.messages.add(message);
        } else {
            return;
        }

        if (source.toHex() == `${process.env.SOURCE}` && destination.toHex() == `${process.env.DESTINATION}`) {
            const payloadString: string = (Buffer.from(payload.toHex().slice(2), 'hex').toString('utf8')).slice(2);
            let payloadOject: JSONMessage = JSON.parse(payloadString);
            console.log("soy payloadString:", payloadString);
            console.log(`Message sent from ${source.toHex()} to ${destination.toHex()}`);
            try {
                if (payloadOject) {
                    let user = Hex.toActorId(payloadOject.source)

                    switch (payloadOject.type) {
                        case "stake":
                            this.handleStake(payloadOject.value);
                            break;
                        case "unestake":
                            this.handleUnestake(payloadOject, user, source.toHex(), id.toHex());
                            break;
                        case "withdraw":
                            this.handleWithdraw(payload);
                            break;
                        default:
                            console.log("ERROR ON SWITCH CASE");
                            throw new Error("Error in Switch Case");
                    }
                }
                else {
                    throw new Error("Error in payload")
                }
            } catch (error) {
                console.log(error);
            }
        }
    }
}