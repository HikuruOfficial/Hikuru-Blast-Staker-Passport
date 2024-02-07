// SPDX-License-Identifier: MIT
// author: Hikuru Labs
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "./IBlast.sol";



interface IFeeClaimer {
    function deposit(address _user, uint256 _amount) external payable returns (bool);
}


contract HikuruStakerPassport is ERC1155, Ownable, ERC1155Supply {
    uint256 public MINTING_FEE = 0.0004 ether;
    address public hikuruPiggyBank;
    IBlast public constant BLAST = IBlast(0x4300000000000000000000000000000000000002);
    IFeeClaimer public feeClaimer; // Reference to the FeeClaimer contract

    mapping(address => string) private _URIs; // Mapping of token IDs to their URIs
    mapping(address => string) private _usernames; // Mapping of token IDs to usernames
    mapping(address => uint256) private _uids; // Mapping of token IDs to user IDs
    mapping(address => uint256) public userScores; // Mapping of user addresses to scores


    struct BadgeType {
        string uri;
        uint256 startTime;
        uint256 endTime;
    }


    mapping(uint256 => BadgeType) public badgeTypes; // Mapping of badge types
    mapping(address => bool) public isOwner; // Mapping for additional owners
    mapping(address => uint256) public userBlastStakedEth; // User staked ETH amount
    mapping(address => uint256) public userBlastStakedUsd; // User staked USD amount
    mapping(address => uint256) public userBlastFirstStakedDate; // When user made first stake
    mapping(address => mapping(uint256 => bool)) public isAllowedToMint; // Mapping for whitelisted addresses
    mapping(address => mapping(uint256 => bool)) public hasMinted; // User protection to mint twice same type
    mapping(address => uint256) public referralsInviteCount;

    // Modifier that checks that the caller is one of the owners
    modifier onlyHikuruOwner() {
        require(isOwner[msg.sender], "Caller is not an owner");
        _; // Continue execution
    }

    // Constructor sets up the initial owner and the piggy bank address
    constructor(address initialOwner, address _hikuruPiggyBank, address _feeClaimer, string memory zero_url_) ERC1155("") Ownable(initialOwner) {
        isOwner[initialOwner] = true;
        hikuruPiggyBank = _hikuruPiggyBank;
        feeClaimer = IFeeClaimer(_feeClaimer);

        BLAST.configureClaimableYield();
        BLAST.configureClaimableGas(); 

        // Initialize the default badge type
        badgeTypes[0] = BadgeType({
            uri: zero_url_,
            startTime: 0,
            endTime: 0
        });
    }

    // Function to mint new badges
    function mint(address to, uint256 badgeTypeId, string memory username_, uint256 uid_) public payable {
        require(block.timestamp >= badgeTypes[badgeTypeId].startTime, "Minting not started");
        require(badgeTypes[badgeTypeId].endTime == 0 || block.timestamp <= badgeTypes[badgeTypeId].endTime, "Minting ended");
        require(isAllowedToMint[msg.sender][badgeTypeId], "Not allowed to mint this badge type");
        require(bytes(badgeTypes[badgeTypeId].uri).length != 0, "Badge type does not exist");
        require(msg.value >= MINTING_FEE, "Incorrect payment");
        require(!hasMinted[msg.sender][badgeTypeId], "Already minted this badge type");

        // user should stake first some amount of BLAST
        require(userBlastStakedEth[msg.sender] > 0 || userBlastStakedUsd[msg.sender]>0, "User should stake first some amount of BLAST");

        // Transfer the minting fee to the hikuru piggy bank
        (bool feeTransferSuccess, ) = hikuruPiggyBank.call{value: msg.value}("");
        require(feeTransferSuccess, "Fee transfer failed");

        hasMinted[msg.sender][badgeTypeId] = true;
        _usernames[msg.sender] = username_; // Set the username for the new NFT
        _uids[msg.sender] = uid_; // Set the user ID for the new NFT
        _mint(to, badgeTypeId, 1, "");
    }

    function mint(address to, uint256 badgeTypeId, address reffAddress, string memory username_, uint256 uid_) public payable {
        require(block.timestamp >= badgeTypes[badgeTypeId].startTime, "Minting not started");
        require(badgeTypes[badgeTypeId].endTime == 0 || block.timestamp <= badgeTypes[badgeTypeId].endTime, "Minting ended");
        require(isAllowedToMint[msg.sender][badgeTypeId], "Not allowed to mint this badge type");
        require(bytes(badgeTypes[badgeTypeId].uri).length != 0, "Badge type does not exist");
        require(msg.value >= MINTING_FEE, "Incorrect payment");
        require(!hasMinted[msg.sender][badgeTypeId], "Already minted this badge type");

        // Calculate referral fee (50% of the minting fee)
        uint256 referralFee = msg.value / 2;

        // Call the deposit function on the FeeClaimer contract
        bool success = feeClaimer.deposit{value: referralFee}(payable(reffAddress), referralFee);
        require(success, "Deposit to FeeClaimer failed");

        // Transfer the remaining fee to the hikuru piggy bank
        uint256 remainingFee = msg.value - referralFee;
        (bool feeTransferSuccess, ) = hikuruPiggyBank.call{value: remainingFee}("");
        require(feeTransferSuccess, "Fee transfer failed");

        hasMinted[msg.sender][badgeTypeId] = true;
        _mint(to, badgeTypeId, 1, "");
        _usernames[msg.sender] = username_; // Set the username for the new NFT
        _uids[msg.sender] = uid_; // Set the user ID for the new NFT
        referralsInviteCount[to]+=1;
    }


    // Function to add an address to the whitelist and set their staked amounts
    function addToWhitelistBlast(address user, uint256 stakedEth, uint256 stakedUsd, uint256 stakeDate, uint256 badgeTypeId, uint256 _userScore) public onlyHikuruOwner {
        userBlastStakedEth[user] = stakedEth;
        userBlastStakedUsd[user] = stakedUsd;
        userBlastFirstStakedDate[user] = stakeDate;
        userScores[user] = _userScore;
        isAllowedToMint[user][badgeTypeId] = true;
    }

    function addToWhitelist(address user, uint256 badgeTypeId) public onlyHikuruOwner {
        isAllowedToMint[user][badgeTypeId] = true;
    }

    function isWhitelisted(address user, uint256 badgeTypeId) public view returns (bool) {
        return isAllowedToMint[user][badgeTypeId];
    }

    // Function to remove an address from the whitelist
    function removeFromWhitelist(address user, uint256 badgeTypeId) public onlyHikuruOwner {
        isAllowedToMint[user][badgeTypeId] = false;
    }

    // Function to update the minting fee
    function updateMintingFee(uint256 newFee) public onlyHikuruOwner {
        MINTING_FEE = newFee;
    }

    // Function to update the Hikuru Piggy Bank address
    function setHikuruPiggyBank(address newPiggyBank) public onlyHikuruOwner {
        require(newPiggyBank != address(0), "New piggy bank address cannot be zero address");
        hikuruPiggyBank = newPiggyBank;
    }

    // Function to update the FeeClaimer contract address
    function setFeeClaimer(address newFeeClaimer) public onlyHikuruOwner {
        require(newFeeClaimer != address(0), "New FeeClaimer address cannot be zero address");
        feeClaimer = IFeeClaimer(newFeeClaimer);
    }


    // Function to create a new badge type
    function createNewBadgeType(uint256 id, string memory uri_, uint256 startTime, uint256 endTime) public onlyHikuruOwner {
        require(bytes(badgeTypes[id].uri).length == 0, "Badge type already exists");

        badgeTypes[id] = BadgeType({
            uri: uri_,
            startTime: startTime,
            endTime: endTime
        });
    }

    // Function to add a new owner
    function addToOwner(address newOwner) public onlyHikuruOwner {
        require(newOwner != address(0), "New owner is the zero address");
        isOwner[newOwner] = true;
    }

    // Function to remove an existing owner
    function removeFromOwner(address owner) public onlyHikuruOwner {
        isOwner[owner] = false;
    }

    // Function to update the URI of a specific badge type
    function setBadgeURI(uint256 badgeTypeId, string memory newuri) public onlyHikuruOwner {
        badgeTypes[badgeTypeId].uri = newuri;
    }

    // Override the uri function to return the URI for each badge type
    function uri(uint256 badgeTypeId) public view override returns (string memory) {
        return badgeTypes[badgeTypeId].uri;
    }

    // Additional useful functions could be added here...
    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155, ERC1155Supply)
    {
        super._update(from, to, ids, values);
    }


    function claimAllYield() external onlyHikuruOwner {
        // allow only the owner to claim the yield
        BLAST.claimAllYield(address(this), hikuruPiggyBank);
    }

    function claimMyContractsGas() external onlyHikuruOwner {
        // allow only the owner to claim the gas
        BLAST.claimAllGas(address(this), hikuruPiggyBank);
    }


    // EIP2981 standard royalties return.
    function royaltyInfo(uint256 _tokenId, uint256 _salePrice) external view
        returns (address receiver, uint256 royaltyAmount)
    {
        return (hikuruPiggyBank, (_salePrice * 200) / 10000);
    }

}
