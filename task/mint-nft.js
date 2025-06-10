const { task } = require('hardhat/config');

task("mint-nft").setAction(async(taskArgs, hre) => {
    const { deployer } = await getNamedAccounts()
    const nft = await ethers.getContract("MyToken", deployer)
    console.log(`Minting NFT on source chain...`)
    const mintTx = await nft.safeMint(deployer)
    mintTx.wait(6)
    console.log(`NFT minted successfully!`)
})

module.exports = {};