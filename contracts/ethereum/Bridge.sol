// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Bridge {
    IERC20 public immutable eSTR;
    uint256 public nonce;

    event BridgeDeposit(
        uint256 indexed amount,
        address indexed sender,
        address indexed recipient,
        uint256 nonce
    );

    constructor(address eSTRAddress) {
        eSTR = IERC20(eSTRAddress);
    }

    function lockTokens(uint256 amount, address recipient) external {
        eSTR.transferFrom(msg.sender, address(this), amount);
        
        emit BridgeDeposit(amount, msg.sender, recipient, nonce++);
    }
}