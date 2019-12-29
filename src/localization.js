const fs = require("fs");

let getLocalString = function(key, local="de") {
    let locales = JSON.parse(fs.readFileSync(`${__dirname}/local/${local}.json`).toString());
    if(locales[key]) {
        let locale = locales[key];
        if(Array.isArray(locale)) {
            locale = locale.join('\n');
        }
        return locale;
    } else {
        return key;
    }
};

let formatLocalString = function(key, format, local="de") {
    let result = getLocalString(key, local);
    if(format) {
        Object.keys(format).forEach(key => {
            result = result.replace(`{k:${key}}`, format[key]);
        });
    }
    return result;
};

module.exports = {
    formatLocalString
}