// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import {FightOnChain} from "../src/FightOnChain.sol";

contract DeployFightOnChain is Script {
    FightOnChain public fightOnChain;
    function setUp() public {}

    function run() external {
        // Load private key from .env file
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy the contract
        fightOnChain = new FightOnChain();

        // Log the deployed address
        console.log("FightOnChain deployed to:", address(fightOnChain));

        vm.stopBroadcast();
    }
}
