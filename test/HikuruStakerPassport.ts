const { expect } = require("chai");
const { ethers } = require("hardhat");


interface IHikuruBadges {
    hikuruPiggyBank(): any;
    connect(otherAccount: { address: any; }): any;
    isWhitelisted(address: any, arg1: number): any;
    uri(badgeTypeId: number): any;
    MINTING_FEE(): any;
    balanceOf(address: any, arg1: number): any;
    isOwner(address: any): any;
    mint(to: string, badgeTypeId: number, options: { value: any }): Promise<any>;
    mint(to: string, badgeTypeId: number, reffAddress: string, options: { value: any }): Promise<any>;
    // Include other functions of the contract as needed
  }

const hikuruPiggyBankAddss = "0x76b70aE8c9a9A4467a1cA3D7339F86D854f476c0";


describe("HikuruStakerPassport Contract Tests", function () {
//     let HikuruBadges, hikuruBadges: {
//         balanceOf(address: any, arg1: number): unknown;
//       MINTING_FEE(): any; isOwner: (arg0: any) => any; hikuruPiggyBank: () => any; connect: (arg0: any) => {
//       updateMintingFee(newFee: any): unknown; (): any; new(): any; mint: {(arg0: any, arg1: number, arg2: { value: any; }): Promise<any>;(arg0: any, arg1: number, arg2: { value: any; }, arg3: string): Promise<any>;}; addToWhitelistBlast: { (arg0: any, arg1: number, arg2: number, arg3: number): any; new(): any; }; removeFromWhitelist: { (arg0: any, arg1: any): any; new(): any; }; createNewBadgeType: { (arg0: number, arg1: string, arg2: number, arg3: number): any; new(): any; }; setBadgeURI: { (arg0: number, arg1: string): any; new(): any; }; addToOwner: { (arg0: any): any; new(): any; }; removeFromOwner: { (arg0: any): any; new(): any; }; 
// }; isWhitelisted: (arg0: any, arg1: number) => any; uri: (arg0: number) => any; };

    let HikuruBadges, hikuruBadges: IHikuruBadges;



    let owner: { address: any; }, otherAccount: { address: any; }, newOwner: { address: any; }, referral: { address: any; };
    const mintingFee = ethers.parseEther("0.0004");
    const mintingFeeForRef = ethers.parseEther("0.0002");


    beforeEach(async function () {
        [owner, otherAccount, newOwner, referral] = await ethers.getSigners();
        HikuruBadges = await ethers.getContractFactory("HikuruStakerPassport");
        hikuruBadges = await HikuruBadges.deploy(owner.address, hikuruPiggyBankAddss, "default_uri");
    });


    describe("Deployment", function () {
      it("Should set the right owner and piggy bank address", async function () {
          expect(await hikuruBadges.isOwner(owner.address)).to.be.true;
          expect(await hikuruBadges.hikuruPiggyBank()).to.equal(hikuruPiggyBankAddss);
      });
  });


  describe("Minting", function () {
    it("Should fail minting if not whitelisted", async function () {

        await expect(hikuruBadges.connect(otherAccount)["mint(address,uint256)"](otherAccount.address, 0, { value: mintingFee }))
            .to.be.revertedWith("Not allowed to mint this badge type");
    });

    it("Should mint a badge successfully for a whitelisted user", async function () {
        await hikuruBadges.connect(owner).addToWhitelistBlast(otherAccount.address, 0, 0, 0, 0);

        await expect(hikuruBadges.connect(otherAccount)["mint(address,uint256)"](otherAccount.address, 0, { value: mintingFee }))
        .to.emit(hikuruBadges, "TransferSingle");

    });
  });

  describe("Whitelisting", function () {
    it("Should whitelist and remove a user correctly", async function () {
        await hikuruBadges.connect(owner).addToWhitelistBlast(otherAccount.address, 0, 0, 0, 0);
        expect(await hikuruBadges.isWhitelisted(otherAccount.address, 0)).to.be.true;

        await hikuruBadges.connect(owner).removeFromWhitelist(otherAccount.address, 0);
        expect(await hikuruBadges.isWhitelisted(otherAccount.address, 0)).to.be.false;
    });
  });


  describe("Badge Type Management", function () {
    it("Should create and update a badge type", async function () {
        const badgeTypeId = 1;
        await hikuruBadges.connect(owner).createNewBadgeType(badgeTypeId, "new_uri", 0, 0);
        expect(await hikuruBadges.uri(badgeTypeId)).to.equal("new_uri");

        const updatedUri = "updated_uri";
        await hikuruBadges.connect(owner).setBadgeURI(badgeTypeId, updatedUri);
        expect(await hikuruBadges.uri(badgeTypeId)).to.equal(updatedUri);
    });
  });


  describe("Ownership and Access Control", function () {
    it("Should add and remove an owner", async function () {
        await hikuruBadges.connect(owner).addToOwner(newOwner.address);
        expect(await hikuruBadges.isOwner(newOwner.address)).to.be.true;

        await hikuruBadges.connect(owner).removeFromOwner(newOwner.address);
        expect(await hikuruBadges.isOwner(newOwner.address)).to.be.false;
    });

    it("Should prevent non-owners from adding new owners", async function () {
        await expect(hikuruBadges.connect(otherAccount).addToOwner(otherAccount.address))
            .to.be.revertedWith("Caller is not an owner");
    });
  });



  describe("Minting Edge Cases and Error Handling", function () {
    beforeEach(async function () {
        // Setup a new badge type for testing
        await hikuruBadges.connect(owner).createNewBadgeType(2, "badge_uri", 0, 0);
        await hikuruBadges.connect(owner).addToWhitelistBlast(otherAccount.address, 0, 0, 0, 0);
    });

    it("Should fail minting with insufficient fee", async function () {
        const insufficientFee = ethers.parseEther("0.00005");
        // await expect(hikuruBadges.connect(otherAccount).mint(otherAccount.address, 0, { value: insufficientFee }))
        //     .to.be.revertedWith("Incorrect payment");
        await expect(hikuruBadges.connect(otherAccount)["mint(address,uint256)"](otherAccount.address, 0, { value: insufficientFee }))
        .to.be.revertedWith("Incorrect payment");
    });

    it("Should fail minting if badge type does not exist", async function () {
        const nonExistentBadgeTypeId = 999;
        await expect(hikuruBadges.connect(otherAccount)["mint(address,uint256)"](otherAccount.address, nonExistentBadgeTypeId, { value: mintingFee }))
            .to.be.reverted;
    });

    it("Should fail minting if badge minting has not started", async function () {
        const futureStartTime = (await ethers.provider.getBlock('latest')).timestamp + 100000; // 10 seconds in the future
        const txResponse = await hikuruBadges.connect(owner).createNewBadgeType(3, "future_badge_uri", futureStartTime, 0);
        await txResponse.wait();
        // await expect(hikuruBadges.connect(otherAccount).mint(otherAccount.address, 3, { value: mintingFee }))
        //     .to.be.revertedWith("Minting not started");
        await expect(hikuruBadges.connect(otherAccount)["mint(address,uint256)"](otherAccount.address, 3, { value: mintingFee }))
            .to.be.revertedWith("Minting not started");
    });

    it("Should fail minting if badge minting has ended", async function () {
        const pastEndTime = (await ethers.provider.getBlock('latest')).timestamp - 1000; // 10 seconds in the past
        await hikuruBadges.connect(owner).createNewBadgeType(4, "past_badge_uri", 0, pastEndTime);

        // await hikuruBadges.connect(otherAccount)["mint(address,uint256)"](otherAccount.address, 0, { value: mintingFee });
        await expect(hikuruBadges.connect(otherAccount)["mint(address,uint256)"](otherAccount.address, 4, { value: mintingFee }))
            .to.be.revertedWith("Minting ended");
    });

    it("Should prevent minting the same badge type more than once", async function () {
        // await hikuruBadges.connect(otherAccount).mint(otherAccount.address, 0, { value: mintingFee });
        await hikuruBadges.connect(otherAccount)["mint(address,uint256)"](otherAccount.address, 0, { value: mintingFee });
        await expect(hikuruBadges.connect(otherAccount)["mint(address,uint256)"](otherAccount.address, 0, { value: mintingFee }))
            .to.be.revertedWith("Already minted this badge type");
    });
  });


    describe("Badge Type Creation and Management", function () {
        it("Should prevent creating a badge type with an invalid ID", async function () {
            await expect(hikuruBadges.connect(owner).createNewBadgeType(0, "invalid_uri", 0, 0))
                .to.be.reverted;
        });

        it("Should prevent unauthorized users from creating badge types", async function () {
            await expect(hikuruBadges.connect(otherAccount).createNewBadgeType(5, "unauthorized_uri", 0, 0))
                .to.be.revertedWith("Caller is not an owner");
        });
    });


  describe("Minting Fee and Piggy Bank Management", function () {
    it("Should allow updating the minting fee", async function () {
        const newFee = ethers.parseEther("0.0002");
        await hikuruBadges.connect(owner).updateMintingFee(newFee);
        expect(await hikuruBadges.MINTING_FEE()).to.equal(newFee);
    });

    it("Should prevent unauthorized users from updating the minting fee", async function () {
        const newFee = ethers.parseEther("0.0002");
        await expect(hikuruBadges.connect(otherAccount).updateMintingFee(newFee))
            .to.be.revertedWith("Caller is not an owner");
    });

    it("Should correctly transfer minting fee to piggy bank", async function () {
        const initialBalance = await ethers.provider.getBalance(hikuruBadges.hikuruPiggyBank());
        await hikuruBadges.connect(owner).addToWhitelistBlast(owner.address, 0, 0, 0, 0);
        // await hikuruBadges.connect(owner).mint(owner.address, 0, { value: mintingFee });
        await hikuruBadges.connect(owner)["mint(address,uint256)"](owner.address, 0, { value: mintingFee });

        const finalBalance = await ethers.provider.getBalance(hikuruBadges.hikuruPiggyBank());
        expect(finalBalance-initialBalance).to.equal(mintingFee);
    });
  });

  describe("Whitelist Management", function () {
    it("Should prevent non-owners from adding to whitelist", async function () {
        await expect(hikuruBadges.connect(otherAccount).addToWhitelistBlast(otherAccount.address, 0, 0, 0, 0))
            .to.be.revertedWith("Caller is not an owner");
    });

    it("Should prevent non-owners from removing from whitelist", async function () {
        await hikuruBadges.connect(owner).addToWhitelistBlast(otherAccount.address, 0, 0, 0, 0);
        await expect(hikuruBadges.connect(otherAccount).removeFromWhitelist(otherAccount.address, 0))
            .to.be.revertedWith("Caller is not an owner");
    });
  });
  describe("Ownership Management", function () {
    it("Should allow adding new owners", async function () {
        await hikuruBadges.connect(owner).addToOwner(newOwner.address);
        expect(await hikuruBadges.isOwner(newOwner.address)).to.be.true;
    });

    it("Should allow removing owners", async function () {
        await hikuruBadges.connect(owner).addToOwner(newOwner.address);
        await hikuruBadges.connect(owner).removeFromOwner(newOwner.address);
        expect(await hikuruBadges.isOwner(newOwner.address)).to.be.false;
    });

    it("Should prevent non-owners from adding or removing owners", async function () {
        await expect(hikuruBadges.connect(otherAccount).addToOwner(otherAccount.address))
            .to.be.revertedWith("Caller is not an owner");
        await expect(hikuruBadges.connect(otherAccount).removeFromOwner(owner.address))
            .to.be.revertedWith("Caller is not an owner");
    });
  });

  describe("URI Management and Querying", function () {
    it("Should correctly set and retrieve URIs for badge types", async function () {
        const badgeTypeId = 3;
        const badgeUri = "unique_uri";
        await hikuruBadges.connect(owner).createNewBadgeType(badgeTypeId, badgeUri, 0, 0);
        expect(await hikuruBadges.uri(badgeTypeId)).to.equal(badgeUri);

        const updatedUri = "updated_unique_uri";
        await hikuruBadges.connect(owner).setBadgeURI(badgeTypeId, updatedUri);
        expect(await hikuruBadges.uri(badgeTypeId)).to.equal(updatedUri);
    });
});


describe("Minting with Referral", function () {
    beforeEach(async function () {
        // Assuming badge type 1 is already created for testing
        await hikuruBadges.connect(owner).addToWhitelistBlast(otherAccount.address, 1, 0, 0, 0);
    });

    it("Should transfer referral fee and mint fee correctly", async function () {
        const initialReferralBalance = await ethers.provider.getBalance(referral.address);
        const initialPiggyBankBalance = await ethers.provider.getBalance(hikuruBadges.hikuruPiggyBank());

        // Perform the mint operation
        // const tx = await hikuruBadges.connect(otherAccount).mint(referralAccount.address, 1, { value: mintingFee });
        const tx = await hikuruBadges.connect(otherAccount)["mint(address,uint256,address)"](otherAccount.address, 0, referral.address, { value: mintingFee });
        await tx.wait();

        // Calculate expected balances after minting
        // const mintingFeeBN = ethers.BigNumber.from(mintingFee);

        const expectedPiggyBankBalance = initialPiggyBankBalance+mintingFee-mintingFeeForRef;

        // Check final balances
        const finalReferralBalance = await ethers.provider.getBalance(referral.address);
        const finalPiggyBankBalance = await ethers.provider.getBalance(hikuruBadges.hikuruPiggyBank());
        
        expect(finalReferralBalance).to.equal(initialReferralBalance+mintingFeeForRef);
        expect(finalPiggyBankBalance).to.equal(expectedPiggyBankBalance);

        // Check if the badge was successfully minted
        const balanceOfBadge = await hikuruBadges.balanceOf(otherAccount.address, 0);
        expect(balanceOfBadge).to.equal(1);
    });
    });




  })