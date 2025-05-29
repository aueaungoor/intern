import { Country } from './country';
import { District } from './district';
import { Province } from './province';

export interface LocationData {
  country?: Country;
  province?: Province;
  district?: District;
}
