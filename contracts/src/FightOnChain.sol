// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract FightOnChain {

    struct Player {
        address walletAddress;
        uint256 score;
       
    }

    struct Admin {
        address walletAddress;
        string name;
        uint256 joinDate;
        bool isActive;
    }

    Admin [] public admins;

    Player [] public players;

    mapping(address => bool) public isAdmin;

    // Event to log batch point awards with reason
    event PointsAwardedBatch(
        address indexed admin,
        address[] addresses,
        uint256[] amounts,
        string reason,
        uint256 timestamp
    );

    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "Only admins can perform this action");
        _;
    }

    function addAdmin(address walletAddress, string memory name) public onlyAdmin {
        require(!isAdmin[walletAddress], "Already admin");
        isAdmin[walletAddress] = true;
        admins.push(Admin(walletAddress, name, block.timestamp, true));
        
    }

    
    function removeAdmin(address walletAddress) public onlyAdmin {
        isAdmin[walletAddress] = false;
        for (uint256 i = 0; i < admins.length; i++) {
            if (admins[i].walletAddress == walletAddress) {
                admins[i].isActive = false;
            }
        }
    }

    function getAdmins() public view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < admins.length; i++) {
            if (admins[i].isActive) count++;
        }

        address[] memory activeAdmins = new address[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < admins.length; i++) {
            if (admins[i].isActive) {
                activeAdmins[index] = admins[i].walletAddress;
                index++;
            }
        }
        return activeAdmins;
    }

    function getAdminByAddress(address addr) public view returns (Admin memory) {
    require(isAdmin[addr], "Not an admin");
    for (uint256 i = 0; i < admins.length; i++) {
        if (admins[i].walletAddress == addr && admins[i].isActive) {
            return admins[i];
        }
    }
    revert("Admin not found");
    }

    function addPlayer(address walletAddress, uint256 score) public onlyAdmin {
        players.push(Player(walletAddress, score));
    }

    function updatePlayerScore(address walletAddress, uint256 score) public onlyAdmin {
        for (uint256 i = 0; i < players.length; i++) {
            if (players[i].walletAddress == walletAddress) {
                players[i].score += score;
            }
        }
    }
    
    function awardPointsBatch(address[] memory addresses, uint256[] memory amounts, string memory reason) public onlyAdmin {
        require(addresses.length == amounts.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < addresses.length; i++) {
            updatePlayerScore(addresses[i], amounts[i]);
        }
        
        emit PointsAwardedBatch(msg.sender, addresses, amounts, reason, block.timestamp);
    }

    function getPlayers() public view returns (Player[] memory) {
        return players;
    }

    constructor() {
        address initialAdmin = 0xE19496E993F05Ec1B03D1d456dF6B8227E50deA1;
        isAdmin[initialAdmin] = true;
        admins.push(Admin(initialAdmin, "Shriya", block.timestamp, true));
    }
}
