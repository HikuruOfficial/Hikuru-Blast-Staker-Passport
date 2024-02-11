# HikuruStakerPassport Contract

### Concept of Hikuru Passport

![image](https://github.com/HikuruOfficial/Hikuru-Blast-Staker-Passport/assets/132744928/0ba6f937-6b58-4451-9d20-321505826a3f)

The "Hikuru Passport" is a virtual document designed to encapsulate and represent a user's online presence and activities across multiple networks. This innovative concept aims to provide a standardized way of quantifying and verifying a user's engagement level and identity in the digital realm.

### Features of the Hikuru Passport

- **Activity Scale:** At its core, the Hikuru Passport utilizes a numerical scale ranging from zero to one hundred to indicate the degree of a user's activity online. This scale is a dynamic representation that reflects how engaged and active the user is across different platforms. A higher score on this scale signifies a more active user, potentially influencing their credibility, visibility, or access to certain online privileges and services.

- **User Identification:** Beyond measuring activity, the passport also serves as a digital identity card. It stores essential identifiers such as the user's username and possibly other personal data. This aspect of the passport facilitates user verification, making it easier for various online services and platforms to authenticate users and tailor experiences to their preferences and activity level.

- **Interoperability with Services:** One of the key benefits of the Hikuru Passport is its potential for widespread usability and acceptance across different online services. By standardizing the way user activity and identity are represented, it can be used by various platforms for verification purposes. This interoperability means that users might carry their reputation and credentials with them seamlessly from one service to another, enhancing user experience and security online.

### Potential Applications and Benefits

- **Enhanced Security and Trust:** By providing a reliable way to verify user activity and identity, the Hikuru Passport can help reduce fraud and increase trust between users and services online.
  
- **Personalization:** Services can use the data stored in the passport to personalize user experiences, offering content, recommendations, and features more aligned with the user's interests and level of engagement.

- **Access Control:** The activity score could be used to grant or restrict access to certain features or services based on a user's level of activity, encouraging more engagement while also preventing abuse.

- **Simplification of User Verification:** For services that require identity verification, the Hikuru Passport could streamline the process, reducing the need for users to repeatedly provide personal information to different platforms.

### Challenges and Considerations

While the concept of the Hikuru Passport offers numerous benefits, it also raises questions regarding privacy, data security, and the standardization of activity metrics across diverse platforms. Ensuring user data protection and developing a universally accepted activity measurement system will be crucial for its success and acceptance.

In summary, the Hikuru Passport represents an innovative approach to quantifying online activity and streamlining identity verification across the digital landscape, potentially transforming how users interact with online services.



## Overview Contract

The `HikuruStakerPassport` contract is an Ethereum blockchain-based smart contract developed by Hikuru Labs. It is designed to manage digital badges using the ERC1155 token standard. The contract includes features such as minting badges, managing whitelists, and handling referral programs. It also includes ownership and access control mechanisms.

## Features Contract

- **Badge Minting**: Users can mint badges if they meet certain criteria, including being whitelisted and paying a minting fee.
- **Whitelist Management**: The contract allows certain addresses to mint specific badge types.
- **Referral Program**: Users can mint badges through a referral system, splitting the fee between the referral and the contract's piggy bank.
- **Ownership and Access Control**: Specific functions are restricted to owners only, allowing for administrative control.
- **URI Management**: Each badge type has a unique URI which can be set and updated by the owner.
- **Royalty Management**: Implements the EIP2981 standard for handling royalties.

## Contract Dependencies

- OpenZeppelin's ERC1155 and ERC1155Supply contracts for token management.
- OpenZeppelin's Ownable contract for access control.

The test suite covers various aspects of the contract, including deployment, minting logic, whitelist management, badge type management, access control, and edge case handling.

## Contract Functions

### Mint Function

- `mint(address to, uint256 badgeTypeId)`: Allows users to mint a badge of a specific type. The user must be whitelisted for the badge type, and the current timestamp must be within the allowed minting period for that badge type. The function requires a minting fee.
![image](https://github.com/HikuruOfficial/Hikuru-Blast-Staker-Passport/assets/132744928/792ac301-78e8-4a93-9ed2-d5628a74ead0)
- **Referral System**: A second mint function, `mint(address to, uint256 badgeTypeId, address reffAddress)`, includes a referral system. When a badge is minted using this function, 50% of the minting fee is transferred to the referrer's address (specified by `reffAddress`), and the remaining 50% is sent to the contract's piggy bank.
- The minting process involves several checks including whether minting for the badge type has started, if it has ended, and whether the badge type exists.
- Each user is allowed to mint a specific badge type only once, to prevent duplicate minting.

### Additional Functions

- `addToWhitelistBlast`: Add an address with staking details to the whitelist.
- `removeFromWhitelist`: Remove an address from the whitelist.
- `createNewBadgeType`: Create a new badge type with specific details.
- `setBadgeURI`: Update the URI for a badge type.

### Access Control

- Functions like `addToWhitelistBlast` and `createNewBadgeType` require the caller to be an owner, ensuring secure management.


## Setting Up

### Prerequisites

- Node.js and npm installed.
- Ethereum development tools like Hardhat or Truffle.

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/HikuruOfficial/Hikuru-Blast-Staker-Passport.git
   ```
2. Navigate to the project directory:
   ```
   cd Hikuru-Blast-Staker-Passport
   ```
3. Install dependencies:
   ```
   npm install
   ```
## Running Tests

To run the test suite:

1. Compile the contract:
   ```
   npx hardhat compile
   ```
2. Run the test scripts:
   ```
   npx hardhat test
   ```

```

Compiled 14 Solidity files successfully.

  HikuruStakerPassport Contract Tests
    Deployment
      ✔ Should set the right owner and piggy bank address
    Minting
      ✔ Should fail minting if not whitelisted
      ✔ Should mint a badge successfully for a whitelisted user (51ms)
    Whitelisting
      ✔ Should whitelist and remove a user correctly
    Badge Type Management
      ✔ Should create and update a badge type
    Ownership and Access Control
      ✔ Should add and remove an owner
      ✔ Should prevent non-owners from adding new owners
    Minting Edge Cases and Error Handling
      ✔ Should fail minting with insufficient fee
      ✔ Should fail minting if badge type does not exist
      ✔ Should fail minting if badge minting has not started
      ✔ Should fail minting if badge minting has ended
      ✔ Should prevent minting the same badge type more than once
    Badge Type Creation and Management
      ✔ Should prevent creating a badge type with an invalid ID
      ✔ Should prevent unauthorized users from creating badge types
    Minting Fee and Piggy Bank Management
      ✔ Should allow updating the minting fee
      ✔ Should prevent unauthorized users from updating the minting fee
      ✔ Should correctly transfer minting fee to piggy bank
    Whitelist Management
      ✔ Should prevent non-owners from adding to whitelist
      ✔ Should prevent non-owners from removing from whitelist
    Ownership Management
      ✔ Should allow adding new owners
      ✔ Should allow removing owners
      ✔ Should prevent non-owners from adding or removing owners
    URI Management and Querying
      ✔ Should correctly set and retrieve URIs for badge types
    Minting with Referral
      ✔ Should transfer referral fee and mint fee correctly


  24 passing (2s)


```

## Deployment and verification
```
npx hardhat run scripts/deploy.ts --network blast_sepolia
```
Deploying Hikuru Blast Staker Passport...
Deployer:  **0x4d052115975db4a43D7471fa6E08696D4c0355A4**

Hikuru Blast Staker Passport contract deployed to:  **0xaB41D4bEa12f0640a2C17d68265aeb35Bc91C13b**


```
npx hardhat verify --network blast_sepolia --constructor-args args.js 0xaB41D4bEa12f0640a2C17d68265aeb35Bc91C13b
```
Successfully submitted source code for contract
contracts/HikuruStakerPassport.sol:HikuruStakerPassport at **0xaB41D4bEa12f0640a2C17d68265aeb35Bc91C13b**
for verification on the block explorer. Waiting for verification result...

Successfully verified contract HikuruStakerPassport on the block explorer.
[testnet.blastscan.io](https://testnet.blastscan.io/address/0xaB41D4bEa12f0640a2C17d68265aeb35Bc91C13b#code)

   
## Authors

- Hikuru Labs

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

This README provides a comprehensive guide to understanding and interacting with the `HikuruStakerPassport` contract. It's designed to be clear and accessible for developers at various levels of expertise in Ethereum and smart contract development.



