// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IPFSStorage {
    mapping(address => string[]) private userCIDs;

    event CIDStored(address indexed user, string cid);

    function storeCID(string memory cid) public {
        userCIDs[msg.sender].push(cid);
        emit CIDStored(msg.sender, cid);
    }

    function getUserCIDs() public view returns (string[] memory) {
        return userCIDs[msg.sender];
    }
}
