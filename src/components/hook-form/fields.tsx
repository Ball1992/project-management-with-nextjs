import { RHFCode } from './rhf-code';
import { RHFRating } from './rhf-rating';
import { RHFSlider } from './rhf-slider';
import { RHFTextField } from './rhf-text-field';
import { RHFRadioGroup } from './rhf-radio-group';
import { RHFPhoneInput } from './rhf-phone-input';
import { RHFNumberInput } from './rhf-number-input';
import { RHFAutocomplete } from './rhf-autocomplete';
import { RHFCountrySelect } from './rhf-country-select';
import { RHFSwitch, RHFMultiSwitch } from './rhf-switch';
import { RHFSelect, RHFMultiSelect } from './rhf-select';
import { RHFCheckbox, RHFMultiCheckbox } from './rhf-checkbox';
import { RHFUpload, RHFUploadBox, RHFUploadAvatar, RHFUploadCoverImage } from './rhf-upload';
import { RHFDatePicker, RHFMobileDateTimePicker } from './rhf-date-picker';
import { RHFCKEditor } from './rhf-ckeditor';
import { RHFImageUpload, RHFMultiImageUpload } from './rhf-image-upload';

// ----------------------------------------------------------------------

export const Field = {
  Code: RHFCode,
  Select: RHFSelect,
  Upload: RHFUpload,
  Switch: RHFSwitch,
  Slider: RHFSlider,
  Rating: RHFRating,
  Text: RHFTextField,
  Phone: RHFPhoneInput,
  CKEditor: RHFCKEditor,
  Checkbox: RHFCheckbox,
  UploadBox: RHFUploadBox,
  RadioGroup: RHFRadioGroup,
  DatePicker: RHFDatePicker,
  NumberInput: RHFNumberInput,
  MultiSelect: RHFMultiSelect,
  MultiSwitch: RHFMultiSwitch,
  UploadAvatar: RHFUploadAvatar,
  UploadCoverImage: RHFUploadCoverImage,
  Autocomplete: RHFAutocomplete,
  MultiCheckbox: RHFMultiCheckbox,
  CountrySelect: RHFCountrySelect,
  MobileDateTimePicker: RHFMobileDateTimePicker,
  ImageUpload: RHFImageUpload,
  MultiImageUpload: RHFMultiImageUpload,
};
