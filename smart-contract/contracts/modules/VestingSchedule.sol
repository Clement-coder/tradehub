// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VestingSchedule is Ownable {
    struct Vesting {
        uint256 totalAmount;
        uint256 released;
        uint256 startTime;
        uint256 duration;
        uint256 cliffDuration;
    }

    IERC20 public token;
    mapping(address => Vesting) public vestingSchedules;

    event VestingCreated(address indexed beneficiary, uint256 amount, uint256 duration);
    event TokensReleased(address indexed beneficiary, uint256 amount);

    constructor(address _token, address initialOwner) Ownable(initialOwner) {
        token = IERC20(_token);
    }

    function createVesting(
        address beneficiary,
        uint256 amount,
        uint256 duration,
        uint256 cliffDuration
    ) external onlyOwner {
        require(beneficiary != address(0), "Invalid beneficiary");
        require(amount > 0, "Invalid amount");
        require(duration > 0, "Invalid duration");
        require(vestingSchedules[beneficiary].totalAmount == 0, "Vesting exists");

        vestingSchedules[beneficiary] = Vesting({
            totalAmount: amount,
            released: 0,
            startTime: block.timestamp,
            duration: duration,
            cliffDuration: cliffDuration
        });

        token.transferFrom(msg.sender, address(this), amount);
        emit VestingCreated(beneficiary, amount, duration);
    }

    function release() external {
        Vesting storage vesting = vestingSchedules[msg.sender];
        require(vesting.totalAmount > 0, "No vesting");

        uint256 releasable = _releasableAmount(msg.sender);
        require(releasable > 0, "No tokens to release");

        vesting.released += releasable;
        token.transfer(msg.sender, releasable);

        emit TokensReleased(msg.sender, releasable);
    }

    function _releasableAmount(address beneficiary) internal view returns (uint256) {
        Vesting storage vesting = vestingSchedules[beneficiary];
        
        if (block.timestamp < vesting.startTime + vesting.cliffDuration) {
            return 0;
        }

        uint256 timeElapsed = block.timestamp - vesting.startTime;
        if (timeElapsed >= vesting.duration) {
            return vesting.totalAmount - vesting.released;
        }

        uint256 vestedAmount = (vesting.totalAmount * timeElapsed) / vesting.duration;
        return vestedAmount - vesting.released;
    }

    function getReleasableAmount(address beneficiary) external view returns (uint256) {
        return _releasableAmount(beneficiary);
    }
}
