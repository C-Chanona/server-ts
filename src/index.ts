import { GearApi, ProgramMetadata } from "@gear-js/api";
import { config } from "dotenv";
import { Server } from "./Server"


async function main() {
    config();
    const gApi = await GearApi.create({
        providerAddress: "wss://testnet.vara.network",
    });
    
    let server = new Server(gApi);

    server.listen();
    server.subscribeToEvent();
}

main()