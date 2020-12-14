
import router from '@/router';
import axios, { AxiosResponse } from "axios";
axios.defaults.baseURL = "http://localhost:3000";

export class AccountService {



    async getAccount() {
        axios.interceptors.response.use(res => {
            return res;
        }, function (error) {
            debugger;
            console.log(error)
            // router.replace(response)
        })
        const response = axios.get("/user", {}).then(data=>console.log(data)).catch(error => console.error(error)); // todo move to /api/user
        return response;
    }

}