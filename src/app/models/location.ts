import { Country } from './country';
import { District } from './district';
import { Province } from './province';

export interface AddressLocation {
  country: Country | null;
  province: Province | null;
  district: District | null;
  idaccount?: number | null;
}
