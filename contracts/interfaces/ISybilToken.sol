// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * Interfaces:
 * 1. All must function must be mark as external.
 * 2. Cannot declare state variables.
 * 3. Cannot have a contructor.
 * 4. The function cannot have any implementation.
 * 5. Can inherit from another interfaces.
 */

interface ISybilToken {
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
    event Burn(address indexed _from, uint256 _value);

    function transfer(address _to, uint256 _value) external returns (bool success);

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) external returns (bool success);

    function approve(address _spender, uint256 _value) external returns (bool success);

    function burn(uint256 _value) external returns (bool success);

    function burnFrom(address _from, uint256 _value) external returns (bool success);

    function totalSupply() external view returns (uint256);

    function balanceOf(address _account) external view returns (uint256 balance);

    function allowance(address _owner, address _spender) external view returns (uint256 remaining);
}
