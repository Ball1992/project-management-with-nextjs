'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import LoadingButton from '@mui/lab/LoadingButton';
import MenuItem from '@mui/material/MenuItem';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import MenuList from '@mui/material/MenuList';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Form, Field, schemaHelper } from 'src/components/hook-form';
import { Controller } from 'react-hook-form';
import { WorkspacesPopover } from 'src/layouts/components/workspaces-popover';
import { Upload } from 'src/components/upload';
import { CustomPopover } from 'src/components/custom-popover';
import { usePopover } from 'minimal-shared/hooks';
import { toast } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { penthouseService } from 'src/services/penthouse.service';
import { locationService } from 'src/services/location.service';
import { propertyTypeService } from 'src/services/property-type.service';
import { officeTypeService } from 'src/services/office-type.service';
import { languageService } from 'src/services/language.service';
import { currencyService } from 'src/services/currency.service';
import { offerTypeService } from 'src/services/offer-type.service';
import { zoneService } from 'src/services/zone.service';
import type { ILocation } from 'src/types/location';
import type { IPropertyType } from 'src/types/property-type';
import type { IOfficeType } from 'src/types/office-type';
import type { ILanguage } from 'src/types/language';
import type { ICurrency } from 'src/services/currency.service';
import type { IOfferType } from 'src/types/offer-type';
import type { IZone } from 'src/types/zone';
import type { IPenthouse } from 'src/types/penthouse';

// ----------------------------------------------------------------------

export const ListingSchema = zod
  .object({
    slug: zod
      .string()
      .min(1, { message: 'URL Alias is required!' })
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { 
        message: 'URL Alias must contain only lowercase letters, numbers, and hyphens. No spaces or special characters allowed.' 
      }),
    coverImage: schemaHelper.file().optional(),
    logoImage: schemaHelper.file().optional(),
    thumbnailImage: schemaHelper.file().optional(),
    ogImage: schemaHelper.file().optional(),
    locationId: zod.string().optional(),
    propertyTypeId: zod.string().optional(),
    officeTypeId: zod.string().optional(),
    offerTypeId: zod.string().optional(),
    zoneId: zod.string().optional(),
    status: zod.enum(['draft', 'published', 'closed']),
    publishStartDate: zod.string().optional(),
    publishEndDate: zod.string().optional(),
    isFeatured: zod.boolean().default(false),
    isPinned: zod.boolean().default(false),
    sortOrder: zod.number().default(0),
    isActive: zod.boolean().default(true),
    urlAlias: zod.string().optional(),
    listingCode: zod.string().optional(),
    unitSize: zod.number().optional(),
    rentalPrice: zod.string().optional(),
    // New fields
    bedroom: zod.number().min(0, { message: 'Bedroom must be 0 or greater' }).optional(),
    bathroom: zod.number().min(0, { message: 'Bathroom must be 0 or greater' }).optional(),
    usableAreaSqm: zod
      .string()
      .transform((val) => (val ? parseFloat(val) : undefined))
      .pipe(zod.number().optional()),
    plotSizeSqw: zod
      .string()
      .transform((val) => (val ? parseFloat(val) : undefined))
      .pipe(zod.number().optional()),
    // Translations - Title is required as per requirements
    title: zod.string().min(1, { message: 'Name is required!' }),
    description: zod.string().optional(),
    metaTitle: zod.string().optional(),
    metaDescription: zod.string().optional(),
    metaKeywords: zod.string().optional(),
    // Legacy prices (keeping for compatibility)
    salePrice: zod.number().optional(),
    rentMonthlyPrice: zod.number().optional(),
    currencyId: zod.string().optional(),
    // Project Info sections
    projectInfoTitle: zod.string().optional(),
    projectInfoDescription: zod.string().optional(),
    projectInfoContent: zod.string().optional(),
    projectInfoUnitInformation: zod.string().optional(),
    projectInfoUnitHighlight: zod.string().optional(),
    projectInfoDetail: zod.string().optional(),
    projectInfoFacilitiesSubject: zod.string().optional(),
    projectInfoFloorNumber: zod.string().optional(),
    projectInfoPropertyTypeDetail: zod.string().optional(),
    projectInfoUnitNumber: zod.string().optional(),
    projectInfoRentalCurrency: zod.string().optional(),
    projectInfoRentalPeriod: zod.string().optional(),
    projectInfoProjectSize: zod.string().optional(),
    projectInfoLayoutDetail: zod.string().optional(),
    projectInfoFacilitiesDesc: zod.string().optional(),
    projectInfoBannerImage: schemaHelper.file().optional(),
    // Neighborhood sections
    neighborhoodTitle: zod.string().optional(),
    neighborhoodDescription: zod.string().optional(),
    neighborhoodTitleHighlight: zod.string().optional(),
    neighborhoodContent: zod.string().optional(),
    neighborhoodLocationUrl: zod.string().optional(),
    neighborhoodLocationDescription: zod.string().optional(),
    neighborhoodGallery: zod.array(zod.any()).optional(),
    // Gallery sections
    galleryTourTitle: zod.string().optional(),
    galleryTourDescription: zod.string().optional(),
    galleryImages: zod.array(zod.any()).optional(),
    plansGallery: zod.array(zod.any()).optional(),
    // Location Detail field
    locationDetail: zod.string().optional(),
  })
  .catchall(zod.any()); // Allow dynamic price fields

export type ListingSchemaType = zod.infer<typeof ListingSchema>;

// ----------------------------------------------------------------------

type Props = {
  currentPenthouse?: IPenthouse;
};

