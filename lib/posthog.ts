import { PostHog } from 'posthog-node';

let posthogClient: PostHog | null = null;

export function getPostHogClient(): PostHog | null {
  // Only initialize on server-side with API key
  if (typeof window === 'undefined' && process.env.POSTHOG_API_KEY) {
    if (!posthogClient) {
      posthogClient = new PostHog(process.env.POSTHOG_API_KEY, {
        host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      });
    }
    return posthogClient;
  }
  return null;
}

export async function trackEvent(distinctId: string, event: string, properties?: Record<string, any>) {
  const client = getPostHogClient();
  if (client) {
    client.capture({
      distinctId,
      event,
      properties,
    });
  }
}

export async function identifyUser(distinctId: string, properties: Record<string, any>) {
  const client = getPostHogClient();
  if (client) {
    client.identify({
      distinctId,
      properties,
    });
  }
}
