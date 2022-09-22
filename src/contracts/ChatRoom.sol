// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

contract ChatRoom {
    uint256 private roomIds;
    uint256 private messageIds;

    struct Message {
        address sender;
        string message;
        uint256 time;
    }

    struct Room {
        uint256 roomId;
        address roomCreator;
        string roomName;
        string roomPhoto;
        address[] roomMembers;
    }

    mapping(uint256 => Room) private rooms;
    mapping(uint256 => Message[]) private messages;
    mapping(uint => mapping(address => bool)) private joined;
    mapping(uint => bool) private _exists;


    modifier exists(uint _roomId){
        require(_exists[_roomId], "Query of nonexistent room");
        _;
    }

    /// @dev create new room
    /// @notice you will automatically be added to the chat room
    /// @notice input data must not contain any empty values
    function newRoom(string calldata _roomName, string calldata _roomPhoto) public {
        require(bytes(_roomName).length > 0, "Empty room name");
        require(bytes(_roomPhoto).length > 0, "Empty room photo");
        address[] memory roomMembers;
        uint roomId = roomIds;
        roomIds++;
        rooms[roomId] = Room(
            roomId,
            msg.sender,
            _roomName,
            _roomPhoto,
            roomMembers
        );
        _exists[roomId] = true;
        joinRoom(roomId);
    }

    /// @dev create a new message
    /// @notice only chat room members can send new messages
    function newMessage(string calldata _message, uint256 _roomId) public exists(_roomId) {
        require(bytes(_message).length > 0, "Empty message");
        require(joined[_roomId][msg.sender], "You haven't joined this room yet");
        Message memory _newMessage = Message(
            msg.sender,
            _message,
            block.timestamp
        );
        messages[_roomId].push(_newMessage);
    }

    /// @dev fetch all chat rooms and return to frontend
    function chatRooms() public view returns (Room[] memory) {
        Room[] memory _rooms = new Room[](roomIds);
        for (uint256 i = 0; i < roomIds; i++) {
            _rooms[i] = rooms[i];
        }
        return _rooms;
    }

    /// @dev join a chat room
    /// @notice you can only join a chat room once
    function joinRoom(uint256 _roomId) public exists(_roomId) {
        require(!joined[_roomId][msg.sender],"You have already joined this room");
        joined[_roomId][msg.sender] = true;
        rooms[_roomId].roomMembers.push(msg.sender);
    }

    /// @dev fetch room details
    function roomDetails(uint256 _roomId)
        public
        view
        exists(_roomId)
        returns (
            uint256 roomId,
            address roomCreator,
            string memory roomName,
            string memory roomPhoto,
            address[] memory roomMembers
        )
    {
        Room memory room = rooms[_roomId];
        roomId = room.roomId;
        roomCreator = room.roomCreator;
        roomName = room.roomName;
        roomPhoto = room.roomPhoto;
        roomMembers = room.roomMembers;
    }

    /// @dev fetch room messages
    function roomMessages(uint256 _roomId)
        public
        view
        exists(_roomId)
        returns (Message[] memory)
    {
        return messages[_roomId];
    }
}
