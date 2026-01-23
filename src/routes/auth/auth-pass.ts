import { generateAuthenticationOptions, GenerateAuthenticationOptionsOpts } from "@simplewebauthn/server";
import { app } from "../../..";
import Elysia from "elysia";
import { ip } from "elysia-ip";
import { rateLimit } from "elysia-rate-limit";

const elysiaApp = new Elysia()
  .get('/auth-passkey', async ({ request }: any) => {
    const opts: GenerateAuthenticationOptionsOpts = {
      timeout: 60000,
      userVerification: 'required',
      rpID: request.hostname,
    };

    const options = await generateAuthenticationOptions(opts);
    return options;
  })


export default elysiaApp;
