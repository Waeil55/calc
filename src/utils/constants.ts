import type { ConversionCategory } from '@/types';

// All unit conversion definitions
// factor = multiplier to convert TO the base unit

export const UNIT_CATEGORIES: ConversionCategory[] = [
  {
    name: 'Length',
    icon: 'ruler',
    units: [
      { id: 'mm', name: 'Millimeter', symbol: 'mm', factor: 0.001 },
      { id: 'cm', name: 'Centimeter', symbol: 'cm', factor: 0.01 },
      { id: 'm', name: 'Meter', symbol: 'm', factor: 1 },
      { id: 'km', name: 'Kilometer', symbol: 'km', factor: 1000 },
      { id: 'in', name: 'Inch', symbol: 'in', factor: 0.0254 },
      { id: 'ft', name: 'Foot', symbol: 'ft', factor: 0.3048 },
      { id: 'yd', name: 'Yard', symbol: 'yd', factor: 0.9144 },
      { id: 'mi', name: 'Mile', symbol: 'mi', factor: 1609.344 },
      { id: 'nm', name: 'Nanometer', symbol: 'nm', factor: 1e-9 },
      { id: 'um', name: 'Micrometer', symbol: 'μm', factor: 1e-6 },
      { id: 'ly', name: 'Light Year', symbol: 'ly', factor: 9.461e15 },
      { id: 'pc', name: 'Parsec', symbol: 'pc', factor: 3.086e16 },
    ],
  },
  {
    name: 'Mass',
    icon: 'scale',
    units: [
      { id: 'mg', name: 'Milligram', symbol: 'mg', factor: 1e-6 },
      { id: 'g', name: 'Gram', symbol: 'g', factor: 0.001 },
      { id: 'kg', name: 'Kilogram', symbol: 'kg', factor: 1 },
      { id: 'tonne', name: 'Metric Ton', symbol: 't', factor: 1000 },
      { id: 'oz', name: 'Ounce', symbol: 'oz', factor: 0.028349523 },
      { id: 'lb', name: 'Pound', symbol: 'lb', factor: 0.45359237 },
      { id: 'stone', name: 'Stone', symbol: 'st', factor: 6.35029318 },
      { id: 'ton', name: 'Short Ton', symbol: 'ton', factor: 907.184874 },
    ],
  },
  {
    name: 'Temperature',
    icon: 'thermometer',
    units: [
      { id: 'C', name: 'Celsius', symbol: '°C', factor: 1, offset: 0 },
      { id: 'F', name: 'Fahrenheit', symbol: '°F', factor: 5 / 9, offset: -32 },
      { id: 'K', name: 'Kelvin', symbol: 'K', factor: 1, offset: -273.15 },
      { id: 'R', name: 'Rankine', symbol: '°R', factor: 5 / 9, offset: -491.67 },
    ],
  },
  {
    name: 'Area',
    icon: 'square',
    units: [
      { id: 'mm2', name: 'Square Millimeter', symbol: 'mm²', factor: 1e-6 },
      { id: 'cm2', name: 'Square Centimeter', symbol: 'cm²', factor: 1e-4 },
      { id: 'm2', name: 'Square Meter', symbol: 'm²', factor: 1 },
      { id: 'km2', name: 'Square Kilometer', symbol: 'km²', factor: 1e6 },
      { id: 'in2', name: 'Square Inch', symbol: 'in²', factor: 0.00064516 },
      { id: 'ft2', name: 'Square Foot', symbol: 'ft²', factor: 0.09290304 },
      { id: 'yd2', name: 'Square Yard', symbol: 'yd²', factor: 0.83612736 },
      { id: 'acre', name: 'Acre', symbol: 'ac', factor: 4046.85642 },
      { id: 'ha', name: 'Hectare', symbol: 'ha', factor: 10000 },
      { id: 'mi2', name: 'Square Mile', symbol: 'mi²', factor: 2589988.11 },
    ],
  },
  {
    name: 'Volume',
    icon: 'droplet',
    units: [
      { id: 'ml', name: 'Milliliter', symbol: 'mL', factor: 0.001 },
      { id: 'l', name: 'Liter', symbol: 'L', factor: 1 },
      { id: 'cm3', name: 'Cubic Centimeter', symbol: 'cm³', factor: 0.001 },
      { id: 'm3', name: 'Cubic Meter', symbol: 'm³', factor: 1000 },
      { id: 'floz', name: 'Fluid Ounce (US)', symbol: 'fl oz', factor: 0.0295735 },
      { id: 'cup', name: 'Cup (US)', symbol: 'cup', factor: 0.236588 },
      { id: 'pt', name: 'Pint (US)', symbol: 'pt', factor: 0.473176 },
      { id: 'qt', name: 'Quart (US)', symbol: 'qt', factor: 0.946353 },
      { id: 'gal', name: 'Gallon (US)', symbol: 'gal', factor: 3.785412 },
      { id: 'tsp', name: 'Teaspoon', symbol: 'tsp', factor: 0.00492892 },
      { id: 'tbsp', name: 'Tablespoon', symbol: 'tbsp', factor: 0.0147868 },
      { id: 'bbl', name: 'Barrel', symbol: 'bbl', factor: 158.987 },
    ],
  },
  {
    name: 'Speed',
    icon: 'zap',
    units: [
      { id: 'ms', name: 'Meters per Second', symbol: 'm/s', factor: 1 },
      { id: 'kmh', name: 'Kilometers per Hour', symbol: 'km/h', factor: 1 / 3.6 },
      { id: 'mph', name: 'Miles per Hour', symbol: 'mph', factor: 0.44704 },
      { id: 'knot', name: 'Knot', symbol: 'kn', factor: 0.514444 },
      { id: 'mach', name: 'Mach', symbol: 'Ma', factor: 343 },
      { id: 'c', name: 'Speed of Light', symbol: 'c', factor: 299792458 },
    ],
  },
  {
    name: 'Time',
    icon: 'clock',
    units: [
      { id: 'ns', name: 'Nanosecond', symbol: 'ns', factor: 1e-9 },
      { id: 'us', name: 'Microsecond', symbol: 'μs', factor: 1e-6 },
      { id: 'ms_t', name: 'Millisecond', symbol: 'ms', factor: 1e-3 },
      { id: 's', name: 'Second', symbol: 's', factor: 1 },
      { id: 'min', name: 'Minute', symbol: 'min', factor: 60 },
      { id: 'hr', name: 'Hour', symbol: 'hr', factor: 3600 },
      { id: 'day', name: 'Day', symbol: 'd', factor: 86400 },
      { id: 'week', name: 'Week', symbol: 'wk', factor: 604800 },
      { id: 'month', name: 'Month (avg)', symbol: 'mo', factor: 2629746 },
      { id: 'year', name: 'Year', symbol: 'yr', factor: 31556952 },
      { id: 'decade', name: 'Decade', symbol: 'dec', factor: 315569520 },
      { id: 'century', name: 'Century', symbol: 'cent', factor: 3155695200 },
    ],
  },
  {
    name: 'Data Storage',
    icon: 'database',
    units: [
      { id: 'bit', name: 'Bit', symbol: 'b', factor: 1 },
      { id: 'byte', name: 'Byte', symbol: 'B', factor: 8 },
      { id: 'kb', name: 'Kilobyte', symbol: 'KB', factor: 8000 },
      { id: 'mb', name: 'Megabyte', symbol: 'MB', factor: 8e6 },
      { id: 'gb', name: 'Gigabyte', symbol: 'GB', factor: 8e9 },
      { id: 'tb', name: 'Terabyte', symbol: 'TB', factor: 8e12 },
      { id: 'pb', name: 'Petabyte', symbol: 'PB', factor: 8e15 },
      { id: 'kib', name: 'Kibibyte', symbol: 'KiB', factor: 8192 },
      { id: 'mib', name: 'Mebibyte', symbol: 'MiB', factor: 8 * 1048576 },
      { id: 'gib', name: 'Gibibyte', symbol: 'GiB', factor: 8 * 1073741824 },
      { id: 'tib', name: 'Tebibyte', symbol: 'TiB', factor: 8 * 1099511627776 },
    ],
  },
  {
    name: 'Data Transfer',
    icon: 'wifi',
    units: [
      { id: 'bps', name: 'Bits per second', symbol: 'bps', factor: 1 },
      { id: 'kbps', name: 'Kilobits per second', symbol: 'Kbps', factor: 1000 },
      { id: 'mbps', name: 'Megabits per second', symbol: 'Mbps', factor: 1e6 },
      { id: 'gbps', name: 'Gigabits per second', symbol: 'Gbps', factor: 1e9 },
    ],
  },
  {
    name: 'Energy',
    icon: 'battery',
    units: [
      { id: 'j', name: 'Joule', symbol: 'J', factor: 1 },
      { id: 'kj', name: 'Kilojoule', symbol: 'kJ', factor: 1000 },
      { id: 'cal', name: 'Calorie', symbol: 'cal', factor: 4.184 },
      { id: 'kcal', name: 'Kilocalorie', symbol: 'kcal', factor: 4184 },
      { id: 'wh', name: 'Watt-hour', symbol: 'Wh', factor: 3600 },
      { id: 'kwh', name: 'Kilowatt-hour', symbol: 'kWh', factor: 3.6e6 },
      { id: 'btu', name: 'BTU', symbol: 'BTU', factor: 1055.06 },
      { id: 'ev', name: 'Electron Volt', symbol: 'eV', factor: 1.60218e-19 },
      { id: 'ftlbf', name: 'Foot-pound force', symbol: 'ft·lbf', factor: 1.35582 },
    ],
  },
  {
    name: 'Power',
    icon: 'zap',
    units: [
      { id: 'w', name: 'Watt', symbol: 'W', factor: 1 },
      { id: 'kw', name: 'Kilowatt', symbol: 'kW', factor: 1000 },
      { id: 'mw', name: 'Megawatt', symbol: 'MW', factor: 1e6 },
      { id: 'hp', name: 'Horsepower', symbol: 'hp', factor: 745.7 },
      { id: 'btuhr', name: 'BTU/hour', symbol: 'BTU/hr', factor: 0.293071 },
    ],
  },
  {
    name: 'Pressure',
    icon: 'activity',
    units: [
      { id: 'pa', name: 'Pascal', symbol: 'Pa', factor: 1 },
      { id: 'kpa', name: 'Kilopascal', symbol: 'kPa', factor: 1000 },
      { id: 'mpa', name: 'Megapascal', symbol: 'MPa', factor: 1e6 },
      { id: 'bar', name: 'Bar', symbol: 'bar', factor: 100000 },
      { id: 'psi', name: 'PSI', symbol: 'psi', factor: 6894.757 },
      { id: 'atm', name: 'Atmosphere', symbol: 'atm', factor: 101325 },
      { id: 'mmhg', name: 'mmHg', symbol: 'mmHg', factor: 133.322 },
      { id: 'inhg', name: 'inHg', symbol: 'inHg', factor: 3386.39 },
    ],
  },
  {
    name: 'Angle',
    icon: 'corner-up-right',
    units: [
      { id: 'deg', name: 'Degree', symbol: '°', factor: 1 },
      { id: 'rad', name: 'Radian', symbol: 'rad', factor: 180 / Math.PI },
      { id: 'grad', name: 'Gradian', symbol: 'grad', factor: 0.9 },
      { id: 'rev', name: 'Revolution', symbol: 'rev', factor: 360 },
    ],
  },
  {
    name: 'Fuel Economy',
    icon: 'droplet',
    units: [
      { id: 'mpgus', name: 'MPG (US)', symbol: 'mpg', factor: 1 },
      { id: 'mpguk', name: 'MPG (UK)', symbol: 'mpg UK', factor: 1.20095 },
      { id: 'l100km', name: 'L/100km', symbol: 'L/100km', factor: 235.215 / 1 }, // special: mpg = 235.215 / (L/100km)
      { id: 'kml', name: 'km/L', symbol: 'km/L', factor: 2.35215 },
    ],
  },
  {
    name: 'Cooking',
    icon: 'coffee',
    units: [
      { id: 'cook_ml', name: 'Milliliter', symbol: 'mL', factor: 1 },
      { id: 'cook_l', name: 'Liter', symbol: 'L', factor: 1000 },
      { id: 'cook_tsp', name: 'Teaspoon', symbol: 'tsp', factor: 4.92892 },
      { id: 'cook_tbsp', name: 'Tablespoon', symbol: 'tbsp', factor: 14.7868 },
      { id: 'cook_cup', name: 'Cup', symbol: 'cup', factor: 236.588 },
      { id: 'cook_floz', name: 'Fluid Ounce', symbol: 'fl oz', factor: 29.5735 },
      { id: 'cook_g', name: 'Gram (water)', symbol: 'g', factor: 1 },
      { id: 'cook_oz', name: 'Ounce (weight)', symbol: 'oz', factor: 28.3495 },
      { id: 'cook_lb', name: 'Pound', symbol: 'lb', factor: 453.592 },
    ],
  },
];

export function convertUnit(
  value: number,
  fromUnit: ConversionCategory['units'][0],
  toUnit: ConversionCategory['units'][0]
): number {
  // Special case: Temperature (uses offset)
  if (fromUnit.offset !== undefined && toUnit.offset !== undefined) {
    // Convert to Celsius first (base), then to target
    const celsius = value * fromUnit.factor + fromUnit.offset;
    return (celsius - toUnit.offset) / toUnit.factor;
  }
  // Standard: convert to base, then to target
  const baseValue = value * fromUnit.factor;
  return baseValue / toUnit.factor;
}

// Physical constants
export const PHYSICAL_CONSTANTS = {
  PI: Math.PI,
  E: Math.E,
  PHI: (1 + Math.sqrt(5)) / 2, // Golden ratio
  SQRT2: Math.SQRT2,
  C: 299792458,        // Speed of light (m/s)
  G: 6.67430e-11,      // Gravitational constant
  H: 6.62607015e-34,   // Planck's constant
  AVOGADRO: 6.02214076e23,
  K_BOLTZMANN: 1.380649e-23,
} as const;
