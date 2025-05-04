import { FaUmbrellaBeach, FaMountain, FaPlane, FaMapMarkerAlt, FaTree, FaCompass, FaCity, FaHiking, FaSpa, FaDollarSign, FaGem } from 'react-icons/fa';

/**
 * Array of preset icon objects for holiday representation.
 * Each object contains the icon component, a name, and a Tailwind background color class.
 */
export const presetIcons = [
  { icon: FaUmbrellaBeach, name: 'Beach', color: 'bg-blue-500' },
  { icon: FaMountain, name: 'Mountains', color: 'bg-green-600' },
  { icon: FaPlane, name: 'Plane', color: 'bg-cyan-600' },
  { icon: FaMapMarkerAlt, name: 'Location', color: 'bg-red-500' },
  { icon: FaTree, name: 'Tropical', color: 'bg-amber-600' },
  { icon: FaCompass, name: 'Adventure', color: 'bg-purple-600' },
];

/**
 * Array of currency objects used for budget selection.
 * Each object contains the currency code, symbol, and name.
 */
export const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar' }, // Note: CAD symbol often shown as C$
  { code: 'AUD', symbol: '$', name: 'Australian Dollar' }, // Note: AUD symbol often shown as A$
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
];

/**
 * Array of country names for destination input suggestions.
 * Consider loading this asynchronously or from a more managed source if the list grows significantly.
 */
export const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", 
  "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", 
  "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", 
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", 
  "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", 
  "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", 
  "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", 
  "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", 
  "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", 
  "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", 
  "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", 
  "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", 
  "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", 
  "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", 
  "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", 
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", 
  "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", 
  "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", 
  "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", 
  "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", 
  "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", 
  "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", 
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", 
  "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", 
  "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", 
  "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", 
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", 
  "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", 
  "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", 
  "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", 
  "Zimbabwe"
];

// Define consistent colors for expense categories
export const CATEGORY_COLORS = {
    Food: '#34D399', // Emerald 400 (Tailwind: emerald-400)
    Accommodation: '#60A5FA', // Blue 400 (Tailwind: blue-400)
    Transportation: '#FBBF24', // Amber 400 (Tailwind: amber-400)
    Activities: '#F87171', // Red 400 (Tailwind: red-400)
    Shopping: '#A78BFA', // Violet 400 (Tailwind: violet-400)
    Other: '#9CA3AF', // Gray 400 (Tailwind: gray-400)
    Default: '#A0AEC0', // Gray 500 (Tailwind: gray-500) (Fallback)
};

// Define Tailwind classes corresponding to CATEGORY_COLORS for badges/text
export const CATEGORY_COLOR_CLASSES = {
    Food: 'bg-emerald-500/20 text-emerald-500',
    Accommodation: 'bg-blue-500/20 text-blue-500',
    Transportation: 'bg-amber-500/20 text-amber-500',
    Activities: 'bg-red-500/20 text-red-500',
    Shopping: 'bg-violet-500/20 text-violet-500',
    Other: 'bg-gray-500/20 text-gray-500',
    Default: 'bg-gray-500/20 text-gray-500',
};

// --- Preset Holiday Tags ---
export const PRESET_HOLIDAY_TAGS = {
  beach: { label: 'Beach', icon: FaUmbrellaBeach, color: 'blue' },
  city: { label: 'City', icon: FaCity, color: 'gray' },
  adventure: { label: 'Adventure', icon: FaHiking, color: 'green' },
  relax: { label: 'Relax', icon: FaSpa, color: 'purple' },
  budget: { label: 'Budget', icon: FaDollarSign, color: 'yellow' },
  luxury: { label: 'Luxury', icon: FaGem, color: 'pink' },
};

// Helper to get Tailwind classes based on tag key and color
export const getTagClasses = (tagKey, isSelected, isDarkMode) => {
  const tagInfo = PRESET_HOLIDAY_TAGS[tagKey];
  if (!tagInfo) return 'text-gray-700'; // Fallback

  const color = tagInfo.color;
  // Define selected and unselected states for light/dark mode
  // Example using Tailwind colors - adjust as needed
  const base = `border rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5`;
  if (isSelected) {
    switch (color) {
      case 'blue': return `${base} border-blue-500 text-blue-500`;
      case 'gray': return `${base} border-gray-500 text-gray-500`;
      case 'green': return `${base} border-green-500 text-green-500`;
      case 'purple': return `${base} border-purple-500 text-purple-500`;
      case 'yellow': return `${base} border-yellow-500 text-yellow-500`;
      case 'pink': return `${base} border-pink-500 text-pink-500`;
      default: return `${base} border-cyan-600 text-cyan-600`;
    }
  } else {
    // Unselected state
    if (isDarkMode) {
       switch (color) {
        case 'blue': return `${base} border-blue-700 text-blue-400`;
        case 'gray': return `${base} border-gray-600 text-gray-400`;
        case 'green': return `${base} border-green-700 text-green-400`;
        case 'purple': return `${base} border-purple-700 text-purple-400`;
        case 'yellow': return `${base} border-yellow-600 text-yellow-400`; 
        case 'pink': return `${base} border-pink-700 text-pink-400`;
        default: return `${base} border-gray-700 text-gray-400`;
      }
    } else {
       switch (color) {
        case 'blue': return `${base} border-blue-300 text-blue-700`;
        case 'gray': return `${base} border-gray-300 text-gray-700`;
        case 'green': return `${base} border-green-300 text-green-700`;
        case 'purple': return `${base} border-purple-300 text-purple-700`;
        case 'yellow': return `${base} border-yellow-400 text-yellow-800`;
        case 'pink': return `${base} border-pink-300 text-pink-700`;
        default: return `${base} border-gray-300 text-gray-700`;
      } 
    }
  }
}; 