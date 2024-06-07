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

    return {
        plugins: [react()],
        server: {
            watch: {
                usePolling: true
            }
        }

    }
})
