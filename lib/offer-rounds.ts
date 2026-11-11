/**
 * A negotiation "round" starts at a service request's most recent "Keep Searching"
 * re-broadcast (republishedAt), or at its creation if it's never been republished, and
 * lasts until the customer takes it off the market or republishes again. Offers from a
 * prior round are real history - they're just not part of the CURRENT negotiation, so a
 * re-engaged party (customer or artisan) should see a fresh start, not a continuation of
 * a round that's already over (stale counter-offer counts, old bubbles, disabled actions
 * on an already-terminal offer).
 *
 * Both apps (client-app, artisan-app) reimplement this identically since they don't share
 * a package - keep them in sync if the round boundary logic ever changes.
 */

type RoundBoundaryServiceRequest = {
  republishedAt?: string | null;
  createdAt?: string | null;
} | null | undefined;

/** True if `offer` was created after the current round started. */
export function isCurrentRoundOffer(
  offer: { createdAt: string },
  serviceRequest: RoundBoundaryServiceRequest
): boolean {
  if (!serviceRequest) return true;
  const roundStart = serviceRequest.republishedAt ?? serviceRequest.createdAt;
  if (!roundStart) return true;
  return new Date(offer.createdAt).getTime() > new Date(roundStart).getTime();
}

/** Keeps only offers belonging to the current negotiation round. */
export function filterCurrentRoundOffers<T extends { createdAt: string }>(
  offers: T[] | null | undefined,
  serviceRequest: RoundBoundaryServiceRequest
): T[] {
  if (!offers) return [];
  return offers.filter((offer) => isCurrentRoundOffer(offer, serviceRequest));
}
