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
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Feature from "@/components/Feature";
import AnimatedWalletButton from "@/components/ScaleBtn";

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
    <main className="min-h-screen bg-gradient-to-b from-gray-900/80 to-gray-800/80">
      <Navbar />
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6">
            Decentralized Joint Account Management
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Create and manage joint accounts on Algorand with Xion's abstraction and advanced voting mechanisms with complete transparency
          </p>

          <div className="flex justify-center gap-4 mb-12">
            <a
              // onClick={toggleWalletModal}
              href='dashboard/'
              className="px-4 sm:px-8 py-3 text-sm sm:text-md bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-semibold hover:opacity-90 transition-all"
              data-test-id="connect-wallet"
            >
              Go To Account
            </a>
            <AnimatedWalletButton onClick={() => { setShow(true) }} />
          </div>
        </div>

        {/* Features Section */}
        <Feature />

        {/* How It Works Section */}
        <div className="py-20">
          <h2 className="text-4xl font-bold text-center text-white mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center backdrop-blur-sm bg-slate-800/60 hover:bg-slate-800/40 transition-all ease-in-out duration-200 hover:translate-y-2 cursor-pointer p-4 rounded-md">
              <div className="bg-purple-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Connect Wallet</h3>
              <p className="text-gray-400">Link your Algorand wallet to get started</p>
            </div>
            <div className="text-center backdrop-blur-sm bg-slate-800/60 hover:bg-slate-800/40 transition-all ease-in-out duration-200 hover:translate-y-2 cursor-pointer p-4 rounded-md">
              <div className="bg-purple-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Create Account</h3>
              <p className="text-gray-400">Set up your joint account with custom parameters</p>
            </div>
            <div className="text-center backdrop-blur-sm bg-slate-800/60 hover:bg-slate-800/40 transition-all ease-in-out duration-200 hover:translate-y-2 cursor-pointer p-4 rounded-md">
              <div className="bg-purple-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Add Members</h3>
              <p className="text-gray-400">Invite trusted parties to join your account</p>
            </div>
            <div className="text-center backdrop-blur-sm bg-slate-800/60 hover:bg-slate-800/40 transition-all ease-in-out duration-200 hover:translate-y-2 cursor-pointer p-4 rounded-md">
              <div className="bg-purple-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">4</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Start Managing</h3>
              <p className="text-gray-400">Create proposals and vote on decisions</p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-20 bg-gray-800/50 rounded-3xl px-8 relative"
          style={{
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85)), url("/public/bg2.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
          <h2 className="text-4xl font-bold text-center text-white mb-12">Why Choose Us</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-start gap-4 bg-slate-700/50 backdrop-blur-sm hover:backdrop-blur-md  p-4 rounded-md">
                <div className="bg-purple-500 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Decentralized Control</h3>
                  <p className="text-gray-400">No single point of failure or control, truly democratic management</p>
                </div>
              </div>
              <div className="flex items-start gap-4 backdrop-blur-sm bg-slate-700/50 hover:backdrop-blur-md p-4 ">
                <div className="bg-purple-500 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Enhanced Security</h3>
                  <p className="text-gray-400">Multi-signature requirements and blockchain-based security</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start gap-4 backdrop-blur-sm bg-slate-700/50 hover:backdrop-blur-md p-4 rounded-md">
                <div className="bg-purple-500 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Complete Transparency</h3>
                  <p className="text-gray-400">All actions and votes are recorded on the blockchain</p>
                </div>
              </div>
              <div className="flex items-start gap-4 backdrop-blur-sm bg-slate-700/50 hover:backdrop-blur-md p-4 rounded-md">
                <div className="bg-purple-500 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Fast & Efficient</h3>
                  <p className="text-gray-400">Quick proposal creation and voting process</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Create Joint account section */}
        {/* Main Interface */}

      </div>

      {/* Footer Section */}
      <Footer />
      <Abstraxion onClose={() => setShow(false)} />
    </main>
  );
}
