const axios = require('axios');

function fetch(id) {
    return axios.get(`https://api.opsgenie.com/v2/schedules/${id}/on-calls?flat=true`, {
        headers: {
            Authorization: `GenieKey ${process.env.OPSGENIE_API_KEY}`,
        },
    });
}

const MAPPING = {
    'dimas.rullyandanu@bukalapak.com': '@dimasdanz',
    'william.lazuardi@bukalapak.com': '@williamlazuardi',
    'juan.anton@bukalapak.com': '@juan_anton',
    'liem.hindra@bukalapak.com': '@liemhindrasanjaya',
    'farouk.rizki@bukalapak.com': '@faroukrizki',
};

module.exports = {
    oncall: async () => {
        const [respPrimary, respSecondary] = await Promise.all([
            fetch('5dfa238b-98e5-4952-994a-79483aad7d02'),
            fetch('0dfe965b-cce1-4dd1-9489-7355b7ec912f'),
        ]);

        const primaries = respPrimary.data.data.onCallRecipients.map(v => MAPPING[v] || v);
        const secondaries = respSecondary.data.data.onCallRecipients.map(v => MAPPING[v] || v);

        return {
            primaries,
            secondaries,
        };
    },
}
