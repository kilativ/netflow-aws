import axios from "axios";
import { NetFlowUser } from '../../../shared/models/account-dto'

axios.defaults.baseURL = "http://localhost:3000";

export class AccountService {

    async getUserAccount(accessToken: string) {
        axios.interceptors.response.use(res => { // todo make this global
            return res;
        }, function (error) {
            console.log(error)
        })

        const response = await axios.get<NetFlowUser>("/user", {headers: {
            'Authorization': `Bearer ${accessToken}`
            }});
        return response.data;
    }

}