<template>
  <div class="plaid-link-wrapper">
    <div class='title'>
      <h1>Login Here</h1>
    </div>
    <button class="plaid-link-button" @click="handleOnClick">
      Open Plaid Link
    </button>
    <br />
    <span>link token: {{ linkToken.link_token }}</span>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Emit, Prop } from "vue-property-decorator";
import axios, { AxiosResponse } from "axios";
import { LinkToken } from "../models/LinkToken";

axios.defaults.baseURL = "http://localhost:3000";

declare global {
  interface Window {
    Plaid: any;
    linkHandler: any;
  }
}

@Options({
  emits: ["event", "exit", "success"],
})
export default class PlaidLink extends Vue {
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
        resolve();
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
  onEvent() {}

  @Emit("exit")
  onExit() {}

  @Emit("success")
  onSuccess(publicToken: string) {
    console.log(publicToken);
  }

  async handleOnClick() {
    const response = await axios.post("/api/create_link_token", {});
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
      window.linkHandler.open(institution);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.title {
  h1 {
    background-color: lightgray;
  }
}
</style>
