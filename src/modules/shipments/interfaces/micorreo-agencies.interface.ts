interface MiCorreoAgenciesInterface {
  code: string;
  name: string;
  manager: string;
  email: string;
  phone: string;
  services: AgenciesServices;
  location: AgenciesLocation;
  hours: AgenciesHours;
  status: AgenciesStatus;
  nearByPostalCode: string;
}

interface AgenciesServices {
  packageReception: boolean;
  pickupAvailability: boolean;
}

interface AgenciesLocation {
  address: AgenciesAddress;
  latitude: string;
  longitude: string;
}

interface AgenciesAddress {
  streetName: string;
  streetNumber: string;
  floor?: string;
  apartment?: string;
  locality: string;
  city: string;
  provinceCode: string;
  postalCode: string;
  province: string;
}

interface AgenciesHours {
  sunday?: AgenciesSchedule;
  monday?: AgenciesSchedule;
  tuesday?: AgenciesSchedule;
  wednesday?: AgenciesSchedule;
  thursday?: AgenciesSchedule;
  friday?: AgenciesSchedule;
  saturday?: AgenciesSchedule;
  holidays?: AgenciesSchedule;
}

interface AgenciesSchedule {
  start: string;
  end: string;
}

type AgenciesStatus = 'ACTIVE' | 'INACTIVE';

export type MiCorreoAgenciesResponseInterface = MiCorreoAgenciesInterface[];