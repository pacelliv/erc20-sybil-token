// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol";

interface ISybilToken {
    event Burn(address indexed _from, uint256 _value);

    function burnFrom(address _from, uint256 _value) external returns (bool success);

    function getBurntAmount() external view returns (uint256);

    function getTargetSupply() external view returns (uint256);
}

/**
 * @title SybilBurner.
 * @author Eugenio Pacelli Flores Voitier.
 * @notice This is a sample contract to create an automated contract that periodically
 * burns an amount tokens of an ERC-20 compliant token.
 * @dev This contract implements Chainlink Automation.
 */

/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */

contract SybilBurner is AutomationCompatibleInterface {
    uint8 private constant _DECIMALS = 18;
    uint256 public _lastTimestamp;
    uint256 public _dailyBurnAmount;
    uint256 public _burningInterval;
    address public immutable _tokenOwner;
    ISybilToken public immutable _sybilToken;

    error SybilToken__UpkeepNotNeeded();
    error SybilBurner__NotOwner();

    modifier onlyOwner() {
        if (msg.sender != _tokenOwner) {
            revert SybilBurner__NotOwner();
        }
        _;
    }

    /**
     * @dev Sets the values for {_lastTimestamp}, {_dailyBurnAmount}, {_burningInterval},
     * {_tokenOwner} and {_sybilToken}.
     *
     * Only {_tokenOwner} and {_sybilToken} are immutable.
     */
    constructor(uint256 _burningRate, uint256 _interval, address _tokenAddress) {
        _lastTimestamp = block.timestamp;
        _dailyBurnAmount = _burningRate * 10 ** uint256(_DECIMALS);
        _burningInterval = _interval;
        _tokenOwner = msg.sender;
        _sybilToken = ISybilToken(_tokenAddress);
    }

    /**
     * @dev performUpkeep is the function the Chainlink nodes will call to kick off the
     * burning of tokens. This function can only be call if upkeepNeeded is true.
     */
    function performUpkeep(bytes calldata /*performData*/) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (!upkeepNeeded) revert SybilToken__UpkeepNotNeeded();

        _sybilToken.burnFrom(_tokenOwner, _dailyBurnAmount);
        _lastTimestamp = block.timestamp;
    }

    /**
     * @dev Sets the new amount tokens to be burned.
     * @param _newDailyBurnAmount Amount of tokens.
     */
    function setBurningAmount(uint256 _newDailyBurnAmount) public onlyOwner {
        _dailyBurnAmount = _newDailyBurnAmount * 10 ** uint256(_DECIMALS);
    }

    /**
     * @dev Sets the new burning interval.
     * @param _newBurningInterval The interval in seconds.
     */
    function setBurningInterval(uint256 _newBurningInterval) public onlyOwner {
        _burningInterval = _newBurningInterval;
    }

    /**
     * @dev checkUpkeep is the function that the Chainlink Keepers nodes will call to know if
     * performUpKeep should be call by them. The Keepers will simulate off-chain the logic
     * inside this function.
     *
     * The following conditions must be true in order for `upKeepNeeded` to return true:
     * 1. Our time lock time should have passed.
     * 2. The target supply of tokens has not been reached
     * 3. Our subscription is funded with LINK.
     *
     * @return upkeepNeeded a boolean to indicate if the Keepers should call performUpkeep to
     * kick-off the burning the tokens.
     */
    function checkUpkeep(
        bytes memory /*checkData*/
    ) public view override returns (bool upkeepNeeded, bytes memory /*performData */) {
        bool hasTimeElapsed = (block.timestamp - _lastTimestamp) > _burningInterval;
        bool isTargetSupply = _sybilToken.getTargetSupply() > _sybilToken.getBurntAmount();
        upkeepNeeded = hasTimeElapsed && isTargetSupply;
    }
}
