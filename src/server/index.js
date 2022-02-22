const fastify = require(`fastify`);
const fastifyStatic = require(`fastify-static`);
const { resolve } = require(`path`);
const { request } = require(`undici`);
const { URL } = require(`url`);

const HOST = `127.0.0.1`;
const PORT = 4000;

const server = fastify();

server.addHook(`onReady`, () => console.log(`Server listening on http://${HOST}:${PORT}`));
server.addHook(`onRequest`, (req, _, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

server.register(fastifyStatic, {
    prefix: `/`,
    root: resolve(__dirname, `../client`)
});

server.get(`/`, (_, res) => {
    return res.sendFile(`index.html`);
});

server.get(`/data`, async (req, res) => {
    if (typeof req.query.ip !== `string`) return res.code(400).send();
    let ipInfo = await (await request(new URL(`http://ip-api.com/json/${req.query.ip}?fields=66842623`)).catch(() => {}))?.body.json().catch(() => {});
    if (!ipInfo) return res.code(500).send();

    if (ipInfo.status !== `success`) ipInfo = {
        query: req.ip,
        status: `success`,
        continent: `East America`,
        continentCode: `EA`,
        country: `States`,
        countryCode: `S`,
        region: `DC`,
        regionName: `District of Clubs`,
        city: `George`,
        district: `Part of the City`,
        zip: `20069`,
        lat: 40,
        lon: -80,
        timezone: `America/Old_York`,
        offset: -18000,
        currency: `SD`,
        isp: `The "no clue" ISP`,
        org: `The "no clue" org`,
        as: `As something`,
        asname: `As named something`,
        mobile: false,
        proxy: false,
        hosting: false
    }

    ipInfo = {
        ...ipInfo,
        agent: req.headers[`user-agent`],
        acceptLang: req.headers[`accept-language`],
        map: `https://tyler-demo.herokuapp.com/?lat=${ipInfo.lat}&lon=${ipInfo.lon}&width=500&height=500&zoom=10`
    }

    res.send(ipInfo);
});

server.listen(PORT, HOST);
