import * as path from 'path'
import {defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({command, mode}) => {
    const envFileDirectory = path.relative(process.cwd(), '../..');
    process.env = {...process.env, ...loadEnv(mode, envFileDirectory, '')}
    console.log("Loading env from ", envFileDirectory)
    for (const key in process.env) {
        if (key.startsWith('VITE')) {
            console.log(key, process.env[key])
        }
    }
    let alias = {}
    // Workaround for vite not resolving ethr-did-resolver
    if (mode == "development") {
        alias = {
            "ethr-did-resolver": path.resolve(
                "./node_modules/ethr-did-resolver/src/index.ts"
            ),
        };
    }

    return {
        plugins: [react()],
        server: {
            port: Number.parseInt(process.env.PAGE_PORT) ?? 3080,
            watch: {
                usePolling: true
            }
        },
        build: {
            sourcemap: 'inline'
        },
        resolve: {
            alias,
        },
        test: {
            include: ['test/**/*.ts']
        }
    }
})
