// src/hooks/use-zone.ts
import { useState, useEffect } from 'react';
import { zoneService } from 'src/services/zone.service';
import type { IZone, CreateZoneDto, UpdateZoneDto } from 'src/types/zone';

export function useZone(id?: string, lang?: string) {
  const [zone, setZone] = useState<IZone | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadZone = async (language?: string) => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await zoneService.getZone(id, language || lang);
      setZone(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load zone');
      console.error('Error loading zone:', err);
    } finally {
      setLoading(false);
    }
  };

  const createZone = async (data: CreateZoneDto) => {
    try {
      setLoading(true);
      setError(null);
      const result = await zoneService.createZone(data);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create zone');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateZone = async (data: UpdateZoneDto) => {
    if (!id) throw new Error('ID is required for update');
    
    try {
      setLoading(true);
      setError(null);
      const result = await zoneService.updateZone(id, data);
      setZone(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update zone');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadZone();
    }
  }, [id, lang]);

  return {
    zone,
    loading,
    error,
    loadZone,
    createZone,
    updateZone,
  };
}
