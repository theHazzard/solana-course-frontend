import { useEffect, useState, useCallback } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';

import idl from './idl.json';
import kp from './keypair.json';

const { SystemProgram } = web3;
console.log(web3);
const programID = new PublicKey(idl.metadata.address);
const network = clusterApiUrl('devnet');
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)

const opts = {
  preflightCommitment: "processed"
}

const TEST_GIFS = [
	'https://media4.giphy.com/media/3o7bukaBzZvgv1TUxG/giphy.gif',
	'https://i.pinimg.com/originals/4c/13/02/4c1302ff53ac123ce027e428de086b94.gif',
	'https://c.tenor.com/DaaKERFwv2gAAAAC/grim-fandango-pc-game.gif',
	'https://i.gifer.com/N7bN.gif',
  'https://i.gifer.com/49QP.gif',
]

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [gifList, setGifList] = useState([]);
  const [popupState, setPopupState] = useState({
    open: false,
    to: '',
  });
  const [solToSend, setSolToSend] = useState(0)

  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  };

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
  }

  const upvoteGif = async (gifLink) => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
  
      await program.rpc.updateItem(gifLink, {
        accounts: {
          baseAccount: baseAccount.publicKey,
        },
      });
  
      await getGifList();
    } catch (error) {
      console.log("Error sending GIF:", error)
    }
  }

  const sendGif = async () => {
    if (inputValue.length === 0) {
      console.log("No gif link given!")
      return
    }
    console.log('Gif link:', inputValue);
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
  
      await program.rpc.addGif(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
        },
      });
      console.log("GIF sucesfully sent to program", inputValue)
  
      await getGifList();
    } catch (error) {
      console.log("Error sending GIF:", error)
    }
  };

  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const { solana } = window;

      if (solana) {
        const response = await solana.connect();
        console.log('Connected with Public Key:', response.publicKey.toString());
        setWalletAddress(response.publicKey.toString());
      }
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet found!');

          const response = await solana.connect({ onlyIfTrusted: true })

          console.log(
            'Connected with Public Key:',
            response.publicKey.toString()
          );

          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert('Solana object not found! get a phantom wallet!')
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    async function load(event) {
      await checkIfWalletIsConnected();
    }
    window.addEventListener('load', load)
  });

  const sendSol = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const to_account_info = await provider.connection.getAccountInfo(popupState.to);
      debugger
      await program.rpc.sendSol(parseFloat(solToSend), {
        accounts: {
          from: provider.wallet.publicKey,
          to: popupState.to,
          systemProgram: SystemProgram.programId,
        }
      });
      setPopupState({
        open: false,
        to: '',
      });
      setSolToSend(0);
    } catch (error) {
      console.log('Error in sendSol', error);
    }
  }

  const getGifList = useCallback(async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);

      console.log('Got the account', account);
      setGifList(account.gifList);
    } catch (error) {
      console.log('Error in getGifs', error);
      setGifList(null);
    }
  }, [])

  const createGifAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping")
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });
      console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
      await getGifList();
  
    } catch(error) {
      console.log("Error creating BaseAccount account:", error)
    }
  }

  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching GIF list...');
      getGifList();
    }
  }, [walletAddress, getGifList]);

  return (
    <div className="App">
      {
        popupState.open && (
          <div className="modal-background">
            <div className="modal-content">
              How much SOL you want to send?
              <input
                type="number"
                placeholder="1"
                value={solToSend}
                onChange={(event) => setSolToSend(event.target.value)}
              />
              <button className="cta-button submit-gif-button" onClick={sendSol}>Send!</button>
            </div>
          </div>
        )
      }
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
          {
            (!walletAddress && (
              <button
                className="cta-button connect-wallet-button"
                onClick={connectWallet}
              >
                Connect to Wallet
              </button>
            )) || ((gifList === null && (
              <div className="connected-container">
                <button className="cta-button submit-gif-button" onClick={createGifAccount}>
                  Do One-Time Initialization For GIF Program Account
                </button>
              </div>
            )) || (
              <div className="connected-container">
                <input
                  type="text"
                  placeholder="Enter gif link!"
                  value={inputValue}
                  onChange={onInputChange}
                />
                <button className="cta-button submit-gif-button" onClick={sendGif}>Submit</button>
                <div className="gif-grid">
                  {gifList.map((item, index) => (
                    <figure className="gif-item" key={index}>
                      <figcaption className="gif-item-caption"><span>By:</span> {item.userAddress.toString()}</figcaption>
                      <div className="gif-item-container">
                        <div className="gif-item-votes" onClick={() => upvoteGif(item.gifLink)}><span>Votes:</span> {item.votes}</div>
                        <button className="gif-item-tip" onClick={() => setPopupState({
                          open: true,
                          to: item.userAddress,
                        })}>Tip</button>
                        <img src={item.gifLink} alt={item.gifLink} />
                      </div>
                    </figure>
                  ))}
                </div>
              </div>
            ))
          }
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
