import { CookieJar } from 'tough-cookie';
import WebStorageCookieStore from './WebStorageCookieStore'; 

class WSCookieJar extends CookieJar {
    constructor () {
        super(new WebStorageCookieStore(localStorage));
    }

    onChange(cb) {
        if(typeof cv !== 'function')
        throw new Error("Callback is not a function")
        cb();
    }

    getAll (url) {
        return new Promise ((resolve, reject) => {
            this.getCookies(url, {}, (err, cookies) => {
                if(err) reject(err);
                else resolve(cookies);
            });
        });
    }

    getAllSync (url) {
        return this.getCookiesSync(url, {});
    }

    set (url, cookie) {
        return new Promise ((resolve, reject) => {
            this.setCookie(cookie, url, (err, cookie) => {
                if(err) resolve(false);
                else resolve(true);
            });
        })
    }

    setAllSync (url, cookies) {
        // if cookie is string then validity by checking for =
        cookies.filter(c => typeof c === 'string' ? c.includes("=") : true)
        .forEach(c => this.setCookieSync(c, url));
    }

    // remove cookies for the url
    clear (url) {
        const store = this.store;
        const cookies = this.getAllSync(url);
        cookies.forEach(cookie => {
            store.removeCookie(cookie.domain, cookie.path, cookie.key, err => {
                if(err) console.error("Error occurred while removing cookies ", err);
            })
        });
    }
}

export default WSCookieJar;
