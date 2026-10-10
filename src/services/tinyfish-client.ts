
import { env } from "../config/env.js";

const TINYFISH_SEARCH_URL = "https://api.search.tinyfish.ai";

export async function tinyfishSearch(query: string): Promise<unknown> {
    if (!query.trim()) {
        throw new Error("TinyFish search query cannot be empty");
    }

    const url = `${TINYFISH_SEARCH_URL}?query=${encodeURIComponent(query)}`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "X-API-Key": env.tinyfishApiKey,
            Accept: "application/json",
        },
        signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            `TinyFish error ${response.status} ${response.statusText}: ${errorText}`,
        );
    }

    return (await response.json()) as unknown;
}
