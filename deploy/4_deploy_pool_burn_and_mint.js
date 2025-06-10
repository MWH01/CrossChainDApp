const { developmentChains, networkConfig } = require("../helper-hardhat-config");
const { network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts();
    const { deploy, log } = deployments;

    log("Deploying NFTPoolBurnAndMint contract...");
    let destChainRouter, linkToken;
    if(developmentChains.includes(network.name)) {
        const CCIPSimulatorDeployment = await deployments.get("CCIPLocalSimulator");
        const CCIPSimulator = await ethers.getContractAt("CCIPLocalSimulator", CCIPSimulatorDeployment.address);
        const CCIPConfig = await CCIPSimulator.configuration();
        destChainRouter = CCIPConfig.destinationRouter_;
        linkToken = CCIPConfig.linkToken_;
    } else {
        destChainRouter = networkConfig[network.config.chainId].router;
        linkToken = networkConfig[network.config.chainId].linkToken;
    }
    const wnftDeployment = await deployments.get("WrappedMyToken");
    const wnftAddr = wnftDeployment.address;

    await deploy("NFTPoolBurnAndMint", {
        contract: "NFTPoolBurnAndMint",
        from: deployer,
        log: true,
        args: [destChainRouter, linkToken, wnftAddr],
    });
    log("NFTPoolBurnAndMint contract deployed successfully!");
    log("----------------------------------------------------");
}
module.exports.tags = ["destchain", "all"];