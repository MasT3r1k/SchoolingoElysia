import { generateRandomString } from '@core/utils/crypto.util';

export function randomString(length: number): string {
    return generateRandomString(length);
}