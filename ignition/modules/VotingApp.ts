import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const VotingAppModule = buildModule("LockModule", (m) => {

    const vapp = m.contract("VotingAppModule", [], {
    });

    return { vapp };
});

export default VotingAppModule;
