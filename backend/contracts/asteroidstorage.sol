// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AsteroidStorage {
    mapping(address => string[]) private userFiles;

    event FileUploaded(address indexed user, string ipfsHash);

    function uploadFile(string memory ipfsHash) public {
        userFiles[msg.sender].push(ipfsHash);
        emit FileUploaded(msg.sender, ipfsHash);
    }

    function getUserFiles(address user) public view returns (string[] memory) {
        return userFiles[user];
    }
}