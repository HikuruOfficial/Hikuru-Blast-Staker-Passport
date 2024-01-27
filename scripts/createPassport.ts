// scripts/deploy_upgradeable_box.js
// const { ethers, upgrades } = require("hardhat");

async function createPassport() {
    const {abi} = require("../artifacts/contracts/PassportFactoryV1.sol/PassportFactoryV1.json");

    const [deployer] = await ethers.getSigners();

    const HikuruPassportFactoryContract= new ethers.Contract("0x5067457698Fd6Fa1C6964e416b3f42713513B3dD", abi, deployer);

    let hikuruPiggyBank =await HikuruPassportFactoryContract.hikuruPiggyBank();
    console.log(hikuruPiggyBank)


    const tx =await HikuruPassportFactoryContract.createAndMint("test_url", "tester1", 1, 60, {"value": "10000000000000000"});
    console.log(tx)

}
// , "test_url", "tester1", 1, 60
createPassport();