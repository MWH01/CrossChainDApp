const { task } = require('hardhat/config');

task("check-nft").setAction(async (taskArgs, hre) => {
    const { deployer } = await getNamedAccounts();
    const nft = await ethers.getContract("MyToken", deployer);
    const totalSupply = await nft.totalSupply();
    console.log(`checking status of MyToken NFT on source chain...`);
    for(let tokenId = 0; tokenId < totalSupply; tokenId++) {
        const owner = await nft.ownerOf(tokenId);
        console.log(`Token ID: ${tokenId}, Owner: ${owner}`);
    }
})

module.exports = {};