/* Hält den Mailversand lokal: keine Anfrage verlässt die Maschine. */
const echt = globalThis.fetch
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input?.url ?? String(input)
  if (url.includes("api.resend.com")) {
    console.log("[no-mail] abgefangen:", url)
    return new Response(JSON.stringify({ id: "lokal-abgefangen" }), {
      status: 200, headers: { "Content-Type": "application/json" },
    })
  }
  return echt(input, init)
}
