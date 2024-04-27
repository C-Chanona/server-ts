export class Hex {

    public static toActorId(actorId: string): any {
        let regex = /\[(.*?)\]/;
        let result = regex.exec(actorId);
        let arrayBytes = result![1].split(',').map(Number);

        return '0x' + arrayBytes.map(byte => byte.toString(16).padStart(2, '0')).join('');
    }

}