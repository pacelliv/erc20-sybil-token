// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface ISybilToken {
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    function transfer(address _to, uint256 _value) external returns (bool success);

    function balanceOf(address _account) external view returns (uint256 balance);
}

/**
 * @title SybilFaucet.
 * @author Eugenio Pacelli Flores Voitier.
 * @notice This is a sample contract to create a faucet for an ERC-20 token.
 */

/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */

contract SybilFaucet {
    uint256 public s_tokenAmount;
    uint256 public s_lockTime;
    ISybilToken public immutable i_sybilToken;
    address payable public s_owner;
    bool public s_paused;
    mapping(address => uint256) private s_lastRequestTime;

    event Paused();
    event Unpaused();
    event Withdraw(address indexed to, uint256 indexed amount);
    event Deposit(address indexed from, uint256 indexed amount);
    event TokensRequested(address indexed petitioner, uint256 indexed amount);

    error SybilFaucet__NotOwner();
    error SybilFaucet__RequestsPaused();

    modifier whenNotPaused() {
        if (s_paused == true) {
            revert SybilFaucet__RequestsPaused();
        }
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != s_owner) {
            revert SybilFaucet__NotOwner();
        }
        _;
    }

    /**
     * @dev Sets the values for {s_tokenAmount}, {s_lockTime}, {i_sybilToken} and
     * {s_owner}.
     *
     * Only {i_sybilToken} is immutable.
     */
    constructor(address _tokenContract, uint256 _initialAmount, uint256 _initialLockTime) payable {
        require(_tokenContract != address(0), "SybilFaucet: Cannot use address zero");
        s_tokenAmount = _initialAmount;
        s_lockTime = _initialLockTime;
        i_sybilToken = ISybilToken(_tokenContract);
        s_owner = payable(msg.sender);
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    fallback() external payable {}

    /**
     * @dev Pauses the withdrawals of tokens.
     *
     * Emits a {Paused} event.
     */
    function pause() external onlyOwner {
        s_paused = true;

        emit Paused();
    }

    /**
     * @dev Resumes the withdrawals of tokens.
     *
     * Emits a {Unpause} event.
     */
    function unpause() external onlyOwner {
        s_paused = false;

        emit Unpaused();
    }

    /**
     * @dev Transfers the entire balance of the faucet to the owner of the token.
     *
     * Emits a {Withdraw} event.
     */
    function withdraw() external onlyOwner {
        i_sybilToken.transfer(msg.sender, i_sybilToken.balanceOf(address(this)));

        emit Withdraw(msg.sender, i_sybilToken.balanceOf(address(this)));
    }

    /**
     * @dev Returns the balance of tokens in the faucet.
     */
    function getBalance() external view returns (uint256) {
        return i_sybilToken.balanceOf(address(this));
    }

    /**
     * @dev Reads the elapsed time of a request of an account.
     */
    function getLastTime(address _account) external view returns (uint256) {
        return s_lastRequestTime[_account];
    }

    /**
     * @dev Sets the new lock time users must wait between requests.
     * @param _newLockTime Time in seconds users must wait.
     */
    function setLockTime(uint256 _newLockTime) public onlyOwner {
        s_lockTime = _newLockTime;
    }

    /**
     * @dev Sets a new amount of tokens the faucet will distribute.
     * @param _newTokenAmount Amount of tokens.
     */
    function setTokenAmount(uint256 _newTokenAmount) public onlyOwner {
        s_tokenAmount = _newTokenAmount;
    }

    /**
     * @dev Transfer the ownership of the faucet.
     * @param _newOwner Address of the account to be set as the new owner.
     */
    function transferOwnership(address _newOwner) public onlyOwner {
        s_owner = payable(_newOwner);
    }

    /**
     * @dev This function will call the {transfer} method of SybilToken to send
     * `s_tokenAmount` amount to `msg.sender` the petitioner from the faucet.
     *
     * Emits a {TokensRequested} event.
     */
    function requestTokens() public whenNotPaused {
        require(
            msg.sender != address(0),
            "SybilFaucet: Request cannot be originated from address zero"
        );
        require(
            i_sybilToken.balanceOf(address(this)) >= s_tokenAmount,
            "SybilFaucet: Insufficient balance to fulfill tokens request"
        );
        require(
            isAllowedToWithdraw(msg.sender) == true,
            "SybilFaucet: Not sufficient time elapsed since last request"
        );

        s_lastRequestTime[msg.sender] = block.timestamp + s_lockTime;
        i_sybilToken.transfer(msg.sender, s_tokenAmount);

        emit TokensRequested(msg.sender, s_tokenAmount);
    }

    /**
     * @dev Verifies if enough time has elapsed between requests for an account.
     * @param _petitioner Address of the account to check if it's allow to withdraw.
     *
     * Return true if enough time has passed or false if not enough time has passed.
     */
    function isAllowedToWithdraw(address _petitioner) public view returns (bool) {
        if (s_lastRequestTime[_petitioner] == 0) {
            return true;
        } else if (block.timestamp >= s_lastRequestTime[_petitioner]) {
            return true;
        } else {
            return false;
        }
    }
}
