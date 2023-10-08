//const { ethers, getNamedAccounts } = require("hardhat")
const { ethers } = require("hardhat")

async function main() {

  const fundMeFactory = await ethers.getContractFactory("FundMe")
  console.log("Deploying...")
  // sepolia
  //const fundMe = await fundMeFactory.deploy("0x694AA1769357215DE4FAC081bf1f309aDC325306")
  // hardhat
  const fundMe = await fundMeFactory.deploy("0x5FbDB2315678afecb367f032d93F642f64180aa3")
  await fundMe.deployed()
  console.log(`Deployed contract to: ${fundMe.address}`)

  // const { deployer } = await getNamedAccounts()
  // const fundMe = await ethers.getContract("FundMe", deployer)
  // console.log(`Got contract FundMe at ${fundMe.address}`)
  // console.log("Funding contract...")
  // const transactionResponse = await fundMe.fund({
  //   value: ethers.utils.parseEther("0.1"),
  // })
  // await transactionResponse.wait()
  // console.log("Funded!")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
