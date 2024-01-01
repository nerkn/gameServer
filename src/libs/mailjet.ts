import Elysia, { Static, t } from "elysia";

import { envConfig } from "@/envConfig";

export const mailjet = new Elysia().derive(() => {
  return {
    async sendJetMail(to: string, msg: string, Subject = "Win to Loose") {
      return await fetch("https://api.mailjet.com/v3.1/send", {
        method: "POST",
        headers: { Authorization: "Basic " + envConfig.MAILJET_b64 },
        body: JSON.stringify({
          Messages: [
            {
              From: {
                Email: "hello@loserix.com",
                Name: "LoserIX",
              },
              To: [
                {
                  Email: to,
                },
              ],
              Subject,
              HTMLPart: msg,
            },
          ],
        }),
      })
        .then((r) => r.json())
        .catch(console.log);
    },
  };
});

/*
echo -n "username:password" | base64 -w0
	--user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
	https://api.mailjet.com/v3.1/send \
	-H 'Content-Type: application/json' \
	}'
    */
