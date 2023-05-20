import { Button, Input } from "@chakra-ui/react";
import { useState } from "react";
import {
  createPublicClient,
  decodeAbiParameters,
  http,
  parseAbiItem,
  parseAbiParameters,
} from "viem";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const transport = http(
    `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`
  );

  const client = createPublicClient({
    transport: transport,
  });

  const epca = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
  const UserOperationEvent = parseAbiItem(
    "event UserOperationEvent(bytes32 indexed userOpHash, address indexed sender, address indexed paymaster, uint256 nonce, bool success, uint256 actualGasCost, uint256 actualGasUsed)"
  );

  const UserOperationInput = parseAbiParameters(
    "(address sender, uint256 nonce, bytes initCode, bytes callData, uint256 callGasLimit, uint256 verificationGasLimit, uint256 preVerificationGas, uint256 maxFeePerGas, uint256 maxPriorityFeePerGas, bytes paymasterAndData, bytes signature)[] calldata ops, address beneficiary"
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Call your function here with the searchQuery value
    console.log("Search query:", searchQuery);

    if (UserOperationEvent === undefined) {
      console.error("UserOperationEvent not defined");
      return;
    }

    const filter = await client.createEventFilter({
      address: epca,
      event: UserOperationEvent,
      fromBlock: 17296100n,
      toBlock: 17296133n,
      args: [searchQuery],
    });
    const logs = await client.getFilterLogs({ filter });
    console.log(logs);

    const parentHash = logs[0].transactionHash;
    console.log("parentHash", parentHash);

    if (parentHash === null) {
      console.error("parentHash not defined");
      return;
    }

    const txnView = await client.getTransaction({ hash: parentHash });
    console.log("txnView", txnView);

    const inp = txnView.input;
    console.log("inp", inp);

    const parseInp: `0x${string}` = `0x${txnView.input.slice(10)}`;
    console.log("parseInp", parseInp);

    const vals = decodeAbiParameters(UserOperationInput, parseInp);
    console.log("vals", vals);

    const res = await client.getBlockNumber();
    console.log(res);
  };

  const handleChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <>
      <div className="flex justify-center items-center min-h-screen">
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            value={searchQuery}
            onChange={handleChange}
            placeholder="Enter your search query"
          />
          <Button type="submit" colorScheme="blue">
            Search
          </Button>
        </form>
      </div>
    </>
  );
}
