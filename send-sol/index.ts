import { address, airdropFactory, createSolanaRpc, createSolanaRpcSubscriptions, lamports} from "@solana/kit";

const rpc = createSolanaRpc("https://api.devnet.solana.com");
const rpcSubscriptions = createSolanaRpcSubscriptions("wss://api.devnet.solana.com");

const LAMPORTS_PER_SOL = 1_000_000_000n;

const airdrop = airdropFactory({rpc, rpcSubscriptions});

await airdrop({
    commitment: "confirmed",
    recipientAddress: address("your wallet adress"),
    lamports: lamports(LAMPORTS_PER_SOL)
});

console.log(`Address ${address} ${lamports}`);
