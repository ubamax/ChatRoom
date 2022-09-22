// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

contract ChatRoom {
    uint256 internal roomIds;
    uint256 internal messageIds;

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

    mapping(uint256 => Room) internal rooms;
    mapping(uint256 => Message[]) internal messages;

    // create new room
    function newRoom(string memory _roomName, string memory _roomPhoto) public {
        address[] memory roomMembers;
        rooms[roomIds] = Room(
            roomIds,
            msg.sender,
            _roomName,
            _roomPhoto,
            roomMembers
        );
        joinRoom(roomIds);
        roomIds++;
    }

    // create a new message
    function newMessage(string memory _message, uint256 _roomId) public {
        Message memory _newMessage = Message(
            msg.sender,
            _message,
            block.timestamp
        );
        messages[_roomId].push(_newMessage);
    }

    // fetch all chat rooms and return to frontend
    function chatRooms() public view returns (Room[] memory) {
        Room[] memory _rooms = new Room[](roomIds);
        for (uint256 i = 0; i < roomIds; i++) {
            _rooms[i] = rooms[i];
        }
        return _rooms;
    }

    // join a chat room
    function joinRoom(uint256 _roomId) public {
        rooms[_roomId].roomMembers.push(msg.sender);
    }

    // fetch room details
    function roomDetails(uint256 _roomId)
        public
        view
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

    // fetch room messages
    function roomMessages(uint256 _roomId)
        public
        view
        returns (Message[] memory)
    {
        return messages[_roomId];
    }
}
