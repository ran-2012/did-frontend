
## Install

- Node.js
  https://nodejs.org/zh-cn
  Recommended version: 20.13.1

- Install dependencies
```bash
npm install -g pnpm concurrently
pnpm install
```
> `pnpm instlall` would take a while

- Set up env
  Create a new `.env` file using the `sample.env` file as a template and fill in the required information.
    - Register a Infura key: https://app.infura.io/
    - Create a Wallet Project Id: https://cloud.walletconnect.com/

- Run

`pnpm run dev`

- If you run this project on Windows and it doesn't work due to command `cp` is not available, I recommend you to change default shell for node to powershell.

`npm config --global set script-shell Powershell`

