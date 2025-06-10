// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {MyToken} from "./MyToken.sol";

contract WrappedMyToken is MyToken{
    // This contract wraps MyToken and allows minting with a specific token ID.
    constructor(string memory tokenName, string memory tokenSymbol)
        MyToken(tokenName, tokenSymbol){}

    function mintTokenWithSpecificTokenId(address to, uint256 tokenId) public {
        _safeMint(to, tokenId);
    }
}