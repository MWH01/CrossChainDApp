# 🌉 CrossChainDApp - A Cross-Chain NFT Burn-and-Mint DApp

## 📌 Introduction

CrossChainDApp is a cross-chain NFT solution built using Solidity and Chainlink CCIP.  
It supports both **Burn-and-Mint** and **Lock-and-Release** models for transferring NFTs across blockchains.


## 🛠 Features

- 🔗 Cross-chain NFT transfer via Chainlink CCIP  
- 🔥 Burn-and-Mint NFT logic  
- 🔒 Lock-and-Release with wrapped NFTs  
- 🧪 Hardhat-based testing framework  

## Transaction | 事务
```text
【 user's NFT on SourceChain 】

       🔽  lockAndSendNFT
+-------------------------------+
| SChain: NFTPoolLockAndRelease |
| - transferFrom(user → this)   |
| - sendMessage(tokenId, owner) |
+-------------------------------+
                 |
                 | Chainlink CCIP
                 V
+-------------------------------+
| DChain: NFTPoolBurnAndMint    |
| - mintTokenWithSpecificId()   |
+-------------------------------+

【 user now has wrapped NFT on DestChain】

       🔽 burnAndMint
+-------------------------------+
| DChain: NFTPoolBurnAndMint    |
| - burn wrapped NFT            |
| - sendMessage(tokenId, owner) |
+-------------------------------+
                 |
                 | Chainlink CCIP
                 V
+-------------------------------+
| SChain: NFTPoolLockAndRelease |
| - transfer NFT back to user   |
+-------------------------------+

【 user's NFT back to the SourceChain】
```

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

