import { Formatter } from "@/utils/formatter";
import { inject } from "vue";
import { Vue } from "vue-class-component";

export class NetFlowVue extends Vue {
    private $gAuth: any;
    protected Vue3GoogleOauth: any = inject("Vue3GoogleOauth");
    protected formatter = Formatter;

    getAccessToken() {
        return this.$gAuth.instance.currentUser.get().getAuthResponse().access_token;
    }
}