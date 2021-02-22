<template>
  <div class="plaid-link-wrapper">
    <div class="text-lg text-red-800">
      Use <i class="fa fa-recycle"></i>Relink ONLY when have Plaid Error "the login details of this item have changed"

    </div>
    <div class="flex flex-col">
      <div v-for="bank in banks" :key="bank.id" class="flex flex-row">
        <div>{{ bank.nickname }}</div>
        <div class="cursor-pointer underline px-2" @click="relink(bank.id)">
          <i class="fa fa-recycle"></i>Relink
        </div>
      </div>
    </div>
    <button class="plaid-link-button" @click="handleOnClick">
      Add another bank
    </button>
    <br />
    <span>link token: {{ linkToken.link_token }}</span>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Emit, InjectReactive, Prop, Watch } from "vue-property-decorator";
import axios from "axios";
import { LinkToken } from "../models/LinkToken";
import { NetFlowVue } from "./NetFlowBaseVue";
import { AccountService } from "../services/account";
import { NetFlowPlaidBankLink } from "../../../shared/models/account-dto";

// axios.defaults.baseURL = "http://localhost:3000";

declare global {
  interface Window {
    Plaid: any;
    linkHandler: any;
  }
}

@Options({
  emits: ["event", "exit", "success"],
})
export default class PlaidLink extends NetFlowVue {
  private linkToken: LinkToken = new LinkToken();

  @Prop({ default: "https://cdn.plaid.com/link/v2/stable/link-initialize.js" })
  readonly plaidUrl!: string;
  @Prop({ default: "sandbox" }) readonly env!: string;
  @Prop(String) readonly institution!: string;
  @Prop(Boolean) readonly selectAccount!: boolean;
  @Prop(String) readonly token!: string;
  @Prop({ type: [String, Array], default: ["transactions"] }) readonly product:
    | string
    | Array<string> = "";
  @Prop(String) readonly clientName!: string;
  @Prop(String) readonly webhook!: string;
  banks: NetFlowPlaidBankLink[] = [];

  created() {
    this.loadScript(this.plaidUrl)
      .then(this.onScriptLoaded)
      .catch(this.onScriptError);
  }

  beforeUnmount() {
    if (window.linkHandler) {
      window.linkHandler.exit();
    }
  }

  loadScript(src: string) {
    return new Promise(function (resolve, reject) {
      if (document.querySelector('script[src="' + src + '"]')) {
        resolve(true);
        return;
      }

      const el = document.createElement("script");

      el.type = "text/javascript";
      el.async = true;
      el.src = src;

      el.addEventListener("load", resolve);
      el.addEventListener("error", reject);
      el.addEventListener("abort", reject);

      document.head.appendChild(el);
    });
  }

  onScriptError(error: string) {
    console.error(
      "There was an issue loading the link-initialize.js script",
      error
    );
  }

  onScriptLoaded() {
    console.log("script loaded");
  }

  @Emit("event")
  onEvent() {console.log('event')}

  @Emit("exit")
  onExit() {console.log('exit')}

  @Emit("success")
  onSuccess(publicToken: string) {
    console.log('on success');
    console.log(publicToken);
  }

  async handleOnClick() {
    const response = await axios.post(
      "/api/create_link_token",
      {},
      {
        headers: { Authorization: `Bearer ${this.getAccessToken()}` },
      }
    );
    this.linkToken = response.data;

    const institution = this.institution || null;
    window.linkHandler = window.Plaid.create({
      clientName: this.clientName,
      env: this.env,
      onExit: this.onExit,
      onEvent: this.onEvent,
      onSuccess: this.onSuccess,
      product: this.product,
      selectAccount: this.selectAccount,
      token: this.linkToken.link_token,
      webhook: this.webhook,
    });
    if (window.linkHandler) {
      window.linkHandler.open(institution || null);
    }
  }

  async relink(bankId: string) {
    const response = await axios.post(
      "/api/create_relink_token",
      { bankId: bankId },
      {
        headers: { Authorization: `Bearer ${this.getAccessToken()}` },
      }
    );
    this.linkToken = response.data.link_token;
    // Initialize Link with the token parameter
    // set to the generated link_token for the Item
    const linkHandler = window.Plaid.create({
      token: this.linkToken,
      onSuccess: (public_token: any, metadata: any) => {
        // You do not need to repeat the /item/public_token/exchange
        // process when a user uses Link in update mode.
        // The Item's access_token has not changed.
      },
      onExit: (err: any, metadata: any) => {
        // The user exited the Link flow.
        if (err != null) {
          console.error(err);
          // The user encountered a Plaid API error prior
          // to exiting.
        }
        // metadata contains the most recent API request ID and the
        // Link session ID. Storing this information is helpful
        // for support.
      },
    });
    if (linkHandler) {
      linkHandler.open(this.institution);
    }
  }

  @InjectReactive() isInit!: boolean;
  @Watch("isInit", { immediate: true }) onIsInitChanged() {
    if (this.isInit) {
      this.loadData();
    }
  }

  async loadData() {
    const user = await new AccountService().getUserAccount(
      this.getAccessToken()
    );
    this.banks = user.banks;
  }
}
</script>
