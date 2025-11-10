import { generateKeyPair, getBase58Decoder, getUtf8Encoder, signBytes, verifySignature } from "@solana/kit";

const keys = await generateKeyPair();
const message = getUtf8Encoder().encode("HEllo, wrold");
const signedBytes = await signBytes(keys.privateKey, message);

const decoded = getBase58Decoder().decode(signedBytes);
console.log("Signatuure:", decoded);

const verified = await verifySignature(keys.publicKey, signedBytes, message);
console.log("verified:", verified);

