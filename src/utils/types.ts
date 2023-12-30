export type eventID =
  | "333"
  | "222"
  | "444"
  | "555"
  | "666"
  | "777"
  | "333bf"
  | "333fm"
  | "333oh"
  | "minx"
  | "pyram"
  | "skewb"
  | "sq1"
  | "clock"
  | "444bf"
  | "555bf"
  | "333mbf";

export type coordinate = {
  lat: number;
  lon: number;
};

export type Nullable<T> = T | null;

export type competition = {
  id: string;
  name: string;
  city: string;
  country: string;
  isCanceled: boolean;
  information: string;
  externalWebsite: Nullable<string>;
  date: {
    from: string;
    till: string;
    numberOfDays: number;
  };
  events: eventID[];
  wcaDelegates: { name: string; email: string }[];
  organisers: { name: string; email: string }[];
  venue: {
    name: string;
    address: string;
    details: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
};
