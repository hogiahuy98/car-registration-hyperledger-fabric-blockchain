'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
const {nanoid} = require('nanoid');

class MyWorkload extends WorkloadModuleBase {
    constructor() {
        super();
    }
    
    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);

    }
    
    async submitTransaction() {
        // NOOP
        const car = {
            id: "U" + nanoid(),
            registrationNumber: "65A-65246",
            brand: "Nissan",
            model: "Maxima",
            color: "Puce",
            engineNumber: "U" + nanoid(),
            chassisNumber: "U" + nanoid(),
            owner: "U" + nanoid(),
            year: 2002,
            capality: 4124
          }
        const myArgs = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'createRegistration',
            invokerIdentity: 'User1',
            contractArguments: [car.id, car.engineNumber, car.chassisNumber, car.brand, car.model, car.color, car.year, car.capality, car.owner],
            readOnly: false
        };

        await this.sutAdapter.sendRequests(myArgs);
    }
    
    async cleanupWorkloadModule() {
        // NOOP
    }
}

function createWorkloadModule() {
    return new MyWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;