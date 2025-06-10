const { getNamedAccounts, ethers } = require("hardhat")
const { expect } = require("chai")

let deployer, ccipLocalSimulator, nft, nftPoolLockAndRelease, wnft, nftPoolBurnAndMint, chainSelector
before(async function(){
    // prepare variables: contract, account
    deployer = (await getNamedAccounts()).deployer
    await deployments.fixture("all")
    ccipLocalSimulator = await ethers.getContract("CCIPLocalSimulator", deployer)
    nft = await ethers.getContract("MyToken", deployer)
    nftPoolLockAndRelease = await ethers.getContract("NFTPoolLockAndRelease", deployer)
    wnft = await ethers.getContract("WrappedMyToken", deployer)
    nftPoolBurnAndMint = await ethers.getContract("NFTPoolBurnAndMint", deployer)
    const config = await ccipLocalSimulator.configuration()
    chainSelector = config.chainSelector_
})

describe("source chain -> dest chain tests", async function() {
    it("test if user can mint a nft from nft contract successfully", async function() {
        await nft.safeMint(deployer)
        const owner = await nft.ownerOf(0)
        expect(owner).to.equal(deployer)
    })

    it("test if user can lock the nft in the pool and send ccip message on source chain", async function() {
        nft.approve(nftPoolLockAndRelease.target, 0)
        await ccipLocalSimulator.requestLinkFromFaucet(nftPoolLockAndRelease, ethers.parseEther("10"))
        await nftPoolLockAndRelease.lockAndSendNFT(0, deployer, chainSelector, nftPoolBurnAndMint.target)
        const owner = await nft.ownerOf(0)
        expect(owner).to.equal(nftPoolLockAndRelease)
    })

    it("test if user can get a wrapped nft on dest chain", async function(){
        const owner = await wnft.ownerOf(0)
        expect(owner).to.equal(deployer)
    })
})


describe("dest chain -> source chain tests", async function() {
    it("test if user can burn the wrapped nft and send ccip message on dest chain", async function() {
        await wnft.approve(nftPoolBurnAndMint.target, 0)
        await ccipLocalSimulator.requestLinkFromFaucet(nftPoolBurnAndMint, ethers.parseEther("10"))
        await nftPoolBurnAndMint.burnAndMint(0, deployer, chainSelector, nftPoolLockAndRelease.target)
        const totalSupply = await wnft.totalSupply()
        expect(totalSupply).to.equal(0)
    })

    it("test if user have the nft unlocked on source chain", async function() {
        const owner = await nft.ownerOf(0)
        expect(owner).to.equal(deployer)
    })
})