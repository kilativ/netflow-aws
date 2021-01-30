import { Formatter } from "../../../shared/utils/formatter"
import { Vue } from "vue-class-component";
import { Component } from "vue-property-decorator";


export abstract class NetFlowVue extends Vue {
    public static $gAuth: any;
    public $swal: any;
    public static Vue3GoogleOauth: any;
    protected formatter = Formatter;

    getAccessToken() {
        return NetFlowVue.$gAuth.instance.currentUser.get().getAuthResponse().access_token;
    }
}