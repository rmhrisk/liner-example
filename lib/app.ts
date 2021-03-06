declare type CryptoKeyPair = { privateKey: CryptoKey, publicKey: CryptoKey, }
declare let liner: any;

// const alg = { name: "RSA-PSS", hash: "SHA-256", publicExponent: new Uint8Array([1, 0, 1]), modulusLength: 1024, saltLength: 32 };
const alg = { name: "ECDSA", namedCurve: "P-256", hash: "SHA-256" };

class App {

    static keys?: CryptoKeyPair;

    static generateKey() {

        return liner.crypto.subtle.generateKey(
            alg,
            true,
            ["sign", "verify"]
        )
            .then((keys: CryptoKeyPair) => {
                this.keys = keys;
                return keys;
            })
    }

    static sign(text: string) {
        if (!this.keys)
            throw new Error("You must generate CryptoKey first");
        return liner.crypto.subtle.sign(alg, this.keys.privateKey, this.stringToBuffer(text))
    }

    static stringToBuffer(text: string) {
        text = atob(btoa(text)); // utf8 -> binary
        let res = new Uint8Array(text.length);
        for (let i = 0; i < text.length; i++)
            res[i] = text.charCodeAt(i);
        return res;
    }

    static buffer2string(buffer: Uint8Array) {
        let res = "";
        for (let i = 0; i < buffer.length; i++)
            res += String.fromCharCode(buffer[i]);
        return res;
    }

}