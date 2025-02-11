export default {
    hostname: process.env.HOSTNAME ?? 'localhost',
    port: process.env.API_PORT ?? 3000,

    log: {
        defaultLevel: 'debug',
        file: {
            enable: false,
            maxSize: 1000000,
            maxFiles: 10,
        },
        tagLevel: {}
    },

    mongodb: {
        connectStr: process.env.MONGODB_STR ?? 'mongodb://localhost:27017/dev'
    }
};