export function ListingDetail({ currentPenthouse }: Props) {
  const router = useRouter();
  const publishActions = usePopover();
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    content: '',
    action: null as (() => void) | null,
  });

  const [locations, setLocations] = useState<ILocation[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<IPropertyType[]>([]);
  const [officeTypes, setOfficeTypes] = useState<IOfficeType[]>([]);
  const [offerTypes, setOfferTypes] = useState<IOfferType[]>([]);
  const [zones, setZones] = useState<IZone[]>([]);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [currencies, setCurrencies] = useState<ICurrency[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<ILanguage | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    propertie: true,
    pricing: true,
    images: true,
    seo: true,
    projectInfo: true,
    projectPlans: true,
    neighborhood: true,
    neighborhoodGallery: true,
    gallery: true,
    pageTitle: true,
    unitInfo: true,
    projectImages: true,
    moreInfo: true,
    facilities: true,
    googleMap: true,
  });

  const isEdit = !!currentPenthouse;

  // Get current translation for selected language
  const getCurrentTranslation = () => {
    if (!currentPenthouse || !selectedLanguage) return null;
    return currentPenthouse.translations?.find((t) => t.languageCode === selectedLanguage.code);
  };

  const getCurrentPrice = () => {
    if (!currentPenthouse || !selectedLanguage) return null;
    return currentPenthouse.prices?.find((p) => p.currencyCode);
  };

  const getCurrentProjectInfo = () => {
    if (!currentPenthouse || !selectedLanguage) return null;
    return currentPenthouse.projectInfo?.[0];
  };

  const getCurrentNeighborhood = () => {
    if (!currentPenthouse || !selectedLanguage) return null;
    return currentPenthouse.neighborhood?.[0];
  };

  const getCurrentGalleryTour = () => {
    if (!currentPenthouse || !selectedLanguage) return null;
    return currentPenthouse.galleryTour?.[0];
  };

  // Helper function to get price by type from API response
  const getPriceByType = (prices: any[], type: string, currencyCode: string = 'THB') => {
    const price = prices?.find((p) => p.priceType === type && p.currencyCode === currencyCode);
    return price ? parseFloat(price.price) : undefined;
  };

  // Helper function to get translation from nested structure
  const getTranslationFromNested = (item: any, languageCode: string) => {
    return item?.translations?.find((t: any) => t.languageCode === languageCode);
  };

  const defaultValues: ListingSchemaType = {
    slug: currentPenthouse?.slug || '',
    coverImage: currentPenthouse?.coverImage || null,
    logoImage: currentPenthouse?.logoImage || null,
    thumbnailImage: currentPenthouse?.thumbnailImage || null,
    ogImage: currentPenthouse?.ogImage || null,
    locationId: currentPenthouse?.locationId || '',
    propertyTypeId: currentPenthouse?.propertyTypeId || '',
    officeTypeId: currentPenthouse?.officeTypeId || '',
    offerTypeId: currentPenthouse?.offerTypeId || '',
    zoneId: currentPenthouse?.zoneId || '',
    status: currentPenthouse?.status || 'draft',
    publishStartDate: currentPenthouse?.publishStartDate || '',
    publishEndDate: currentPenthouse?.publishEndDate || '',
    isFeatured: currentPenthouse?.isFeatured || false,
    isPinned: currentPenthouse?.isPinned || false,
    sortOrder: currentPenthouse?.sortOrder || 0,
    isActive: currentPenthouse?.isActive ?? true,
    urlAlias: currentPenthouse?.slug || '',
    listingCode: '',
    unitSize: 0,
    rentalPrice: '',
    // Translations
    title: getCurrentTranslation()?.title || '',
    description: getCurrentTranslation()?.description || '',
    metaTitle: getCurrentTranslation()?.metaTitle || '',
    metaDescription: getCurrentTranslation()?.metaDescription || '',
    metaKeywords: getCurrentTranslation()?.metaKeywords || '',
    // Prices
    salePrice: 0,
    rentMonthlyPrice: undefined,
    currencyId: '',
    // Content sections
    projectInfoTitle: '',
    projectInfoDescription: '',
    projectInfoContent: '',
    neighborhoodTitle: '',
    neighborhoodDescription: '',
    neighborhoodContent: '',
    neighborhoodLocationUrl: '',
    galleryTourTitle: '',
    galleryTourDescription: '',
    galleryImages: [],
  };

  const methods = useForm<ListingSchemaType>({
    defaultValues,
    mode: 'onChange', // Enable real-time validation
  });

  const {
    handleSubmit,
    formState: { isSubmitting, isDirty, isValid, errors },
    setValue,
    watch,
    reset,
  } = methods;

  const galleryImages = watch('galleryImages') || [];
  const currentStatus = watch('status');
  const selectedOfferTypeId = watch('offerTypeId');
  
  // Watch required fields for create mode validation
  const watchedTitle = watch('title');
  const watchedSlug = watch('slug');
  
  // Check if required fields are filled for create mode
  const hasRequiredFields = !!(watchedTitle && watchedSlug);
  
  // For create mode, disable buttons if required fields are not filled or form is invalid
  // For edit mode, disable buttons if form is invalid or no changes made
  const shouldDisableButtons = isEdit 
    ? (!isValid || (!isDirty && isEdit))
    : (!isValid || !hasRequiredFields);

  // Get the selected offer type details
  const selectedOfferType = offerTypes.find((offerType) => offerType.id === selectedOfferTypeId);

  // Determine which price fields to show based on offer type
  const shouldShowSalePrice =
    !selectedOfferTypeId ||
    selectedOfferType?.code === 'for_sale' ||
    selectedOfferType?.code === 'both';
  const shouldShowRentPrice =
    !selectedOfferTypeId ||
    selectedOfferType?.code === 'for_rent' ||
    selectedOfferType?.code === 'both';

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // First, get languages and currencies (language-independent)
        const [languagesRes, currenciesRes, officeTypesRes] = await Promise.all([
          languageService.getLanguages({ limit: 100 }),
          currencyService.getCurrencies(),
          officeTypeService.getOfficeTypes(),
        ]);

        setLanguages(languagesRes.data.data);
        setOfficeTypes(officeTypesRes.data);
        setCurrencies(currenciesRes || []);

        // Get language from localStorage or use default
        const savedLanguageCode = localStorage.getItem('selectedLanguageCode');
        const savedLanguage = savedLanguageCode
          ? languagesRes.data.data.find((lang: ILanguage) => lang.code === savedLanguageCode)
          : null;

        const defaultLang =
          savedLanguage ||
          languagesRes.data.data.find((lang: ILanguage) => lang.isDefault) ||
          languagesRes.data.data[0];

        if (defaultLang) {
          setSelectedLanguage(defaultLang);
        }
      } catch (err) {
        console.error('Error fetching initial data:', err);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch language-dependent data when selectedLanguage changes
  useEffect(() => {
    if (!selectedLanguage) return;

    const fetchLanguageDependentData = async () => {
      try {
        const [locationsRes, propertyTypesRes, offerTypesRes, zonesRes] = await Promise.all([
          locationService.getLocations({ lang: selectedLanguage.code }),
          propertyTypeService.getPropertyTypes({ lang: selectedLanguage.code }),
          offerTypeService.getOfferTypes({ lang: selectedLanguage.code }),
          zoneService.getZones({ lang: selectedLanguage.code,page:1,limit:1000 }),
        ]);

        setLocations(locationsRes.data);
        setPropertyTypes(propertyTypesRes.data);
        setOfferTypes(offerTypesRes.data);
        setZones(zonesRes.data);
      } catch (err) {
        console.error('Error fetching language-dependent data:', err);
      }
    };

    fetchLanguageDependentData();
  }, [selectedLanguage]);

  // Load penthouse data with language support when editing
  useEffect(() => {
    if (isEdit && currentPenthouse && selectedLanguage && currencies.length > 0) {
      const fetchPenthouseDetail = async () => {
        try {
          setLoading(true);
          const detailedPenthouse = await penthouseService.getPenthouse(
            currentPenthouse.id,
            selectedLanguage.code
          );
          // Update form with detailed data
          const translation = detailedPenthouse.translations?.find(
            (t) => t.languageCode === selectedLanguage.code
          );

          // Handle different API response structures
          const languageCode = selectedLanguage.code || 'en';

          // Map existing prices to form fields
          const priceFieldValues: any = {};
          if (detailedPenthouse.prices) {
            console.log('Mapping prices:', detailedPenthouse.prices);
            detailedPenthouse.prices.forEach((price: any) => {
              // Use currencyCode directly from the price object
              const currencyCode = price.currencyCode;
              if (currencyCode) {
                if (price.priceType === 'for_rent') {
                  priceFieldValues[`rentPrice_${currencyCode}`] = price.price;
                  console.log(`Setting rentPrice_${currencyCode} = ${price.price}`);
                } else if (price.priceType === 'for_sale') {
                  priceFieldValues[`salePrice_${currencyCode}`] = price.price;
                  console.log(`Setting salePrice_${currencyCode} = ${price.price}`);
                }
              }
            });
          }
          console.log('Price field values:', priceFieldValues);

          // Get prices from API response format (legacy support)
          const salePrice = detailedPenthouse.prices
            ? getPriceByType(detailedPenthouse.prices, 'for_sale', 'THB')
            : undefined;
          const rentPrice = detailedPenthouse.prices
            ? getPriceByType(detailedPenthouse.prices, 'for_rent', 'THB')
            : undefined;

          // Get project info translation
          const projectInfo = detailedPenthouse.projectInfo?.[0];
          const projectInfoTranslation = projectInfo?.translations?.find(
            (t: any) => t.languageCode === languageCode
          );

          // Get neighborhood translation
          const neighborhood = detailedPenthouse.neighborhood?.[0];
          const neighborhoodTranslation = neighborhood?.translations?.find(
            (t: any) => t.languageCode === languageCode
          );

          // Get gallery tour translation
          const galleryTour = detailedPenthouse.galleryTour?.[0];
          const galleryTourTranslation = galleryTour?.translations?.find(
            (t: any) => t.languageCode === languageCode
          );

          // Get gallery images from API response
          const galleryImages = galleryTour?.gallery?.map((item: any) => item.imageUrl) || [];

          // Get plans gallery from project info
          const plansGallery = projectInfo?.plansGallery?.map((item: any) => item.imageUrl) || [];

          // Get neighborhood gallery
          const neighborhoodGallery =
            neighborhood?.gallery?.map((item: any) => item.imageUrl) || [];

          // Get existing zones data for areaId field
          const existingAreaIds =
            detailedPenthouse.zones?.map((zone: any) => zone.zoneId?.toString()) || [];

          reset({
            slug: detailedPenthouse.slug || '',
            coverImage: detailedPenthouse.coverImage || null,
            logoImage: detailedPenthouse.logoImage || null,
            thumbnailImage: detailedPenthouse.thumbnailImage || null,
            ogImage: detailedPenthouse.ogImage || null,
            locationId: detailedPenthouse.locationId || '',
            propertyTypeId: detailedPenthouse.propertyTypeId || '',
            officeTypeId: detailedPenthouse.officeTypeId || '',
            offerTypeId: detailedPenthouse.offerTypeId || '',
            status: detailedPenthouse.status || 'draft',
            publishStartDate: detailedPenthouse.publishStartDate || '',
            publishEndDate: detailedPenthouse.publishEndDate || '',
            isFeatured: detailedPenthouse.isFeatured || false,
            isPinned: detailedPenthouse.isPinned || false,
            sortOrder: detailedPenthouse.sortOrder || 0,
            isActive: detailedPenthouse.isActive ?? true,
            urlAlias: detailedPenthouse.urlAlias || detailedPenthouse.slug || '',
            listingCode: detailedPenthouse.listingCode || '',
            unitSize: detailedPenthouse.unitSize?.toString() || undefined,
            rentalPrice: detailedPenthouse.rentalPrice?.toString() || undefined,
            // New fields
            bedroom: detailedPenthouse.bedroom || undefined,
            bathroom: detailedPenthouse.bathroom || undefined,
            usableAreaSqm: detailedPenthouse.usableAreaSqm?.toString() || undefined,
            plotSizeSqw: detailedPenthouse.plotSizeSqw?.toString() || undefined,
            // Translations
            title: translation?.title || '',
            description: translation?.description || '',
            metaTitle: translation?.metaTitle || '',
            metaDescription: translation?.metaDescription || '',
            metaKeywords: translation?.metaKeywords || '',
            // Prices
            salePrice: salePrice || undefined,
            rentMonthlyPrice: rentPrice || undefined,
            currencyId: 'THB',
            // Dynamic price fields
            ...priceFieldValues,
            // Project Info sections
            projectInfoTitle: projectInfoTranslation?.title || '',
            projectInfoDescription: projectInfoTranslation?.titleDescription || '',
            projectInfoContent: projectInfoTranslation?.unitSpec || '',
            projectInfoUnitInformation: projectInfoTranslation?.unitInformation || '',
            projectInfoUnitHighlight: projectInfoTranslation?.unitHighlight || '',
            projectInfoDetail: projectInfoTranslation?.detail || '',
            projectInfoFacilitiesSubject: projectInfoTranslation?.facilitiesSubject || '',
            projectInfoFloorNumber: projectInfoTranslation?.floorNumber || '',
            projectInfoPropertyTypeDetail: projectInfoTranslation?.propertyTypeDetail || '',
            projectInfoUnitNumber: projectInfoTranslation?.unitNumber || '',
            projectInfoRentalCurrency: projectInfoTranslation?.rentalCurrency || '',
            projectInfoRentalPeriod: projectInfoTranslation?.rentalPeriod || '',
            projectInfoProjectSize: projectInfoTranslation?.projectSize || '',
            projectInfoLayoutDetail: projectInfoTranslation?.layoutDetail || '',
    projectInfoFacilitiesDesc: projectInfoTranslation?.facilitiesDesc || '',
    projectInfoBannerImage: projectInfo?.bannerImage || null,
    plansGallery: plansGallery,
            // Neighborhood sections
            neighborhoodTitle: neighborhoodTranslation?.title || '',
            neighborhoodDescription: neighborhoodTranslation?.titleDescription || '',
            neighborhoodTitleHighlight: neighborhoodTranslation?.titleHighlight || '',
            neighborhoodContent: neighborhoodTranslation?.contentEditor || '',
            neighborhoodLocationUrl: neighborhood?.locationUrl || '',
            neighborhoodLocationDescription: neighborhoodTranslation?.locationDescription || '',
            neighborhoodGallery: neighborhoodGallery,
            // Gallery sections
            galleryTourTitle: galleryTourTranslation?.title || '',
            galleryTourDescription: galleryTourTranslation?.titleDescription || '',
            galleryImages: galleryImages,
            // Location Detail field populated from neighborhood locationDescription
            locationDetail: neighborhoodTranslation?.locationDescription || '',
            // Area field populated from existing zones
            areaId: existingAreaIds,
          });
        } catch (error) {
          console.error('Error fetching penthouse details:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchPenthouseDetail();
    }
  }, [isEdit, currentPenthouse, selectedLanguage, reset]);

  // Update form when language changes
  useEffect(() => {
    if (currentPenthouse && selectedLanguage && isEdit) {
      // Re-fetch penthouse data when language changes
      const fetchPenthouseDetail = async () => {
        try {
          setLoading(true);
          const detailedPenthouse = await penthouseService.getPenthouse(
            currentPenthouse.id,
            selectedLanguage.code
          );
          const translation = detailedPenthouse.translations?.find(
            (t) => t.languageCode === selectedLanguage.code
          );

          // Handle different API response structures
          const languageCode = selectedLanguage.code || 'en';

          // Get project info translation
          const projectInfo = detailedPenthouse.projectInfo?.[0];
          const projectInfoTranslation = getTranslationFromNested(projectInfo, languageCode);

          // Get neighborhood translation
          const neighborhood = detailedPenthouse.neighborhood?.[0];
          const neighborhoodTranslation = getTranslationFromNested(neighborhood, languageCode);

          // Get gallery tour translation
          const galleryTour = detailedPenthouse.galleryTour?.[0];
          const galleryTourTranslation = getTranslationFromNested(galleryTour, languageCode);

          // Only update language-specific fields
          setValue('title', translation?.title || '');
          setValue('description', translation?.description || '');
          setValue('metaTitle', translation?.metaTitle || '');
          setValue('metaDescription', translation?.metaDescription || '');
          setValue('metaKeywords', translation?.metaKeywords || '');
          setValue('projectInfoTitle', projectInfoTranslation?.title || '');
          setValue('projectInfoDescription', projectInfoTranslation?.titleDescription || '');
          setValue('projectInfoContent', projectInfoTranslation?.unitSpec || '');
          setValue('neighborhoodTitle', neighborhoodTranslation?.title || '');
          setValue('neighborhoodDescription', neighborhoodTranslation?.titleDescription || '');
          setValue('neighborhoodContent', neighborhoodTranslation?.contentEditor || '');
          setValue('neighborhoodLocationUrl', neighborhood?.locationUrl || '');
          setValue(
            'neighborhoodLocationDescription',
            neighborhoodTranslation?.locationDescription || ''
          );
          setValue('locationDetail', neighborhoodTranslation?.locationDescription || '');
          setValue('galleryTourTitle', galleryTourTranslation?.title || '');
          setValue('galleryTourDescription', galleryTourTranslation?.titleDescription || '');
        } catch (error) {
          console.error('Error fetching penthouse details:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchPenthouseDetail();
    }
  }, [selectedLanguage, currentPenthouse, isEdit, setValue]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Function to reload penthouse data
  const reloadPenthouseData = useCallback(
    async (penthouseId: string) => {
      if (!selectedLanguage) return;

      try {
        setLoading(true);
        const detailedPenthouse = await penthouseService.getPenthouse(
          penthouseId,
          selectedLanguage.code
        );

        // Update form with fresh data from server
        const translation = detailedPenthouse.translations?.find(
          (t) => t.languageCode === selectedLanguage.code
        );
        const languageCode = selectedLanguage.code || 'en';

        // Map existing prices to form fields
        const priceFieldValues: any = {};
        if (detailedPenthouse.prices) {
          detailedPenthouse.prices.forEach((price: any) => {
            const currencyCode = price.currencyCode;
            if (currencyCode) {
              if (price.priceType === 'for_rent') {
                priceFieldValues[`rentPrice_${currencyCode}`] = price.price;
              } else if (price.priceType === 'for_sale') {
                priceFieldValues[`salePrice_${currencyCode}`] = price.price;
              }
            }
          });
        }

        // Get prices from API response format (legacy support)
        const salePrice = detailedPenthouse.prices
          ? getPriceByType(detailedPenthouse.prices, 'for_sale', 'THB')
          : undefined;
        const rentPrice = detailedPenthouse.prices
          ? getPriceByType(detailedPenthouse.prices, 'for_rent', 'THB')
          : undefined;

        // Get project info translation
        const projectInfo = detailedPenthouse.projectInfo?.[0];
        const projectInfoTranslation = projectInfo?.translations?.find(
          (t: any) => t.languageCode === languageCode
        );

        // Get neighborhood translation
        const neighborhood = detailedPenthouse.neighborhood?.[0];
        const neighborhoodTranslation = neighborhood?.translations?.find(
          (t: any) => t.languageCode === languageCode
        );

        // Get gallery tour translation
        const galleryTour = detailedPenthouse.galleryTour?.[0];
        const galleryTourTranslation = galleryTour?.translations?.find(
          (t: any) => t.languageCode === languageCode
        );

        // Get gallery images from API response
        const galleryImages = galleryTour?.gallery?.map((item: any) => item.imageUrl) || [];

        // Get plans gallery from project info
        const plansGallery = projectInfo?.plansGallery?.map((item: any) => item.imageUrl) || [];

        // Get neighborhood gallery
        const neighborhoodGallery = neighborhood?.gallery?.map((item: any) => item.imageUrl) || [];

         // Get existing zones data for areaId field
          const existingAreaIds =
            detailedPenthouse.zones?.map((zone: any) => zone.zoneId?.toString()) || [];
            
        reset({
          slug: detailedPenthouse.slug || '',
          coverImage: detailedPenthouse.coverImage || null,
          logoImage: detailedPenthouse.logoImage || null,
          thumbnailImage: detailedPenthouse.thumbnailImage || null,
          ogImage: detailedPenthouse.ogImage || null,
          locationId: detailedPenthouse.locationId || '',
          propertyTypeId: detailedPenthouse.propertyTypeId || '',
          officeTypeId: detailedPenthouse.officeTypeId || '',
          offerTypeId: detailedPenthouse.offerTypeId || '',
          status: detailedPenthouse.status || 'draft',
          publishStartDate: detailedPenthouse.publishStartDate || '',
          publishEndDate: detailedPenthouse.publishEndDate || '',
          isFeatured: detailedPenthouse.isFeatured || false,
          isPinned: detailedPenthouse.isPinned || false,
          sortOrder: detailedPenthouse.sortOrder || 0,
          isActive: detailedPenthouse.isActive ?? true,
          urlAlias: detailedPenthouse.urlAlias || detailedPenthouse.slug || '',
          listingCode: detailedPenthouse.listingCode || '',
          unitSize: detailedPenthouse.unitSize?.toString() || undefined,
          rentalPrice: detailedPenthouse.rentalPrice?.toString() || undefined,
          // New fields
          bedroom: detailedPenthouse.bedroom || undefined,
          bathroom: detailedPenthouse.bathroom || undefined,
          usableAreaSqm: detailedPenthouse.usableAreaSqm?.toString() || undefined,
          plotSizeSqw: detailedPenthouse.plotSizeSqw?.toString() || undefined,
          // Translations
          title: translation?.title || '',
          description: translation?.description || '',
          metaTitle: translation?.metaTitle || '',
          metaDescription: translation?.metaDescription || '',
          metaKeywords: translation?.metaKeywords || '',
          // Prices
          salePrice: salePrice || undefined,
          rentMonthlyPrice: rentPrice || undefined,
          currencyId: 'THB',
          // Dynamic price fields
          ...priceFieldValues,
          // Project Info sections
          projectInfoTitle: projectInfoTranslation?.title || '',
          projectInfoDescription: projectInfoTranslation?.titleDescription || '',
          projectInfoContent: projectInfoTranslation?.unitSpec || '',
          projectInfoUnitInformation: projectInfoTranslation?.unitInformation || '',
          projectInfoUnitHighlight: projectInfoTranslation?.unitHighlight || '',
          projectInfoDetail: projectInfoTranslation?.detail || '',
          projectInfoFacilitiesSubject: projectInfoTranslation?.facilitiesSubject || '',
          projectInfoFloorNumber: projectInfoTranslation?.floorNumber || '',
          projectInfoPropertyTypeDetail: projectInfoTranslation?.propertyTypeDetail || '',
          projectInfoUnitNumber: projectInfoTranslation?.unitNumber || '',
          projectInfoRentalCurrency: projectInfoTranslation?.rentalCurrency || '',
          projectInfoRentalPeriod: projectInfoTranslation?.rentalPeriod || '',
          projectInfoProjectSize: projectInfoTranslation?.projectSize || '',
          projectInfoLayoutDetail: projectInfoTranslation?.layoutDetail || '',
          projectInfoFacilitiesDesc: projectInfoTranslation?.facilitiesDesc || '',
          projectInfoBannerImage: projectInfo?.bannerImage || null,
          plansGallery: plansGallery,
          // Neighborhood sections
          neighborhoodTitle: neighborhoodTranslation?.title || '',
          neighborhoodDescription: neighborhoodTranslation?.titleDescription || '',
          neighborhoodTitleHighlight: neighborhoodTranslation?.titleHighlight || '',
          neighborhoodContent: neighborhoodTranslation?.contentEditor || '',
          neighborhoodLocationUrl: neighborhood?.locationUrl || '',
          neighborhoodLocationDescription: neighborhoodTranslation?.locationDescription || '',
          neighborhoodGallery: neighborhoodGallery,
          // Gallery sections
          galleryTourTitle: galleryTourTranslation?.title || '',
          galleryTourDescription: galleryTourTranslation?.titleDescription || '',
          galleryImages: galleryImages,
          // Area field populated from existing zones
          areaId: existingAreaIds,
        });

        console.log('Data reloaded successfully');
      } catch (error) {
        console.error('Error reloading penthouse data:', error);
        toast.error('Failed to reload data');
      } finally {
        setLoading(false);
      }
    },
    [selectedLanguage, reset, getPriceByType]
  );

  const onSubmitWithStatus = useCallback(
    async (status: 'draft' | 'published') => {
      const data = methods.getValues();

      try {
        // Upload all images first
        let coverImageUrl = data.coverImage;
        let logoImageUrl = data.logoImage;
        let thumbnailImageUrl = data.thumbnailImage;
        let ogImageUrl = data.ogImage;
        let projectBannerUrl = data.projectInfoBannerImage;

        // Upload cover image
        if (data.coverImage instanceof File) {
          const formData = new FormData();
          formData.append('image', data.coverImage);
          const uploadResult = await penthouseService.uploadImage(formData, 'cover-image');
          coverImageUrl = 'url' in uploadResult ? uploadResult.url : uploadResult.files[0]?.url;
        }

        // Upload logo image
        if (data.logoImage instanceof File) {
          const formData = new FormData();
          formData.append('image', data.logoImage);
          const uploadResult = await penthouseService.uploadImage(formData, 'logo-image');
          logoImageUrl = 'url' in uploadResult ? uploadResult.url : uploadResult.files[0]?.url;
        }

        // Upload thumbnail image
        if (data.thumbnailImage instanceof File) {
          const formData = new FormData();
          formData.append('image', data.thumbnailImage);
          const uploadResult = await penthouseService.uploadImage(formData, 'thumbnail-image');
          thumbnailImageUrl = 'url' in uploadResult ? uploadResult.url : uploadResult.files[0]?.url;
        }

        // Upload OG image
        if (data.ogImage instanceof File) {
          const formData = new FormData();
          formData.append('image', data.ogImage);
          const uploadResult = await penthouseService.uploadImage(formData, 'og-image');
          ogImageUrl = 'url' in uploadResult ? uploadResult.url : uploadResult.files[0]?.url;
        }

        // Upload project banner image
        if (data.projectInfoBannerImage instanceof File) {
          const formData = new FormData();
          formData.append('image', data.projectInfoBannerImage);
          const uploadResult = await penthouseService.uploadImage(formData, 'project-banner');
          projectBannerUrl = 'url' in uploadResult ? uploadResult.url : uploadResult.files[0]?.url;
        }


        // Upload plans gallery (multiple files)
        const plansGalleryUrls: any[] = [];
        if (data.plansGallery && data.plansGallery.length > 0) {
          const planFiles = data.plansGallery.filter((plan) => plan instanceof File);
          const planStrings = data.plansGallery.filter((plan) => typeof plan === 'string');

          // Upload new files
          if (planFiles.length > 0) {
            const formData = new FormData();
            planFiles.forEach((file) => {
              formData.append('images', file);
            });
            const uploadResult = await penthouseService.uploadImage(formData, 'floor-plans');

            // Handle multiple files response
            if ('files' in uploadResult && Array.isArray(uploadResult.files)) {
              uploadResult.files.forEach((file: any, index: number) => {
                plansGalleryUrls.push({
                  imageUrl: file.url,
                  imageAlt: `Floor plan ${plansGalleryUrls.length + 1}`,
                  imageCaption: `Floor plan ${plansGalleryUrls.length + 1}`,
                  imageType: 'floor_plan',
                  sortOrder: plansGalleryUrls.length,
                });
              });
            } else if ('url' in uploadResult) {
              // Handle single file response
              plansGalleryUrls.push({
                imageUrl: uploadResult.url,
                imageAlt: `Floor plan ${plansGalleryUrls.length + 1}`,
                imageCaption: `Floor plan ${plansGalleryUrls.length + 1}`,
                imageType: 'floor_plan',
                sortOrder: plansGalleryUrls.length,
              });
            }
          }

          // Add existing string URLs
          planStrings.forEach((plan, index) => {
            plansGalleryUrls.push({
              imageUrl: plan,
              imageAlt: `Floor plan ${plansGalleryUrls.length + 1}`,
              imageCaption: `Floor plan ${plansGalleryUrls.length + 1}`,
              imageType: 'floor_plan',
              sortOrder: plansGalleryUrls.length,
            });
          });
        }

        // Upload neighborhood gallery (multiple files)
        const neighborhoodGalleryUrls: any[] = [];
        if (data.neighborhoodGallery && data.neighborhoodGallery.length > 0) {
          const neighborhoodFiles = data.neighborhoodGallery.filter(
            (image) => image instanceof File
          );
          const neighborhoodStrings = data.neighborhoodGallery.filter(
            (image) => typeof image === 'string'
          );

          // Upload new files
          if (neighborhoodFiles.length > 0) {
            const formData = new FormData();
            neighborhoodFiles.forEach((file) => {
              formData.append('images', file);
            });
            const uploadResult = await penthouseService.uploadImage(
              formData,
              'neighborhood-gallery'
            );

            // Handle multiple files response
            if ('files' in uploadResult && Array.isArray(uploadResult.files)) {
              uploadResult.files.forEach((file: any, index: number) => {
                neighborhoodGalleryUrls.push({
                  imageUrl: file.url,
                  imageAlt: `Neighborhood ${neighborhoodGalleryUrls.length + 1}`,
                  imageCaption: `Neighborhood ${neighborhoodGalleryUrls.length + 1}`,
                  sortOrder: neighborhoodGalleryUrls.length,
                });
              });
            } else if ('url' in uploadResult) {
              // Handle single file response
              neighborhoodGalleryUrls.push({
                imageUrl: uploadResult.url,
                imageAlt: `Neighborhood ${neighborhoodGalleryUrls.length + 1}`,
                imageCaption: `Neighborhood ${neighborhoodGalleryUrls.length + 1}`,
                sortOrder: neighborhoodGalleryUrls.length,
              });
            }
          }

          // Add existing string URLs
          neighborhoodStrings.forEach((image, index) => {
            neighborhoodGalleryUrls.push({
              imageUrl: image,
              imageAlt: `Neighborhood ${neighborhoodGalleryUrls.length + 1}`,
              imageCaption: `Neighborhood ${neighborhoodGalleryUrls.length + 1}`,
              sortOrder: neighborhoodGalleryUrls.length,
            });
          });
        }

        // Upload gallery images (multiple files)
        const galleryUrls: any[] = [];
        if (data.galleryImages && data.galleryImages.length > 0) {
          const galleryFiles = data.galleryImages.filter((image) => image instanceof File);
          const galleryStrings = data.galleryImages.filter((image) => typeof image === 'string');

          // Upload new files
          if (galleryFiles.length > 0) {
            const formData = new FormData();
            galleryFiles.forEach((file) => {
              formData.append('images', file);
            });
            const uploadResult = await penthouseService.uploadImage(formData, 'gallery-images');

            // Handle multiple files response
            if ('files' in uploadResult && Array.isArray(uploadResult.files)) {
              uploadResult.files.forEach((file: any, index: number) => {
                galleryUrls.push({
                  imageUrl: file.url,
                  imageAlt: `Gallery ${galleryUrls.length + 1}`,
                  imageCaption: `Gallery ${galleryUrls.length + 1}`,
                  imageType: 'photo',
                  sortOrder: galleryUrls.length,
                });
              });
            } else if ('url' in uploadResult) {
              // Handle single file response
              galleryUrls.push({
                imageUrl: uploadResult.url,
                imageAlt: `Gallery ${galleryUrls.length + 1}`,
                imageCaption: `Gallery ${galleryUrls.length + 1}`,
                imageType: 'photo',
                sortOrder: galleryUrls.length,
              });
            }
          }

          // Add existing string URLs
          galleryStrings.forEach((image, index) => {
            galleryUrls.push({
              imageUrl: image,
              imageAlt: `Gallery ${galleryUrls.length + 1}`,
              imageCaption: `Gallery ${galleryUrls.length + 1}`,
              imageType: 'photo',
              sortOrder: galleryUrls.length,
            });
          });
        }

        // Prepare base penthouse data
        const baseData = {
          slug: data.slug,
          coverImage: typeof coverImageUrl === 'string' ? coverImageUrl : undefined,
          logoImage: typeof logoImageUrl === 'string' ? logoImageUrl : undefined,
          thumbnailImage: typeof thumbnailImageUrl === 'string' ? thumbnailImageUrl : undefined,
          ogImage: typeof ogImageUrl === 'string' ? ogImageUrl : undefined,
          locationId: data.locationId || undefined,
          propertyTypeId: data.propertyTypeId || undefined,
          officeTypeId: data.officeTypeId || undefined,
          offerTypeId: data.offerTypeId || undefined,
          zoneId: data.zoneId || undefined,
          status: status, // Use the status parameter instead of data.status
          publishStartDate: data.publishStartDate || undefined,
          publishEndDate: data.publishEndDate || undefined,
          isFeatured: data.isFeatured,
          isPinned: data.isPinned,
          sortOrder: data.sortOrder,
          viewCount: currentPenthouse?.viewCount || 0,
          isActive: data.isActive,
          urlAlias: data.urlAlias,
          listingCode: data.listingCode,
          unitSize: data.unitSize,
          rentalPrice: data.rentalPrice ? parseFloat(data.rentalPrice) : undefined,
          // New fields
          bedroom: data.bedroom || undefined,
          bathroom: data.bathroom || undefined,
          usableAreaSqm: data.usableAreaSqm ? parseFloat(data.usableAreaSqm.toString()) : undefined,
          plotSizeSqw: data.plotSizeSqw ? parseFloat(data.plotSizeSqw.toString()) : undefined,
          areaId: data.areaId, // Include area (zones) data
        };

        // Collect dynamic pricing data
        const pricesData: any[] = [];

        // Process rent prices
        currencies.forEach((currency) => {
          const rentPriceKey = `rentPrice_${currency.code}`;
          const rentPrice = (data as any)[rentPriceKey];
          if (rentPrice && parseFloat(rentPrice) > 0) {
            pricesData.push({
              currencyCode: currency.code,
              priceType: 'for_rent',
              price: parseFloat(rentPrice).toString(),
              isPrimary: currency.code === 'THB',
            });
          }
        });

        // Process sale prices
        currencies.forEach((currency) => {
          const salePriceKey = `salePrice_${currency.code}`;
          const salePrice = (data as any)[salePriceKey];
          if (salePrice && parseFloat(salePrice) > 0) {
            pricesData.push({
              currencyCode: currency.code,
              priceType: 'for_sale',
              price: parseFloat(salePrice).toString(),
              isPrimary: currency.code === 'THB',
            });
          }
        });

        // Prepare zones data from areaId (multi-select zones)
        const zonesData: any[] = [];
        if (data.areaId && Array.isArray(data.areaId) && data.areaId.length > 0) {
          data.areaId.forEach((zoneId: string, index: number) => {
            zonesData.push({
              zoneId: parseInt(zoneId),
              sortOrder: index,
            });
          });
        }

        // For create, include nested data
        const createData = {
          ...baseData,
          translations: selectedLanguage
            ? [
                {
                  languageCode: selectedLanguage.code,
                  title: data.title,
                  description: data.description,
                  metaTitle: data.metaTitle,
                  metaDescription: data.metaDescription,
                  metaKeywords: data.metaKeywords,
                },
              ]
            : [],
          prices: pricesData,
          zones: zonesData,
          projectInfo:
            selectedLanguage && data.projectInfoTitle
              ? [
                  {
                    bannerImage:
                      typeof projectBannerUrl === 'string' ? projectBannerUrl : undefined,
                    sortOrder: 0,
                    translations: [
                      {
                        languageCode: selectedLanguage.code,
                        title: data.projectInfoTitle,
                        titleDescription: data.projectInfoDescription,
                        unitSpec: data.projectInfoContent,
                        unitInformation: data.projectInfoUnitInformation,
                        unitHighlight: data.projectInfoUnitHighlight,
                        detail: data.projectInfoDetail,
                        facilitiesSubject: data.projectInfoFacilitiesSubject,
                        floorNumber: data.projectInfoFloorNumber,
                        propertyTypeDetail: data.projectInfoPropertyTypeDetail,
                        unitNumber: data.projectInfoUnitNumber,
                        rentalCurrency: data.projectInfoRentalCurrency,
                        rentalPeriod: data.projectInfoRentalPeriod,
                        projectSize: data.projectInfoProjectSize
                          ? parseFloat(data.projectInfoProjectSize)
                          : undefined,
                        layoutDetail: data.projectInfoLayoutDetail,
                        facilitiesDesc: data.projectInfoFacilitiesDesc,
                      },
                    ],
                    plansGallery: plansGalleryUrls,
                  },
                ]
              : [],
          neighborhood:
            selectedLanguage && data.neighborhoodTitle
              ? [
                  {
                    locationUrl: data.neighborhoodLocationUrl,
                    sortOrder: 0,
                    translations: [
                      {
                        languageCode: selectedLanguage.code,
                        title: data.neighborhoodTitle,
                        titleDescription: data.neighborhoodDescription,
                        titleHighlight: data.neighborhoodTitleHighlight,
                        contentEditor: data.neighborhoodContent,
                        locationDescription:
                          data.locationDetail || data.neighborhoodLocationDescription,
                      },
                    ],
                    gallery: neighborhoodGalleryUrls,
                  },
                ]
              : [],
          galleryTour:
            selectedLanguage && data.galleryTourTitle
              ? [
                  {
                    sortOrder: 0,
                    translations: [
                      {
                        languageCode: selectedLanguage.code,
                        title: data.galleryTourTitle,
                        titleDescription: data.galleryTourDescription,
                      },
                    ],
                    gallery: galleryUrls,
                  },
                ]
              : [],
        };

        let penthouseId: string;

        if (isEdit && currentPenthouse) {
          // For update, use createData with all nested data (UpdatePenthouseDto supports all fields)
          // This ensures all data including translations, prices, projectInfo, neighborhood, and galleryTour are updated
          const response = await penthouseService.updatePenthouse(currentPenthouse.id, createData);
          penthouseId = currentPenthouse.id.toString();
          toast.success(
            `Listing ${status === 'published' ? 'published' : 'saved as draft'} successfully!`
          );

          // Reload data after successful update
          await reloadPenthouseData(penthouseId);

          // Log the data being sent for debugging
          console.log('Update data sent:', createData);
        } else {
          // For create, use createData with all nested data
          const response = await penthouseService.createPenthouse(createData);
          penthouseId = response.id.toString();
          toast.success(
            `Listing ${status === 'published' ? 'published' : 'saved as draft'} successfully!`
          );

          // For new listings, redirect to edit page with the new ID
          router.push(`/menu/our-penthouses/listings/${penthouseId}`);

          // Log the data being sent for debugging
          console.log('Create data sent:', createData);
        }
      } catch (error) {
        console.error('Error saving listing:', error);
        toast.error('Failed to save listing');
      }
    },
    [methods, isEdit, currentPenthouse, selectedLanguage, currencies, router, reloadPenthouseData]
  );

  const onSubmit = handleSubmit(async (data) => {
    await onSubmitWithStatus(data.status as 'draft' | 'published');
  });

  const handleSaveDraft = useCallback(async () => {
    await onSubmitWithStatus('draft');
  }, [onSubmitWithStatus]);

  const handlePublish = useCallback(async () => {
    await onSubmitWithStatus('published');
  }, [onSubmitWithStatus]);

  const handlePublishAction = useCallback(
    async (action: 'publish' | 'unpublish' | 'closed' | 'close') => {
      if (!currentPenthouse) return;

      // Show confirmation dialog for delete action
      if (action === 'close') {
        setConfirmDialog({
          open: true,
          title: 'Delete',
          content: 'Are you sure want to delete?',
          action: async () => {
            try {
              await penthouseService.deletePenthouse(currentPenthouse.id);
              toast.success('Listing deleted successfully!');

              // Redirect to listings list page after successful deletion
              router.push('/menu/our-penthouses/listings');
              publishActions.onClose();
            } catch (error) {
              console.error('Error deleting listing:', error);
              toast.error('Failed to delete listing');
            }
          },
        });
        return;
      }

      try {
        let response;
        switch (action) {
          case 'publish':
            response = await penthouseService.publishPenthouse(currentPenthouse.id);
            toast.success('Listing published successfully!');
            break;
          case 'unpublish':
            response = await penthouseService.unpublishPenthouse(currentPenthouse.id);
            toast.success('Listing unpublished successfully!');
            break;
          case 'closed':
            response = await penthouseService.closePenthouse(currentPenthouse.id);
            toast.success('Listing closed successfully!');
            break;
        }

        // Update the form status and reload data
        if (response) {
          setValue('status', response.status);
        }
        if (currentPenthouse) {
          await reloadPenthouseData(currentPenthouse.id.toString());
        }
        publishActions.onClose();
      } catch (error) {
        console.error(`Error ${action}ing listing:`, error);
        toast.error(`Failed to ${action} listing`);
      }
    },
    [currentPenthouse, setValue, publishActions, reloadPenthouseData, router]
  );

  const handleDropMultiFile = (acceptedFiles: File[]) => {
    const currentImages = watch('galleryImages') || [];
    setValue('galleryImages', [
      ...currentImages,
      ...acceptedFiles.map((newFile) =>
        Object.assign(newFile, {
          preview: URL.createObjectURL(newFile),
        })
      ),
    ]);
  };

  const handleRemoveFile = (inputFile: File | string) => {
    const currentImages = watch('galleryImages') || [];
    const filesFiltered = currentImages.filter((fileFiltered: any) => fileFiltered !== inputFile);
    setValue('galleryImages', filesFiltered);
  };

  const handleRemoveAllFiles = () => {
    setValue('galleryImages', []);
  };

  const handleExpandSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev],
    }));
  };

  const renderPublishActions = () => (
    <CustomPopover
      open={publishActions.open}
      anchorEl={publishActions.anchorEl}
      onClose={publishActions.onClose}
      slotProps={{ arrow: { placement: 'top-right' } }}
    >
      <MenuList>
        <MenuItem
          onClick={() => handlePublishAction('unpublish')}
          sx={{
            color: 'error.main',
            '&:hover': {
              backgroundColor: 'error.lighter',
            },
          }}
        >
          Unpublish
        </MenuItem>
        <MenuItem
          onClick={() => handlePublishAction('closed')}
          sx={{
            color: 'error.main',
            '&:hover': {
              backgroundColor: 'error.lighter',
            },
          }}
        >
          Closed
        </MenuItem>
        <MenuItem
          onClick={() => handlePublishAction('close')}
          sx={{
            color: 'error.main',
            '&:hover': {
              backgroundColor: 'error.lighter',
            },
          }}
        >
          Delete
        </MenuItem>
      </MenuList>
    </CustomPopover>
  );

  const renderCollapseButton = (value: boolean, onToggle: () => void) => (
    <IconButton onClick={onToggle}>
      <Iconify icon={value ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'} />
    </IconButton>
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={`${isEdit ? 'Edit' : 'Create'}`}
        backHref={'/menu/our-penthouses/listings'}
        links={[
          { name: 'Dashboard', href: '/dashboard' },
          { name: 'Our Penthouses' },
          { name: 'Listings', href: '/menu/our-penthouses/listings' },
          { name: isEdit ? 'Edit' : 'Create' },
        ]}
        action={
          <Stack direction="row" spacing={2} alignItems="center">
            {isEdit && currentPenthouse && (
              <>
                <LoadingButton
                  onClick={handlePublish}
                  variant="contained"
                  loading={isSubmitting}
                  disabled={shouldDisableButtons}
                  sx={{
                    backgroundColor: shouldDisableButtons ? 'grey.400' : 'grey.800',
                    color: 'common.white',
                    '&:hover': {
                      backgroundColor: shouldDisableButtons ? 'grey.400' : 'grey.900',
                    },
                    '&.Mui-disabled': {
                      backgroundColor: 'grey.400',
                      color: 'common.white',
                    },
                  }}
                >
                  Published
                </LoadingButton>
                <LoadingButton
                  onClick={handleSaveDraft}
                  variant="outlined"
                  loading={isSubmitting}
                  disabled={shouldDisableButtons}
                  sx={{
                    color: shouldDisableButtons ? 'text.disabled' : 'text.secondary',
                    borderColor: shouldDisableButtons ? 'grey.300' : 'grey.300',
                    backgroundColor: 'common.white',
                    '&:hover': {
                      backgroundColor: shouldDisableButtons ? 'common.white' : 'grey.50',
                      borderColor: shouldDisableButtons ? 'grey.300' : 'grey.400',
                    },
                    '&.Mui-disabled': {
                      color: 'text.disabled',
                      borderColor: 'grey.300',
                      backgroundColor: 'grey.100',
                    },
                  }}
                >
                  Draft
                </LoadingButton>
                <IconButton onClick={publishActions.onOpen}>
                  <Iconify icon="eva:more-vertical-fill" />
                </IconButton>
              </>
            )}
            {!isEdit && (
              <>
                <LoadingButton
                  onClick={handlePublish}
                  variant="contained"
                  loading={isSubmitting}
                  disabled={shouldDisableButtons}
                  sx={{
                    backgroundColor: shouldDisableButtons ? 'grey.400' : 'grey.800',
                    color: 'common.white',
                    '&:hover': {
                      backgroundColor: shouldDisableButtons ? 'grey.400' : 'grey.900',
                    },
                    '&.Mui-disabled': {
                      backgroundColor: 'grey.400',
                      color: 'common.white',
                    },
                  }}
                >
                  Published
                </LoadingButton>
                <LoadingButton
                  onClick={handleSaveDraft}
                  variant="outlined"
                  loading={isSubmitting}
                  disabled={shouldDisableButtons}
                  sx={{
                    color: shouldDisableButtons ? 'text.disabled' : 'text.secondary',
                    borderColor: shouldDisableButtons ? 'grey.300' : 'grey.300',
                    backgroundColor: 'common.white',
                    '&:hover': {
                      backgroundColor: shouldDisableButtons ? 'common.white' : 'grey.50',
                      borderColor: shouldDisableButtons ? 'grey.300' : 'grey.400',
                    },
                    '&.Mui-disabled': {
                      color: 'text.disabled',
                      borderColor: 'grey.300',
                      backgroundColor: 'grey.100',
                    },
                  }}
                >
                  Draft
                </LoadingButton>
              </>
            )}
          </Stack>
        }
        slotProps={{
          heading: {
            sx: {
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              '&::after': {
                content: `"${currentStatus === 'published' ? 'Published' : currentStatus === 'draft' ? 'Draft' : currentStatus}"`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'capitalize',
                backgroundColor:
                  currentStatus === 'published'
                    ? 'success.lighter'
                    : currentStatus === 'draft'
                      ? 'info.lighter'
                      : 'grey.200',
                color:
                  currentStatus === 'published'
                    ? 'success.darker'
                    : currentStatus === 'draft'
                      ? 'info.darker'
                      : 'text.secondary',
              },
            },
          },
        }}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: { xs: 3, md: 5 } }}>
        <Tab label="Overview" icon={<Iconify width={24} icon="solar:file-text-bold" />} />
        <Tab
          label="Property Information"
          icon={<Iconify width={24} icon="solar:bill-list-bold" />}
        />
        <Tab label="Neighborhood" icon={<Iconify width={24} icon="solar:map-point-bold" />} />
        <Tab
          label="Gallery & Tour"
          icon={<Iconify width={24} icon="solar:gallery-wide-bold" />}
        />
      </Tabs>

      {isEdit ? (
        // Edit Mode: Centered layout with sidebar at bottom (same width as create mode)
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={{ xs: 3, md: 5 }} sx={{ mx: 'auto', maxWidth: { xs: 720, xl: 880 } }}>
              {tabValue === 0 && (
                <Stack spacing={3}>
                  <Card>
                    <CardHeader
                      title="Overview"
                      subheader="Name, short description..."
                      action={renderCollapseButton(expandedSections.overview, () =>
                        handleExpandSection('overview')
                      )}
                      sx={{ mb: 3 }}
                    />
                    <Collapse in={expandedSections.overview}>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <Field.Text
                              name="listingCode"
                              label="Listing Code"
                              disabled
                              placeholder="Enter listing code"
                            />
                          </Grid>

                        <Grid item xs={12}>
                          <Field.Text
                            name="slug"
                            label="URL Alias *"
                            placeholder="Enter URL alias"
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Field.Text name="title" label="Name *" placeholder="Enter name" />
                        </Grid>

                          <Grid item xs={12}>
                            <Field.Text
                              name="description"
                              label="Short Description"
                              placeholder="Enter short description"
                              multiline
                              rows={4}
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <Field.Switch name="isPinned" label="Pin (Displayed on homepage)" />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Collapse>
                  </Card>

                  <Card>
                    <CardHeader
                      title="Properties"
                      subheader="Additional functions and attributes..."
                      action={renderCollapseButton(expandedSections.overview, () =>
                        handleExpandSection('overview')
                      )}
                      sx={{ mb: 3 }}
                    />
                    <Collapse in={expandedSections.overview}>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <Field.Select
                              name="offerTypeId"
                              label="Offer Type"
                              placeholder="Select offer type"
                            >
                              <MenuItem value="">
                                <em>Select offer type</em>
                              </MenuItem>
                              {offerTypes.map((offerType) => {
                                const translation = offerType.translations?.find(
                                  (t) => t.languageCode === selectedLanguage?.code
                                );
                                return (
                                  <MenuItem key={offerType.id} value={offerType.id}>
                                    {translation?.name || offerType.name}
                                  </MenuItem>
                                );
                              })}
                            </Field.Select>
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <Field.Select
                              name="propertyTypeId"
                              label="Property Type"
                              placeholder="Select property type"
                            >
                              <MenuItem value="">
                                <em>Select property type</em>
                              </MenuItem>
                              {propertyTypes.map((propertyType) => {
                                const translation = propertyType.translations?.find(
                                  (t) => t.languageCode === selectedLanguage?.code
                                );
                                return (
                                  <MenuItem key={propertyType.id} value={propertyType.id}>
                                    {translation?.name || propertyType.name}
                                  </MenuItem>
                                );
                              })}
                            </Field.Select>
                          </Grid>

                          <Grid item xs={12}>
                            <Field.Select
                              name="locationId"
                              label="Location"
                              placeholder="Select location"
                            >
                              <MenuItem value="">
                                <em>Select location</em>
                              </MenuItem>
                              {locations.map((location) => {
                                const translation = location.translations?.find(
                                  (t) => t.languageCode === selectedLanguage?.code
                                );
                                return (
                                  <MenuItem key={location.id} value={location.id}>
                                    {translation?.name || location.name}
                                  </MenuItem>
                                );
                              })}
                            </Field.Select>
                          </Grid>

                          {/*
                          <Grid item xs={12} md={6}>
                            <Field.Text
                              name="locationDetail"
                              label="Location Detail"
                              placeholder=""
                            />
                          </Grid>
                          */}
                          <Grid item xs={12}>
                            <Field.MultiSelect
                              name="areaId"
                              label="Zone"
                              placeholder=""
                              chip
                              checkbox
                              fullWidth
                              options={zones.map((zone) => {
                                const translation = zone.translations?.find(
                                  (t) => t.languageCode === selectedLanguage?.code
                                );
                                return {
                                  label: translation?.name || zone.name || '',
                                  value: zone.id.toString(),
                                };
                              })}
                            />
                          </Grid>

                          {/* <Grid item xs={12}>
                            <Field.Text
                              name="unitSize"
                              label="Unit (Sq.m.)"
                              placeholder="Enter unit size"
                              type="number"
                            />
                          </Grid> */}

                          <Grid item xs={12} md={6}>
                            <Field.Text
                              name="bedroom"
                              label="Bedroom"
                              placeholder="Enter number of bedrooms"
                              type="number"
                              slotProps={{
                                input: {
                                  inputProps: { min: 0 },
                                },
                              }}
                            />
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <Field.Text
                              name="bathroom"
                              label="Bathroom"
                              placeholder="Enter number of bathrooms"
                              type="number"
                              slotProps={{
                                input: {
                                  inputProps: { min: 0 },
                                },
                              }}
                            />
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <Field.Text
                              name="usableAreaSqm"
                              label="Usable Area (Sq.m.)"
                              placeholder="Enter usable area"
                              type="number"
                              slotProps={{
                                input: {
                                  inputProps: { step: 0.01 },
                                },
                              }}
                            />
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <Field.Text
                              name="plotSizeSqw"
                              label="Plot Size (Sq.w.)"
                              placeholder="Enter plot size"
                              type="number"
                              slotProps={{
                                input: {
                                  inputProps: { step: 0.01 },
                                },
                              }}
                            />
                          </Grid>

                          {/* <Grid item xs={12} md={6}></Grid> */}

                          {/* <Grid item xs={12}>
                            <Field.Text
                              name="projectInfoLayoutDetail"
                              label="Layout"
                              placeholder="Enter layout"
                              multiline
                              rows={3}
                            />
                          </Grid> */}
                        </Grid>
                      </CardContent>
                    </Collapse>
                  </Card>

                  {/* Pricing Section - Only show if there are relevant price fields to display */}
                  {(shouldShowSalePrice || shouldShowRentPrice) && (
                    <Card>
                      <CardHeader
                        title="Pricing"
                        subheader="Price related inputs"
                        action={renderCollapseButton(expandedSections.pricing, () =>
                          handleExpandSection('pricing')
                        )}
                        sx={{ mb: 3 }}
                      />
                      <Collapse in={expandedSections.pricing}>
                        <Divider />
                        <CardContent>
                          <Grid container spacing={3}>
                            {currencies.map((currency) => (
                              <Grid item xs={12} key={currency.code}>
                                <Typography variant="subtitle2" gutterBottom sx={{mb:1}}>
                                  {currency.code} ({currency.name})
                                </Typography>
                                <Grid container spacing={2}>
                                  {shouldShowSalePrice && (
                                    <Grid item xs={12} md={shouldShowRentPrice ? 6 : 12}>
                                      <Controller
                                        name={`salePrice_${currency.code}`}
                                        control={methods.control}
                                        render={({ field, fieldState: { error } }) => (
                                          <Field.Text
                                            {...field}
                                            label="For Sale"
                                            placeholder=""
                                            error={!!error}
                                            helperText={error?.message}
                                            value={
                                              field.value
                                                ? Number(field.value).toLocaleString()
                                                : ''
                                            }
                                            onChange={(e) => {
                                              const value = e.target.value.replace(/,/g, '');
                                              if (!isNaN(Number(value)) || value === '') {
                                                field.onChange(value);
                                              }
                                            }}
                                            slotProps={{
                                              input: {
                                                inputProps: {
                                                  style: { textAlign: 'right' },
                                                },
                                              },
                                            }}
                                          />
                                        )}
                                      />
                                    </Grid>
                                  )}
                                  {shouldShowRentPrice && (
                                    <Grid item xs={12} md={shouldShowSalePrice ? 6 : 12}>
                                      <Controller
                                        name={`rentPrice_${currency.code}`}
                                        control={methods.control}
                                        render={({ field, fieldState: { error } }) => (
                                          <Field.Text
                                            {...field}
                                            label="For Rent"
                                            placeholder=""
                                            error={!!error}
                                            helperText={error?.message}
                                            value={
                                              field.value
                                                ? Number(field.value).toLocaleString()
                                                : ''
                                            }
                                            onChange={(e) => {
                                              const value = e.target.value.replace(/,/g, '');
                                              if (!isNaN(Number(value)) || value === '') {
                                                field.onChange(value);
                                              }
                                            }}
                                            slotProps={{
                                              input: {
                                                inputProps: {
                                                  style: { textAlign: 'right' },
                                                },
                                              },
                                            }}
                                          />
                                        )}
                                      />
                                    </Grid>
                                  )}
                                </Grid>
                              </Grid>
                            ))}
                          </Grid>
                        </CardContent>
                      </Collapse>
                    </Card>
                  )}

                  {/* Images Section */}
                  <Card>
                    <CardHeader
                      title="Images"
                      subheader="Upload your images"
                      action={renderCollapseButton(expandedSections.images, () =>
                        handleExpandSection('images')
                      )}
                      sx={{ mb: 3 }}
                    />
                    <Collapse in={expandedSections.images}>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                              Thumbnail
                            </Typography>
                            <Upload
                              value={watch('thumbnailImage')}
                              onDrop={(acceptedFiles) => {
                                const file = acceptedFiles[0];
                                if (file) {
                                  setValue(
                                    'thumbnailImage',
                                    Object.assign(file, {
                                      preview: URL.createObjectURL(file),
                                    })
                                  );
                                }
                              }}
                              onDelete={() => setValue('thumbnailImage', null)}
                              placeholderTitle="Drop or select file"
                              placeholderDescription="Drop files here or click to browse through your machine."
                              placeholderAllowedTypes="Allowed *.jpeg, *.jpg, *.png, recommend size of 985*762 px"
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                              Logo
                            </Typography>
                            <Upload
                              value={watch('logoImage')}
                              onDrop={(acceptedFiles) => {
                                const file = acceptedFiles[0];
                                if (file) {
                                  setValue(
                                    'logoImage',
                                    Object.assign(file, {
                                      preview: URL.createObjectURL(file),
                                    })
                                  );
                                }
                              }}
                              onDelete={() => setValue('logoImage', null)}
                              placeholderTitle="Drop or select file"
                              placeholderDescription="Drop files here or click to browse through your machine."
                              placeholderAllowedTypes="Allowed *.jpeg, *.jpg, *.png"
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                              Cover
                            </Typography>
                            <Upload
                              value={watch('coverImage')}
                              onDrop={(acceptedFiles) => {
                                const file = acceptedFiles[0];
                                if (file) {
                                  setValue(
                                    'coverImage',
                                    Object.assign(file, {
                                      preview: URL.createObjectURL(file),
                                    })
                                  );
                                }
                              }}
                              onDelete={() => setValue('coverImage', null)}
                              placeholderTitle="Drop or select file"
                              placeholderDescription="Drop files here or click to browse through your machine."
                              placeholderAllowedTypes="Allowed *.jpeg, *.jpg, *.png, recommend size of 1920*690 px"
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Collapse>
                  </Card>

                  {/* SEO Section */}
                  <Card>
                    <CardHeader
                      title="SEO"
                      subheader="Search Engine Optimization"
                      action={renderCollapseButton(expandedSections.seo, () =>
                        handleExpandSection('seo')
                      )}
                      sx={{ mb: 3 }}
                    />
                    <Collapse in={expandedSections.seo}>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <Field.Text
                              name="metaTitle"
                              label="Meta Title"
                              placeholder="Enter meta title"
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <Field.Text
                              name="metaKeywords"
                              label="Meta Keyword"
                              placeholder="Enter meta keywords"
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <Field.Text
                              name="metaDescription"
                              label="Meta Description"
                              placeholder="Enter meta description"
                              multiline
                              rows={4}
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                              OG Image
                            </Typography>
                            <Upload
                              value={watch('ogImage')}
                              onDrop={(acceptedFiles) => {
                                const file = acceptedFiles[0];
                                if (file) {
                                  setValue(
                                    'ogImage',
                                    Object.assign(file, {
                                      preview: URL.createObjectURL(file),
                                    })
                                  );
                                }
                              }}
                              onDelete={() => setValue('ogImage', null)}
                              placeholderTitle="Drop or select file"
                              placeholderDescription="Drop files here or click to browse through your machine."
                              placeholderAllowedTypes="Allowed *.jpeg, *.jpg, *.png, recommend size of 1200*630 px"
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Collapse>
                  </Card>
                </Stack>
              )}

              {tabValue === 1 && (
                <Stack spacing={3}>
                  {/* Page Title Section */}
                  <Card>
                    <CardHeader
                      title="Overview"
                      subheader="Name, description"
                      action={
                        <IconButton onClick={() => handleExpandSection('pageTitle')}>
                          <Iconify
                            icon={
                              expandedSections.pageTitle
                                ? 'eva:arrow-ios-upward-fill'
                                : 'eva:arrow-ios-downward-fill'
                            }
                          />
                        </IconButton>
                      }
                      sx={{ pb: 3 }}
                    />
                    <Collapse in={expandedSections.pageTitle}>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <Field.Text
                              name="projectInfoTitle"
                              label="Name"
                              placeholder="Enter project title"
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <Field.Text
                              name="projectInfoDescription"
                              label="Description"
                              placeholder="Enter project description"
                              multiline
                              rows={4}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Collapse>
                  </Card>

                  {/* Unit Section */}
                  <Card>
                    <CardHeader
                      title="Plan"
                      subheader="Cover, floor plan"
                      action={
                        <IconButton onClick={() => handleExpandSection('unitInfo')}>
                          <Iconify
                            icon={
                              expandedSections.unitInfo
                                ? 'eva:arrow-ios-upward-fill'
                                : 'eva:arrow-ios-downward-fill'
                            }
                          />
                        </IconButton>
                      }
                      sx={{ pb: 3 }}
                    />
                    <Collapse in={expandedSections.unitInfo}>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          {/* <Grid item xs={12}>
                            <Field.Text
                              name="projectInfoContent"
                              label="Unit Overview"
                              placeholder="Enter unit overview"
                              multiline
                              rows={4}
                            />
                          </Grid> */}

                          {/* <Grid item xs={12}>
                            <Field.Text
                              name="projectInfoUnitInformation"
                              label="Unit Information"
                              placeholder="Enter additional unit information"
                              multiline
                              rows={4}
                            />
                          </Grid> */}

                          {/* <Grid item xs={12}>
                            <Field.Text
                              name="projectInfoUnitHighlight"
                              label="Unit Highlights"
                              placeholder="Enter unit highlights"
                              multiline
                              rows={4}
                            />
                          </Grid> */}

                          {/* Upload Banner before Floor Plan */}
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                              Banner
                            </Typography>
                            <Upload
                              value={watch('projectInfoBannerImage')}
                              onDrop={(acceptedFiles) => {
                                const file = acceptedFiles[0];
                                if (file) {
                                  setValue(
                                    'projectInfoBannerImage',
                                    Object.assign(file, {
                                      preview: URL.createObjectURL(file),
                                    })
                                  );
                                }
                              }}
                              onDelete={() => setValue('projectInfoBannerImage', null)}
                              placeholderTitle="Drop or select file"
                              placeholderDescription="Drop files here or click to browse through your machine."
                              placeholderAllowedTypes="Allowed *.jpeg, *.jpg, *.png"
                            />
                          </Grid>

                          {/* Images Section moved inside Unit - matching reference image */}
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                              Floor Plan
                            </Typography>
                            <Upload
                              multiple
                              thumbnail
                              value={watch('plansGallery') || []}
                              onDrop={(acceptedFiles) => {
                                const currentPlans = watch('plansGallery') || [];
                                setValue('plansGallery', [
                                  ...currentPlans,
                                  ...acceptedFiles.map((newFile) =>
                                    Object.assign(newFile, {
                                      preview: URL.createObjectURL(newFile),
                                    })
                                  ),
                                ]);
                              }}
                              onRemove={(inputFile) => {
                                const currentPlans = watch('plansGallery') || [];
                                const filesFiltered = currentPlans.filter(
                                  (fileFiltered: any) => fileFiltered !== inputFile
                                );
                                setValue('plansGallery', filesFiltered);
                              }}
                              onRemoveAll={() => setValue('plansGallery', [])}
                              placeholderTitle="Drop or select file"
                              placeholderDescription="Drop files here or click to browse through your machine."
                              placeholderAllowedTypes="Allowed *.jpeg, *.jpg, *.png"
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Collapse>
                  </Card>

                  {/* More Information Section */}
                  {/* <Card>
                    <CardHeader
                      title="More Information"
                      subheader="Title, short description, image..."
                      action={
                        <IconButton onClick={() => handleExpandSection('moreInfo')}>
                          <Iconify
                            icon={
                              expandedSections.moreInfo
                                ? 'eva:arrow-ios-upward-fill'
                                : 'eva:arrow-ios-downward-fill'
                            }
                          />
                        </IconButton>
                      }
                      sx={{ pb: 3 }}
                    />
                    <Collapse in={expandedSections.moreInfo}>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                              Content
                            </Typography>
                            <Field.CKEditor
                              name="projectInfoContent"
                              placeholder="Write something awesome..."
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Collapse>
                  </Card> */}

                  {/* Facilities Section */}
                  <Card>
                    <CardHeader
                      title="Facilities"
                      subheader="Subject, description"
                      action={
                        <IconButton onClick={() => handleExpandSection('facilities')}>
                          <Iconify
                            icon={
                              expandedSections.facilities
                                ? 'eva:arrow-ios-upward-fill'
                                : 'eva:arrow-ios-downward-fill'
                            }
                          />
                        </IconButton>
                      }
                      sx={{ pb: 3 }}
                    />
                    <Collapse in={expandedSections.facilities}>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <Field.Text
                              name="projectInfoFacilitiesSubject"
                              label="Subject"
                              placeholder="Enter facilities subject"
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <Field.Text
                              name="projectInfoFacilitiesDesc"
                              label="Description"
                              placeholder="Enter facilities description"
                              multiline
                              rows={4}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Collapse>
                  </Card>
                </Stack>
              )}

              {tabValue === 2 && (
                <Stack spacing={3}>
                  {/* Page Title Section */}
                  <Card>
                    <CardHeader
                      title="Overview"
                      subheader="Name, description"
                      action={
                        <IconButton onClick={() => handleExpandSection('pageTitle')}>
                          <Iconify
                            icon={
                              expandedSections.pageTitle
                                ? 'eva:arrow-ios-upward-fill'
                                : 'eva:arrow-ios-downward-fill'
                            }
                          />
                        </IconButton>
                      }
                      sx={{ pb: 3 }}
                    />
                    <Collapse in={expandedSections.pageTitle}>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <Field.Text
                              name="neighborhoodTitle"
                              label="Name"
                              placeholder="Enter neighborhood title"
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <Field.Text
                              name="neighborhoodDescription"
                              label="Description"
                              placeholder="Enter neighborhood description"
                              multiline
                              rows={4}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Collapse>
                  </Card>

                  {/* Neighborhood Content Section */}
                  <Card>
                    <CardHeader
                      title="Neighborhood"
                      subheader="Content, gallery"
                      action={
                        <IconButton onClick={() => handleExpandSection('neighborhood')}>
                          <Iconify
                            icon={
                              expandedSections.neighborhood
                                ? 'eva:arrow-ios-upward-fill'
                                : 'eva:arrow-ios-downward-fill'
                            }
                          />
                        </IconButton>
                      }
                      sx={{ pb: 3 }}
                    />
                    <Collapse in={expandedSections.neighborhood}>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                              Content
                            </Typography>
                            <Field.CKEditor
                              name="neighborhoodContent"
                              placeholder="Write something awesome..."
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                              Gallery
                            </Typography>
                            <Upload
                              multiple
                              thumbnail
                              value={watch('neighborhoodGallery') || []}
                              onDrop={(acceptedFiles) => {
                                const currentGallery = watch('neighborhoodGallery') || [];
                                setValue('neighborhoodGallery', [
                                  ...currentGallery,
                                  ...acceptedFiles.map((newFile) =>
                                    Object.assign(newFile, {
                                      preview: URL.createObjectURL(newFile),
                                    })
                                  ),
                                ]);
                              }}
                              onRemove={(inputFile) => {
                                const currentGallery = watch('neighborhoodGallery') || [];
                                const filesFiltered = currentGallery.filter(
                                  (fileFiltered: any) => fileFiltered !== inputFile
                                );
                                setValue('neighborhoodGallery', filesFiltered);
                              }}
                              onRemoveAll={() => setValue('neighborhoodGallery', [])}
                              placeholderTitle="Drop or select file"
                              placeholderDescription="Drop files here or click to browse through your machine."
                              placeholderAllowedTypes="Allowed *.jpeg, *.jpg, *.png"
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Collapse>
                  </Card>

                  {/* Google Map Section */}
                  <Card>
                    <CardHeader
                      title="Google Map"
                      subheader="URL"
                      action={
                        <IconButton onClick={() => handleExpandSection('googleMap')}>
                          <Iconify
                            icon={
                              expandedSections.googleMap
                                ? 'eva:arrow-ios-upward-fill'
                                : 'eva:arrow-ios-downward-fill'
                            }
                          />
                        </IconButton>
                      }
                      sx={{ pb: 3 }}
                    />
                    <Collapse in={expandedSections.googleMap}>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <Field.Text
                              name="neighborhoodLocationUrl"
                              label="URL"
                              placeholder="Enter Google Maps URL"
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Collapse>
                  </Card>
                </Stack>
              )}

              {tabValue === 3 && (
                <Stack spacing={3}>
                  {/* Page Title Section */}
                  <Card>
                    <CardHeader
                      title="Overview"
                      subheader="Name"
                      action={
                        <IconButton onClick={() => handleExpandSection('pageTitle')}>
                          <Iconify
                            icon={
                              expandedSections.pageTitle
                                ? 'eva:arrow-ios-upward-fill'
                                : 'eva:arrow-ios-downward-fill'
                            }
                          />
                        </IconButton>
                      }
                      sx={{ pb: 3 }}
                    />
                    <Collapse in={expandedSections.pageTitle}>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <Field.Text
                              name="galleryTourTitle"
                              label="Name"
                              placeholder="Enter gallery title"
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Collapse>
                  </Card>

                  {/* Gallery & Tour Section */}
                  <Card>
                    <CardHeader
                      title="Gallery & Tour"
                      subheader="Image"
                      action={
                        <IconButton onClick={() => handleExpandSection('gallery')}>
                          <Iconify
                            icon={
                              expandedSections.gallery
                                ? 'eva:arrow-ios-upward-fill'
                                : 'eva:arrow-ios-downward-fill'
                            }
                          />
                        </IconButton>
                      }
                      sx={{ pb: 3 }}
                    />
                    <Collapse in={expandedSections.gallery}>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                              Gallery
                            </Typography>
                            <Upload
                              multiple
                              thumbnail
                              value={galleryImages}
                              onDrop={handleDropMultiFile}
                              onRemove={handleRemoveFile}
                              onRemoveAll={handleRemoveAllFiles}
                              placeholderTitle="Drop or select file"
                              placeholderDescription="Drop files here or click to browse through your machine."
                              placeholderAllowedTypes="Allowed *.jpeg, *.jpg, *.png"
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Collapse>
                  </Card>
                </Stack>
              )}

            {/* Sidebar for Edit Mode - Moved to Bottom */}
            {currentPenthouse && (
              <Card>
                <CardHeader
                  title="History"
                  subheader="Created, updates..."
                  action={renderCollapseButton(expandedSections.overview, () =>
                    handleExpandSection('overview')
                  )}
                  sx={{ mb: 3 }}
                />
                
                <Collapse in={expandedSections.overview}>
                  <Divider />
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={3}>
                      {/* Created By Section */}
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                          Created By
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: 'primary.main',
                            }}
                          >
                            {currentPenthouse.createdByName?.charAt(0) || 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {currentPenthouse.createdByName || 'Unknown User'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {(() => {
                                const dateStr = currentPenthouse.createdDate;
                                if (!dateStr) return 'No date';

                                const [datePart, timePart] = dateStr.split(' ');
                                if (!datePart) return 'Invalid Date';

                                const [day, month, year] = datePart.split('/');
                                if (!day || !month || !year) return 'Invalid Date';

                                const jsDateStr = `${month}/${day}/${year}${timePart ? ` ${timePart}` : ''}`;
                                const date = new Date(jsDateStr);

                                return !isNaN(date.getTime())
                                  ? date.toLocaleDateString('en-GB', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: true,
                                    })
                                  : 'Invalid Date';
                              })()}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>

                      {/* Divider */}
                      {currentPenthouse.updatedByName && currentPenthouse.updatedDate && (
                        <Divider sx={{ borderStyle: 'dashed' }} />
                      )}

                      {/* Updated By Section */}
                      {currentPenthouse.updatedByName && currentPenthouse.updatedDate && (
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                            Updated By
                          </Typography>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: 'primary.main',
                              }}
                            >
                              {currentPenthouse.updatedByName?.charAt(0) || 'U'}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {currentPenthouse.updatedByName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {(() => {
                                  const dateStr = currentPenthouse.updatedDate;
                                  if (!dateStr) return 'No date';

                                  const [datePart, timePart] = dateStr.split(' ');
                                  if (!datePart) return 'Invalid Date';

                                  const [day, month, year] = datePart.split('/');
                                  if (!day || !month || !year) return 'Invalid Date';

                                  const jsDateStr = `${month}/${day}/${year}${timePart ? ` ${timePart}` : ''}`;
                                  const date = new Date(jsDateStr);

                                  return !isNaN(date.getTime())
                                    ? date.toLocaleDateString('en-GB', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true,
                                      })
                                    : 'Invalid Date';
                                })()}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Collapse>
              </Card>
            )}
          </Stack>
        </Form>
      ) : (
        // Create Mode: Same tabbed structure as edit mode
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={{ xs: 3, md: 5 }} sx={{ mx: 'auto', maxWidth: { xs: 720, xl: 880 } }}>
            {tabValue === 0 && (
              <Stack spacing={3}>
                <Card>
                  <CardHeader
                    title="Overview"
                    subheader="Name, short description..."
                    action={renderCollapseButton(expandedSections.overview, () =>
                      handleExpandSection('overview')
                    )}
                    sx={{ mb: 3 }}
                  />
                  <Collapse in={expandedSections.overview}>
                    <Divider />
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Field.Text
                            name="slug"
                            label="URL Alias *"
                            placeholder="Enter URL alias"
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Field.Text name="title" label="Name *" placeholder="Enter name" />
                        </Grid>

                        <Grid item xs={12}>
                          <Field.Text
                            name="description"
                            label="Short Description"
                            placeholder="Enter short description"
                            multiline
                            rows={4}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Field.Switch name="isPinned" label="Pin (Displayed on homepage)" />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Collapse>
                </Card>

                <Card>
                  <CardHeader
                    title="Properties"
                    subheader="Additional functions and attributes..."
                    action={renderCollapseButton(expandedSections.overview, () =>
                      handleExpandSection('overview')
                    )}
                    sx={{ mb: 3 }}
                  />
                  <Collapse in={expandedSections.overview}>
                    <Divider />
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Field.Select
                            name="offerTypeId"
                            label="Offer Type"
                            placeholder="Select offer type"
                          >
                            <MenuItem value="">
                              <em>Select offer type</em>
                            </MenuItem>
                            {offerTypes.map((offerType) => {
                              const translation = offerType.translations?.find(
                                (t) => t.languageCode === selectedLanguage?.code
                              );
                              return (
                                <MenuItem key={offerType.id} value={offerType.id}>
                                  {translation?.name || offerType.name}
                                </MenuItem>
                              );
                            })}
                          </Field.Select>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Field.Select
                            name="propertyTypeId"
                            label="Property Type"
                            placeholder="Select property type"
                          >
                            <MenuItem value="">
                              <em>Select property type</em>
                            </MenuItem>
                            {propertyTypes.map((propertyType) => {
                              const translation = propertyType.translations?.find(
                                (t) => t.languageCode === selectedLanguage?.code
                              );
                              return (
                                <MenuItem key={propertyType.id} value={propertyType.id}>
                                  {translation?.name || propertyType.name}
                                </MenuItem>
                              );
                            })}
                          </Field.Select>
                        </Grid>

                        <Grid item xs={12}>
                          <Field.Select
                            name="locationId"
                            label="Location"
                            placeholder="Select location"
                          >
                            <MenuItem value="">
                              <em>Select location</em>
                            </MenuItem>
                            {locations.map((location) => {
                              const translation = location.translations?.find(
                                (t) => t.languageCode === selectedLanguage?.code
                              );
                              return (
                                <MenuItem key={location.id} value={location.id}>
                                  {translation?.name || location.name}
                                </MenuItem>
                              );
                            })}
                          </Field.Select>
                        </Grid>

                        <Grid item xs={12}>
                          <Field.MultiSelect
                            name="areaId"
                            label="Zone"
                            placeholder=""
                            chip
                            checkbox
                            fullWidth
                            options={zones.map((zone) => {
                              const translation = zone.translations?.find(
                                (t) => t.languageCode === selectedLanguage?.code
                              );
                              return {
                                label: translation?.name || zone.name || '',
                                value: zone.id.toString(),
                              };
                            })}
                          />
                        </Grid>

                        {/* <Grid item xs={12}>
                          <Field.Text
                            name="unitSize"
                            label="Unit (Sq.m.)"
                            placeholder="Enter unit size"
                            type="number"
                          />
                        </Grid> */}

                        <Grid item xs={12} md={6}>
                          <Field.Text
                            name="bedroom"
                            label="Bedroom"
                            placeholder="Enter number of bedrooms"
                            type="number"
                            slotProps={{
                              input: {
                                inputProps: { min: 0 },
                              },
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Field.Text
                            name="bathroom"
                            label="Bathroom"
                            placeholder="Enter number of bathrooms"
                            type="number"
                            slotProps={{
                              input: {
                                inputProps: { min: 0 },
                              },
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Field.Text
                            name="usableAreaSqm"
                            label="Usable Area (Sq.m.)"
                            placeholder="Enter usable area"
                            type="number"
                            slotProps={{
                              input: {
                                inputProps: { step: 0.01 },
                              },
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Field.Text
                            name="plotSizeSqw"
                            label="Plot Size (Sq.w.)"
                            placeholder="Enter plot size"
                            type="number"
                            slotProps={{
                              input: {
                                inputProps: { step: 0.01 },
                              },
                            }}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Collapse>
                </Card>

                {/* Pricing Section - Only show if there are relevant price fields to display */}
                {(shouldShowSalePrice || shouldShowRentPrice) && (
                  <Card>
                    <CardHeader
                      title="Pricing"
                      subheader="Price related inputs"
                      action={renderCollapseButton(expandedSections.pricing, () =>
                        handleExpandSection('pricing')
                      )}
                      sx={{ mb: 3 }}
                    />
                    <Collapse in={expandedSections.pricing}>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          {currencies.map((currency) => (
                            <Grid item xs={12} key={currency.code}>
                              <Typography variant="subtitle2" gutterBottom sx={{mb:1}}>
                                {currency.code} ({currency.name})
                              </Typography>
                              <Grid container spacing={2}>
                                {shouldShowSalePrice && (
                                  <Grid item xs={12} md={shouldShowRentPrice ? 6 : 12}>
                                    <Controller
                                      name={`salePrice_${currency.code}`}
                                      control={methods.control}
                                      render={({ field, fieldState: { error } }) => (
                                        <Field.Text
                                          {...field}
                                          label="For Sale"
                                          placeholder=""
                                          error={!!error}
                                          helperText={error?.message}
                                          value={
                                            field.value
                                              ? Number(field.value).toLocaleString()
                                              : ''
                                          }
                                          onChange={(e) => {
                                            const value = e.target.value.replace(/,/g, '');
                                            if (!isNaN(Number(value)) || value === '') {
                                              field.onChange(value);
                                            }
                                          }}
                                          slotProps={{
                                            input: {
                                              inputProps: {
                                                style: { textAlign: 'right' },
                                              },
                                            },
                                          }}
                                        />
                                      )}
                                    />
                                  </Grid>
                                )}
                                {shouldShowRentPrice && (
                                  <Grid item xs={12} md={shouldShowSalePrice ? 6 : 12}>
                                    <Controller
                                      name={`rentPrice_${currency.code}`}
                                      control={methods.control}
                                      render={({ field, fieldState: { error } }) => (
                                        <Field.Text
                                          {...field}
                                          label="For Rent"
                                          placeholder=""
                                          error={!!error}
                                          helperText={error?.message}
                                          value={
                                            field.value
                                              ? Number(field.value).toLocaleString()
                                              : ''
                                          }
                                          onChange={(e) => {
                                            const value = e.target.value.replace(/,/g, '');
                                            if (!isNaN(Number(value)) || value === '') {
                                              field.onChange(value);
                                            }
                                          }}
                                          slotProps={{
                                            input: {
                                              inputProps: {
                                                style: { textAlign: 'right' },
                                              },
                                            },
                                          }}
                                        />
                                      )}
                                    />
                                  </Grid>
                                )}
                              </Grid>
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                    </Collapse>
                  </Card>
                )}

                {/* Images Section */}
                <Card>
                  <CardHeader
                    title="Images"
                    subheader="Upload your images"
                    action={renderCollapseButton(expandedSections.images, () =>
                      handleExpandSection('images')
                    )}
                    sx={{ mb: 3 }}
                  />
                  <Collapse in={expandedSections.images}>
                    <Divider />
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>
                            Thumbnail
                          </Typography>
                          <Upload
                            value={watch('thumbnailImage')}
                            onDrop={(acceptedFiles) => {
                              const file = acceptedFiles[0];
                              if (file) {
                                setValue(
                                  'thumbnailImage',
                                  Object.assign(file, {
                                    preview: URL.createObjectURL(file),
                                  })
                                );
                              }
                            }}
                            onDelete={() => setValue('thumbnailImage', null)}
                            placeholderTitle="Drop or select file"
                            placeholderDescription="Drop files here or click to browse through your machine."
                            placeholderAllowedTypes="Allowed *.jpeg, *.jpg, *.png, recommend size of 500*500 px"
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>
                            Logo
                          </Typography>
                          <Upload
                            value={watch('logoImage')}
                            onDrop={(acceptedFiles) => {
                              const file = acceptedFiles[0];
                              if (file) {
                                setValue(
                                  'logoImage',
                                  Object.assign(file, {
                                    preview: URL.createObjectURL(file),
                                  })
                                );
                              }
                            }}
                            onDelete={() => setValue('logoImage', null)}
                            placeholderTitle="Drop or select file"
                            placeholderDescription="Drop files here or click to browse through your machine."
                            placeholderAllowedTypes="Allowed *.jpeg, *.jpg, *.png, recommend size of 500*500 px"
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>
                            Cover
                          </Typography>
                          <Upload
                            value={watch('coverImage')}
                            onDrop={(acceptedFiles) => {
                              const file = acceptedFiles[0];
                              if (file) {
                                setValue(
                                  'coverImage',
                                  Object.assign(file, {
                                    preview: URL.createObjectURL(file),
                                  })
                                );
                              }
                            }}
                            onDelete={() => setValue('coverImage', null)}
                            placeholderTitle="Drop or select file"
                            placeholderDescription="Drop files here or click to browse through your machine."
                            placeholderAllowedTypes="Allowed *.jpeg, *.jpg, *.png, recommend size of 1920*1080 px"
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Collapse>
                </Card>

                {/* SEO Section */}
                <Card>
                  <CardHeader
                    title="SEO"
                    subheader="Search Engine Optimization"
                    action={renderCollapseButton(expandedSections.seo, () =>
                      handleExpandSection('seo')
                    )}
                    sx={{ mb: 3 }}
                  />
                  <Collapse in={expandedSections.seo}>
                    <Divider />
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Field.Text
                            name="metaTitle"
                            label="Meta Title"
                            placeholder="Enter meta title"
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Field.Text
                            name="metaKeywords"
                            label="Meta Keyword"
                            placeholder="Enter meta keywords"
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Field.Text
                            name="metaDescription"
                            label="Meta Description"
                            placeholder="Enter meta description"
                            multiline
                            rows={4}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>
                            OG Image
                          </Typography>
                          <Upload
                            value={watch('ogImage')}
                            onDrop={(acceptedFiles) => {
                              const file = acceptedFiles[0];
                              if (file) {
                                setValue(
                                  'ogImage',
                                  Object.assign(file, {
                                    preview: URL.createObjectURL(file),
                                  })
                                );
                              }
                            }}
                            onDelete={() => setValue('ogImage', null)}
                            placeholderTitle="Drop or select file"
                            placeholderDescription="Drop files here or click to browse through your machine."
                            placeholderAllowedTypes="Allowed *.jpeg, *.jpg, *.png, recommend size of 1200*630 px"
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Collapse>
                </Card>
              </Stack>
            )}

            {tabValue === 1 && (
              <Stack spacing={3}>
                {/* Page Title Section */}
                <Card>
                  <CardHeader
                    title="Overview"
                    subheader="Name, description"
                    action={
                      <IconButton onClick={() => handleExpandSection('pageTitle')}>
                        <Iconify
                          icon={
                            expandedSections.pageTitle
                              ? 'eva:arrow-ios-upward-fill'
                              : 'eva:arrow-ios-downward-fill'
                          }
                        />
                      </IconButton>
                    }
                    sx={{ pb: 3 }}
                  />
                  <Collapse in={expandedSections.pageTitle}>
                    <Divider />
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Field.Text
                            name="projectInfoTitle"
                            label="Name"
                            placeholder="Enter project title"
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Field.Text
                            name="projectInfoDescription"
                            label="Description"
                            placeholder="Enter project description"
                            multiline
                            rows={4}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Collapse>
                </Card>

                {/* Unit Section */}
                <Card>
                  <CardHeader
                    title="Plan"
                    subheader="Cover, floor plan"
                    action={
                      <IconButton onClick={() => handleExpandSection('unitInfo')}>
                        <Iconify
                          icon={
                            expandedSections.unitInfo
                              ? 'eva:arrow-ios-upward-fill'
                              : 'eva:arrow-ios-downward-fill'
                          }
                        />
                      </IconButton>
                    }
                    sx={{ pb: 3 }}
                  />
                  <Collapse in={expandedSections.unitInfo}>
                    <Divider />
                    <CardContent>
                      <Grid container spacing={3}>
                        {/* <Grid item xs={12}>
                          <Field.Text
                            name="projectInfoContent"
                            label="Unit Overview"
                            placeholder="Enter unit overview"
                            multiline
                            rows={4}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Field.Text
                            name="projectInfoUnitInformation"
                            label="Unit Information"
                            placeholder="Enter additional unit information"
                            multiline
                            rows={4}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Field.Text
                            name="projectInfoUnitHighlight"
                            label="Unit Highlights"
                            placeholder="Enter unit highlights"
                            multiline
                            rows={4}
                          />
                        </Grid> */}
                         <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                              Banner
                            </Typography>
                            <Upload
                              value={watch('projectInfoBannerImage')}
                              onDrop={(acceptedFiles) => {
                                const file = acceptedFiles[0];
                                if (file) {
                                  setValue(
                                    'projectInfoBannerImage',
                                    Object.assign(file, {
                                      preview: URL.createObjectURL(file),
                                    })
                                  );
                                }
                              }}
                              onDelete={() => setValue('projectInfoBannerImage', null)}
                              placeholderTitle="Drop or select file"
                              placeholderDescription="Drop files here or click to browse through your machine."
                              placeholderAllowedTypes="Allowed *.jpeg, *.jpg, *.png"
                            />
                          </Grid>
                        {/* Images Section moved inside Unit - matching reference image */}
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>
                            Floor Plan
                          </Typography>
                          <Upload
                            multiple
                            thumbnail
                            value={watch('plansGallery') || []}
                            onDrop={(acceptedFiles) => {
                              const currentPlans = watch('plansGallery') || [];
                              setValue('plansGallery', [
                                ...currentPlans,
                                ...acceptedFiles.map((newFile) =>
                                  Object.assign(newFile, {
                                    preview: URL.createObjectURL(newFile),
                                  })
                                ),
                              ]);
                            }}
                            onRemove={(inputFile) => {
                              const currentPlans = watch('plansGallery') || [];
                              const filesFiltered = currentPlans.filter(
                                (fileFiltered: any) => fileFiltered !== inputFile
                              );
                              setValue('plansGallery', filesFiltered);
                            }}
                            onRemoveAll={() => setValue('plansGallery', [])}
                            placeholderTitle="Drop or select file"
                            placeholderDescription="Drop files here or click to browse through your machine."
                            placeholderAllowedTypes="Allowed *.jpeg, *.jpg, *.png"
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Collapse>
                </Card>

                {/* More Information Section */}
                {/* <Card>
                  <CardHeader
                    title="More Information"
                    subheader="Title, short description, image..."
                    action={
                      <IconButton onClick={() => handleExpandSection('moreInfo')}>
                        <Iconify
                          icon={
                            expandedSections.moreInfo
                              ? 'eva:arrow-ios-upward-fill'
                              : 'eva:arrow-ios-downward-fill'
                          }
                        />
                      </IconButton>
                    }
                    sx={{ pb: 3 }}
                  />
                  <Collapse in={expandedSections.moreInfo}>
                    <Divider />
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>
                            Content
                          </Typography>
                          <Field.CKEditor
                            name="projectInfoContent"
                            placeholder="Write something awesome..."
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Collapse>
                </Card> */}

                {/* Facilities Section */}
                <Card>
                  <CardHeader
                    title="Facilities"
                    subheader="Subject, description"
                    action={
                      <IconButton onClick={() => handleExpandSection('facilities')}>
                        <Iconify
                          icon={
                            expandedSections.facilities
                              ? 'eva:arrow-ios-upward-fill'
                              : 'eva:arrow-ios-downward-fill'
                          }
                        />
                      </IconButton>
                    }
                    sx={{ pb: 3 }}
                  />
                  <Collapse in={expandedSections.facilities}>
                    <Divider />
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Field.Text
                            name="projectInfoFacilitiesSubject"
                            label="Subject"
                            placeholder="Enter facilities subject"
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Field.Text
                            name="projectInfoFacilitiesDesc"
                            label="Description"
                            placeholder="Enter facilities description"
                            multiline
                            rows={4}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Collapse>
                </Card>
              </Stack>
            )}

            {tabValue === 2 && (
              <Stack spacing={3}>
                {/* Page Title Section */}
                <Card>
                  <CardHeader
                    title="Overview"
                    subheader="Name, description"
                    action={
                      <IconButton onClick={() => handleExpandSection('pageTitle')}>
                        <Iconify
                          icon={
                            expandedSections.pageTitle
                              ? 'eva:arrow-ios-upward-fill'
                              : 'eva:arrow-ios-downward-fill'
                          }
                        />
                      </IconButton>
                    }
                    sx={{ pb: 3 }}
                  />
                  <Collapse in={expandedSections.pageTitle}>
                    <Divider />
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Field.Text
                            name="neighborhoodTitle"
                            label="Name"
                            placeholder="Enter neighborhood title"
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Field.Text
                            name="neighborhoodDescription"
                            label="Description"
                            placeholder="Enter neighborhood description"
                            multiline
                            rows={4}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Collapse>
                </Card>

                {/* Neighborhood Content Section */}
                <Card>
                  <CardHeader
                    title="Neighborhood"
                    subheader="Content, gallery"
                    action={
                      <IconButton onClick={() => handleExpandSection('neighborhood')}>
                        <Iconify
                          icon={
                            expandedSections.neighborhood
                              ? 'eva:arrow-ios-upward-fill'
                              : 'eva:arrow-ios-downward-fill'
                          }
                        />
                      </IconButton>
                    }
                    sx={{ pb: 3 }}
                  />
                  <Collapse in={expandedSections.neighborhood}>
                    <Divider />
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>
                            Content
                          </Typography>
                          <Field.CKEditor
                            name="neighborhoodContent"
                            placeholder="Write something awesome..."
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>
                            Gallery
                          </Typography>
                          <Upload
                            multiple
                            thumbnail
                            value={watch('neighborhoodGallery') || []}
                            onDrop={(acceptedFiles) => {
                              const currentGallery = watch('neighborhoodGallery') || [];
                              setValue('neighborhoodGallery', [
                                ...currentGallery,
                                ...acceptedFiles.map((newFile) =>
                                  Object.assign(newFile, {
                                    preview: URL.createObjectURL(newFile),
                                  })
                                ),
                              ]);
                            }}
                            onRemove={(inputFile) => {
                              const currentGallery = watch('neighborhoodGallery') || [];
                              const filesFiltered = currentGallery.filter(
                                (fileFiltered: any) => fileFiltered !== inputFile
                              );
                              setValue('neighborhoodGallery', filesFiltered);
                            }}
                            onRemoveAll={() => setValue('neighborhoodGallery', [])}
                            placeholderTitle="Drop or select file"
                            placeholderDescription="Drop files here or click to browse through your machine."
                            placeholderAllowedTypes="Allowed *.jpeg, *.jpg, *.png"
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Collapse>
                </Card>

                {/* Google Map Section */}
                <Card>
                  <CardHeader
                    title="Google Map"
                    subheader="URL"
                    action={
                      <IconButton onClick={() => handleExpandSection('googleMap')}>
                        <Iconify
                          icon={
                            expandedSections.googleMap
                              ? 'eva:arrow-ios-upward-fill'
                              : 'eva:arrow-ios-downward-fill'
                          }
                        />
                      </IconButton>
                    }
                    sx={{ pb: 3 }}
                  />
                  <Collapse in={expandedSections.googleMap}>
                    <Divider />
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Field.Text
                            name="neighborhoodLocationUrl"
                            label="URL"
                            placeholder="Enter Google Maps URL"
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Collapse>
                </Card>
              </Stack>
            )}

            {tabValue === 3 && (
              <Stack spacing={3}>
                {/* Page Title Section */}
                <Card>
                  <CardHeader
                    title="Overview"
                    subheader="Name"
                    action={
                      <IconButton onClick={() => handleExpandSection('pageTitle')}>
                        <Iconify
                          icon={
                            expandedSections.pageTitle
                              ? 'eva:arrow-ios-upward-fill'
                              : 'eva:arrow-ios-downward-fill'
                          }
                        />
                      </IconButton>
                    }
                    sx={{ pb: 3 }}
                  />
                  <Collapse in={expandedSections.pageTitle}>
                    <Divider />
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Field.Text
                            name="galleryTourTitle"
                            label="Name"
                            placeholder="Enter gallery title"
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Collapse>
                </Card>

                {/* Gallery & Tour Section */}
                <Card>
                  <CardHeader
                    title="Gallery & Tour"
                    subheader="Image"
                    action={
                      <IconButton onClick={() => handleExpandSection('gallery')}>
                        <Iconify
                          icon={
                            expandedSections.gallery
                              ? 'eva:arrow-ios-upward-fill'
                              : 'eva:arrow-ios-downward-fill'
                          }
                        />
                      </IconButton>
                    }
                    sx={{ pb: 3 }}
                  />
                  <Collapse in={expandedSections.gallery}>
                    <Divider />
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>
                            Gallery
                          </Typography>
                          <Upload
                            multiple
                            thumbnail
                            value={galleryImages}
                            onDrop={handleDropMultiFile}
                            onRemove={handleRemoveFile}
                            onRemoveAll={handleRemoveAllFiles}
                            placeholderTitle="Drop or select file"
                            placeholderDescription="Drop files here or click to browse through your machine."
                            placeholderAllowedTypes="Allowed *.jpeg, *.jpg, *.png"
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Collapse>
                </Card>
              </Stack>
            )}
          </Stack>
        </Form>
      )}

      {renderPublishActions()}

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        title={confirmDialog.title}
        content={confirmDialog.content}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (confirmDialog.action) {
                confirmDialog.action();
              }
              setConfirmDialog({ ...confirmDialog, open: false });
            }}
          >
            Delete
          </Button>
        }
      />
    </DashboardContent>
  );
}
