"use client";
import {
  Abstraxion,
  useAbstraxionAccount,
  useAbstraxionSigningClient,
  useModal
} from "@burnt-labs/abstraxion";
import { Button } from "@burnt-labs/ui";
import { useEffect, useState } from "react";
import type { ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { CONTRACTS, JOINTLY_ID, TREASURY } from "@/utils/constants";
import type { GranteeSignerClient } from "@burnt-labs/abstraxion-core"

type ExecuteResultOrUndefined = ExecuteResult | string | undefined;


async function write(client: GranteeSignerClient | undefined, msg: unknown, sender: string, contract: string) {
  if (!client) return;
  return client.execute(
    sender,
    contract,
    msg,
    {
      amount: [{ amount: "1", denom: "uxion" }],
      gas: "500000",
      granter: TREASURY.treasury
    },
    "",
    []
  );
}

async function read(client: GranteeSignerClient | undefined, msg: unknown, contract: string) {
  if (!client) return;
  return client.queryContractSmart(
    contract,
    msg
  );
}

export default function Page(): JSX.Element {
  // Abstraxion hooks
  const { data: { bech32Address }, isConnected, isConnecting } = useAbstraxionAccount();

  // General state hooks
  const [, setShow] = useModal();

  const [executeResult, setExecuteResult] = useState<ExecuteResultOrUndefined>(undefined);
  const [ownerOfPotato, setOwnerOfPotato] = useState<string | undefined>();
  const [transferTo, setTransferTo] = useState<string>("");
  const { client } = useAbstraxionSigningClient();


  // to display loading state while the function executes
  const [loading, setLoading] = useState(false);

  const execute = async (type: "read" | "write", msg: unknown) => {
    setLoading(true)
    setExecuteResult(undefined)

    try {
      if (type === "write") {
        const res = await write(client, msg, bech32Address, CONTRACTS.Jointly)
        setExecuteResult(res);
      }

      if (type === "read") {
        const res = await read(client, msg, CONTRACTS.Jointly);

        setExecuteResult(res);
      }

    } catch (err) {

      setExecuteResult("there was an error, check logs")
      console.log(err)

    } finally {

      setLoading(false);

    }
  }


  // watch isConnected and isConnecting
  // only added for testing
  useEffect(() => {
    console.log({ isConnected, isConnecting });
  }, [isConnected, isConnecting])

  const getPotatoOwner = async () => {
    setOwnerOfPotato("Loading...");
    const msg = { owner_of: { token_id: JOINTLY_ID } }
    try {
      const res = await read(client, msg, CONTRACTS.Jointly);
      setOwnerOfPotato(res["owner"]);
    } catch (err) {
      console.log(err);
      setOwnerOfPotato(undefined)
    }
  }
  useEffect(() => {
    if (!client) return;
    getPotatoOwner();
  }, [client, executeResult])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 w-full px-12">
      <h1 className="text-2xl font-bold tracking-tighter text-black dark:text-white">
        Jointly
      </h1>
      <div className="flex flex-col w-full gap-6">
        <div className="flex flex-row w-full gap-6">
          <Button
            fullWidth
            onClick={() => { setShow(true) }}
            structure="base"
          >
            {bech32Address ? (
              <div className="flex items-center justify-center">View Account</div>
            ) : (
              "Cnnect Account"
            )}
          </Button>
        </div>
      </div>
      <Abstraxion onClose={() => setShow(false)} />
    </main>
  );
}
