import { getSetComputeUnitLimitInstruction, getSetComputeUnitPriceInstruction } from "@solana-program/compute-budget";
import { getAddMemoInstruction } from "@solana-program/memo";
import { airdropFactory, createSolanaRpc, getComputeUnitEstimateForTransactionMessageFactory, createSolanaRpcSubscriptions, sendAndConfirmTransactionFactory, generateKeyPair, lamports, pipe, createTransactionMessage, setTransactionMessageFeePayerSigner, setTransactionMessageLifetimeUsingBlockhash, appendTransactionMessageInstruction, prependTransactionMessageInstruction, prependTransactionMessageInstructions, signTransaction, signTransactionMessageWithSigners, getSignatureFromTransaction } from "@solana/kit";




const rpc = createSolanaRpc("");
const rpcSubscriptions = createSolanaRpcSubscriptions("");

const airdrop = airdropFactory({rpc,rpcSubscriptions});
const getComputeUnitEstimate = 
 getComputeUnitEstimateForTransactionMessageFactory({ rpc });

const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions });

const keypairSigner = await generateKeyPair();

await airdrop({
    commitment: "confirmed",
    lamports: lamports(1000_000n),
    recipientAddress: keypairSigner.address
});

const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

const transactionMessage = pipe(
    createTransactionMessage({ version: "legacy" }),
    (m) => setTransactionMessageFeePayerSigner(keypairSigner, m),
    (m) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
    (m) => appendTransactionMessageInstruction(
        getSetComputeUnitPriceInstruction({ microLamports: 5000n }),
        m
    ),
    (m) => appendTransactionMessageInstruction(
        getAddMemoInstruction({ memo: "Hello, world!" }),
        m
    )
);


const estimatedComputeUnits = await getComputeUnitEstimate(transactionMessage);
console.log(`Transaction is estimated to consume ${estimatedComputeUnits} compute units`);

const budegetedTranMessage = prependTransactionMessageInstructions(
    [getSetComputeUnitLimitInstruction({ units: estimatedComputeUnits })],
    transactionMessage
)
const signedTx = await signTransactionMessageWithSigners(budegetedTranMessage);

const transactionSignature = getSignatureFromTransaction(signedTx);
await sendAndConfirmTransaction(signedTx, {commitment: "confirmed" });

console.log(`Transaction Signature: ${transactionSignature}`);
