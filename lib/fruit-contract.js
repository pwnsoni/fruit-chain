/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class FruitContract extends Contract {

    async addParticipant(ctx, partcipantType, orgName, licenseNo, address){
        const exists = await this.participantExists(ctx, licenseNo);
        if (exists) {
            throw new Error(`The fruit ${fruitId} already exists`);
        }
        let participant = {};

        participant.partcipantType = partcipantType;
        participant.orgName = orgName;
        participant.licenseNo = licenseNo;
        participant.address = address;

        const buffer = Buffer.from(JSON.stringify(participant));
        await ctx.stub.putState(licenseNo, buffer);

    }

    async participantExists(ctx, licenseNo) {
        const buffer = await ctx.stub.getState(licenseNo);
        return (!!buffer && buffer.length > 0);
    }
    async fruitExists(ctx, fruitId) {
        const buffer = await ctx.stub.getState(fruitId);
        return (!!buffer && buffer.length > 0);
    }

    // Transaction to register fruit in the blockchain
    async createFruit(ctx, fruitId, name, qty, growerName, currentOwner, dateOfPlucking) {
        const exists = await this.fruitExists(ctx, fruitId);
        if (exists) {
            throw new Error(`The fruit ${fruitId} already exists`);
        }
        let asset = { };

        asset.fruitId = fruitId;
        asset.name = name;
        asset.qty = qty;
        asset.growerName = growerName;
        asset.currentOwner = currentOwner;
        asset.dateOfPlucking = dateOfPlucking;
        
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(fruitId, buffer);
    }

    async ownershipTransfer(ctx, fruitId, upcomingOwner){
        const exists = await this.fruitExists(ctx, fruitId);
        if (!exists) {
            throw new Error(`The fruit ${fruitId} does not exist`);
        }
        const buffer = await ctx.stub.getState(fruitId);
        let asset = JSON.parse(buffer.toString());
        
        asset.currentOwner = upcomingOwner;
        const buffer2 = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(fruitId, buffer2);
    }

    async readFruit(ctx, fruitId) {
        const exists = await this.fruitExists(ctx, fruitId);
        if (!exists) {
            throw new Error(`The fruit ${fruitId} does not exist`);
        }
        const buffer = await ctx.stub.getState(fruitId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async updateFruit(ctx, fruitId, name, qty, growerName, currentOwner, dateOfPlucking) {
        const exists = await this.fruitExists(ctx, fruitId);
        if (!exists) {
            throw new Error(`The fruit ${fruitId} does not exist`);
        }
        let asset = { };

        asset.fruitId = fruitId;
        asset.name = name;
        asset.qty = qty;
        asset.growerName = growerName;
        asset.currentOwner = currentOwner;
        asset.dateOfPlucking = dateOfPlucking;

        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(fruitId, buffer);
    }

    async deleteFruit(ctx, fruitId) {
        const exists = await this.fruitExists(ctx, fruitId);
        if (!exists) {
            throw new Error(`The fruit ${fruitId} does not exist`);
        }
        await ctx.stub.deleteState(fruitId);
    }

    async retrieveHistoryForFruitId(ctx, fruitId) {
        console.info('getting history for key: ' + fruitId);
        let iterator = await ctx.stub.getHistoryForKey(fruitId);
        let result = [];
        let res = await iterator.next();
        while (!res.done) {
            if (res.value) {
                console.info(`found state update with value: ${res.value.value.toString('utf8')}`);
                const obj = JSON.parse(res.value.value.toString('utf8'));
                result.push(obj);
            }
            res = await iterator.next();
        }
        await iterator.close();
        return result;
    }

}

module.exports = FruitContract;
