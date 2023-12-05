import {
  LocalAccountSigner,
  type Address,
  type SmartAccountSigner,
  type Hex,
} from "@alchemy/aa-core";
import { polygonMumbai, type Chain } from "viem/chains";
import { describe, it } from "vitest";
import { NaniAccount } from "../account.js";
import { createNaniAccountProvider } from "../provider.js";

const chain = polygonMumbai;

describe("Nani Account Tests", () => {
  const dummyMnemonic =
    "test test test test test test test test test test test test";
  const owner: SmartAccountSigner =
    LocalAccountSigner.mnemonicToAccountSigner(dummyMnemonic);

  it("should correctly sign the message", async () => {
    const provider = givenConnectedProvider({ owner, chain });
    expect(
      await provider.signMessage(
        "0xa70d0af2ebb03a44dcd0714a8724f622e3ab876d0aa312f0ee04823285d6fb1b"
      )
    ).toBe(
      "0x33b1b0d34ba3252cd8abac8147dc08a6e14a6319462456a34468dd5713e38dda3a43988460011af94b30fa3efefcf9d0da7d7522e06b7bd8bff3b65be4aee5b31c"
    );
  });

  it("should correctly sign typed data", async () => {
    const provider = givenConnectedProvider({ owner, chain });
    expect(
      await provider.signTypedData({
        types: {
          Request: [{ name: "hello", type: "string" }],
        },
        primaryType: "Request",
        message: {
          hello: "world",
        },
      })
    ).toBe(
      "0xda1aeed13916d5723579f26cb9116155945d3581d642c38d8e2bce9fc969014f3eb599fa375df3d6e8181c8f04db64819186ac44cf5fd2bdd90e9f8543c579461b"
    );
  });

  it("should correctly encode transferOwnership data", async () => {
    expect(
      NaniAccount.encodeTransferOwnership(
        "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef"
      )
    ).toBe(
      "0xf2fde38b000000000000000000000000deadbeefdeadbeefdeadbeefdeadbeefdeadbeef"
    );
  });

  it("should correctly encode batch transaction data", async () => {
    const provider = givenConnectedProvider({ owner, chain });
    const calls = [
      {
        target: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef" as Address,
        value: BigInt(0),
        data: "0xdeadbeef" as Hex,
      },
      {
        target: "0x8ba1f109551bd432803012645ac136ddd64dba72" as Address,
        value: BigInt(0),
        data: "0xcafebabe" as Hex,
      },
    ];

    expect(
      await provider.account.encodeBatchExecute(calls)
    ).toMatchInlineSnapshot(
      '"0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000deadbeefdeadbeefdeadbeefdeadbeefdeadbeef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004deadbeef000000000000000000000000000000000000000000000000000000000000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004cafebabe00000000000000000000000000000000000000000000000000000000"'
    );
  });

  it("should correctly encode delegate execute data", async () => {
    const provider = givenConnectedProvider({ owner, chain });
    expect(
      await provider.account.encodeExecuteDelegate(
        "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef" as Address,
        "0xdeadbeef" as Hex
      )
    ).toMatchInlineSnapshot(
      '"0xb10cc728000000000000000000000000deadbeefdeadbeefdeadbeefdeadbeefdeadbeef00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000004deadbeef00000000000000000000000000000000000000000000000000000000"');
  });

});

const givenConnectedProvider = ({
  owner,
  chain,
}: {
  owner: SmartAccountSigner;
  chain: Chain;
}) =>
  createNaniAccountProvider({
    owner,
    chain,
    rpcProvider: `${chain.rpcUrls.alchemy.http[0]}/${"test"}`,
    accountAddress: "0xb856DBD4fA1A79a46D426f537455e7d3E79ab7c4",
  });
