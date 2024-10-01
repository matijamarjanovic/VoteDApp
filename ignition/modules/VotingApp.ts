import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const VotingAppModule = buildModule("VotingApp4", (m) => {

    const vapp = m.contract("VotingApp", [], {
    });

    return { vapp };
});

export default VotingAppModule;
