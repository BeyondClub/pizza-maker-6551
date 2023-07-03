import { MediaRenderer, ThirdwebNftMedia, useAddress, useWallet } from '@thirdweb-dev/react';
import { NFT, ThirdwebSDK } from '@thirdweb-dev/sdk';
import { Signer } from 'ethers';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Container from '../../../components/Container/Container';
import newSmartWallet from '../../../components/SmartWallet/SmartWallet';
import SmartWalletConnected from '../../../components/SmartWallet/smartConnected';
import { activeChain, nftDropAddress } from '../../../const/constants';
import styles from '../../../styles/Token.module.css';

type Props = {
	nft: NFT;
	contractMetadata: any;
};

export default function TokenPage({ nft, contractMetadata }: Props) {
	const [smartWalletAddress, setSmartWalletAddress] = useState<string | null>(null);
	const [signer, setSigner] = useState<Signer>();

	// get the currently connected wallet
	const address = useAddress();
	const wallet = useWallet();

	// create a smart wallet for the NFT
	useEffect(() => {
		const createSmartWallet = async (nft: NFT) => {
			if (nft && smartWalletAddress == null && address && wallet) {
				const smartWallet = newSmartWallet(nft);
				console.log('personal wallet', address);
				await smartWallet.connect({
					personalWallet: wallet,
				});
				setSigner(await smartWallet.getSigner());
				console.log('signer', signer);
				setSmartWalletAddress(await smartWallet.getAddress());
				console.log('smart wallet address', await smartWallet.getAddress());
				return smartWallet;
			} else {
				console.log('smart wallet not created');
			}
		};
		createSmartWallet(nft);
	}, [nft, smartWalletAddress, address, wallet]);

	return (
		<>
			<Toaster position="bottom-center" reverseOrder={false} />
			<Container maxWidth="lg">
				<div className="grid md:grid-cols-2 gap-10 align-center">
					<div className="mx-auto mt-10">
						<div className="relative w-90 h-90">
							<div className={styles.metadataContainer}>
								<ThirdwebNftMedia metadata={nft.metadata} className={styles.image} />

								{/* Loop over the images and return the image element */}
								<img
									src="https://ipfs.thirdwebcdn.com/ipfs/QmNrxLEmZJdjC99YVs9rEhBiKKj9wAQYNhh9XbbCstCtzy/0.png"
									className="absolute top-0 w-60 h-60 top-5 left-7"
								/>

								<img
									src="https://ipfs.thirdwebcdn.com/ipfs/QmZZ76t69Y58VKsRL2sx2YrxrVSSFof2iuuM4dfnizhA58/0.png"
									className="absolute top-0 w-60 h-60 top-5 left-7"
								/>

								<img
									src="https://ipfs.thirdwebcdn.com/ipfs/QmeNaGHjb98H3T4Q8yjLaVisBJikN7ogxawbC8goPTLU6i/0.png"
									className="absolute top-0 w-60 h-60 top-5 left-7"
								/>
							</div>
						</div>
					</div>

					<div className={styles.listingContainer}>
						{contractMetadata && (
							<div className={styles.contractMetadataContainer}>
								<MediaRenderer src={contractMetadata.image} className={styles.collectionImage} />
								<p className={styles.collectionName}>{contractMetadata.name}</p>
							</div>
						)}
						<h1 className={styles.title}>{nft.metadata.name}</h1>
						<p className={styles.collectionName}>Token ID #{nft.metadata.id}</p>
						{smartWalletAddress ? (
							<SmartWalletConnected signer={signer} />
						) : (
							<div className={styles.btnContainer}>
								<p>Loading...</p>
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
		fallback: 'blocking', // can also be true or 'blocking'
	};
};
