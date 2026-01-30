import { expect } from "chai";
import hre from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { SocialRegistry } from "../typechain-types";

describe("SocialRegistry", function () {
  let socialRegistry: SocialRegistry;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await hre.ethers.getSigners();
    const SocialRegistryFactory = await hre.ethers.getContractFactory("SocialRegistry");
    socialRegistry = await SocialRegistryFactory.deploy(owner.address);
    await socialRegistry.waitForDeployment();
  });

  describe("Profile Management", function () {
    it("Should create a profile successfully", async function () {
      await socialRegistry.connect(user1).createProfile("alice", "Hello World", "avatar1");
      
      const profile = await socialRegistry.getProfile(user1.address);
      expect(profile.username).to.equal("alice");
      expect(profile.bio).to.equal("Hello World");
      expect(profile.avatar).to.equal("avatar1");
      expect(profile.isActive).to.be.true;
      expect(await socialRegistry.totalUsers()).to.equal(1);
    });

    it("Should prevent duplicate usernames", async function () {
      await socialRegistry.connect(user1).createProfile("alice", "Bio1", "avatar1");
      await expect(
        socialRegistry.connect(user2).createProfile("alice", "Bio2", "avatar2")
      ).to.be.reverted;
    });

    it("Should prevent creating multiple profiles for same address", async function () {
      await socialRegistry.connect(user1).createProfile("alice", "Bio1", "avatar1");
      await expect(
        socialRegistry.connect(user1).createProfile("bob", "Bio2", "avatar2")
      ).to.be.reverted;
    });

    it("Should update profile successfully", async function () {
      await socialRegistry.connect(user1).createProfile("alice", "Old Bio", "old_avatar");
      await socialRegistry.connect(user1).updateProfile("New Bio", "new_avatar");
      
      const profile = await socialRegistry.getProfile(user1.address);
      expect(profile.bio).to.equal("New Bio");
      expect(profile.avatar).to.equal("new_avatar");
    });

    it("Should prevent non-users from updating profile", async function () {
      await expect(
        socialRegistry.connect(user1).updateProfile("Bio", "avatar")
      ).to.be.reverted;
    });
  });

  describe("Following System", function () {
    beforeEach(async function () {
      await socialRegistry.connect(user1).createProfile("alice", "Bio1", "avatar1");
      await socialRegistry.connect(user2).createProfile("bob", "Bio2", "avatar2");
    });

    it("Should follow user successfully", async function () {
      await socialRegistry.connect(user1).followUser(user2.address);
      
      expect(await socialRegistry.isUserFollowing(user1.address, user2.address)).to.be.true;
      
      const user1Profile = await socialRegistry.getProfile(user1.address);
      const user2Profile = await socialRegistry.getProfile(user2.address);
      
      expect(user1Profile.followingCount).to.equal(1);
      expect(user2Profile.followersCount).to.equal(1);
    });

    it("Should unfollow user successfully", async function () {
      await socialRegistry.connect(user1).followUser(user2.address);
      await socialRegistry.connect(user1).unfollowUser(user2.address);
      
      expect(await socialRegistry.isUserFollowing(user1.address, user2.address)).to.be.false;
      
      const user1Profile = await socialRegistry.getProfile(user1.address);
      const user2Profile = await socialRegistry.getProfile(user2.address);
      
      expect(user1Profile.followingCount).to.equal(0);
      expect(user2Profile.followersCount).to.equal(0);
    });

    it("Should prevent following self", async function () {
      await expect(
        socialRegistry.connect(user1).followUser(user1.address)
      ).to.be.reverted;
    });

    it("Should prevent double following", async function () {
      await socialRegistry.connect(user1).followUser(user2.address);
      await expect(
        socialRegistry.connect(user1).followUser(user2.address)
      ).to.be.reverted;
    });
  });

  describe("Posts System", function () {
    beforeEach(async function () {
      await socialRegistry.connect(user1).createProfile("alice", "Bio1", "avatar1");
      await socialRegistry.connect(user2).createProfile("bob", "Bio2", "avatar2");
    });

    it("Should create post successfully", async function () {
      const tx = await socialRegistry.connect(user1).createPost("Hello World!", "media_hash");
      const receipt = await tx.wait();
      
      expect(await socialRegistry.totalPosts()).to.equal(1);
      
      const post = await socialRegistry.getPost(1);
      expect(post.author).to.equal(user1.address);
      expect(post.content).to.equal("Hello World!");
      expect(post.mediaHash).to.equal("media_hash");
      expect(post.isActive).to.be.true;
      expect(post.likesCount).to.equal(0);
    });

    it("Should like post successfully", async function () {
      await socialRegistry.connect(user1).createPost("Hello World!", "");
      await socialRegistry.connect(user2).likePost(1);
      
      const post = await socialRegistry.getPost(1);
      expect(post.likesCount).to.equal(1);
      expect(await socialRegistry.hasUserLikedPost(1, user2.address)).to.be.true;
    });

    it("Should unlike post successfully", async function () {
      await socialRegistry.connect(user1).createPost("Hello World!", "");
      await socialRegistry.connect(user2).likePost(1);
      await socialRegistry.connect(user2).unlikePost(1);
      
      const post = await socialRegistry.getPost(1);
      expect(post.likesCount).to.equal(0);
      expect(await socialRegistry.hasUserLikedPost(1, user2.address)).to.be.false;
    });

    it("Should prevent empty posts", async function () {
      await expect(
        socialRegistry.connect(user1).createPost("", "")
      ).to.be.reverted;
    });

    it("Should prevent double liking", async function () {
      await socialRegistry.connect(user1).createPost("Hello World!", "");
      await socialRegistry.connect(user2).likePost(1);
      await expect(
        socialRegistry.connect(user2).likePost(1)
      ).to.be.reverted;
    });
  });

  describe("Access Control", function () {
    it("Should prevent non-users from following", async function () {
      await socialRegistry.connect(user1).createProfile("alice", "Bio1", "avatar1");
      await expect(
        socialRegistry.connect(user2).followUser(user1.address)
      ).to.be.reverted;
    });

    it("Should prevent non-users from posting", async function () {
      await expect(
        socialRegistry.connect(user1).createPost("Hello", "")
      ).to.be.reverted;
    });

    it("Should prevent non-users from liking", async function () {
      await socialRegistry.connect(user1).createProfile("alice", "Bio1", "avatar1");
      await socialRegistry.connect(user1).createPost("Hello World!", "");
      
      await expect(
        socialRegistry.connect(user2).likePost(1)
      ).to.be.reverted;
    });
  });

  describe("Events", function () {
    it("Should emit ProfileCreated event", async function () {
      await expect(socialRegistry.connect(user1).createProfile("alice", "Bio", "avatar"))
        .to.emit(socialRegistry, "ProfileCreated")
        .withArgs(user1.address, "alice");
    });

    it("Should emit UserFollowed event", async function () {
      await socialRegistry.connect(user1).createProfile("alice", "Bio1", "avatar1");
      await socialRegistry.connect(user2).createProfile("bob", "Bio2", "avatar2");
      
      await expect(socialRegistry.connect(user1).followUser(user2.address))
        .to.emit(socialRegistry, "UserFollowed")
        .withArgs(user1.address, user2.address);
    });

    it("Should emit PostCreated event", async function () {
      await socialRegistry.connect(user1).createProfile("alice", "Bio", "avatar");
      
      await expect(socialRegistry.connect(user1).createPost("Hello!", ""))
        .to.emit(socialRegistry, "PostCreated")
        .withArgs(1, user1.address, "Hello!");
    });
  });
});
