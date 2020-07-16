require('dotenv').config();

const fs = require('fs');
const axios = require('axios');
const Promise = require('bluebird');

const ticketBaseURL = `https://ezgo.coa.gov.tw/zh-TW/Front/ETicket/StoreDataJson?_=`;
const key = process.env.KEY;

(async () => {
    try {
        const ts = new Date().getTime();
        const response = await axios.get(`${ticketBaseURL}${ts}`);
        if (response && response.data) {
            const stores = await Promise.map(
                response.data,
                async (store) => {
                    const { Address: address, StoreName: storeName } = store;
                    const target = address || storeName;
                    const geoRes = await axios.get(
                        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                            target,
                        )}&key=${key}`,
                    );
                    if (geoRes && geoRes.data) {
                        const { results } = geoRes.data;
                        const location =
                            results &&
                            results[0] &&
                            results[0].geometry &&
                            results[0].geometry.location;
                        store.Location = location;
                    }
                    return store;
                },
                { concurrency: 1 },
            );
            const js = `const stores = ${JSON.stringify(stores)};`;
            fs.writeFileSync('./stores2.js', Buffer.from(js));
        }
    } catch (e) {
        console.log(e);
    }
})();
