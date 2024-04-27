"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const api_1 = require("@gear-js/api");
const dotenv_1 = require("dotenv");
const Server_1 = require("./Server");
function main() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        (0, dotenv_1.config)();
        const gApi = yield api_1.GearApi.create({
            providerAddress: "wss://testnet.vara.network",
        });
        let server = new Server_1.Server(gApi);
        server.subscribeToEvent();
    });
}
main();
