"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const api_1 = require("@gear-js/api");
const hex_1 = require("./utils/hex");
const handler_1 = require("./services/handler");
class Server {
    constructor(gApi) {
        this.meta = api_1.ProgramMetadata.from(`${process.env.META}`);
        this.messages = new Set();
        this.gApi = gApi;
        this.Handler = new handler_1.Handler(this.meta, this.gApi);
    }
    subscribeToEvent() {
        this.gApi.gearEvents.subscribeToGearEvent('UserMessageSent', this.handleUserMessageSentEvent.bind(this));
    }
    handleStake(amount) {
        this.Handler.stake(amount);
    }
    handleUnestake(payloadObject, user, source, id) {
        let uParams = {
            amount: payloadObject.amount * 1000000000000,
            user: user,
            source: source,
            messageId: id
        };
        this.Handler.unestake(uParams);
        // unestake(this.gApi, this.meta, uParams);
    }
    handleWithdraw(payload) {
        this.Handler.withdraw(payload);
    }
    handleUserMessageSentEvent({ data: { message: { id, source, destination, payload, value, details } } }) {
        console.log(id.toHuman());
        let message = id.toHuman().toString();
        if (!this.messages.has(message)) {
            this.messages.add(message);
        }
        else {
            return;
        }
        if (source.toHex() == `${process.env.SOURCE}` && destination.toHex() == `${process.env.DESTINATION}`) {
            const payloadString = (Buffer.from(payload.toHex().slice(2), 'hex').toString('utf8')).slice(2);
            let payloadOject = JSON.parse(payloadString);
            console.log("soy payloadString:", payloadString);
            console.log(`Message sent from ${source.toHex()} to ${destination.toHex()}`);
            try {
                if (payloadOject) {
                    let user = hex_1.Hex.toActorId(payloadOject.source);
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
                    throw new Error("Error in payload");
                }
            }
            catch (error) {
                console.log(error);
            }
        }
    }
}
exports.Server = Server;
