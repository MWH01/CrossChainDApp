const { getNamedAccounts } = require("hardhat");

module.exports = async({getNamedAccounts, deployments}) => {
    const { deployer } = await getNamedAccounts();
    const { deploy, log } = deployments;

    log("Deploying NFT contract...");
    await deploy("MyToken", {
        contract: "MyToken",
        from: deployer,
        log: true,
        args: ["MyToken", "MT"]
    })
    log("NFT contract deployed successfully!");
    log("----------------------------------------------------");
}

module.exports.tags = ["sourcechain", "all", "mytoken"]