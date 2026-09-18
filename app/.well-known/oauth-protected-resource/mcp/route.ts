import { protectedResourceMetadata } from '@/lib/cognitum-oauth';

export function GET(request: Request) {
  return protectedResourceMetadata(request);
}
