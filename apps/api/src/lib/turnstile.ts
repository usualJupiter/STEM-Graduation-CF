const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

export async function verifyTurnstile(
  secret: string,
  token: string,
  remoteIp: string | null,
): Promise<boolean> {
  if (!token) return false
  const body = new URLSearchParams()
  body.append("secret", secret)
  body.append("response", token)
  if (remoteIp) body.append("remoteip", remoteIp)

  const res = await fetch(VERIFY_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  })
  if (!res.ok) return false
  const json = (await res.json()) as { success?: boolean }
  return json.success === true
}
