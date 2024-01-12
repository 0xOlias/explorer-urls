import * as chains from 'viem/chains'

const now = Math.floor(Date.now() / 1000)

const latestBlockParams = new URLSearchParams({
  module: "block",
  action: "getblocknobytime",
  timestamp: String(now),
  closest: "before"
});

const results: { [chainName: string]: { [explorerName: string]: string } } = {}

for (const [chainKey, chain] of Object.entries(chains)) {

  const explorers = Object.entries(chain.blockExplorers ?? {})

  for (const [explorerName, explorer] of explorers) {
    const url = new URL(explorer.url)

    let apiBaseUrl = 'not found'

    const nameGuessOne = chain.name.replace(new RegExp(' ', 'g'), '')
    const nameGuessTwo = chainKey.replace(new RegExp(' ', 'g'), '')

    const prefixGuesses = [
      "api-",
      "api.",
      `api-${nameGuessOne}.`,
      `api.${nameGuessOne}.`,
      `api-${nameGuessTwo}.`,
      `api.${nameGuessTwo}.`
    ]
    const suffixGuesses = ["/api", ""]
    const guesses = suffixGuesses
      .map(suffix => prefixGuesses
      .map(prefix => [prefix, suffix]))
      .flat()
      .map(([prefix, suffix], i) => [i, prefix, suffix])

    console.log(`${chain.name}\n  explorer: ${explorerName}`)

    for (const [i, prefix, suffix] of guesses) {
      console.log(`  attempt: ${i}`)
      
      try {
        const guessUrl = new URL(`${url.protocol}//${prefix}${url.host}${suffix}?${latestBlockParams.toString()}`)
        const guessBaseUrl = guessUrl.href.split("?")[0]
        console.log(`    guess: ${guessBaseUrl}`)

        const response = await fetch(guessUrl);
        const json = await response.json() as { status: string; result: string; message: string; }
        console.log(response.status)
        if (response.status === 200 && json.status === "1") {
          console.log('    status: success')
          apiBaseUrl = guessBaseUrl
          break
        }
      } catch (e) {
        console.log('    status: failed')
      }
    }

    (results[chain.name] ||= {})[explorerName] = apiBaseUrl
  }
}

console.log(results)

