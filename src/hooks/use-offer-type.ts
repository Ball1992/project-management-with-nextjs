import { useState, useEffect } from 'react';
import { offerTypeService } from 'src/services/offer-type.service';
import type { IOfferType } from 'src/types/offer-type';

export function useOfferType(id?: string) {
  const [offerType, setOfferType] = useState<IOfferType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchOfferType = async () => {
      try {
        setLoading(true);
        const data = await offerTypeService.getOfferType(id);
        setOfferType(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchOfferType();
  }, [id]);

  return { offerType, loading, error };
}

export function useOfferTypes(params?: { page?: number; limit?: number; search?: string; status?: string }) {
  const [offerTypes, setOfferTypes] = useState<IOfferType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchOfferTypes = async () => {
      try {
        setLoading(true);
        const response = await offerTypeService.getOfferTypes(params);
        setOfferTypes(response.data);
        setTotalCount(response.total || response.data.length);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchOfferTypes();
  }, [params?.page, params?.limit, params?.search, params?.status]);

  return { offerTypes, loading, error, totalCount };
}
