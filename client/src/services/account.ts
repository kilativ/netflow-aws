import axios from "axios";
import { Transaction } from "plaid";
import { NetFlowUser } from '../../../shared/models/account-dto'
import { SnapshotDto } from '../../../shared/models/snapshot-dto';
import {UpdateCounts} from '../../../shared/models/update-counts-dto'
import { NetflowTransaction } from "../../../shared/models/netflow-transaction";
import dayjs from "dayjs";

axios.defaults.baseURL = process.env.VUE_APP_BASE_URL;

export class AccountService {

    async addBankAccountToUser(accessToken: string, plaidAccessToken: string) {
        const response = await axios.post<string>('/s/api/user/account',
            { public_token: plaidAccessToken }
            , {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
        return response.data;
    }

    async addUserAccount(accessToken: string) {
        const response = await axios.post<NetFlowUser>("/s/api/user", null, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return response.data;
    }

    async getUserAccount(accessToken: string) {
        const response = await axios.get<NetFlowUser>("/s/api/user", {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return response.data;
    }

    async getAccountTransactions(accessToken: string, accountId: string): Promise<Transaction[]> {
        const response = await axios.get(`/s/api/account/${accountId}/transactions`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return response.data;
    }

    async getUserTransactions(accessToken: string, startDate: Date, endDate: Date, searchTerm: string): Promise<NetflowTransaction[]> {
        console.log(axios.defaults.baseURL);
        console.log(process.env.VUE_APP_BASE_URL);
        console.log(process.env);

        const response = await axios.get(`/s/api/user/transactions?startDate=${dayjs(startDate).format('YYYY-MM-DD')}&endDate=${dayjs(endDate).format('YYYY-MM-DD')}&searchTerm=${searchTerm}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return response.data;
    }

    async getAccountSnapshot(accessToken: string, accountId: string): Promise<SnapshotDto> {
        const response = await axios.get(`/s/api/snapshot/${accountId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return response.data;
    }

    async fetchBankTransaction(accessToken: string, bankId: string): Promise<UpdateCounts> {
        return new Promise((resolve, reject) => {
            axios.post<object>(`/s/api/bank/${bankId}/fetch-transactions`,
            {}
            , {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'content-type': "application/application.json"
                }
            }).then(response=> resolve(response.data as UpdateCounts)).catch(response => 
                {
                    console.error(response);
                    reject(response);
                })
        })
    }


}