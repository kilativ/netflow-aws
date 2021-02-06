import axios from "axios";
import { Transaction } from "plaid";
import { NetFlowUser } from '../../../shared/models/account-dto'
import { SnapshotDto } from '../../../shared/models/snapshot-dto';
import { NetflowTransaction } from "../../../shared/models/netflow-transaction";
import moment from "moment";

axios.defaults.baseURL = process.env.VUE_APP_BASE_URL ?? "http://localhost:3000";

export class AccountService {

    async addBankAccountToUser(accessToken: string, plaidAccessToken: string) {
        axios.interceptors.response.use(res => { // todo make this global
            return res;
        }, function (error) {
            console.log(error)
        })

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
        axios.interceptors.response.use(res => { // todo make this global
            return res;
        }, function (error) {
            console.log(error)
        })

        const response = await axios.post<NetFlowUser>("/s/api/user", null, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return response.data;
    }

    async getUserAccount(accessToken: string) {
        axios.interceptors.response.use(res => { // todo make this global
            return res;
        }, function (error) {
            console.log(error)
        })

        const response = await axios.get<NetFlowUser>("/s/api/user", {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return response.data;
    }

    async getAccountTransactions(accessToken: string, accountId: string): Promise<Transaction[]> {
        axios.interceptors.response.use(res => { // todo make this global
            return res;
        }, function (error) {
            console.log(error)
        })

        const response = await axios.get(`/s/api/account/${accountId}/transactions`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return response.data;
    }

    async getUserTransactions(accessToken: string, startDate: Date, endDate: Date, searchTerm: string): Promise<NetflowTransaction[]> {
        axios.interceptors.response.use(res => { // todo make this global
            return res;
        }, function (error) {
            console.log(error)
        })


        const response = await axios.get(`/s/api/user/transactions?startDate=${moment(startDate).format('YYYY-MM-DD')}&endDate=${moment(endDate).format('YYYY-MM-DD')}&searchTerm=${searchTerm}`, {
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

    async fetchBankTransaction(accessToken: string, bankId: string) {
        axios.interceptors.response.use(res => { 
            return res;
        }, function (error) {
            console.log(error)
        })

        const response = await axios.post<string>(`/s/api/bank/${bankId}/fetch-transactions`,
            {}
            , {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
        return response.data;
    }


}