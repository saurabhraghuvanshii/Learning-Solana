import { createSolanaRpc, createSolanaRpcSubscriptions, address, lamports } from "@solana/kit";


const rpc = createSolanaRpc("http://localhost:8899");
const rpcSubscriptions = createSolanaRpcSubscriptions("ws://localhost:8900");

const LAMPORTS_PER_SOL = lamports(1_000_000_000n);

const wallet = address("");

const abortController = new AbortController();

const notifications  = await rpcSubscriptions
  .accountNotifications(wallet, {commitment: "confirmed"})
  .subscribe({ abortSignal: abortController.signal});

(async () => {
    for await (const notification of notifications) {
        console.log(notification)
    }
})();

const airdropSignature = await rpc 
    .requestAirdrop(wallet, LAMPORTS_PER_SOL)
    .send();

while ( true ) {
    const status = await rpc.getSignatureStatuses([airdropSignature]).send();
    if (status.value?.[0]?.confirmationStatus === "confirmed") break;
    await new Promise((r) => setTimeout(r, 1000));
}

abortController.abort();
