// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./lib/Errors.sol";
import "./lib/Events.sol";

/**
 * @title SocialRegistry
 * @dev A decentralized social registry for user profiles and connections
 */
contract SocialRegistry is Ownable, ReentrancyGuard {
    struct Profile {
        string username;
        string bio;
        string avatar;
        bool isActive;
        uint256 createdAt;
        uint256 followersCount;
        uint256 followingCount;
    }

    struct Post {
        address author;
        string content;
        string mediaHash;
        uint256 timestamp;
        uint256 likesCount;
        bool isActive;
    }

    mapping(address => Profile) public profiles;
    mapping(string => address) public usernameToAddress;
    mapping(address => mapping(address => bool)) public isFollowing;
    mapping(uint256 => Post) public posts;
    mapping(uint256 => mapping(address => bool)) public hasLiked;
    
    uint256 private _nextPostId = 1;
    uint256 public totalUsers;
    uint256 public totalPosts;

    event ProfileCreated(address indexed user, string username);
    event ProfileUpdated(address indexed user, string username);
    event UserFollowed(address indexed follower, address indexed following);
    event UserUnfollowed(address indexed follower, address indexed following);
    event PostCreated(uint256 indexed postId, address indexed author, string content);
    event PostLiked(uint256 indexed postId, address indexed liker);
    event PostUnliked(uint256 indexed postId, address indexed unliker);

    constructor(address initialOwner) Ownable(initialOwner) {}

    modifier onlyActiveProfile() {
        if (!profiles[msg.sender].isActive) revert Errors.Unauthorized();
        _;
    }

    modifier validUsername(string memory username) {
        if (bytes(username).length == 0 || bytes(username).length > 32) revert Errors.InvalidInput();
        _;
    }

    function createProfile(
        string memory username,
        string memory bio,
        string memory avatar
    ) external validUsername(username) {
        if (profiles[msg.sender].isActive) revert Errors.InvalidInput();
        if (usernameToAddress[username] != address(0)) revert Errors.InvalidInput();

        profiles[msg.sender] = Profile({
            username: username,
            bio: bio,
            avatar: avatar,
            isActive: true,
            createdAt: block.timestamp,
            followersCount: 0,
            followingCount: 0
        });

        usernameToAddress[username] = msg.sender;
        totalUsers++;

        emit ProfileCreated(msg.sender, username);
    }

    function updateProfile(
        string memory bio,
        string memory avatar
    ) external onlyActiveProfile {
        profiles[msg.sender].bio = bio;
        profiles[msg.sender].avatar = avatar;

        emit ProfileUpdated(msg.sender, profiles[msg.sender].username);
    }

    function followUser(address userToFollow) external onlyActiveProfile nonReentrant {
        if (userToFollow == msg.sender) revert Errors.InvalidInput();
        if (!profiles[userToFollow].isActive) revert Errors.InvalidInput();
        if (isFollowing[msg.sender][userToFollow]) revert Errors.InvalidInput();

        isFollowing[msg.sender][userToFollow] = true;
        profiles[msg.sender].followingCount++;
        profiles[userToFollow].followersCount++;

        emit UserFollowed(msg.sender, userToFollow);
    }

    function unfollowUser(address userToUnfollow) external onlyActiveProfile nonReentrant {
        if (!isFollowing[msg.sender][userToUnfollow]) revert Errors.InvalidInput();

        isFollowing[msg.sender][userToUnfollow] = false;
        profiles[msg.sender].followingCount--;
        profiles[userToUnfollow].followersCount--;

        emit UserUnfollowed(msg.sender, userToUnfollow);
    }

    function createPost(
        string memory content,
        string memory mediaHash
    ) external onlyActiveProfile returns (uint256) {
        if (bytes(content).length == 0) revert Errors.InvalidInput();

        uint256 postId = _nextPostId++;
        posts[postId] = Post({
            author: msg.sender,
            content: content,
            mediaHash: mediaHash,
            timestamp: block.timestamp,
            likesCount: 0,
            isActive: true
        });

        totalPosts++;
        emit PostCreated(postId, msg.sender, content);
        return postId;
    }

    function likePost(uint256 postId) external onlyActiveProfile {
        if (!posts[postId].isActive) revert Errors.InvalidInput();
        if (hasLiked[postId][msg.sender]) revert Errors.InvalidInput();

        hasLiked[postId][msg.sender] = true;
        posts[postId].likesCount++;

        emit PostLiked(postId, msg.sender);
    }

    function unlikePost(uint256 postId) external onlyActiveProfile {
        if (!hasLiked[postId][msg.sender]) revert Errors.InvalidInput();

        hasLiked[postId][msg.sender] = false;
        posts[postId].likesCount--;

        emit PostUnliked(postId, msg.sender);
    }

    function getProfile(address user) external view returns (Profile memory) {
        return profiles[user];
    }

    function getPost(uint256 postId) external view returns (Post memory) {
        return posts[postId];
    }

    function isUserFollowing(address follower, address following) external view returns (bool) {
        return isFollowing[follower][following];
    }

    function hasUserLikedPost(uint256 postId, address user) external view returns (bool) {
        return hasLiked[postId][user];
    }
}
// Commit 2
// Commit 3
// Commit 4
// Commit 5
// Commit 6
// Commit 7
// Commit 8
// Commit 9
// Commit 10
// Commit 11
// Commit 12
// Commit 13
// Commit 14
// Commit 15
// Commit 16
