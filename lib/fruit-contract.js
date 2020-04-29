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

        console.log('addParticipant contract initiated');

        participant.partcipantType = partcipantType;
        participant.orgName = orgName;
        participant.licenseNo = licenseNo;
        participant.address = address;

        console.log('added participant');
        console.log(participant);

        const buffer = Buffer.from(JSON.stringify(participant));
        await ctx.stub.putState(licenseNo, buffer);

    }

    async participantExists(ctx, licenseNo) {
        console.log('participantExists contract initiated');
        const buffer = await ctx.stub.getState(licenseNo);
        return (!!buffer && buffer.length > 0);
    }
    async fruitExists(ctx, fruitId) {
        console.log('fruitExists contract initiated');
        const buffer = await ctx.stub.getState(fruitId);
        return (!!buffer && buffer.length > 0);
    }

    // Transaction to register fruit in the blockchain
    async createFruit(ctx, fruitId, name, qty, growerName, currentOwner, currentLocationGLN, dateOfPlucking, dateOfTransfer) {
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
        asset.currentLocationGLN = currentLocationGLN;
        asset.dateOfPlucking = dateOfPlucking;
        asset.dateOfTransfer = dateOfTransfer;

        console.log('fruitExists contract initiated');
        console.log('created fruit');
        console.log(asset);
        
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(fruitId, buffer);
    }

    async ownershipTransfer(ctx, fruitId, upcomingOwner, recipientLocationGLN, date){
        const exists = await this.fruitExists(ctx, fruitId);
        if (!exists) {
            throw new Error(`The fruit ${fruitId} does not exist`);
        }
        const buffer = await ctx.stub.getState(fruitId);
        let asset = JSON.parse(buffer.toString());
        console.log('ownershipTransfer contract initiated');
        console.log('transferred ownership from ' + asset.currentOwner  + ' to ' + upcomingOwner)
        asset.currentOwner = upcomingOwner;
        asset.dateOfTransfer = date;
        asset.currentLocationGLN = recipientLocationGLN;
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

    async updateFruit(ctx, fruitId, name, qty, growerName, currentOwner, currentLocationGLN, dateOfPlucking, dateOfTransfer) {
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
        asset.dateOfTransfer = dateOfTransfer;
        asset.currentLocationGLN = currentLocationGLN;

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
        console.log('retrieveHistoryForFruitId contract initiated')
        console.info('getting history for fruitId: ' + fruitId);
        let iterator = await ctx.stub.getHistoryForKey(fruitId);
        let result = [];
        let res = await iterator.next();

        while (!res.done) {
            if (res.value) {
                // console.info(`found state update with value: ${res.value.value.toString('utf8')}`);
                const obj = JSON.parse(res.value.value.toString('utf8'));
                result.push(obj);
            }
            res = await iterator.next();
        }
        await iterator.close();
        console.log(result);
        return result;
    }

}

module.exports = FruitContract;
