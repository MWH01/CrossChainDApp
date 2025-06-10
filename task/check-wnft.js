const { task } = require('hardhat/config');

task("check-wnft").setAction(async (taskArgs, hre) => {
    const { deployer } = await getNamedAccounts();
    const wnft = await ethers.getContract("WrappedMyToken", deployer);
    const totalSupply = await wnft.totalSupply();
    console.log(`checking status of WrappedMyToken NFT on dest chain...`);
    for(let tokenId = 0; tokenId < totalSupply; tokenId++) {
        const owner = await nft.ownerOf(tokenId);
        console.log(`Token ID: ${tokenId}, Owner: ${owner}`);
    }
})

module.exports = {};