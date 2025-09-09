<div align="center">
	<h1>Hardhat Simple Storage Project</h1>
	<p><strong>A minimal, production-grade Hardhat project showcasing smart contract deployment, interaction, verification, gas reporting and custom tasks.</strong></p>
</div>

---

## 1. Overview

This repository contains a Solidity smart contract (`SimpleStorage.sol`) and a Hardhat environment set up to:

- Compile, deploy, and interact with the contract locally or on Sepolia testnet
- Automatically verify the contract on Etherscan (if API key provided)
- Measure gas usage (gas reporter)
- Provide a custom Hardhat task (`block-number`)
- Facilitate clean scripting via `package.json` commands

The `SimpleStorage` contract lets you store a single unsigned integer and retrieve it. The deployment script also demonstrates reading and updating on-chain state immediately after deployment.

## 2. Tech Stack & Tooling

| Layer               | Tools                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Language            | Solidity 0.8.4                                                                                                           |
| Framework           | Hardhat 2.x                                                                                                              |
| Libraries / Plugins | @nomiclabs/hardhat-waffle, @nomiclabs/hardhat-ethers, @nomiclabs/hardhat-etherscan (legacy verify), hardhat-gas-reporter |
| Environment         | dotenv for secrets management                                                                                            |
| Testing             | Waffle + Chai (structure ready)                                                                                          |
| Deployment          | Hardhat scripts & networks config                                                                                        |
| Verification        | Etherscan API                                                                                                            |
| Package Manager     | pnpm                                                                                                                     |

> Note: Project currently mixes legacy plugins (`@nomiclabs/*`) and the newer `@nomicfoundation/hardhat-verify`. A future migration to Hardhat v3 + `@nomicfoundation/hardhat-toolbox` is recommended.

### 2.1 Dependency Reference (What Was Installed & Why)

| Package                             | Type       | Why It's Here / Usage                                                                         |
| ----------------------------------- | ---------- | --------------------------------------------------------------------------------------------- |
| `hardhat`                           | Dev        | Core development environment: tasks, compilation, scripting.                                  |
| `ethers`                            | Dev        | EVM interaction library used by Hardhat & scripts. Version 5 chosen for plugin compatibility. |
| `@nomiclabs/hardhat-ethers`         | Dev Plugin | Bridges Hardhat runtime and Ethers v5 (injects `hre.ethers`).                                 |
| `@nomiclabs/hardhat-waffle`         | Dev Plugin | Adds Waffle matchers to Chai for Solidity contract testing.                                   |
| `ethereum-waffle`                   | Dev        | Assertion + utilities for contract testing (used by the waffle plugin).                       |
| `chai`                              | Dev        | Test assertions (e.g., `expect()`).                                                           |
| `dotenv`                            | Dev        | Loads environment variables from `.env` (RPC URLs, private keys, API keys).                   |
| `@nomiclabs/hardhat-etherscan`      | Dev Plugin | Legacy Etherscan verification (used in `deploy.js` via `run("verify:verify")`).               |
| `@nomicfoundation/hardhat-verify`   | Dev Plugin | New verification plugin (present for future migration; currently not referenced in config).   |
| `hardhat-gas-reporter`              | Dev Plugin | Generates gas usage report during test runs (`gasReporter.enabled = true`).                   |
| `solidity-coverage`                 | Dev Plugin | Provides test coverage metrics for Solidity (`hardhat coverage`).                             |
| `pnpm` (via `packageManager` field) | Tooling    | Fast, disk-efficient package manager ensuring deterministic installs.                         |

If you don't need both verification plugins, you can eventually remove one depending on the migration path you choose.

## 3. Project Structure

```
contracts/
	SimpleStorage.sol          # Core smart contract
scripts/
	deploy.js                  # Deployment + post-deploy interaction + optional verification
tasks/
	block-number.js            # Custom Hardhat task example
test/                        # Place your test files here
hardhat.config.js            # Hardhat configuration (networks, plugins, gas reporter)
package.json                 # Scripts & dev dependencies
```

## 4. Prerequisites

- Node.js >= 18 (recommended)
- pnpm (configured via `packageManager` field)
- A Sepolia RPC endpoint (e.g. Alchemy, Infura, etc.)
- A funded Sepolia account private key (test ETH only)
- Etherscan API key (for verification)

## 5. Installation

```bash
pnpm install
```

## 6. Environment Variables

Create a `.env` file (never commit secrets):

```
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/<YOUR_KEY>
SEPOLIA_PRIVATE_KEY=0xabcdef...yourprivatekey...
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY
```

