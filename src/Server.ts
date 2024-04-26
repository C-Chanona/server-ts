import { GearApi, ProgramMetadata } from "@gear-js/api";
import { stake } from "./services/stake";
import { unestake } from "./services/unestake";

export class Server {

    private messages: Set<string>;
    private meta: ProgramMetadata;
    private gApi: GearApi;

    constructor(gApi: GearApi) {
        this.meta = ProgramMetadata.from(`${process.env.META}`);
        this.messages = new Set();
        this.gApi = gApi;
    }

    public async listen() {
        this.gApi.query.system.events((events) => {
            events
                .filter(({ event }) => this.gApi.events.balances.Transfer.is(event))
                .forEach(({ event: { data } }) => {
                    // console.log(data.toHuman());
                });
    
            events
                .filter(({ event }) => this.gApi.events.gear.UserMessageSent.is(event))
                .forEach(({ event: { data } }) => {
                    //   console.log(data.toHuman());
                });
    
            // events
            // .filter(({ event }) => this.gApi.events.balances.Withdraw.is(event))
            // .forEach(({ event: { data } }) => {
            //   console.log(data.toHuman());
            // });
    
        });
    }

    public subscribeToEvent() {
        this.gApi.gearEvents.subscribeToGearEvent(
            'UserMessageSent', ({
                data: {
                    message: { id, source, destination, payload, value, details },
                },
            }) => {
            let message = JSON.stringify(id.toHuman());
            if (!this.messages.has(message)) {
                this.messages.add(message);
            } else {
                return;
            }
        
            if (source.toHex() == `${process.env.SOURCE}` && destination.toHex() == `${process.env.DESTINATION}`) {
                const payloadHex: `0x${string}` = payload.toHex();
                const payloadString: string = Buffer.from(payloadHex.slice(2), 'hex').toString('utf8');
                const newString: string = payloadString.slice(2);
                let payloadOject;
                console.log("soy payloadString:", newString);
                console.log(`Message sent from ${source.toHex()} to ${destination.toHex()}`);
                try {
                    payloadOject = JSON.parse(newString);
                } catch (error) {
                    console.log(error);
                }
                if (payloadOject) {
                    let actorId = payloadOject.source;
                    let regex = /\[(.*?)\]/;
                    let result = regex.exec(actorId);
                    let arrayBytes = result![1].split(',').map(Number);
                    let user = '0x' + arrayBytes.map(byte => byte.toString(16).padStart(2, '0')).join('');
                    switch (payloadOject.type) {
                        case "stake":
                            stake(this.gApi, payloadOject.value);
                            break;
                        case "unestake":
                            let voucherID: `0x${string}` = payloadOject.voucher_id;
                            unestake(this.gApi,this.meta, voucherID, payloadOject.amount * 1000000000000, user, source, id.toHex());
                            break;
                        case "withdraw":
                            console.log("withdraw: ", payloadOject.witdraw);
                            break;
                        default:
                            console.log("ERROR ON SWITCH CASE");
                            break;
                    }
                }
                else {
                    console.log("El payload no es un JSON");
                }
            }
        });
    }
}