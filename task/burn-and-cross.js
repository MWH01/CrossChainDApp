const { task } = require('hardhat/config');
const { networkConfig } = require('../helper-hardhat-config');

task("burn-and-cross")
    .addOptionalParam("chainSelector", "chain selector of dest chain")
    .addOptionalParam("receiver", "receiver address on dest chain")
    .addParam("tokenid", "token ID of the wnft to burn and cross")
    .setAction(async (taskArgs, hre) => {
        const { network, ethers, getNamedAccounts } = hre;
        let chainSelector, receiver;
        const tokenId = taskArgs.tokenid
        const { deployer } = await getNamedAccounts();
        if (taskArgs.chainSelector) {
            chainSelector = taskArgs.chainSelector
        } else {
            chainSelector = networkConfig[network.config.chainId].chainSelector
            console.log(`Using default chain selector: ${chainSelector}`);
        }
        if (taskArgs.receiver) {
            receiver = taskArgs.receiver
        } else {
            const nftPoolLockAndReleaseDeployment =
                await hre.companionNetworks["destChain"].deployments.get("NFTPoolLockAndRelease");
            receiver = nftPoolLockAndReleaseDeployment.address
            console.log(`Using default receiver address: ${receiver}`);
        }
        console.log('receiver address:', receiver)
        // transfer link token to address of the pool contract
        const linkTokenAddr = networkConfig[network.config.chainId].linkToken
        const linkToken = await ethers.getContractAt("LinkToken", linkTokenAddr)
        const nftPoolBurnAndMint = await ethers.getContract("NFTPoolBurnAndMint", deployer)
        const transferTx = await linkToken.transfer(nftPoolBurnAndMint.target, ethers.parseEther("10"))
        await transferTx.wait(6)
        const balance = linkToken.balanceOf(nftPoolBurnAndMint.target)
        console.log(`Link token balance of NFTPoolBurnAndMint: ${balance}`);
        // approve pool contract to call burnAndSendNFT on wnft contract
        const wnft = await ethers.getContract("WrappedMyToken", deployer)
        await wnft.approve(nftPoolBurnAndMint.target, tokenId)
        console.log(`Approve Successfully!`);
        // call burnAndSendNFT on pool contract
        const burnAndSendNFTTx = await nftPoolBurnAndMint.burnAndSendNFT(
            tokenId,
            deployer,
            chainSelector,
            receiver
        )
        console.log("ccip transaction hash:", burnAndSendNFTTx.hash);
    })

module.exports = {};