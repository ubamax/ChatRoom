import React from "react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../../Spinner";
import "./ChatRooms.css";

const ChatRooms = (props) => {
  const navigate = useNavigate()

  const getIcon = (_address) => {
    return <Jazzicon diameter={50} seed={jsNumberForAddress(_address)} />;
  };

  const joinThenOpen = async (id) => {
    try {
      // first join room
      await props.chatroomContract.methods.joinRoom(id).send({ from: props.walletAddress });
      navigate(`room/${id}`);      
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <>
      {props.rooms ? (
        <div className="chatrooms">
          <div className="rooms-head">All Public rooms</div>
          <div className="rooms">
            {props.rooms.map((room) => (
              <div className="room-prev">
                <img src={room.roomImage} />
                <div className="room-name">{room.roomName}</div>
                <div className="room-creator">
                  Created By:
                  <div className="icon">{getIcon(room.roomCreator)}</div>
                  <div className="addr">
                    {props.truncateAddress(room.roomCreator)}
                  </div>
                </div>
                <div>Participants: {room.roomMembers.length}</div>
                <div className="room-prev-btns">
                  {room.roomMembers.includes(props.walletAddress) ? (
                    <button>
                      <Link to={`room/${room.roomId}`}>Open</Link>
                    </button>
                  ) : (
                    <button onClick={async () => joinThenOpen(room.roomId)}>
                      Join
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default ChatRooms;
