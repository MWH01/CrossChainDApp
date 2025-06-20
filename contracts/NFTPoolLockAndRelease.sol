// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";
import {MyToken} from "./MyToken.sol";

/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES HARDCODED VALUES FOR CLARITY.
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */

/// @title - 一个简单的跨链消息发送与接收合约示例。
contract NFTPoolLockAndRelease is CCIPReceiver, OwnerIsCreator {
    using SafeERC20 for IERC20;

    // 自定义错误，用于提供更详细的 revert 信息
    error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees); // 余额不足，无法支付手续费
    error NothingToWithdraw(); // 没有可提现的以太币
    error FailedToWithdrawEth(address owner, address target, uint256 value); // 提现以太币失败
    error InvalidReceiverAddress(); // 接收者地址为0，非法地址

    // 发送跨链消息时触发的事件
    event MessageSent(
        bytes32 indexed messageId, // CCIP消息唯一ID
        uint64 indexed destinationChainSelector, // 目标链选择器
        address receiver, // 目标链接收地址
        bytes text, // 发送的消息内容
        address feeToken, // 支付手续费的代币地址
        uint256 fees // 支付的手续费金额
    );

    // 接收到跨链消息并解锁NFT时触发的事件
    event TokenUnlocked(
        uint256 tokenId, // 解锁的NFT Token ID
        address newOwner // NFT的新所有者地址
    );

    bytes32 private s_lastReceivedMessageId; // 记录最后收到的消息ID
    string private s_lastReceivedText; // 记录最后收到的消息文本

    IERC20 private s_linkToken; // LINK代币合约，用于支付跨链消息手续费
    MyToken public nft; // NFT合约实例

    // 跨链请求的数据结构，包含Token ID和新所有者地址
    struct RequestData {
        uint256 tokenId; // NFT的Token ID
        address newOwner; // NFT的新拥有者地址
    }

    /// @notice 构造函数，初始化路由合约、LINK合约地址和NFT合约地址
    /// @param _router 路由合约地址
    /// @param _link LINK代币合约地址
    /// @param nftAddr NFT合约地址
    constructor(
        address _router,
        address _link,
        address nftAddr
    ) CCIPReceiver(_router) {
        s_linkToken = IERC20(_link);
        nft = MyToken(nftAddr);
    }

    /// @dev 修饰器，检查接收者地址不为0
    /// @param _receiver 接收者地址
    modifier validateReceiver(address _receiver) {
        if (_receiver == address(0)) revert InvalidReceiverAddress();
        _;
    }

    /// @notice 锁定NFT并发送跨链消息
    /// @param tokenId NFT的Token ID
    /// @param newOwner 目标链上NFT的新拥有者地址
    /// @param chainSelector 目标链选择器
    /// @param receiver 目标链接收地址
    /// @return messageId 返回发送的消息ID
    function lockAndSendNFT(
        uint256 tokenId,
        address newOwner,
        uint64 chainSelector,
        address receiver
    ) public returns (bytes32) {
        // 将NFT从调用者转移到合约地址，实现锁定
        nft.transferFrom(msg.sender, address(this), tokenId);
        // 构造跨链消息的payload
        bytes memory payload = abi.encode(tokenId, newOwner);
        // 发送跨链消息，并获取消息ID
        bytes32 messageId = sendMessagePayLINK(
            chainSelector,
            receiver,
            payload
        );
        return messageId;
    }

    /// @notice 通过LINK支付手续费发送跨链消息
    /// @param _destinationChainSelector 目标链选择器
    /// @param _receiver 目标链消息接收地址
    /// @param _text 发送的消息内容（bytes格式）
    /// @return messageId 发送的跨链消息ID
    function sendMessagePayLINK(
        uint64 _destinationChainSelector,
        address _receiver,
        bytes memory _text
    ) internal returns (bytes32 messageId) {
        // 构造CCIP消息体
        Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
            _receiver,
            _text,
            address(s_linkToken)
        );

        // 获取Router客户端实例
        IRouterClient router = IRouterClient(this.getRouter());

        // 查询发送该消息所需手续费
        uint256 fees = router.getFee(_destinationChainSelector, evm2AnyMessage);

        // 检查合约LINK余额是否足够支付手续费
        if (fees > s_linkToken.balanceOf(address(this)))
            revert NotEnoughBalance(s_linkToken.balanceOf(address(this)), fees);

        // 批准Router从合约账户扣除手续费
        s_linkToken.approve(address(router), fees);

        // 调用Router发送跨链消息，返回消息ID
        messageId = router.ccipSend(_destinationChainSelector, evm2AnyMessage);

        // 触发事件，记录发送信息
        emit MessageSent(
            messageId,
            _destinationChainSelector,
            _receiver,
            _text,
            address(s_linkToken),
            fees
        );

        return messageId;
    }

    /// @notice 接收跨链消息回调
    /// @param any2EvmMessage 接收到的消息数据结构
    function _ccipReceive(
        Client.Any2EVMMessage memory any2EvmMessage
    ) internal override {
        // 解码跨链消息数据
        RequestData memory requestData = abi.decode(
            any2EvmMessage.data,
            (RequestData)
        );
        uint256 tokenId = requestData.tokenId;
        address newOwner = requestData.newOwner;

        // 将NFT从合约地址转给新所有者，实现解锁
        nft.transferFrom(address(this), newOwner, tokenId);

        // 触发NFT解锁事件
        emit TokenUnlocked(tokenId, newOwner);
    }

    /// @notice 构造CCIP消息结构体
    /// @param _receiver 接收者地址
    /// @param _payload 发送的数据负载（bytes）
    /// @param _feeTokenAddress 支付手续费的代币地址，地址0表示本地原生币
    /// @return Client.EVM2AnyMessage 返回构造的CCIP消息结构体
    function _buildCCIPMessage(
        address _receiver,
        bytes memory _payload,
        address _feeTokenAddress
    ) private pure returns (Client.EVM2AnyMessage memory) {
        return
            Client.EVM2AnyMessage({
                receiver: abi.encode(_receiver), // ABI编码后的接收者地址
                data: _payload, // 发送的数据负载
                tokenAmounts: new Client.EVMTokenAmount[](0), // 空数组，不转账代币
                extraArgs: Client._argsToBytes(
                    Client.EVMExtraArgsV1({gasLimit: 200_000}) // 额外参数，设置gas上限
                ),
                feeToken: _feeTokenAddress // 付款代币地址
            });
    }

    /// @notice 获取最近接收到的消息详情
    /// @return messageId 最近消息ID
    /// @return text 最近消息文本
    function getLastReceivedMessageDetails()
        external
        view
        returns (bytes32 messageId, string memory text)
    {
        return (s_lastReceivedMessageId, s_lastReceivedText);
    }

    /// @notice 合约接收以太币的回退函数
    receive() external payable {}

    /// @notice 合约拥有者提现所有合约内以太币
    /// @param _beneficiary 提现接收地址
    function withdraw(address _beneficiary) public onlyOwner {
        uint256 amount = address(this).balance;
        if (amount == 0) revert NothingToWithdraw();

        (bool sent, ) = _beneficiary.call{value: amount}("");
        if (!sent) revert FailedToWithdrawEth(msg.sender, _beneficiary, amount);
    }

    /// @notice 合约拥有者提现指定ERC20代币全部余额
    /// @param _beneficiary 提现接收地址
    /// @param _token 代币合约地址
    function withdrawToken(
        address _beneficiary,
        address _token
    ) public onlyOwner {
        uint256 amount = IERC20(_token).balanceOf(address(this));
        if (amount == 0) revert NothingToWithdraw();

        IERC20(_token).safeTransfer(_beneficiary, amount);
    }

    function getNFT() external view returns (address) {
        return address(nft);
    }
}
