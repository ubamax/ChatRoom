import { useState, useEffect } from "react";
import Web3 from "web3";
import { newKitFromWeb3 } from "@celo/contractkit";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import ChatRooms from "./components/ChatRooms/ChatRooms";
import Room from "./components/Room/Room";
import chatroomABI from "./contracts/chatroom.abi.json";
import "./App.css";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

const ERC20_DECIMALS = 18;
const chatroomContractAddress = "0xce42dF9622ED105728B977364F61f350d8b186c2";

const truncateAddress = (address) => {
  if (!address) return;
  return (
    address.slice(0, 5) +
    "..." +
    address.slice(address.length - 4, address.length)
  );
};

function App() {
  const [kit, setKit] = useState();
  const [accountBalance, setAccountBalance] = useState(0);
  const [rooms, setRooms] = useState();
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
      const cUsdBalance = balance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2);
      const myContract = new kit.web3.eth.Contract(
        chatroomABI,
        chatroomContractAddress
      );

      setAccountBalance(cUsdBalance);
      setChatroomContract(myContract);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchRooms = async () => {
    try {
      const r = await chatroomContract.methods.chatRooms().call();
      const rs = await Promise.all(
        r.map(async (_room) => {
          return {
            roomId: _room[0],
            roomCreator: _room[1],
            roomName: _room[2],
            roomImage: _room[3],
            roomMembers: _room[4],
          };
        })
      );
      setRooms(rs);
    } catch (e) {
      console.log(e);
    }
  };

  const addNewRoom = async (name, photo) => {
    try {
      const tx = await chatroomContract.methods
        .newRoom(name, photo)
        .send({ from: walletAddress });
      setNullState(tx);
    } catch (e) {
      console.log(e);
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

  useEffect(() => {
    if (chatroomContract) {
      fetchRooms();
    }
  }, [chatroomContract, nullState]);

  const NewRoom = (props) => {
    const [show, setShow] = useState(false);
    const [name, setName] = useState();
    const [photo, setPhoto] = useState();

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
      <>
        <Button
          variant="primary"
          onClick={handleShow}
          style={{ height: "60px", width: "100px", margin: "2rem" }}
        >
          New Room
        </Button>

        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Add new chat room</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <label>Room name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
            <label>Room Photo</label>
            <input value={photo} onChange={(e) => setPhoto(e.target.value)} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={async () => props.addNewRoom(name, photo)}
            >
              Add
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  };

  return (
    <div className="app">
      <div className="heading">
        <div className="head-text">Web3Chat</div>
        <NewRoom addNewRoom={addNewRoom} />
        <div className="bal">{accountBalance} cUSD</div>
      </div>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <ChatRooms
                truncateAddress={truncateAddress}
                walletAddress={walletAddress}
                rooms={rooms}
                chatroomContract={chatroomContract}
              />
            }
          />
          <Route
            path="/room/:id"
            element={<Room walletAddress={walletAddress} />}
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
