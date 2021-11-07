import { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';

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

  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  };

  const sendGif = async () => {
    if (inputValue.length > 0) {
      console.log('Gif link:', inputValue);
    } else {
      console.log('Empty input. Try again.');
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

  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching GIF list...');
      
      // Call Solana program here.
  
      // Set state
      setGifList(TEST_GIFS);
    }
  }, [walletAddress]);

  return (
    <div className="App">
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
          {
            !walletAddress && (
              <button
                className="cta-button connect-wallet-button"
                onClick={connectWallet}
              >
                Connect to Wallet
              </button>
            ) || (
              <div className="connected-container">
                <input
                  type="text"
                  placeholder="Enter gif link!"
                  value={inputValue}
                  onChange={onInputChange}
                />
                <button className="cta-button submit-gif-button" onClick={sendGif}>Submit</button>
                <div className="gif-grid">
                  {gifList.map(gif => (
                    <div className="gif-item" key={gif}>
                      <img src={gif} alt={gif} />
                    </div>
                  ))}
                </div>
              </div>
            )
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
