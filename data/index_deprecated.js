const axios = require('axios');
const cheerio = require('cheerio');
const Promise = require('bluebird');

const baseURL = `https://ezgo.coa.gov.tw/zh-TW/Front/ETicket/UseStore?page=`;

const getPage = async (n) => {
    try {
        const response = await axios.get(`${baseURL}${n}`);
        if (response && response.data) {
            const $ = cheerio.load(response.data);
            console.log($('body').text());
            $('.listContainer')
                .find('tr')
                .each((i, tr) => {
                    const tds = $(tr).find('td');
                    const obj = {
                        name: tds.eq(0).text().trim().replace('\n', ''),
                        address: tds.eq(1).text().trim().replace('\n', ''),
                        phone: tds.eq(2).text().trim().replace('\n', ''),
                        desc: tds.eq(3).text().trim().replace('\n', ''),
                        special: tds.eq(4).text().trim().replace('\n', ''),
                    };
                    console.log(JSON.stringify(obj));
                });
        } else {
            throw new Error(JSON.stringify(response));
        }
    } catch (error) {
        console.log(`${error.message}, retry page ${n}`);
        await Promise.delay(2000);
        return getPage(n);
    }
};

(async () => {
    const pageCount = 1; //116;
    for (let i = 1; i <= pageCount; i++) {
        await getPage(i);
    }
})();
