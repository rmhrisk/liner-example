var helper;
(function (helper) {
    helper.Browser = {
        IE: "Internet Explorer",
        Safari: "Safari",
        Edge: "Edge",
        Chrome: "Chrome",
        Firefox: "Firefox Mozilla",
    };
    /**
     * Returns info about browser
     */
    function BrowserInfo() {
        var res = {
            name: "",
            version: ""
        };
        var userAgent = self.navigator.userAgent;
        var reg;
        if (reg = /edge\/([\d\.]+)/i.exec(userAgent)) {
            res.name = helper.Browser.Edge;
            res.version = reg[1];
        }
        else if (/msie/i.test(userAgent)) {
            res.name = helper.Browser.IE;
            res.version = /msie ([\d\.]+)/i.exec(userAgent)[1];
        }
        else if (/Trident/i.test(userAgent)) {
            res.name = helper.Browser.IE;
            res.version = /rv:([\d\.]+)/i.exec(userAgent)[1];
        }
        else if (/chrome/i.test(userAgent)) {
            res.name = helper.Browser.Chrome;
            res.version = /chrome\/([\d\.]+)/i.exec(userAgent)[1];
        }
        else if (/safari/i.test(userAgent)) {
            res.name = helper.Browser.Safari;
            res.version = /([\d\.]+) safari/i.exec(userAgent)[1];
        }
        else if (/firefox/i.test(userAgent)) {
            res.name = helper.Browser.Firefox;
            res.version = /firefox\/([\d\.]+)/i.exec(userAgent)[1];
        }
        return res;
    }
    helper.BrowserInfo = BrowserInfo;
})(helper || (helper = {}));
var App = (function () {
    function App() {
    }
    App.generateKey = function () {
        var _this = this;
        return liner.crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"])
            .then(function (keys) {
            _this.keys = keys;
            return keys;
        });
    };
    App.sign = function (text) {
        if (!this.keys)
            throw new Error("You must generate CryptoKey first");
        return liner.crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, this.keys.privateKey, this.stringToBuffer(text));
    };
    App.stringToBuffer = function (text) {
        text = atob(btoa(text)); // utf8 -> binary
        var res = new Uint8Array(text.length);
        for (var i = 0; i < text.length; i++)
            res[i] = text.charCodeAt(i);
        return res;
    };
    App.buffer2string = function (buffer) {
        var res = "";
        for (var i = 0; i < buffer.length; i++)
            res += String.fromCharCode(buffer[i]);
        return res;
    };
    return App;
}());
switch (helper.BrowserInfo().name) {
    case helper.Browser.IE:
        importScripts("promise.min.js");
    case helper.Browser.Edge:
    case helper.Browser.Safari:
        importScripts("asmcrypto.js");
        importScripts("elliptic.js");
}
onmessage = function (e) {
    var command = e.data[0];
    var params = e.data.slice(1);
    if (!command)
        throw TypeError("Worker's command cannot be empty");
    switch (command) {
        case "sign":
            Promise.resolve()
                .then(function () { return App.generateKey(); })
                .then(function () { return App.sign.apply(App, params); })
                .then(function (sig) { return postMessage(["sign", App.buffer2string(new Uint8Array(sig))]); })
                .catch(function (e) {
                console.log(e);
                console.log(e.stack);
                throw e;
            });
            break;
        default:
            throw Error("Unknown worker's command '" + command + "'");
    }
};
importScripts("webcrypto-liner.js");
var liner = {};
liner.crypto = new Liner.Crypto();
