import { z } from 'zod';

export const versionConfig = z
  .object({
    commit: z.string().optional(),
    environment: z.enum(['develop', 'staging', 'master']),
    release: z.string().optional(),
    origin: z.string().url().optional(),
  })
  .parse({
    commit: process.env.NEXT_PUBLIC_VERSION_COMMIT,
    environment: process.env.NEXT_PUBLIC_VERSION_ENVIRONMENT,
    release: process.env.NEXT_PUBLIC_VERSION_RELEASE,
    origin: process.env.NEXT_PUBLIC_VERSION_ORIGIN,
  });

export const walletConnectProjectId = z
  .string()
  .parse(process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID);
