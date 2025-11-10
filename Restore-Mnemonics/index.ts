import { createKeyPairSignerFromPrivateKeyBytes } from "@solana/kit";
import * as bip39 from "bip39";
import { HDKey } from "micro-ed25519-hdkey";

// Restore BIP39 

const mnemonic = "pill tomorrow foster begin walnut borrow virtual kick shift mutual shoe scatter";

const seed = bip39.mnemonicToSeedSync(mnemonic, "");

const privateKeyBytes = seed.subarray(0, 32);

const signer = await createKeyPairSignerFromPrivateKeyBytes(
    new Uint8Array(privateKeyBytes)
)

console.log(signer.address)



// Restoring BIP44 format mnemonics

const mnemonic44 = "neither lonely flavor argue grass remind eye tag avocado spot unusual intact";

const seed1 = bip39.mnemonicToSeedSync(mnemonic44);
const hd = HDKey.fromMasterSeed(seed1.toString("hex"));

for (let i = 0; i < 10; i++) {
    const path = `m/44'/501'/${i}'/0'`;
    const child = hd.derive(path);

    const signer = await createKeyPairSignerFromPrivateKeyBytes(
        new Uint8Array(child.privateKey)
    );

    console.log(`${path} => ${signer.address}`);
}

