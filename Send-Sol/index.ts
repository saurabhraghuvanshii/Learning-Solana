import { getTransferSolInstruction } from "@solana-program/system";
import { airdropFactory, appendTransactionMessageInstruction, appendTransactionMessageInstructions, createSolanaRpc, createSolanaRpcSubscriptions, createTransactionMessage, generateKeyPair, generateKeyPairSigner, getSignatureFromTransaction, lamports, pipe, sendAndConfirmTransactionFactory, setTransactionMessageFeePayer, setTransactionMessageLifetimeUsingBlockhash, signTransactionMessageWithSigners } from "@solana/kit";




const rpc = createSolanaRpc("");
const rpcSubscriptions = createSolanaRpcSubscriptions("");

const sender = await generateKeyPairSigner( );
const recipient = await generateKeyPairSigner();

const LAMPORTS_PER_SOL = 1_000_000_000n;
const transferAmount = lamports(LAMPORTS_PER_SOL / 100n);


await airdropFactory({rpc, rpcSubscriptions})({
    recipientAddress: sender.address,
    lamports: lamports(LAMPORTS_PER_SOL),
    commitment: "confirmed"
});

const transferInstruction = getTransferSolInstruction({
    source: sender,
    destination: recipient.address,
    amount: transferAmount
});

const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
const transactionMessage = pipe(
    createTransactionMessage({ version: 0}),
    (tx) => setTransactionMessageFeePayer(sender.address, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    (tx) => appendTransactionMessageInstructions([transferInstruction], tx)
);


const signedTransaction= 
  await signTransactionMessageWithSigners(transactionMessage);

  await sendAndConfirmTransactionFactory({rpc, rpcSubscriptions})(
    signedTransaction as any,
    {commitment: "confirmed"}
);

const transactionSignature = getSignatureFromTransaction(signedTransaction);
console.log("Transcation Signature:", transactionSignature);
