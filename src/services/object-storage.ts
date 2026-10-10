
import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucket = process.env.S3_BUCKET_NAME;
const endpoint = process.env.S3_ENDPOINT;
const region = process.env.S3_REGION;
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

if (
    !bucket ||
    !endpoint ||
    !region ||
    !accessKeyId ||
    !secretAccessKey
) {
    throw new Error(
        "Backblaze B2 environment variables are missing",
    );
}

const s3 = new S3Client({
    region,
    endpoint,
    forcePathStyle: false,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

export interface UploadObjectInput {
    key: string;
    body: Buffer | Uint8Array;
    contentType: string;
}

export async function uploadObject(
    input: UploadObjectInput,
) {
    await s3.send(
        new PutObjectCommand({
            Bucket: bucket,
            Key: input.key,
            Body: input.body,
            ContentType: input.contentType,
        }),
    );

    return {
        key: input.key,
        bucket,
    };
}

export async function createDownloadUrl(
    key: string,
    expiresInSeconds = 300,
) {
    if (
        !Number.isInteger(expiresInSeconds) ||
        expiresInSeconds < 1 ||
        expiresInSeconds > 604800
    ) {
        throw new Error(
            "Download URL expiry must be between 1 and 604800 seconds",
        );
    }

    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
    });

    return getSignedUrl(s3, command, {
        expiresIn: expiresInSeconds,
    });
}

export async function deleteObject(key: string) {
    await s3.send(
        new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
        }),
    );

    return {
        key,
        deleted: true,
    };
}
