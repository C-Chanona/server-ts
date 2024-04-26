import { __awaiter } from "tslib";
import { GearApi } from "@gear-js/api";
import { config } from "dotenv";
import { Server } from "./Server.js";
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        config();
        const gApi = yield GearApi.create({
            providerAddress: "wss://testnet.vara.network",
        });
        let server = new Server(gApi);
        server.listen();
        server.subscribeToEvent();
    });
}
main();
