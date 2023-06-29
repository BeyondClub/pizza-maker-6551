import {
  ThirdwebNftMedia,
  ThirdwebSDKProvider,
  useAddress,
  useBalance,
  useContract,
  useOwnedNFTs,
  Web3Button,
} from "@thirdweb-dev/react";
import React from "react";
import { activeChain, tokenAddress, editionDropAddressLeaf, editionDropAddressCheese, editionDropAddressTomato } from "../../const/constants";
import { Signer } from "ethers";
import style from "../../styles/Token.module.css";
import toast from "react-hot-toast";
import toastStyle from "../../util/toastConfig";
interface ConnectedProps {
  signer: Signer | undefined;
}

// ThirdwebSDKProvider is a wrapper component that provides the smart wallet signer and active chain to the Thirdweb SDK.
const SmartWalletConnected: React.FC<ConnectedProps> = ({ signer }) => {
  return (
    <ThirdwebSDKProvider signer={signer} activeChain={activeChain}>
      <ClaimTokens />
    </ThirdwebSDKProvider>
  );
};

// This is the main component that shows the user's token bound smart wallet.
const ClaimTokens = () => {
  const address = useAddress();
  const { data: tokenBalance, isLoading: loadingBalance } =
    useBalance(tokenAddress);

    const{
      contract: leafContract
    } = useContract(editionDropAddressLeaf);
    const{
      data: ownedNFTsLeaf,
      isLoading: ownedNFTsIsLoadingLeaf,
    } = useOwnedNFTs(leafContract, address)

    const{
      contract:tomatoContract
    } = useContract(editionDropAddressTomato);
    const{
      data: ownedNFTsTomato,
      isLoading: ownedNFTsIsLoadingTomato,
    } = useOwnedNFTs(tomatoContract, address)

    const{
      contract: cheeseContract
    } = useContract(editionDropAddressCheese);
    const{
      data: ownedNFTsCheese,
      isLoading: ownedNFTsIsLoadingCheese,
    } = useOwnedNFTs(cheeseContract, address)
  return (
    <div className={style.walletContainer}>
      <h2>This is Your Token Bound Smart Wallet!</h2>
      {address ? (
        loadingBalance ? (
          <h2>Loading Balance...</h2>
        ) : (
          <div className={style.pricingContainer}>
            <h2>Balance: {tokenBalance?.displayValue}</h2>
            <Web3Button
              contractAddress={tokenAddress}
              action={async (contract) => await contract.erc20.claim(10)}
              onSuccess={() => {
                toast(`NFT Claimed!`, {
                  icon: "✅",
                  style: toastStyle,
                  position: "bottom-center",
                });
              }}
              onError={(e) => {
                console.log(e);
                toast(`NFT Claim Failed! Reason: ${(e as any).reason}`, {
                  icon: "❌",
                  style: toastStyle,
                  position: "bottom-center",
                });
              }}
            >
              Claim 10 Tokens
            </Web3Button>
            <h1>Add Topping</h1>
            <Web3Button
              contractAddress={editionDropAddressLeaf}
              action={(contract)=>contract.erc1155.claim(0,1)}
            >
              Leaf 🍃  (10 Tickets)
            </Web3Button>
            {ownedNFTsIsLoadingLeaf ? (
              <p>Loading...</p>
            ):(
              <div>
                {ownedNFTsLeaf && ownedNFTsLeaf.length>0?(
                  ownedNFTsLeaf.map((nft)=>(
                    <div>
                      <ThirdwebNftMedia
                        metadata={nft.metadata}
                      />
                      <p>{nft.metadata.name}</p>
                      <p>Quantity: {nft.quantityOwned}</p>
                    </div>
                  ))
                ):(
                  <p>You have no leaf toppings</p>
                )}
              </div>
            )}

<Web3Button
              contractAddress={editionDropAddressTomato}
              action={(contract)=>contract.erc1155.claim(0,1)}
            >
              Tomato 🍅 (15 Tickets)
            </Web3Button>
            {ownedNFTsIsLoadingTomato ? (
              <p>Loading...</p>
            ):(
              <div>
                {ownedNFTsTomato && ownedNFTsTomato.length>0?(
                  ownedNFTsTomato.map((nft)=>(
                    <div>
                      <ThirdwebNftMedia
                        metadata={nft.metadata}
                      />
                      <p>{nft.metadata.name}</p>
                      <p>Quantity: {nft.quantityOwned}</p>
                    </div>
                  ))
                ):(
                  <p>You have no tomato toppings</p>
                )}
              </div>
            )}


<Web3Button
              contractAddress={editionDropAddressCheese}
              action={(contract)=>contract.erc1155.claim(0,1)}
            >
              Cheese 🧀 (10 Tickets)
            </Web3Button>
            {ownedNFTsIsLoadingCheese ? (
              <p>Loading...</p>
            ):(
              <div>
                {ownedNFTsCheese && ownedNFTsCheese.length>0?(
                  ownedNFTsCheese.map((nft)=>(
                    <div>
                      <ThirdwebNftMedia
                        metadata={nft.metadata}
                      />
                      <p>{nft.metadata.name}</p>
                      <p>Quantity: {nft.quantityOwned}</p>
                    </div>
                  ))
                ):(
                  <p>You have no cheese toppings</p>
                )}
              </div>
            )}

          </div>
        )
      ) : null}
    </div>
  );
};

export default SmartWalletConnected;
