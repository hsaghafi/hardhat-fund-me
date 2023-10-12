import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress, usdt_abi, usdt_contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const USDT_fundButton = document.getElementById("USDT_fundButton")
const balanceButton = document.getElementById("balanceButton")
const USDT_balanceButton = document.getElementById("USDT_balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
const USDT_withdrawButton = document.getElementById("USDT_withdrawButton")
const fundedButton = document.getElementById("fundedButton")
const USDT_fundedButton = document.getElementById("USDT_fundedButton")
const USDT_mintButton = document.getElementById("USDT_mintButton")
connectButton.onclick = connect
fundButton.onclick = fund
USDT_fundButton.onclick = fund_USDT
balanceButton.onclick = getBalance
USDT_balanceButton.onclick = getBalance_USDT
withdrawButton.onclick = withdraw
USDT_withdrawButton.onclick = withdraw_USDT
fundedButton.onclick = fundedAmount
USDT_fundedButton.onclick = fundedAmount_USDT
USDT_mintButton.onclick = USDT_mint

async function connect() {
    if (typeof window.ethereum !== "undefined") {
      try {
        await ethereum.request({ method: "eth_requestAccounts" })
      } catch (error) {
        console.log(error)
        window.alert("ERROR!\n\nMessage:\n"+error)
      }
      const accounts = await ethereum.request({ method: "eth_accounts" })
      console.log(accounts)
      const acc_string=accounts.toString()
      connectButton.innerHTML = acc_string.substring(0,4)+"..."+acc_string.substring(acc_string.length-4)
    } else {
      connectButton.innerHTML = "Please install MetaMask"
    }
  }
  
  async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}...`)
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, abi, signer)
      try {
        const transactionResponse = await contract.fund({
          value: ethers.utils.parseEther(ethAmount),
        })
        await listenForTransactionMine(transactionResponse, provider)
        console.log("done!")
        window.alert("Successfully Funded "+ethAmount+" ETH!")
      } catch (error) {
        console.log(error)
        window.alert("ERROR!\n\nMessage:\n"+error)
      }
    } else {
      fundButton.innerHTML = "Please install MetaMask"
    }
  }

  async function fund_USDT() {
    const USDT_Amount = document.getElementById("USDT_Amount").value

    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const usdt_contract = new ethers.Contract(usdt_contractAddress, usdt_abi, signer)
      const contract = new ethers.Contract(contractAddress, abi, signer)
      console.log(`Approving ${USDT_Amount} USDT...`)
    try {
        const transactionResponse1 = await usdt_contract.approve(contractAddress,USDT_Amount * 1000000)
        await listenForTransactionMine(transactionResponse1, provider)
        console.log("Approved!")
      } catch (error) {
        console.log("Approve Failed...")
        console.log(error)
        window.alert("ERROR!\n\nMessage:\n"+error)
        return;
      }
      console.log(`Funding with ${USDT_Amount} USDT...`)
      try {
        const transactionResponse2 = await contract.fund_USDT(USDT_Amount * 1000000);
        await listenForTransactionMine(transactionResponse2, provider)
        console.log("done!")
        window.alert("Successfully Funded "+USDT_Amount+" USDT!")
      } catch (error) {
        console.log(error)
        window.alert("ERROR!\n\nMessage:\n"+error)
      }
    } else {
      fundButton.innerHTML = "Please install MetaMask"
    }
  }
  
  function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}`)
    return new Promise((resolve, reject) => {
        try {
            provider.once(transactionResponse.hash, (transactionReceipt) => {
                console.log(
                    `Completed with ${transactionReceipt.confirmations} confirmations. `
                )
                resolve()
            })
        } catch (error) {
            reject(error)
        }
    })
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      try {
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
        window.alert("Balance = "+ethers.utils.formatEther(balance)+" ETH")
      } catch (error) {
        console.log(error)
        window.alert("ERROR!\n\nMessage:\n"+error)
      }
    } else {
      balanceButton.innerHTML = "Please install MetaMask"
    }
  }

  async function getBalance_USDT() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, abi, signer)
      try {
        let balance = await contract.balance_usdt()
        console.log(balance / 1000000)
        window.alert("Balance = "+String(balance / 1000000)+" USDT")
      } catch (error) {
        console.log(error)
        window.alert("ERROR!\n\nMessage:\n"+error)
      }
    } else {
      balanceButton.innerHTML = "Please install MetaMask"
    }
  }

  async function fundedAmount() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, abi, signer)
      try {
        const funded = await contract.getAddressToAmountFunded(signer.getAddress())
        console.log(ethers.utils.formatEther(funded))
        window.alert("Your funded amount is "+ethers.utils.formatEther(funded)+" ETH")
      } catch (error) {
        console.log(error)
        window.alert("ERROR!\n\nMessage:\n"+error)
      }
    } else {
      balanceButton.innerHTML = "Please install MetaMask"
    }
  }
  
  async function fundedAmount_USDT() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, abi, signer)
      try {
        const funded = await contract.getAddressToAmountFunded_usdt(signer.getAddress())
        console.log(funded / 1000000)
        window.alert("Your funded amount is "+String(funded / 1000000)+" USDT")
      } catch (error) {
        console.log(error)
        window.alert("ERROR!\n\nMessage:\n"+error)
      }
    } else {
      balanceButton.innerHTML = "Please install MetaMask"
    }
  }

  
  async function withdraw() {
    console.log(`Withdrawing...`)
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      await provider.send('eth_requestAccounts', [])
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, abi, signer)
      try {
        const transactionResponse = await contract.withdraw()
        await listenForTransactionMine(transactionResponse, provider)
        // await transactionResponse.wait(1)
        window.alert("Withdrawal Successful!")
      } catch (error) {
        console.log(error)
        window.alert("ERROR!\n\nMessage:\n"+error)
      }
    } else {
      withdrawButton.innerHTML = "Please install MetaMask"
    }
  }

  async function withdraw_USDT() {
    console.log(`Withdrawing...`)
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      await provider.send('eth_requestAccounts', [])
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, abi, signer)
      try {
        const transactionResponse = await contract.withdraw_usdt()
        await listenForTransactionMine(transactionResponse, provider)
        // await transactionResponse.wait(1)
        window.alert("Withdrawal Successful!")
      } catch (error) {
        console.log(error)
        window.alert("ERROR!\n\nMessage:\n"+error)
      }
    } else {
      withdrawButton.innerHTML = "Please install MetaMask"
    }
  }

  async function USDT_mint() {
    const USDT_Amount = document.getElementById("USDT_mintAmount").value
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const usdt_contract = new ethers.Contract(usdt_contractAddress, usdt_abi, signer)
      console.log(`Minting ${USDT_Amount} USDT...`)
    try {
        const transactionResponse = await usdt_contract._mint(signer.getAddress(),USDT_Amount * 1000000)
        await listenForTransactionMine(transactionResponse, provider)
        console.log("Minted!")
        window.alert(USDT_Amount+" USDT Minted Successfully!")
      } catch (error) {
        console.log("Mint Failed...")
        window.alert("ERROR!\n\nMessage:\n"+error)
      }
    } else {
      fundButton.innerHTML = "Please install MetaMask"
    }
  }
