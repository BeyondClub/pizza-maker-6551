import {
  MediaRenderer,
  ThirdwebNftMedia,
  useAddress,
  useContract,
  useWallet,
  Web3Button,
} from "@thirdweb-dev/react";
import React, { useState } from "react";
import Container from "../../../components/Container/Container";
import { GetStaticProps, GetStaticPaths } from "next";
import { NFT, ThirdwebSDK } from "@thirdweb-dev/sdk";
import {
  activeChain,
  factoryAddress,
  nftDropAddress,
} from "../../../const/constants";
import styles from "../../../styles/Token.module.css";
import toast, { Toaster } from "react-hot-toast";
import toastStyle from "../../../util/toastConfig";
import { Signer } from "ethers";
import newSmartWallet from "../../../util/SmartWallet";
import SmartWalletConnected from "../../../components/SmartWallet/smartConnected";

type Props = {
  nft: NFT;
  contractMetadata: any;
};

export default function TokenPage({ nft, contractMetadata }: Props) {
  const [smartWalletAddress, setSmartWalletAddress] = useState<string | null>(
    null
  );
  const [signer, setSigner] = useState<Signer>();

  // Connect to NFT Drop Contracts
  const { contract: nftDropContract, isLoading: loadingContract } =
    useContract(nftDropAddress);

  // get the currently connected wallet
  const address = useAddress();
  const wallet = useWallet();

  const createSmartWallet = async (nft: NFT) => {
    if (nft && smartWalletAddress == null && address && wallet) {
      const smartWallet = newSmartWallet(nft);
      console.log("personal wallet", address);
      await smartWallet.connect({
        personalWallet: wallet,
      });
      setSigner(await smartWallet.getSigner());
      console.log("signer", signer);
      setSmartWalletAddress(await smartWallet.getAddress());
      console.log("smart wallet address", await smartWallet.getAddress());
      return smartWallet;
    } else {
      console.log("smart wallet not created");
    }
  };

  return (
    <>
      <Toaster position="bottom-center" reverseOrder={false} />
      <Container maxWidth="lg">
        <div className={styles.container}>
          <div className={styles.metadataContainer}>
            <ThirdwebNftMedia
              metadata={nft.metadata}
              className={styles.image}
            />
          </div>

          <div className={styles.listingContainer}>
            {contractMetadata && (
              <div className={styles.contractMetadataContainer}>
                <MediaRenderer
                  src={contractMetadata.image}
                  className={styles.collectionImage}
                />
                <p className={styles.collectionName}>{contractMetadata.name}</p>
              </div>
            )}
            <h1 className={styles.title}>{nft.metadata.name}</h1>
            <p className={styles.collectionName}>Token ID #{nft.metadata.id}</p>
            {smartWalletAddress ? (
              <SmartWalletConnected signer={signer} />
            ) : (
              <div className={styles.btnContainer}>
                <Web3Button
                  contractAddress={factoryAddress}
                  action={async () => await createSmartWallet(nft)}
                  className={styles.btn}
                  onSuccess={() => {
                    toast(`Smart wallet connection success!`, {
                      icon: "✅",
                      style: toastStyle,
                      position: "bottom-center",
                    });
                  }}
                  onError={(e) => {
                    console.log(e);
                    toast(
                      `Smart wallet connection failed! Reason: ${e.message}`,
                      {
                        icon: "❌",
                        style: toastStyle,
                        position: "bottom-center",
                      }
                    );
                  }}
                >
                  Connect a Token Bound Smart Wallet
                </Web3Button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const tokenId = context.params?.tokenId as string;

  const sdk = new ThirdwebSDK(activeChain);

  const contract = await sdk.getContract(nftDropAddress);

  const nft = await contract.erc721.get(tokenId);

  let contractMetadata;

  try {
    contractMetadata = await contract.metadata.get();
  } catch (e) {}

  return {
    props: {
      nft,
      contractMetadata: contractMetadata || null,
    },
    revalidate: 1, // https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const sdk = new ThirdwebSDK(activeChain);

  const contract = await sdk.getContract(nftDropAddress);

  const nfts = await contract.erc721.getAll();

  const paths = nfts.map((nft) => {
    return {
      params: {
        contractAddress: nftDropAddress,
        tokenId: nft.metadata.id,
      },
    };
  });

  return {
    paths,
    fallback: "blocking", // can also be true or 'blocking'
  };
};