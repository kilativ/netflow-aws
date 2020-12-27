import axios from "axios";
import { NetFlowUser } from '../../../shared/models/account-dto'
import { SnapshotDto } from '../../../shared/models/snapshot-dto';

axios.defaults.baseURL = process.env.VUE_APP_BASE_URL;

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

    async getAccountSnapshot(accessToken: string , accountId: string): Promise<SnapshotDto> {
        const response =  await axios.get(`/s/api/snapshot/${accountId}`,{headers: {
            'Authorization': `Bearer ${accessToken}`
            }});
        return response.data;
    }

}