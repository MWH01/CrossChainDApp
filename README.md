# 🌉 CrossChainDApp - A Cross-Chain NFT Burn-and-Mint DApp

## 📌 Introduction | 项目简介

CrossChainDApp is a cross-chain NFT solution built using Solidity and Chainlink CCIP.  
It supports both **Burn-and-Mint** and **Lock-and-Release** models for transferring NFTs across blockchains.

CrossChainDApp 是一个基于 Solidity 与 Chainlink CCIP 的跨链 NFT 应用，  
支持 **烧毁-重铸（Burn-and-Mint）** 和 **锁定-释放（Lock-and-Release）** 两种跨链转移模式。

---

## 🛠 Features | 功能亮点

- 🔗 Cross-chain NFT transfer via Chainlink CCIP  
- 🔥 Burn-and-Mint NFT logic  
- 🔒 Lock-and-Release with wrapped NFTs  
- 🧪 Hardhat-based testing framework  
- 🧱 模拟 CCIP 实现跨链通信流程  
- 🔁 跨链支持 NFT 烧毁再铸造 & 锁定释放  
- 🪙 支持 Wrapped NFT（封装 NFT）  
- ✅ 内置测试脚本，支持一键运行

---

## 📁 Project Structure | 项目结构

```bash
CrossChainDApp/
├── contracts/                      # 核心合约
│   ├── MyToken.sol                 # 自定义 ERC721 NFT 合约
│   ├── NFTPoolBurnAndMint.sol     # 烧毁重铸逻辑
│   ├── NFTPoolLockAndRelease.sol  # 锁定释放逻辑
│   ├── WrappedMyToken.sol         # 封装 NFT 合约
│   └── CCIPSimulator.sol          # 模拟 CCIP 消息
│
├── deploy/                        # 合约部署脚本
│   ├── 1_deploy_nft.js
│   ├── 2_deploy_pool_lock_and_release.js
│   ├── 3_deploy_wnfts.js
│   └── 4_deploy_pool_burn_and_mint.js
│
├── task/                          # 自定义命令脚本
│   ├── burn-and-cross.js
│   ├── lock-and-cross.js
│   └── check-nft.js
│
├── test/                          # 测试用例
│   └── cross-chain-nft.test.js
│
├── hardhat.config.js              # Hardhat 配置文件
└── README.md                      # 项目说明文档

