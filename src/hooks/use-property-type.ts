// src/hooks/use-property-type.ts
import { useState, useEffect } from 'react';
import { propertyTypeService } from 'src/services/property-type.service';
import type { IPropertyType, CreatePropertyTypeDto, UpdatePropertyTypeDto } from 'src/types/property-type';

export function usePropertyType(id?: string, lang?: string) {
  const [propertyType, setPropertyType] = useState<IPropertyType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPropertyType = async (language?: string) => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await propertyTypeService.getPropertyType(id, language || lang);
      setPropertyType(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load property type');
      console.error('Error loading property type:', err);
    } finally {
      setLoading(false);
    }
  };

  const createPropertyType = async (data: CreatePropertyTypeDto) => {
    try {
      setLoading(true);
      setError(null);
      const result = await propertyTypeService.createPropertyType(data);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create property type');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePropertyType = async (data: UpdatePropertyTypeDto) => {
    if (!id) throw new Error('ID is required for update');
    
    try {
      setLoading(true);
      setError(null);
      const result = await propertyTypeService.updatePropertyType(id, data);
      setPropertyType(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update property type');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadPropertyType();
    }
  }, [id, lang]);

  return {
    propertyType,
    loading,
    error,
    loadPropertyType,
    createPropertyType,
    updatePropertyType,
  };
}
