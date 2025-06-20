const { developmentChains, networkConfig } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts();
    const { deploy, log } = deployments;

    log("Deploying NFTPoolLockAndRelease contract...");
    let sourceChainRouter, linkToken, destinationChainSelector;
    if (developmentChains.includes(network.name)) {
        const CCIPSimulatorDeployment = await deployments.get("CCIPLocalSimulator");
        const CCIPSimulator = await ethers.getContractAt("CCIPLocalSimulator", CCIPSimulatorDeployment.address);
        const CCIPConfig = await CCIPSimulator.configuration()
        sourceChainRouter = CCIPConfig.sourceRouter_;
        linkToken = CCIPConfig.linkToken_;
        destinationChainSelector = 31337;
    } else {
        sourceChainRouter = networkConfig[network.config.chainId].router
        linkToken = networkConfig[network.config.chainId].linkToken;
    }
    const nftDeployment = await deployments.get("MyToken");
    const nftAddr = nftDeployment.address;

    await deploy("NFTPoolLockAndRelease", {
        contract: "NFTPoolLockAndRelease",
        from: deployer,
        log: true,
        args: [sourceChainRouter, linkToken, nftAddr],
    });
    log("NFTPoolLockAndRelease contract deployed successfully!");
    if (developmentChains.includes(network.name)) {
        log("✅ 目标链 Chain Selector (destinationChainSelector_):", destinationChainSelector.toString());
    }
    log("----------------------------------------------------");
}
module.exports.tags = ["sourcechain", "all"];