Ensure the private key is prefixed with `0x` and holds only testnet funds.

## 7. Available NPM Scripts

| Script                                  | Purpose                                     |
| --------------------------------------- | ------------------------------------------- |
| `pnpm run compile`                      | Compile contracts                           |
| `pnpm run clean`                        | Clear artifacts & cache                     |
| `pnpm run test`                         | Run Hardhat tests (add tests under `test/`) |
| `pnpm run node`                         | Start local Hardhat JSON-RPC node           |
| `pnpm run console`                      | Open Hardhat console (default network)      |
| `pnpm run block-number`                 | Run custom task on default network          |
| `pnpm run block-number:localhost`       | Run task against local node                 |
| `pnpm run block-number:sepolia`         | Run task against Sepolia                    |
| `pnpm run deploy`                       | Deploy to in-memory Hardhat network         |
| `pnpm run deploy:localhost`             | Deploy to a started local node              |
| `pnpm run deploy:sepolia`               | Deploy to Sepolia (requires env vars)       |
| `pnpm run verify:sepolia <addr> [args]` | Verify contract at address                  |
| `pnpm run flatten`                      | Output flattened sources                    |

### Example: Deploy to Sepolia

```bash
pnpm run deploy:sepolia
```

### Example: Verify (if not auto-verified)

```bash
pnpm run verify:sepolia 0xYourDeployedAddress
```

## 8. The Smart Contract (`SimpleStorage.sol`)

Concept: Store and update a single unsigned integer. Typical functions:

- `retrieve()` – returns current value
- `store(uint256)` – updates stored value

Gas reporting will help quantify the cost of `store` calls.

## 9. Deployment Script (`scripts/deploy.js`)

Performs:

1. Gets contract factory
2. Deploys contract
3. (Sepolia only) waits 6 confirmations then verifies (if API key)
4. Reads initial value
5. Calls `store(12)` and reads updated value

Auto-verification occurs if:

```
network.chainId === 11155111 && ETHERSCAN_API_KEY is set
```

## 10. Custom Task (`block-number`)

Defined in `tasks/block-number.js`:

```bash
pnpm run block-number:sepolia
```

Prints the current block number of the selected network.

## 11. Gas Reporting

Configured via:

```js
gasReporter: {
  enabled: true
}
```

On each test run, gas usage per method will be displayed. If you encounter compatibility issues, ensure plugin versions align with Hardhat core.

## 12. Testing

Add test files under `test/` (e.g. `test/simple-storage.test.js`). Example skeleton:

```javascript
const { expect } = require("chai")

describe("SimpleStorage", function () {
  it("stores and retrieves a value", async function () {
    const Factory = await ethers.getContractFactory("SimpleStorage")
    const c = await Factory.deploy()
    await c.deployed()
    expect(await c.retrieve()).to.equal(0)
    const tx = await c.store(42)
    await tx.wait(1)
    expect(await c.retrieve()).to.equal(42)
  })
})
```

Run tests:

```bash
pnpm run test
```

## 13. Verification Notes

Using legacy `@nomiclabs/hardhat-etherscan` integration (invoked internally via `run("verify:verify", ...)`). Future migration path is to `@nomicfoundation/hardhat-verify` with updated config syntax (`verify: { etherscan: { apiKey } }`).

## 14. Security & Secrets

- Never commit `.env`.
- Use a dedicated testnet private key with limited funds.
- Rotate API keys if leaked.

## 15. Troubleshooting

| Issue                                 | Cause                                         | Fix                                        |
| ------------------------------------- | --------------------------------------------- | ------------------------------------------ |
| Missing module error                  | Plugin not installed                          | Install dev dependency (`pnpm add -D ...`) |
| Verification fails (already verified) | Contract re-submitted                         | Safe to ignore (handled in script)         |
| Gas reporter crash                    | Version mismatch Hardhat vs plugin            | Align versions or disable temporarily      |
| Invalid opcode on deploy              | Wrong Solidity version or corrupted artifacts | `pnpm run clean && pnpm run compile`       |

## 16. Recommended Migration (Optional)

Upgrade to Hardhat v3 & unified toolbox:

```bash
pnpm remove @nomiclabs/hardhat-waffle @nomiclabs/hardhat-ethers @nomiclabs/hardhat-etherscan
pnpm add -D hardhat @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-verify
```

Then simplify config:

```js
require("@nomicfoundation/hardhat-toolbox")
```

Feel free to open issues or extend the project with additional features.
