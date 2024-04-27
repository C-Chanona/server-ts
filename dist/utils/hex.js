"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hex = void 0;
class Hex {
    static toActorId(actorId) {
        let regex = /\[(.*?)\]/;
        let result = regex.exec(actorId);
        let arrayBytes = result[1].split(',').map(Number);
        return '0x' + arrayBytes.map(byte => byte.toString(16).padStart(2, '0')).join('');
    }
}
exports.Hex = Hex;
