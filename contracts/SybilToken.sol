// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title SybilToken.
 * @author Eugenio Pacelli Flores Voitier.
 * @notice This is a sample contract to create an ERC20 token.
 * @dev This token follows the ERC-20 standard as defined in the EIP.
 */

/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */

contract SybilToken {
    string private _name;
    string private _symbol;
    uint8 private constant _DECIMALS = 18;
    uint256 private _totalSupply;
    uint256 private immutable _initialSupply;
    uint256 private immutable _targetSupply;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
    event Burn(address indexed _from, uint256 _value);

    /**
     * @dev Sets the values for {_name}, {_symbol}, {_totalSupply}, {_initialSupply}
     *  and {_targetSupply}.
     *
     * The value of {_DECIMALS} is 18.
     *
     * Allocates the entire supply to the creator of the token.
     */
    constructor(
        string memory tokenName,
        string memory tokenSymbol,
        uint256 initialSupply,
        uint256 targetSupply
    ) {
        _name = tokenName;
        _symbol = tokenSymbol;
        _totalSupply = initialSupply * 10 ** uint256(_DECIMALS);
        _initialSupply = initialSupply * 10 ** uint256(_DECIMALS);
        _targetSupply = targetSupply * 10 ** uint256(_DECIMALS);
        _balances[msg.sender] = _totalSupply;
    }

    /**
     * @dev Moves `_value` tokens from caller's account to `_to` recipient.
     * @param _to address of the recipient.
     * @param _value amount of tokens.
     * @return success a boolean to indicate if the transaction was successful.
     */
    function transfer(address _to, uint256 _value) public returns (bool success) {
        _transfer(msg.sender, _to, _value);

        return true;
    }

    /**
     * @dev Moves `_value` tokens to `_to` on behalf of `_from`. Then `_value` is
     * deducted from caller allowance.
     * @param _from Account from which the tokens will be moved.
     * @param _to Address of the recipient of tokens.
     * @param _value Amount of tokens to be moved.
     * @return success A boolean to indicate if the transaction was successful.
     */
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        require(
            _value <= _allowances[_from][msg.sender],
            "SYL: Value exceeds the remaining allowance"
        );

        _allowances[_from][msg.sender] -= _value;
        _transfer(_from, _to, _value);

        return true;
    }

    /**
     * @dev Sets `_value` as the allowance for a `_spender`. Allows `_spender` to
     * spend no more than `_value` tokens on your behalf.
     * @param _spender The address of the account authorized to spend.
     * @param _value Max amount of tokens allowed to spend.
     * @return success A boolean to indicate if the spender was approved.
     *
     * Emits a {Approval} event.
     */
    function approve(address _spender, uint256 _value) public returns (bool success) {
        require(msg.sender != address(0), "SYL: Cannot approve from address zero");
        require(_spender != address(0), "SYL: Cannot approve address zero as spender");
        _allowances[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    /**
     * @dev Increases the allowance granted to `spender` by the caller.
     * @return success A boolean to indicate if the burning of tokens succeeded.
     *
     * Emits an {Approval} event.
     */
    function increaseAllowance(
        address _spender,
        uint256 _addedValue
    ) public returns (bool success) {
        uint256 currentAllowance = _allowance(msg.sender, _spender);
        approve(_spender, currentAllowance + _addedValue);

        return true;
    }

    /**
     * @dev Decreases the allowance granted to `spender` by the caller.
     * @return success A boolean to indicate if the burning of tokens succeeded.
     *
     * Emits an {Approval} event.
     */
    function decreaseAllowance(
        address _spender,
        uint256 _substractedValue
    ) public returns (bool success) {
        uint256 currentAllowance = _allowance(msg.sender, _spender);
        require(
            currentAllowance >= _substractedValue,
            "SYL: Value exceeds the remaining allowance"
        );
        unchecked {
            approve(_spender, currentAllowance - _substractedValue);
        }

        return true;
    }

    /**
     * @dev Destroy `_value` tokens irreversibly.
     * @param _value Amount of token to destroy.
     * @return success A boolean to indicate if the burning of tokens succeeded.
     *
     * Emits a {Burn} event.
     */
    function burn(uint256 _value) public returns (bool success) {
        require(_balances[msg.sender] >= _value, "SYL: Value exceeds the account balance");
        require(_totalSupply > _targetSupply, "SYL: Cannot burn more tokens");

        _totalSupply -= _value;
        _balances[msg.sender] -= _value;

        emit Burn(msg.sender, _value);
        return true;
    }

    /**
     * @dev Destroy tokens from another account.
     * @param _from Address of the account from which tokens will be destroyed.
     * @param _value Amount of token to destroy.
     * @return success A boolean to indicate if the burning of tokens succeeded.
     *
     * Emits a {Burn} event.
     */
    function burnFrom(address _from, uint256 _value) public returns (bool success) {
        require(_from != address(0), "SYL: Cannot burn tokens from address zero");
        require(_balances[_from] >= _value, "SYL: Value exceeds the account balance");
        require(_totalSupply > _targetSupply, "SYL: Cannot burn more tokens");
        require(
            _value <= _allowances[_from][msg.sender],
            "SYL: Value exceeds the remaining allowance"
        );

        _balances[_from] -= _value;
        _allowances[_from][msg.sender] -= _value;
        _totalSupply -= _value;

        emit Burn(_from, _value);
        return true;
    }

    /**
     * @dev Returns the name of the token.
     */
    function name() public view returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the token.
     */
    function symbol() public view returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Returns the current supply of the token.
     */
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev Returns the total amount of burnt tokens.
     */
    function getBurntAmount() public view returns (uint256) {
        return _initialSupply - _totalSupply;
    }

    /**
     * @dev Returns the initial supply of the token.
     */
    function getInitialSupply() public view returns (uint256) {
        return _initialSupply;
    }

    /**
     * @dev Reads the balance of an account.
     */
    function balanceOf(address _account) public view returns (uint256 balance) {
        return _balances[_account];
    }

    /**
     * @dev Returns the reamining allowance of tokens of an account.
     */
    function _allowance(address _owner, address _spender) public view returns (uint256 remaining) {
        return _allowances[_owner][_spender];
    }

    /**
     * @dev Returns the number of decimals places of the token.
     */
    function decimals() public pure returns (uint8) {
        return _DECIMALS;
    }

    /**
     * @dev Returns the target supply of the tokens.
     */
    function getTargetSupply() public view returns (uint256) {
        return _targetSupply;
    }

    /**
     * @dev Internal transfer, can only be called by the contract.
     * @param _from Address of the sender, must have balance at least of _value.
     * @param _to Address of the recipient, cannot be the zero address.
     * @param _value Amount of tokens.
     *
     * Emits a {Transfer} event.
     */
    function _transfer(address _from, address _to, uint256 _value) internal {
        require(_to != address(0), "SYL: Cannot transfer tokens to address zero");
        require(_from != address(0), "SYL: Cannot transfer tokens from address zero");
        require(_balances[_from] >= _value, "SYL: Value exceeds the account balance");

        _balances[_from] -= _value;
        _balances[_to] += _value;

        emit Transfer(_from, _to, _value);
    }
}
