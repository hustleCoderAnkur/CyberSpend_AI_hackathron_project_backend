
import { env } from "../config/env.js";

export interface AssessmentResponse {
    success: boolean;
    message?: string;
    data?: unknown;
}

export async function runAssessmentOnFastApi(
    datasetId: string,
): Promise<AssessmentResponse> {
    const url = `${env.fastApiUrl.replace(/\/+$/, "")}/process`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({ datasetId }),
        signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            `FastAPI error: ${response.status} ${response.statusText} - ${errorText}`,
        );
    }

    return (await response.json()) as AssessmentResponse;
}
