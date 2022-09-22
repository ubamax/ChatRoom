import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Web3 from "web3";
import { newKitFromWeb3 } from "@celo/contractkit";
import chatroomABI from "../..//contracts/chatroom.abi.json";
import "./Room.css";
import Loader from "../../Spinner";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";

const chatroomContractAddress = "0xce42dF9622ED105728B977364F61f350d8b186c2";

const getIcon = (_address) => {
  return (
    <a
      href={`https://alfajores-blockscout.celo-testnet.org/address/${_address}/transactions`}
    >
      <Jazzicon diameter={30} seed={jsNumberForAddress(_address)} />
    </a>
  );
};

const Room = (props) => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState(null);
  const [details, setDetails] = useState(null);

  const [kit, setKit] = useState();
  const [walletAddress, setWalletAddress] = useState();
  const [chatroomContract, setChatroomContract] = useState();
  const [nullState, setNullState] = useState();

  // function that connect wallet to dapp
  const connectWallet = async () => {
    if (window.celo) {
      // alert("⚠️ Please approve this DApp to use it.");
      try {
        await window.celo.enable();
        const web3 = new Web3(window.celo);
        let kit = newKitFromWeb3(web3);

        const accounts = await kit.web3.eth.getAccounts();
        const defaultAccount = accounts[0];
        kit.defaultAccount = defaultAccount;

        setKit(kit);
        setWalletAddress(defaultAccount);
      } catch (error) {
        console.log(error);
      }
    } else {
      alert(
        "You need to install the celo wallet extension in order to use this app"
      );
    }
  };

  // get balance of connected wallet
  const getBalance = async () => {
    try {
      const balance = await kit.getTotalBalance(walletAddress);
      const myContract = new kit.web3.eth.Contract(
        chatroomABI,
        chatroomContractAddress
      );

      setChatroomContract(myContract);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    connectWallet();
  }, []);

  useEffect(() => {
    if (kit && walletAddress) {
      getBalance();
    }
  }, [kit, walletAddress]);

  const checkMsg = (sender) => {
    if (sender == props.walletAddress) return "my-msg";
  };

  const loadRoom = async () => {
    try {
      setLoading(true);
      const rm = await chatroomContract.methods.roomMessages(id).call();
      const rml = await Promise.all(
        rm.map(async (m) => {
          return {
            sender: m[0],
            message: m[1],
            time: m[2],
          };
        })
      );
      setMessages(rml);

      const _details = new Promise(async (resolve) => {
        const d = await chatroomContract.methods.roomDetails(id).call();
        resolve({
          roomId: d[0],
          roomCreator: d[1],
          roomName: d[2],
          roomPhoto: d[3],
          roomMembers: d[4],
        });
      });
      const dd = await Promise.resolve(_details);
      setDetails(dd);
      setLoading(false);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    try {
      const tx = await chatroomContract.methods
        .newMessage(newMessage, id)
        .send({ from: walletAddress });
      setNullState(tx);
      setNewMessage(null);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (chatroomContract) {
      loadRoom();
    }
  }, [chatroomContract, nullState]);

  return (
    <>
      {!loading && details ? (
        <div className="room">
          <div className="chatroom-head">
            <img src={details.roomPhoto} />
            <div className="head-info">
              <div className="head-name">{details.roomName}</div>
              <div className="head-m-count">
                {details.roomMembers.length} group members
              </div>
            </div>
          </div>
          <div className="chatroom-main">
            {messages.map((m) => (
              <div className={`chatmessage ${checkMsg(m.sender)}`}>
                <div className="chatmessage-body">
                  <div>
                    <div className="chatmessage-msg">{m.message}</div>
                    <div className="chatmessage-time">
                      {new Date(m.time * 1000).toLocaleString()}
                    </div>
                  </div>
                  {m.sender != walletAddress && getIcon(m.sender)}
                </div>
              </div>
            ))}
          </div>
          <div className="send">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button onClick={async () => sendMessage()}>Send</button>
          </div>
        </div>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default Room;
