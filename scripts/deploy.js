const hre = require("hardhat")
const { run, network } = require("hardhat")

async function main() {
  const SimpleStorageFactory = await hre.ethers.getContractFactory(
    "SimpleStorage"
  )
  console.log("Deploying contract...")
  const simpleStorage = await SimpleStorageFactory.deploy()
  await simpleStorage.deployed()
  console.log("Contract deployed to: ", simpleStorage.address)

  // What happens when we deploy to a network other than hardhat network?
  if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for block txes...")
    await simpleStorage.deployTransaction.wait(6)
    await verify(simpleStorage.address, [])
  }

  const currentValue = await simpleStorage.retrieve()
  console.log(`Current Value is: ${currentValue}`)

  // Update the current value
  const transactionResponse = await simpleStorage.store(12)
  await transactionResponse.wait(1)
  console.log("Updated value:", await simpleStorage.retrieve())
}

const verify = async (contractAddress, args) => {
  console.log("Verifying contract...")
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    })
  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified!")
    } else {
      console.log(error)
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
