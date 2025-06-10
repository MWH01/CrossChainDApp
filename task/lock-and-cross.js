const {task} = require('hardhat/config');
const { networkConfig } = require('../helper-hardhat-config');
const { network } = require('hardhat');

task("lock-and-cross")
    .addOptionalParam("chainSelector", "chain selector of dest chain")
    .addOptionalParam("receiver", "receiver address on dest chain")
    .addParam("tokenid", "token ID of the nft to lock and cross")
    .setAction(async (taskArgs, hre) => {
        let chainSelector, receiver;
        const tokenId = taskArgs.tokenid
        const { deployer } = await getNamedAccounts();
        if(taskArgs.chainSelector){
            chainSelector = taskArgs.chainSelector
        } else {
            chainSelector = networkConfig[network.config.chainId].chainSelector
            console.log(`Using default chain selector: ${chainSelector}`);
        }
        if(taskArgs.receiver){
            receiver = taskArgs.receiver
        } else {
            const nftPoolBurnAndMintDeployment = 
                await hre.companionNetworks["destChain"].deployments.get("NFTPoolBurnAndMint");
            receiver = nftPoolBurnAndMintDeployment.address;
            console.log(`Using default receiver address: ${receiver}`);
        }
        console.log('receiver address:', receiver)
        // transfer link token to address of the pool contract
        const linkTokenAddr = networkConfig[network.config.chainId].linkToken
        const linkToken = await ethers.getContractAt("LinkToken", linkTokenAddr)
        const nftPoolLockAndRelease = await ethers.getContract("NFTPoolLockAndRelease", deployer)
        const transferTx = await linkToken.transfer(nftPoolLockAndRelease.target, ethers.parseEther("10"))
        await transferTx.wait(6)
        const balance = linkToken.balanceOf(nftPoolLockAndRelease.target)
        console.log(`Link token balance of NFTPoolLockAndRelease: ${balance}`);
        // approve pool contract to call transferFrom on nft contract
        const nft = await ethers.getContract("MyToken", deployer)
        await nft.approve(nftPoolLockAndRelease.target, tokenId)
        console.log(`Approve Successfully!`);
        // call lockAndSendNFT on pool contract
        const lockAndSendNFTTx = await nftPoolLockAndRelease.lockAndSendNFT(
            tokenId,
            deployer,
            chainSelector,
            receiver
        )
        console.log("ccip transaction hash:", lockAndSendNFTTx.hash);
})

module.exports = {};