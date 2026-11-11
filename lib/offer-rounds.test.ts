import { filterCurrentRoundOffers, isCurrentRoundOffer } from './offer-rounds';

describe('isCurrentRoundOffer', () => {
  it('is true for an offer created after the most recent republish', () => {
    const serviceRequest = {
      createdAt: '2026-01-01T00:00:00.000Z',
      republishedAt: '2026-01-05T00:00:00.000Z',
    };
    expect(isCurrentRoundOffer({ createdAt: '2026-01-06T00:00:00.000Z' }, serviceRequest)).toBe(
      true
    );
  });

  it('is false for an offer created before the most recent republish (previous round)', () => {
    const serviceRequest = {
      createdAt: '2026-01-01T00:00:00.000Z',
      republishedAt: '2026-01-05T00:00:00.000Z',
    };
    expect(isCurrentRoundOffer({ createdAt: '2026-01-02T00:00:00.000Z' }, serviceRequest)).toBe(
      false
    );
  });

  it('falls back to createdAt when the request has never been republished', () => {
    const neverRepublished = { createdAt: '2026-01-01T00:00:00.000Z', republishedAt: null };
    expect(
      isCurrentRoundOffer({ createdAt: '2026-01-02T00:00:00.000Z' }, neverRepublished)
    ).toBe(true);
  });

  it('is false for an offer created exactly at the round boundary (not strictly after)', () => {
    const serviceRequest = { createdAt: '2026-01-01T00:00:00.000Z', republishedAt: null };
    expect(
      isCurrentRoundOffer({ createdAt: '2026-01-01T00:00:00.000Z' }, serviceRequest)
    ).toBe(false);
  });

  it('treats the offer as current round if the service request is missing', () => {
    expect(isCurrentRoundOffer({ createdAt: '2020-01-01T00:00:00.000Z' }, undefined)).toBe(true);
    expect(isCurrentRoundOffer({ createdAt: '2020-01-01T00:00:00.000Z' }, null)).toBe(true);
  });
});

describe('filterCurrentRoundOffers', () => {
  const serviceRequest = {
    createdAt: '2026-01-01T00:00:00.000Z',
    republishedAt: '2026-01-05T00:00:00.000Z',
  };

  it('keeps only offers from the current round, across a mix of old and new', () => {
    const offers = [
      { id: 'round-1-countered', createdAt: '2026-01-02T00:00:00.000Z' },
      { id: 'round-1-rejected', createdAt: '2026-01-03T00:00:00.000Z' },
      { id: 'round-2-pending', createdAt: '2026-01-06T00:00:00.000Z' },
    ];

    const result = filterCurrentRoundOffers(offers, serviceRequest);

    expect(result.map((o) => o.id)).toEqual(['round-2-pending']);
  });

  it('returns an empty array for undefined/empty offers', () => {
    expect(filterCurrentRoundOffers(undefined, serviceRequest)).toEqual([]);
    expect(filterCurrentRoundOffers([], serviceRequest)).toEqual([]);
  });

  it('returns everything unfiltered when there is no republish and request predates all offers', () => {
    const neverRepublished = { createdAt: '2020-01-01T00:00:00.000Z', republishedAt: null };
    const offers = [
      { id: '1', createdAt: '2026-01-01T00:00:00.000Z' },
      { id: '2', createdAt: '2026-01-02T00:00:00.000Z' },
    ];

    expect(filterCurrentRoundOffers(offers, neverRepublished).map((o) => o.id)).toEqual([
      '1',
      '2',
    ]);
  });
});
