import { ContractInteract } from '@openst/mosaic.js';
import { Tx } from 'web3/eth/types';
import Logger from '../Logger';

import Web3 = require('web3');

/**
 * Contracts contains methods to deploy contracts.
 */
export default class Contracts {
  /**
   * Deploys an organization at the given web3 connection.
   */
  public static async deployOrganization(
    web3: Web3,
    txOptions: Tx,
    owner: string,
    admin: string,
  ): Promise<ContractInteract.Organization> {
    const organization: ContractInteract.Organization = await ContractInteract.Organization
      .deploy(
        web3,
        owner,
        admin,
        [],
        '0',
        txOptions,
      );
    Contracts.logContractDeployment('organization', organization);

    return organization;
  }

  /**
   * Deploys an anchor at the given web3 connection.
   */
  public static async deployAnchor(
    web3: Web3,
    txOptions: Tx,
    remoteChainId: string,
    blockHeight: string,
    stateRoot: string,
    maxStateRoots: string,
    organizationAddress: string,
  ): Promise<ContractInteract.Anchor> {
    const anchor: ContractInteract.Anchor = await ContractInteract.Anchor.deploy(
      web3,
      remoteChainId,
      blockHeight,
      stateRoot,
      maxStateRoots,
      organizationAddress,
      txOptions,
    );
    Contracts.logContractDeployment('anchor', anchor);

    return anchor;
  }

  /**
   * Deploys an OST gateway at the given web3 connection.
   * Includes deployment of all required libraries.
   */
  public static async deployOstGateway(
    web3: Web3,
    txOptions: Tx,
    ostAddress: string,
    anchorAddress: string,
    bounty: string,
    organizationAddress: string,
    burnerAddress: string,
  ): Promise<ContractInteract.EIP20Gateway> {
    const {
      gatewayLib,
      messageBus,
    } = await Contracts.deployGatewayLibraries(web3, txOptions);

    const ostGateway: ContractInteract.EIP20Gateway = await ContractInteract.EIP20Gateway.deploy(
      web3,
      ostAddress,
      ostAddress,
      anchorAddress,
      bounty,
      organizationAddress,
      burnerAddress,
      messageBus.address,
      gatewayLib.address,
      txOptions,
    );
    Contracts.logContractDeployment('ostGateway', ostGateway);

    return ostGateway;
  }

  /**
   * Deploys an OST Prime contract at the given web3 connection.
   */
  public static async deployOstPrime(
    web3: Web3,
    txOptions: Tx,
    ostAddress: string,
    organizationAddress: string,
  ): Promise<ContractInteract.OSTPrime> {
    const ostPrime: ContractInteract.OSTPrime = await ContractInteract.OSTPrime.deploy(
      web3,
      ostAddress,
      organizationAddress,
      txOptions,
    );
    Contracts.logContractDeployment('ostPrime', ostPrime);

    return ostPrime;
  }

  /**
   * Deploys an OST co-gateway at the given web3 connection.
   * Includes deployment of all required libraries.
   */
  public static async deployOstCoGateway(
    web3: Web3,
    txOptions: Tx,
    ostAddress: string,
    ostPrimeAddress: string,
    anchorAddress: string,
    bounty: string,
    organizationAddress: string,
    gatewayAddress: string,
    burnerAddress: string,
  ): Promise<ContractInteract.EIP20CoGateway> {
    const {
      gatewayLib,
      messageBus,
    } = await Contracts.deployGatewayLibraries(web3, txOptions);

    const ostCoGateway: ContractInteract.EIP20CoGateway = await ContractInteract.EIP20CoGateway
      .deploy(
        web3,
        ostAddress,
        ostPrimeAddress,
        anchorAddress,
        bounty,
        organizationAddress,
        gatewayAddress,
        burnerAddress,
        messageBus.address,
        gatewayLib.address,
        txOptions,
      );
    Contracts.logContractDeployment('ostCoGateway', ostCoGateway);

    return ostCoGateway;
  }

  /**
   * Deploys the required gateway libraries and returns them to be set on a gateway or co-gateway.
   */
  private static async deployGatewayLibraries(
    web3: Web3,
    txOptions: Tx,
  ): Promise<{
    gatewayLib: ContractInteract.GatewayLib;
    messageBus: ContractInteract.MessageBus;
  }> {
    const merklePatriciaProof = await ContractInteract.MerklePatriciaProof.deploy(
      web3,
      txOptions,
    );
    Contracts.logContractDeployment('merklePatriciaProof', merklePatriciaProof);

    const [gatewayLib, messageBus] = await Promise.all([
      ContractInteract.GatewayLib.deploy(
        web3,
        merklePatriciaProof.address,
        txOptions,
      ),
      ContractInteract.MessageBus.deploy(
        web3,
        merklePatriciaProof.address,
        txOptions,
      ),
    ]);
    Contracts.logContractDeployment('messageBus', messageBus);
    Contracts.logContractDeployment('gatewayLib', gatewayLib);

    return {
      gatewayLib,
      messageBus,
    };
  }

  /**
   * Logs at which address this contract was deployed.
   */
  private static logContractDeployment(contractName: string, contract: { address: string }): void {
    Logger.info('deployed contract', { name: contractName, address: contract.address });
  }
}
