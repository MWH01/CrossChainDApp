const { getNamedAccounts } = require("hardhat");

module.exports = async({getNamedAccounts, deployments}) => {
    const { deployer } = await getNamedAccounts();
    const { deploy, log } = deployments;

    log("Deploying WNFT contract...");
    await deploy("WrappedMyToken", {
        contract: "WrappedMyToken",
        from: deployer,
        log: true,
        args: ["WrappedMyToken", "WMT"]
    })
    log("WNFT contract deployed successfully!");
    log("----------------------------------------------------");
}

module.exports.tags = ["destchain", "all"]