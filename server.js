const axios = require("axios");
const express = require("express");
const settings = require("./settings.json");
const app = express();
const _gwt = require("get-website-text");

app.listen(process.env.PORT, () => {
    console.log("Server is listening on port: " + process.env.PORT);
});

app.get("/search", async (req, res, next) => {
    logging("Begin", "Search: " + req.query.q);
    res.send(await search(req.query.q));
    logging("Ends ", "Search: " + req.query.q);
});

app.get("/site", async(req, res) => {
    logging("Begin", "Site: " + req.query.q);
    res.send(await getSiteText(req.query.q));
    logging("Ends ", "Site: " + req.query.q);
});

const getSiteText = site => {
    return new Promise((resolve, reject) => {
        _gwt.getWebsiteText(site, 5)
            .then(function(data) {
                if (data.error) {
                    console.log('Couldnt get website: ' + site);
                    console.log('Error: ' + data.message);
                    reject(data.error);
                }

                resolve(data.text);
            }).catch(error => {
                console.log('Error getting the site: ' + site);
                console.log(error);
                reject(data.error);
            });
    });
};

const search = query => {
    return new Promise((resolve, reject) => {
        axios.get(settings.serpstack.url, {
            params: {
                [settings.serpstack.authentication.attribute]: process.env[settings.serpstack.authentication.value],
                [settings.serpstack.queryAttribute]: query,
                num: 15
            }
        }).then(response => {
            let asd = processData(response.data);
            // console.log(asd)
            resolve(processData(response.data));
        }).catch(error => {
            console.log('---ERROR--- ' + error);
            reject(error);
        });
    });
};

const processData = (data = {}) => {
    const results = [];

    if (data.organic_results.length) {
        data.organic_results.forEach(result => {
            results.push(result.url)
        });
    }

    return {
        urls: results
    };
};

const logging = (type, service) => {
    console.log("--- " + service + " --- Request " + type + " --- " + Date.now());
};
