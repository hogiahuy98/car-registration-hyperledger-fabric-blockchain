/*
 * SPDX-License-Identifier: Apache-2.0
 */

export class User {

    public id: string;
    public fullName: string;
    public dateOfBirth: string;
    public identityCardNumber: string;
    public placeOfIdentity?: string;
    public dateOfIdentity?:string;
    public phoneNumber: string;
    public role: string;
    public password: string;
    public address?: string;
    public createTime?: string;
    public updateTime?: string;
    public email?: string
    public docType: string;
    public verifyPolice?: string;
    public verified?: boolean;
    
}