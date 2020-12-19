
import router from '@/router';
import axios, { AxiosResponse } from "axios";
axios.defaults.baseURL = "http://localhost:3000";

export class AccountService {



    async getAccount(accessToken: string) {
        axios.interceptors.response.use(res => {
            return res;
        }, function (error) {
            debugger;
            console.log(error)
            // router.replace(response)
        })
        // // const user = this.$gAuth.instance.currentUser.get();
        // console.log(user.getAuthResponse().token_type);
        // console.log(user.getAuthResponse().access_token);
        const response = axios.get("/user", {headers: {
            'Authorization': `Bearer ${accessToken}`
            }}).then(data=>console.log(data)).catch(error => console.error(error)); // todo move to /api/user
        return response;
    }

}