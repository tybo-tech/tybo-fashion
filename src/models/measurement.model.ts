

export interface IMeasurement {
  Name: string;
  Units: string;
  Value: string;
  Image: string;
}


export const initMeasurements = (name: string,val = '', img = '',units = ''): IMeasurement => {
  const item: IMeasurement = {
    Name: name,
    Value: val,
    Image: img,
    Units: units,
  };
  return item;
};