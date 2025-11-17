import { getAddMemoInstruction } from "@solana-program/memo";
import { airdropFactory, appendTransactionMessageInstruction, appendTransactionMessageInstructions, createSolanaRpc, createSolanaRpcSubscriptions, createTransactionMessage, generateKeyPairSigner, getSignatureFromTransaction, lamports, pipe, sendAndConfirmTransactionFactory, setTransactionMessageFeePayerSigner, setTransactionMessageLifetimeUsingBlockhash, signAndSendTransactionMessageWithSigners } from "@solana/kit";


const rpc = createSolanaRpc("");
const rpcSubscriptions = createSolanaRpcSubscriptions("");

const sender = generateKeyPairSigner();
const LAMPORTS_PER_SOL = 1_000_000_000n;
await airdropFactory({ rpc, rpcSubscriptions })({
    recipientAddress: sender.address,
    lamports: lamports(LAMPORTS_PER_SOL),
    commitment: "confirmed"
});

const memoInstruction = getAddMemoInstruction({ memo: "hello fucker" });

const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
const transactionMessage = pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayerSigner(sender, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    (tx) => appendTransactionMessageInstructions([memoInstruction], tx)
);

const signedTransaction = await signAndSendTransactionMessageWithSigners(transactionMessage);

await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(
    signedTransaction,
    { commitment: "confirmed" }
);

const transcationSignature = getSignatureFromTransaction(signedTransaction);
console.log("Transaction Signature:", transcationSignature);
