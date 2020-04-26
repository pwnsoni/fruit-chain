/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class FruitContract extends Contract {

    async fruitExists(ctx, fruitId) {
        const buffer = await ctx.stub.getState(fruitId);
        return (!!buffer && buffer.length > 0);
    }

    async createFruit(ctx, fruitId, value) {
        const exists = await this.fruitExists(ctx, fruitId);
        if (exists) {
            throw new Error(`The fruit ${fruitId} already exists`);
        }
        const asset = { value };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(fruitId, buffer);
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

    async updateFruit(ctx, fruitId, newValue) {
        const exists = await this.fruitExists(ctx, fruitId);
        if (!exists) {
            throw new Error(`The fruit ${fruitId} does not exist`);
        }
        const asset = { value: newValue };
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

}

module.exports = FruitContract;
