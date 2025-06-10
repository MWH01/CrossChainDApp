const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

module.exports = async({getNamedAccounts, deployments}) => {
    if (developmentChains.includes(network.name)){
        const { deployer } = await getNamedAccounts();
        const { deploy, log } = deployments;
    
        log("Deploying CCIP Simulator contract...");
        await deploy("CCIPLocalSimulator", {
            contract: "CCIPLocalSimulator",
            from: deployer,
            log: true,
            args: []
        })
        log("CCIP Simulator contract deployed successfully!");
        log("----------------------------------------------------");
    }
}

module.exports.tags = ["test", "all"]