// const { ethers, upgrades, network} = require("hardhat");

type networks= "eth" | "localhost" | "polygon" | "bsc" | "sepolia" | "arbitrum" | "optimism" | "avalanche" | "base";
const networkParameters: Record<networks, any> = {
    localhost: {
        hikuruPiggyBank: "0x45B6cEBF3528fC8A52657E73b7dEDAfe122c1308",
        registrationFeeEther: "0.02",
        tokenRegistrationUnits: "4.9",
        tokenDecimals: 6,
        tokenContracts: []
    },
    sepolia:{
        hikuruPiggyBank: "0x45B6cEBF3528fC8A52657E73b7dEDAfe122c1308",
        registrationFeeEther: "0.02",
        tokenRegistrationUnits: "4.9",
        tokenDecimals: 6,
        tokenContracts: []
    },
    eth: {
        hikuruPiggyBank: "0x45B6cEBF3528fC8A52657E73b7dEDAfe122c1308",
        registrationFeeEther: "0.01",
        tokenRegistrationUnits: "4.9",
        tokenDecimals: 6,
        tokenContracts: ["0xdac17f958d2ee523a2206206994597c13d831ec7","0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"]
    },
    bsc: {
        hikuruPiggyBank: "0x45B6cEBF3528fC8A52657E73b7dEDAfe122c1308",
        registrationFeeEther: "0.02",
        tokenRegistrationUnits: "4.9",
        tokenDecimals: 18,
        tokenContracts: ["0x55d398326f99059ff775485246999027b3197955", "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d"]
    },
    polygon: {
        hikuruPiggyBank: "0x45B6cEBF3528fC8A52657E73b7dEDAfe122c1308",
        registrationFeeEther: "0.02",
        tokenRegistrationUnits: "4.9",
        tokenDecimals: 6,
        tokenContracts: ["0xc2132d05d31c914a87c6611c10748aeb04b58e8f", "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"]
    },
    arbitrum: {
        hikuruPiggyBank: "0x45B6cEBF3528fC8A52657E73b7dEDAfe122c1308",
        registrationFeeEther: "0.01",
        tokenRegistrationUnits: "4.9",
        tokenDecimals: 6,
        tokenContracts: ["0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"]
    },
    optimism: {
        hikuruPiggyBank: "0x45B6cEBF3528fC8A52657E73b7dEDAfe122c1308",
        registrationFeeEther: "0.02",
        tokenRegistrationUnits: "4.9",
        tokenDecimals: 6,
        tokenContracts: ["0x94b008aa00579c1307b0ef2c499ad98a8ce58e58", "0x7f5c764cbc14f9669b88837ca1490cca17c31607"]
    },
    avalanche: {
        hikuruPiggyBank: "0x45B6cEBF3528fC8A52657E73b7dEDAfe122c1308",
        registrationFeeEther: "0.02",
        tokenRegistrationUnits: "4.9",
        tokenDecimals: 6,
        tokenContracts: ["0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"]
    },
    base: {
        hikuruPiggyBank: "0x45B6cEBF3528fC8A52657E73b7dEDAfe122c1308",
        registrationFeeEther: "0.01",
        tokenRegistrationUnits: "4.9",
        tokenDecimals: 6,
        tokenContracts: []
    }
};



const params = networkParameters[network.name as networks];
if (!params) {
    throw new Error(`Parameters not set for network: ${network.name}`);
}


async function deployFactoryAndCreate() {
    const baseuri="https://w3s.link/ipfs/bafkreidfda5k7225whrwztblpstb2sfh5qdndtuoi6y66fpjoevqeukpgi";
    const username="username";
    const uid=1;
    const score=20;


    console.log("Network: ", network.name)

    const [deployer, minter] = await ethers.getSigners();


    const HikuruPassportFactoryV1 = await ethers.getContractFactory("PassportFactoryV1");
    console.log("Deploying PassportFactory...");
    const HikuruPassportFactoryContract = await upgrades.deployProxy(
        HikuruPassportFactoryV1, 
        [   
            deployer.address, 
            networkParameters[network.name as networks].hikuruPiggyBank, 
            ethers.parseEther(networkParameters[network.name as networks].registrationFeeEther), 
            ethers.parseUnits(networkParameters[network.name as networks].tokenRegistrationUnits, 
            networkParameters[network.name as networks].tokenDecimals), 
            networkParameters[network.name as networks].tokenContracts],
    {
        initializer: "initialize",
        kind: "uups"
    });
    await HikuruPassportFactoryContract.waitForDeployment();
    console.log("PassportFactory Contract deployed to: ", HikuruPassportFactoryContract.target);
    console.log("Deployer: ", deployer.address);


    console.log("\n\nCreate and Mint passport");

    // Data to sign
    const messageHash = ethers.solidityPackedKeccak256(
        ['string', 'string', 'uint256', 'uint256'],
        [baseuri, username, uid, score]
    );

    const signature = await minter.signMessage(ethers.getBytes(messageHash));

    // Connect the minter signer to the deployed contract to make transactions
    const HikuruPassportFactoryWithMinter = HikuruPassportFactoryContract.connect(minter);
    //const tx = await HikuruPassportFactoryWithMinter["createAndMint(address,string,string,uint256,uint256,bytes)"](
    const tx = await HikuruPassportFactoryWithMinter["createAndMint(string,string,uint256,uint256,bytes)"](
        baseuri,
        username,
        uid,
        score,
        signature,
        { value: ethers.parseEther(networkParameters[network.name as networks].registrationFeeEther) }
    );

    await tx.wait()
    console.log("TX hash: ", tx.hash);



    const messageHashUpdate = ethers.solidityPackedKeccak256(
        ['string', 'string', 'uint256', 'uint256'],
        [baseuri, username, uid, 81]
    );
    
    const signatureUpdate = await minter.signMessage(ethers.getBytes(messageHashUpdate));
    
    // Connect the minter signer to the deployed contract to make transactions
    const HikuruPassportWithMinter = HikuruPassportFactoryContract.connect(minter);
    const txUpdate = await HikuruPassportWithMinter.updatePassport(
        baseuri,
        username,
        uid,
        81,
        signatureUpdate
    );
    await txUpdate.wait()
    console.log("TX update hash: ", txUpdate.hash);

}

deployFactoryAndCreate();
