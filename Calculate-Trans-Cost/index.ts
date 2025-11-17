import { getSetComputeUnitLimitInstruction } from "@solana-program/compute-budget";
import { getAddMemoInstruction } from "@solana-program/memo";
import { airdropFactory, getComputeUnitEstimateForTransactionMessageFactory, appendTransactionMessageInstruction, appendTransactionMessageInstructions, createSolanaRpc, createSolanaRpcSubscriptions, createTransactionMessage, generateKeyPair, generateKeyPairSigner, lamports, pipe, sendAndConfirmTransactionFactory, setTransactionMessageFeePayer, setTransactionMessageLifetimeUsingBlockhash, prependTransactionMessageInstruction, compileTransactionMessage, getCompiledTransactionMessageCodec, getCompiledTransactionMessageEncoder, getBase64Decoder, TransactionMessageBytesBase64, signAndSendTransactionMessageWithSigners, getSignatureFromTransaction } from "@solana/kit";




const rpc = createSolanaRpc("");
const rpcSubscriptions = createSolanaRpcSubscriptions("");

// 2. utility functions
const getComputeUnitEstimate = 
   getComputeUnitEstimateForTransactionMessageFactory({ rpc });
const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
    rpc, rpcSubscriptions
});

const airdrop = airdropFactory({ rpc, rpcSubscriptions });

const signer = await generateKeyPairSigner();
await airdrop ({
    commitment: "confirmed",
    lamports: lamports(1000_000n),
    recipientAddress: signer.address
});
console.log("Create and fund account with address", signer.address);

// 4. Create a memo transaction
console.log("Creationg a memo transction");
const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
const transactionMessage = pipe(
    createTransactionMessage({ version: "legacy" }),
    (m: ReturnType<typeof createTransactionMessage>) => setTransactionMessageFeePayer(signer.address,m),
    (m: ReturnType<typeof createTransactionMessage>) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
    (m: ReturnType<typeof createTransactionMessage>) => 
        appendTransactionMessageInstructions(
            [
                getSetComputeUnitLimitInstruction({ microLamports: 5000n }),
                getAddMemoInstruction({ memo: "Hello world!" })
            ], 
        m
    )
);


const estimatedComputeUnits = await getComputeUnitEstimate(transactionMessage);

console.log(`Transaction is estimated to consume ${estimatedComputeUnits} compute units`);

const budgetedTransactionMessage = prependTransactionMessageInstruction(
    [getSetComputeUnitLimitInstruction({ units: estimatedComputeUnits})],
    transactionMessage
);

const base64EncodedMessage = pipe(
    budgetedTransactionMessage,
    compileTransactionMessage,
    getCompiledTransactionMessageEncoder().encode,
    getBase64Decoder().decode
) as TransactionMessageBytesBase64;

const transactionCost = await rpc.getFeeForMessage(base64EncodedMessage).send();

console.log(
    "Transaction estimated cost " + transactionCost.value + "lamports" 
);


const signedTx = await signAndSendTransactionMessageWithSigners(
    budgetedTransactionMessage
);
const transactionSignature = getSignatureFromTransaction(signedTx);
console.log("Trasaction Signature:", transactionSignature);

await sendAndConfirmTransaction(signedTx, { commitment: "confirmed" });
