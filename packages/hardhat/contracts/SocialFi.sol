// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract SocialFi is ReentrancyGuard, Pausable {
    struct Profile {
        string username;
        string bio;
        string avatarUri;  // IPFS URI for profile picture
        address userAddress;
        uint256 followerCount;
        uint256 postCount;
        bool isCreated;
    }
    
    struct Post {
        uint256 id;
        address author;
        string content;
        string mediaUri;   // IPFS URI for media content
        uint256 timestamp;
        uint256 likeCount;
        uint256 commentCount;
    }
    
    struct Comment {
        uint256 id;
        uint256 postId;
        address author;
        string content;
        uint256 timestamp;
    }
    
    // State variables
    mapping(address => Profile) public profiles;
    mapping(uint256 => Post) public posts;
    mapping(uint256 => mapping(uint256 => Comment)) public comments;
    mapping(address => mapping(address => bool)) public isFollowing;
    mapping(uint256 => mapping(address => bool)) public hasLiked;
    
    uint256 private postCounter;
    uint256 private commentCounter;
    address public owner;
    
    // Events
    event ProfileCreated(address indexed user, string username, string avatarUri);
    event ProfileUpdated(address indexed user, string username, string bio, string avatarUri);
    event PostCreated(uint256 indexed postId, address indexed author, string content, string mediaUri);
    event CommentCreated(uint256 indexed postId, uint256 indexed commentId, address indexed author);
    event FollowToggled(address indexed follower, address indexed followed, bool isNowFollowing);
    event PostLiked(uint256 indexed postId, address indexed liker);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    function createProfile(
        string memory _username, 
        string memory _bio,
        string memory _avatarUri
    ) public whenNotPaused {
        require(!profiles[msg.sender].isCreated, "Profile already exists");
        require(bytes(_username).length > 0, "Username cannot be empty");
        
        Profile memory newProfile = Profile({
            username: _username,
            bio: _bio,
            avatarUri: _avatarUri,
            userAddress: msg.sender,
            followerCount: 0,
            postCount: 0,
            isCreated: true
        });
        
        profiles[msg.sender] = newProfile;
        emit ProfileCreated(msg.sender, _username, _avatarUri);
    }
    
    function updateProfile(
        string memory _username,
        string memory _bio,
        string memory _avatarUri
    ) public whenNotPaused {
        require(profiles[msg.sender].isCreated, "Profile does not exist");
        
        Profile storage profile = profiles[msg.sender];
        profile.username = _username;
        profile.bio = _bio;
        profile.avatarUri = _avatarUri;
        
        emit ProfileUpdated(msg.sender, _username, _bio, _avatarUri);
    }
    
    function createPost(
        string memory _content,
        string memory _mediaUri
    ) public whenNotPaused nonReentrant {
        require(profiles[msg.sender].isCreated, "Must create profile first");
        require(bytes(_content).length > 0, "Content cannot be empty");
        
        postCounter++;
        Post memory newPost = Post({
            id: postCounter,
            author: msg.sender,
            content: _content,
            mediaUri: _mediaUri,
            timestamp: block.timestamp,
            likeCount: 0,
            commentCount: 0
        });
        
        posts[postCounter] = newPost;
        profiles[msg.sender].postCount++;
        
        emit PostCreated(postCounter, msg.sender, _content, _mediaUri);
    }
    
    function createComment(
        uint256 _postId,
        string memory _content
    ) public whenNotPaused nonReentrant {
        require(posts[_postId].id != 0, "Post does not exist");
        require(profiles[msg.sender].isCreated, "Must create profile first");
        
        commentCounter++;
        Comment memory newComment = Comment({
            id: commentCounter,
            postId: _postId,
            author: msg.sender,
            content: _content,
            timestamp: block.timestamp
        });
        
        comments[_postId][commentCounter] = newComment;
        posts[_postId].commentCount++;
        
        emit CommentCreated(_postId, commentCounter, msg.sender);
    }
    
    function toggleFollow(address _userToFollow) public whenNotPaused {
        require(msg.sender != _userToFollow, "Cannot follow yourself");
        require(profiles[_userToFollow].isCreated, "Profile to follow does not exist");
        require(profiles[msg.sender].isCreated, "Must create profile first");
        
        bool newFollowState = !isFollowing[msg.sender][_userToFollow];
        isFollowing[msg.sender][_userToFollow] = newFollowState;
        
        if (newFollowState) {
            profiles[_userToFollow].followerCount++;
        } else {
            profiles[_userToFollow].followerCount--;
        }
        
        emit FollowToggled(msg.sender, _userToFollow, newFollowState);
    }
    
    function likePost(uint256 _postId) public whenNotPaused nonReentrant {
        require(posts[_postId].id != 0, "Post does not exist");
        require(!hasLiked[_postId][msg.sender], "Already liked this post");
        require(profiles[msg.sender].isCreated, "Must create profile first");
        
        hasLiked[_postId][msg.sender] = true;
        posts[_postId].likeCount++;
        
        emit PostLiked(_postId, msg.sender);
    }
    
    // View functions
    function getProfile(address _user) public view returns (Profile memory) {
        return profiles[_user];
    }
    
    function getPost(uint256 _postId) public view returns (Post memory) {
        require(posts[_postId].id != 0, "Post does not exist");
        return posts[_postId];
    }
    
    function getComment(uint256 _postId, uint256 _commentId) public view returns (Comment memory) {
        return comments[_postId][_commentId];
    }
    
    // Admin functions
    function pause() public onlyOwner {
        _pause();
    }
    
    function unpause() public onlyOwner {
        _unpause();
    }
}