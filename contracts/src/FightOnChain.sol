// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract FightOnChain {

    struct Player {
        address walletAddress;
        string name;
        uint256 score;
        string tribe;
        uint256 joinDate;
        bool isActive;
    }

    struct Admin {
        address walletAddress;
        string name;
        uint256 joinDate;
        bool isActive;
    }

    Admin [] public admins = [
        Admin(0xE19496E993F05Ec1B03D1d456dF6B8227E50deA1, "Shriya", block.timestamp, true)
    ];

    // Helper function to check if address is an active admin
    function isAdmin(address addr) public view returns (bool) {
        for (uint256 i = 0; i < admins.length; i++) {
            if (admins[i].walletAddress == addr && admins[i].isActive) {
                return true;
            }
        }
        return false;
    }

    modifier onlyAdmin() {
        require(isAdmin(msg.sender), "Only admins can perform this action");
        _;
    }

    Player [] public players = [
        Player(0xE19496E993F05Ec1B03D1d456dF6B8227E50deA1, "Shriya", 100, "Genesis", block.timestamp, true)
    ];


    function addAdmin(address walletAddress, string memory name) public onlyAdmin {
        admins.push(Admin(walletAddress, name, block.timestamp, true));
    }

    function addPlayer(address walletAddress, string memory name, uint256 score, string memory tribe) public {
        players.push(Player(walletAddress, name, score, tribe, block.timestamp, true));
    }

    function getAdmins() public view returns (Admin[] memory) {
        return admins;
    }

    function getPlayers() public view returns (Player[] memory) {
        return players;
    }
}
