import axios from "axios";
import { NetFlowUser } from '../../../shared/models/account-dto'
import { SnapshotBalance } from '../../../shared/models/snapshot-dto';

axios.defaults.baseURL = "http://localhost:3000";

export class AccountService {

    async getUserAccount(accessToken: string) {
        axios.interceptors.response.use(res => { // todo make this global
            return res;
        }, function (error) {
            console.log(error)
        })

        const response = await axios.get<NetFlowUser>("/s/api/user", {headers: {
            'Authorization': `Bearer ${accessToken}`
            }});
        return response.data;
    }

    async getAccountTransactions(accessToken: string, accountId: string) {
        axios.interceptors.response.use(res => { // todo make this global
            return res;
        }, function (error) {
            console.log(error)
        })

        const response = await axios.get(`/s/api/transactions/${accountId}`, {headers: {
            'Authorization': `Bearer ${accessToken}`
            }});
        return response.data;
    }

    async getAccountSnapshot(accessToken: string , accountId: string): Promise<SnapshotBalance[]> {
        const response =  await axios.get(`/s/api/snapshot/${accountId}`,{headers: {
            'Authorization': `Bearer ${accessToken}`
            }});
        return response.data;
    }

}