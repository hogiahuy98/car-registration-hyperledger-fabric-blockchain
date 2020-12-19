/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Contract, Context } from "fabric-contract-api";
import { User } from "./User";



export class UserContract extends Contract {

    constructor(){
        super('User');
    }

    // 0: UID, 1: password, 2:fullName, 3: phoneNumber, 4: dateOfBirth, 5: ward, 6: identityCardNumber, 7: role
    public async createUser(ctx: Context, userAsString: string) {
        console.log('START========CREATE-USER===========');
        const user: User = JSON.parse(userAsString);
        user.verified = user.verifyPolice ? true : false;
        user.createTime = new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString();
        user.updateTime = new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString();
        await ctx.stub.putState(user.id, Buffer.from(JSON.stringify(user)));
        console.log("END========CREATE-USER===========");
    }

    public async verifyUser(ctx: Context, userId: string) {
        const policeId = this.getUserId(ctx);
        const userAsBytes = await ctx.stub.getState(userId);
        const user: User = JSON.parse(userAsBytes.toString());
        user.verified = true;
        user.verifyPolice = policeId;
        user.updateTime = new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString();
        await ctx.stub.putState(user.id, Buffer.from(JSON.stringify(user)));
        return ctx.stub.getTxID();
    }

    public async changePassword(ctx: Context, userId: string, newPassword: string) {
        const userAsBytes = await ctx.stub.getState(userId);
        const user: User = JSON.parse(userAsBytes.toString());
        user.password = newPassword;
        await ctx.stub.putState(user.id, Buffer.from(JSON.stringify(user)));
        return ctx.stub.getTxID();
    }

    public async updateUser(ctx: Context, userAsString: string){
        console.log("======START=UPDATE=USER=======");
        const payload: User = JSON.parse(userAsString);
        const userAsBytes: Uint8Array= await ctx.stub.getState(payload.id);
        if (!userAsBytes || userAsBytes.length === 0){
            throw new Error('wrong UID');
        }
        const currentUser: User = JSON.parse(userAsBytes.toString());
        const modifyUser: User = {...currentUser, ...payload};
        modifyUser.updateTime = new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString();
        await ctx.stub.putState(modifyUser.id, Buffer.from(JSON.stringify(modifyUser)));
        return ctx.stub.getTxID();
    }


    public async readUserByUID(ctx: Context, key: string): Promise<string> {
        const userAsBytes = await ctx.stub.getState(key);
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`Cannot find any user has ${key} key`);
        }
        return userAsBytes.toString();
    }


    public async queryUserByPhoneNumber(ctx: Context, phoneNumber: string): Promise<string>{
        const queryString: any = {};
        queryString.selector = {};
        queryString.selector.phoneNumber = phoneNumber;
        const queryResult = await this.getQueryResultForQueryString(ctx, JSON.stringify(queryString));   
        return queryResult;
    }

    private getUserId(ctx: Context): string {
        const rs = ctx.clientIdentity.getID();
        const find = rs.match(/[A-Za-z0-9_-]{22}/);
        if(find === null) return 'admin';
        return find![0];
    }

    public async getQueryResultForQueryString(ctx: Context, queryString: string): Promise<string> {

		let resultsIterator = await ctx.stub.getQueryResult(queryString);
		let results = await this.getAllResults(resultsIterator, false);

		return JSON.stringify(results);
	}


    public async getAllResults(iterator, isHistory) {
		let allResults = [];
		let res = await iterator.next();
		while (!res.done) {
			if (res.value && res.value.value.toString()) {
				let jsonRes: any = {};
				console.log(res.value.value.toString('utf8'));
				if (isHistory && isHistory === true) {
					jsonRes.TxId = res.value.tx_id;
					jsonRes.Timestamp = res.value.timestamp;
					try {
						jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
					} catch (err) {
						console.log(err);
						jsonRes.Value = res.value.value.toString('utf8');
					}
				} else {
					jsonRes.Key = res.value.key;
					try {
						jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
					} catch (err) {
						console.log(err);
						jsonRes.Record = res.value.value.toString('utf8');
					}
				}
				allResults.push(jsonRes);
			}
			res = await iterator.next();
		}
		iterator.close();
		return allResults;
	}


    public async readHistoryOfUser(ctx: Context, userId: string) {
        const history = await ctx.stub.getHistoryForKey(userId);
    }


    public paramsToUser(params: string[]): User{
        return {
            id: params[0],
            password: params[1],
            fullName: params[2],
            phoneNumber: params[3],
            dateOfBirth: params[4],
            address: params[5],
            identityCardNumber: params[6],
            role: params[7],
            docType: 'user',
        }
    } 


    public async initLedger(ctx: Context) {

        const police: User = {
            id: "CSGT",
            fullName: "Phạm Văn Cảnh",
            address: "",
            dateOfBirth: "TEST",
            identityCardNumber: "385743821",
            role: "police",
            password: "password",
            createTime: new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString(),
            updateTime: new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString(),
            phoneNumber: "cs-0917387922",
            docType: 'user'
        };

        const user: User = {
            id: "iijfsuwbzosdbdsj",
            fullName: "Hồ Gia Huy",
            address: "Ninh Kieu",
            dateOfBirth: new Date('10/01/1998').toString(),
            identityCardNumber: "385752739",
            role: "citizen",
            password: "password",
            createTime: new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString(),
            updateTime: new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString(),
            phoneNumber: "cs-0942070334",
            docType: 'user'
        };

        await ctx.stub.putState(police.id, Buffer.from(JSON.stringify(police)));
        await ctx.stub.putState(user.id, Buffer.from(JSON.stringify(user)));
    }


}
