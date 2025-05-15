// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

interface IpSTR {
    function mint(address to, uint256 amount) external;
}

contract Minter is AccessControl {
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");

    IpSTR public immutable pSTR;
    mapping(uint256 => bool) public usedNonces;

    event Minted(
        address indexed recipient,
        uint256 amount,
        uint256 nonce
    );

    constructor(address pSTRAddress) {
        pSTR = IpSTR(pSTRAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function mint(address recipient, uint256 amount, uint256 nonce) external onlyRole(RELAYER_ROLE) {
        require(!usedNonces[nonce], "Nonce already used");
        
        pSTR.mint(recipient, amount);
        usedNonces[nonce] = true;
        
        emit Minted(recipient, amount, nonce);
    }
}