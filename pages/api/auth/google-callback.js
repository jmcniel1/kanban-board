import { google } from "googleapis";

// Google redirects here after the user authorizes.
// Exchanges the code for tokens and displays the refresh token to copy.
export default async function handler(req, res) {
  const { code, error } = req.query;

  if (error) {
    return res.status(400).send(`
      <h2 style="font-family:sans-serif;color:#c00">Authorization denied</h2>
      <p style="font-family:sans-serif">Google returned: <code>${error}</code></p>
      <p style="font-family:sans-serif"><a href="/api/auth/google">Try again</a></p>
    `);
  }

  if (!code) {
    return res.status(400).send("Missing authorization code.");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google-callback`
  );

  let tokens;
  try {
    const result = await oauth2Client.getToken(code);
    tokens = result.tokens;
  } catch (err) {
    return res.status(500).send(`
      <h2 style="font-family:sans-serif;color:#c00">Token exchange failed</h2>
      <pre style="font-family:monospace;background:#f5f5f5;padding:12px;border-radius:6px">${err.message}</pre>
      <p style="font-family:sans-serif"><a href="/api/auth/google">Try again</a></p>
    `);
  }

  if (!tokens.refresh_token) {
    return res.status(400).send(`
      <h2 style="font-family:sans-serif;color:#c00">No refresh token returned</h2>
      <p style="font-family:sans-serif">
        This usually means you've authorized this app before and Google won't issue a new refresh token.
        <br><br>
        Fix: Go to <a href="https://myaccount.google.com/permissions" target="_blank">Google Account Permissions</a>,
        remove access for this app, then <a href="/api/auth/google">try again</a>.
      </p>
    `);
  }

  // Show the token — user copies it into .env.local and Vercel
  res.setHeader("Content-Type", "text/html");
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Gmail Connected ✓</title>
      <style>
        body { font-family: -apple-system, sans-serif; max-width: 620px; margin: 60px auto; padding: 0 24px; color: #111; }
        h2  { font-size: 22px; margin-bottom: 8px; }
        p   { color: #555; line-height: 1.5; }
        .token-box {
          background: #f5f5f7; border: 1px solid #ddd; border-radius: 8px;
          padding: 16px; font-family: monospace; font-size: 13px;
          word-break: break-all; margin: 16px 0;
          user-select: all; cursor: text;
        }
        .step { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px 16px; margin-top: 20px; }
        .step code { background: #dcfce7; padding: 2px 5px; border-radius: 4px; font-size: 12px; }
        button {
          background: #111; color: white; border: none; padding: 10px 20px;
          border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 8px;
        }
        button:active { background: #333; }
      </style>
    </head>
    <body>
      <h2>✅ Gmail authorized!</h2>
      <p>Copy the refresh token below and add it to two places:</p>

      <div class="token-box" id="token">${tokens.refresh_token}</div>
      <button onclick="navigator.clipboard.writeText('${tokens.refresh_token}').then(()=>this.textContent='Copied ✓')">
        Copy token
      </button>

      <div class="step">
        <strong>1. In your <code>.env.local</code></strong> — paste as:<br><br>
        <code>GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}</code>
      </div>

      <div class="step">
        <strong>2. In Vercel</strong> — go to your project →
        <strong>Settings → Environment Variables</strong> → add:<br><br>
        Key: <code>GOOGLE_REFRESH_TOKEN</code><br>
        Value: <em>(the token above)</em>
      </div>

      <p style="margin-top:24px;color:#888;font-size:13px">
        You never need to do this again — the refresh token works indefinitely
        and the app will use it from Vercel from now on.
      </p>
    </body>
    </html>
  `);
}
