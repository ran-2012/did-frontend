export default {
    hostname: process.env.HOSTNAME ?? 'localhost',
    port: 3000,

    log: {
        defaultLevel: 'info',
        file: {
            enable: false,
            maxSize: 1000000,
            maxFiles: 10,
        },
        tagLevel: {}
    },
};
