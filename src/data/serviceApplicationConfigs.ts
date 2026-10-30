export interface ServiceFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  gridSpan?: 1 | 2;
  helpText?: string;
}

export interface ServiceDocConfig {
  id: string;
  name: string;
  type: string;
  description: string;
  isMandatory: boolean;
}

export interface ServiceAppConfig {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  prefix: string; // e.g. 'AAD', 'PAN', 'VOT', 'MSM', 'LAB', 'UAN', 'ESI'
  accentColor: string;
  fields: ServiceFieldConfig[];
  documents: ServiceDocConfig[];
}

export const serviceAppConfigs: Record<string, ServiceAppConfig> = {
  // 1. AADHAAR CARD
  aadhaar: {
    id: 'aadhaar',
    slug: 'aadhaar',
    title: 'Aadhaar Card Service Application',
    tagline: 'Address update, name correction, DOB update, and enrolment assistance',
    prefix: 'AAD',
    accentColor: '#0066cd',
    fields: [
      {
        name: 'serviceType',
        label: 'Aadhaar Service Required',
        type: 'select',
        required: true,
        options: [
          { value: 'address-update', label: 'Address Update / Correction' },
          { value: 'name-correction', label: 'Name Spelling Correction' },
          { value: 'dob-update', label: 'Date of Birth (DOB) Update' },
          { value: 'mobile-linking', label: 'Mobile Number Linking Support' },
          { value: 'new-enrolment', label: 'New Aadhaar Enrolment Support' },
        ],
        gridSpan: 2,
      },
      { name: 'fullName', label: 'Full Name (as per records)', type: 'text', required: true, placeholder: 'e.g. Ramesh Kumar Sharma' },
      { name: 'aadhaarNumber', label: '12-Digit Aadhaar Number (if existing)', type: 'text', placeholder: 'XXXX XXXX XXXX' },
      { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
      {
        name: 'gender',
        label: 'Gender',
        type: 'select',
        required: true,
        options: [
          { value: 'Male', label: 'Male' },
          { value: 'Female', label: 'Female' },
          { value: 'Other', label: 'Other' },
        ],
      },
      { name: 'guardianName', label: "Father's / Spouse's Name", type: 'text', placeholder: 'Enter father or spouse name' },
      { name: 'mobile', label: 'Primary Mobile Number', type: 'text', required: true, placeholder: '10-digit mobile' },
      { name: 'doorNo', label: 'House / Flat / Door Number', type: 'text', placeholder: 'e.g. Flat 302, Sai Residency' },
      { name: 'street', label: 'Street / Road / Colony', type: 'text', placeholder: 'e.g. 5th Main, MG Road' },
      { name: 'landmark', label: 'Landmark', type: 'text', placeholder: 'Near City Hospital' },
      { name: 'city', label: 'City / Town / Village', type: 'text', required: true, placeholder: 'e.g. Hyderabad' },
      { name: 'district', label: 'District & State', type: 'text', required: true, placeholder: 'e.g. Hyderabad, Telangana' },
      { name: 'pincode', label: 'PIN Code', type: 'text', required: true, placeholder: '6-digit postal PIN' },
    ],
    documents: [
      {
        id: 'doc-aadhaar-front',
        name: 'Aadhaar Card — Front Side (Clear photo)',
        type: 'aadhaar-front',
        description: 'Front side showing photograph, name, date of birth, and Aadhaar number.',
        isMandatory: true,
      },
      {
        id: 'doc-aadhaar-back',
        name: 'Aadhaar Card — Back Side (Address details)',
        type: 'aadhaar-back',
        description: 'Back side showing current address details and QR code.',
        isMandatory: true,
      },
      {
        id: 'doc-electricity-bill',
        name: 'Electricity Utility Bill (Address Proof)',
        type: 'electricity-bill',
        description: 'Recent electricity or water bill (not older than 3 months).',
        isMandatory: true,
      },
      {
        id: 'doc-passport',
        name: 'Indian Passport (Optional Supporting ID)',
        type: 'passport',
        description: 'Optional supporting identity or residential proof.',
        isMandatory: false,
      },
    ],
  },

  // 2. PAN CARD
  'pan-card': {
    id: 'pan-card',
    slug: 'pan-card',
    title: 'PAN Card Application & Correction',
    tagline: 'New PAN issuance (Form 49A) & data correction (CSF) through authorized NSDL/UTIITSL',
    prefix: 'PAN',
    accentColor: '#104A96',
    fields: [
      {
        name: 'applicationType',
        label: 'PAN Application Category',
        type: 'select',
        required: true,
        options: [
          { value: 'new-pan', label: 'New PAN Card (Indian Citizen — Form 49A)' },
          { value: 'pan-correction', label: 'PAN Correction / Update in Name, DOB or Photo' },
          { value: 'pan-reprint', label: 'Reprint of Damaged / Lost Physical PAN Card' },
        ],
        gridSpan: 2,
      },
      { name: 'fullName', label: 'Full Name (to be printed on PAN)', type: 'text', required: true, placeholder: 'e.g. Ramesh Kumar Sharma' },
      { name: 'fatherName', label: "Father's Full Name (Mandatory for PAN)", type: 'text', required: true, placeholder: 'Enter father full name' },
      { name: 'dob', label: 'Date of Birth (as per Aadhaar)', type: 'date', required: true },
      {
        name: 'gender',
        label: 'Gender',
        type: 'select',
        required: true,
        options: [
          { value: 'Male', label: 'Male' },
          { value: 'Female', label: 'Female' },
          { value: 'Other', label: 'Other' },
        ],
      },
      { name: 'existingPan', label: 'Existing 10-Digit PAN (only for correction/reprint)', type: 'text', placeholder: 'e.g. ABCDE1234F' },
      { name: 'aadhaarNumber', label: '12-Digit Aadhaar Number', type: 'text', required: true, placeholder: 'XXXX XXXX XXXX' },
      { name: 'mobile', label: 'Mobile Number (linked to Aadhaar)', type: 'text', required: true, placeholder: '10-digit mobile' },
      { name: 'email', label: 'Email Address (for e-PAN delivery)', type: 'text', required: true, placeholder: 'name@example.com' },
      { name: 'deliveryAddress', label: 'Delivery Address for Physical Card', type: 'textarea', required: true, placeholder: 'Complete postal address with landmarks for India Post courier dispatch', gridSpan: 2 },
      { name: 'pincode', label: 'PIN Code', type: 'text', required: true, placeholder: '6-digit PIN' },
    ],
    documents: [
      {
        id: 'doc-pan-aadhaar-front',
        name: 'Aadhaar Card — Front Side (Primary ID Proof)',
        type: 'aadhaar-front',
        description: 'Front side of Aadhaar showing clear name, DOB and photo.',
        isMandatory: true,
      },
      {
        id: 'doc-pan-aadhaar-back',
        name: 'Aadhaar Card — Back Side (Address Proof)',
        type: 'aadhaar-back',
        description: 'Back side of Aadhaar showing verified address.',
        isMandatory: true,
      },
      {
        id: 'doc-pan-photo',
        name: 'Recent Passport-Size Color Photograph',
        type: 'photo',
        description: 'Clear frontal color photo with white background for PAN printing.',
        isMandatory: true,
      },
      {
        id: 'doc-pan-signature',
        name: 'Applicant Signature Image',
        type: 'signature',
        description: 'Sign clearly in black ink on plain white paper and upload.',
        isMandatory: true,
      },
      {
        id: 'doc-pan-existing',
        name: 'Existing PAN Card Copy (if applying for correction)',
        type: 'existing-pan',
        description: 'Scanned copy of current PAN card or PAN allotment letter.',
        isMandatory: false,
      },
    ],
  },

  // 3. VOTER ID
  'voter-id': {
    id: 'voter-id',
    slug: 'voter-id',
    title: 'Voter ID Enrolment & Correction',
    tagline: 'New voter card (Form 6), address shifting (Form 8), and digital e-EPIC assistance',
    prefix: 'VOT',
    accentColor: '#2563EB',
    fields: [
      {
        name: 'voterFormType',
        label: 'Voter Application Type',
        type: 'select',
        required: true,
        options: [
          { value: 'form-6', label: 'Form 6 — New Voter Registration (First-time voter)' },
          { value: 'form-8-shift', label: 'Form 8 — Shifting of Residence to New Assembly' },
          { value: 'form-8-correction', label: 'Form 8 — Correction in Name, Age or Photograph' },
          { value: 'epic-replacement', label: 'Replacement / PVC Card Delivery' },
        ],
        gridSpan: 2,
      },
      { name: 'fullName', label: 'Applicant Full Name', type: 'text', required: true, placeholder: 'e.g. Ramesh Kumar' },
      { name: 'relativeName', label: "Father's / Mother's / Husband's Name", type: 'text', required: true, placeholder: 'Enter relative full name' },
      {
        name: 'relationType',
        label: 'Relationship Type',
        type: 'select',
        required: true,
        options: [
          { value: 'Father', label: 'Father' },
          { value: 'Mother', label: 'Mother' },
          { value: 'Husband', label: 'Husband' },
          { value: 'Guardian', label: 'Legal Guardian' },
        ],
      },
      { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
      {
        name: 'gender',
        label: 'Gender',
        type: 'select',
        required: true,
        options: [
          { value: 'Male', label: 'Male' },
          { value: 'Female', label: 'Female' },
          { value: 'Third Gender', label: 'Third Gender' },
        ],
      },
      { name: 'existingEpic', label: 'Existing EPIC / Voter ID No. (for Form 8)', type: 'text', placeholder: 'e.g. ABC1234567' },
      { name: 'assemblyConstituency', label: 'Assembly Constituency & District', type: 'text', required: true, placeholder: 'e.g. Jubilee Hills, Hyderabad' },
      { name: 'mobile', label: 'Mobile Number', type: 'text', required: true, placeholder: '10-digit mobile' },
      { name: 'currentAddress', label: 'Current Residential Address', type: 'textarea', required: true, placeholder: 'House No, Street, Village/Town, District, PIN', gridSpan: 2 },
    ],
    documents: [
      {
        id: 'doc-voter-photo',
        name: 'Recent Passport-Size Color Photograph',
        type: 'photo',
        description: 'Clear frontal color photo for printing on the Voter Identity Card.',
        isMandatory: true,
      },
      {
        id: 'doc-voter-age-proof',
        name: 'Age / DOB Proof (Aadhaar / 10th Memo / Birth Certificate)',
        type: 'age-proof',
        description: 'Document verifying completion of 18 years of age.',
        isMandatory: true,
      },
      {
        id: 'doc-voter-address-proof',
        name: 'Current Residence Proof (Aadhaar / Electricity Bill / Gas Bill)',
        type: 'address-proof',
        description: 'Valid residential proof in the local assembly constituency area.',
        isMandatory: true,
      },
    ],
  },

  // 4. MSME / UDYAM REGISTRATION
  msme: {
    id: 'msme',
    slug: 'msme',
    title: 'MSME / Udyam Registration Application',
    tagline: 'Government Udyam certificate with QR code for business loans, tenders & subsidies',
    prefix: 'MSM',
    accentColor: '#FF8500',
    fields: [
      { name: 'enterpriseName', label: 'Enterprise / Business Trade Name', type: 'text', required: true, placeholder: 'e.g. Sri Balaji Enterprises', gridSpan: 2 },
      {
        name: 'organizationType',
        label: 'Type of Business Entity',
        type: 'select',
        required: true,
        options: [
          { value: 'Proprietorship', label: 'Proprietorship (Individual Owner)' },
          { value: 'Partnership', label: 'Partnership Firm' },
          { value: 'Private-Limited', label: 'Private Limited Company' },
          { value: 'LLP', label: 'Limited Liability Partnership (LLP)' },
          { value: 'HUF', label: 'Hindu Undivided Family (HUF)' },
        ],
      },
      {
        name: 'majorActivity',
        label: 'Major Activity of Business',
        type: 'select',
        required: true,
        options: [
          { value: 'Services', label: 'Services' },
          { value: 'Manufacturing', label: 'Manufacturing' },
          { value: 'Trading', label: 'Retail / Wholesale Trading' },
        ],
      },
      { name: 'businessPan', label: 'PAN of Business / Proprietor', type: 'text', required: true, placeholder: 'e.g. ABCDE1234F' },
      { name: 'ownerAadhaar', label: 'Aadhaar of Proprietor / Director (OTP Linked)', type: 'text', required: true, placeholder: 'XXXX XXXX XXXX' },
      { name: 'bankAccountNo', label: 'Business Bank Account Number', type: 'text', required: true, placeholder: 'Bank Account Number' },
      { name: 'bankIfsc', label: 'Bank Branch IFSC Code', type: 'text', required: true, placeholder: 'e.g. SBIN0001234' },
      { name: 'employeeCount', label: 'Total Number of Employees', type: 'number', required: true, placeholder: 'e.g. 5' },
      { name: 'investmentAmount', label: 'Approx. Investment in Machinery / Equipment (in Lakhs)', type: 'text', placeholder: 'e.g. 10 Lakhs' },
      { name: 'businessAddress', label: 'Official Business / Plant Address', type: 'textarea', required: true, placeholder: 'Plot/Door No, Industrial Area/Street, Town, State, PIN', gridSpan: 2 },
    ],
    documents: [
      {
        id: 'doc-msme-owner-aadhaar-front',
        name: 'Proprietor / Director Aadhaar Card — Front Side',
        type: 'aadhaar-front',
        description: 'Front side of Aadhaar of the authorized business owner.',
        isMandatory: true,
      },
      {
        id: 'doc-msme-owner-aadhaar-back',
        name: 'Proprietor / Director Aadhaar Card — Back Side',
        type: 'aadhaar-back',
        description: 'Back side of Aadhaar showing address.',
        isMandatory: true,
      },
      {
        id: 'doc-msme-pan',
        name: 'PAN Card of Business / Proprietor',
        type: 'pan-card',
        description: 'Clear photograph of the PAN card.',
        isMandatory: true,
      },
      {
        id: 'doc-msme-bank-proof',
        name: 'Bank Passbook / Cancelled Cheque',
        type: 'bank-proof',
        description: 'Showing business or proprietor name, account number and IFSC code.',
        isMandatory: true,
      },
      {
        id: 'doc-msme-office-proof',
        name: 'Business Premises Electricity Bill or Rent Agreement',
        type: 'office-proof',
        description: 'Utility bill or lease agreement for business address verification.',
        isMandatory: false,
      },
    ],
  },

  // 5. LABOUR LICENSE (SHOPS & ESTABLISHMENTS)
  'labour-license': {
    id: 'labour-license',
    slug: 'labour-license',
    title: 'Labour License (Shops & Establishments)',
    tagline: 'State Labour Department registration certificate for shops, offices, and commercial establishments',
    prefix: 'LAB',
    accentColor: '#D97706',
    fields: [
      { name: 'shopName', label: 'Shop / Establishment Trade Name', type: 'text', required: true, placeholder: 'e.g. Balaji Traders & Supermarket', gridSpan: 2 },
      {
        name: 'shopCategory',
        label: 'Category of Establishment',
        type: 'select',
        required: true,
        options: [
          { value: 'Retail-Shop', label: 'Retail Shop / Store' },
          { value: 'Commercial-Office', label: 'Commercial Office / IT Firm' },
          { value: 'Hotel-Restaurant', label: 'Hotel / Restaurant / Eatery' },
          { value: 'Warehouse', label: 'Warehouse / Godown' },
        ],
      },
      { name: 'ownerName', label: 'Full Name of Employer / Owner', type: 'text', required: true, placeholder: 'e.g. Ramesh Kumar' },
      { name: 'commencementDate', label: 'Date of Business Commencement', type: 'date', required: true },
      { name: 'employeeCount', label: 'Total Number of Workers Employed', type: 'number', required: true, placeholder: 'e.g. 3' },
      { name: 'mobile', label: 'Contact Mobile Number', type: 'text', required: true, placeholder: '10-digit mobile' },
      { name: 'email', label: 'Contact Email Address', type: 'text', placeholder: 'shop@example.com' },
      { name: 'shopAddress', label: 'Complete Physical Address of Shop/Office', type: 'textarea', required: true, placeholder: 'Shop No, Floor, Building, Main Road, Area, PIN Code', gridSpan: 2 },
    ],
    documents: [
      {
        id: 'doc-labour-owner-aadhaar-front',
        name: 'Owner Aadhaar Card — Front Side',
        type: 'aadhaar-front',
        description: 'Identity proof of proprietor or managing partner.',
        isMandatory: true,
      },
      {
        id: 'doc-labour-owner-aadhaar-back',
        name: 'Owner Aadhaar Card — Back Side',
        type: 'aadhaar-back',
        description: 'Address proof of owner.',
        isMandatory: true,
      },
      {
        id: 'doc-labour-name-board',
        name: 'Shop Name Board Photo (Telugu & English)',
        type: 'name-board',
        description: 'Clear photograph of the establishment signboard displaying the trade name in Telugu script alongside English.',
        isMandatory: true,
      },
      {
        id: 'doc-labour-rent-deed',
        name: 'Rental Deed or Property Tax Receipt',
        type: 'rent-deed',
        description: 'Registered rental agreement or ownership deed for the premises.',
        isMandatory: true,
      },
      {
        id: 'doc-labour-eb-bill',
        name: 'Commercial Electricity Bill of Premises',
        type: 'electricity-bill',
        description: 'Recent power bill showing consumer number and address.',
        isMandatory: true,
      },
    ],
  },

  // 6. UAN / PF SERVICES
  'uan-pf': {
    id: 'uan-pf',
    slug: 'uan-pf',
    title: 'UAN / PF Services & Claim Filing',
    tagline: 'UAN activation, KYC seeding, PF transfer, Form 19, Form 10C and Form 31 claim assistance',
    prefix: 'UAN',
    accentColor: '#0284C7',
    fields: [
      {
        name: 'uanServiceCategory',
        label: 'PF / UAN Service Required',
        type: 'select',
        required: true,
        options: [
          { value: 'uan-activation', label: 'UAN Generation / Activation Support' },
          { value: 'kyc-update', label: 'KYC Seeding & Linking (Aadhaar, PAN, Bank)' },
          { value: 'pf-withdrawal-full', label: 'Full PF Withdrawal (Form 19 & 10C — Resigned/Retired)' },
          { value: 'pf-advance', label: 'PF Partial Advance (Form 31 — Medical/House/Marriage)' },
          { value: 'pf-transfer', label: 'Transfer PF Balance from Previous Employer' },
        ],
        gridSpan: 2,
      },
      { name: 'memberName', label: 'Member Full Name (as per EPFO records)', type: 'text', required: true, placeholder: 'e.g. Ramesh Kumar' },
      { name: 'uanNumber', label: '12-Digit Universal Account Number (UAN)', type: 'text', required: true, placeholder: '10XXXXXXXXXX' },
      { name: 'dob', label: 'Date of Birth (as per Aadhaar)', type: 'date', required: true },
      { name: 'aadhaarNumber', label: '12-Digit Aadhaar Number', type: 'text', required: true, placeholder: 'XXXX XXXX XXXX' },
      { name: 'panNumber', label: 'PAN Card Number', type: 'text', required: true, placeholder: 'ABCDE1234F' },
      { name: 'bankAccountNo', label: 'Bank Account Number for PF Credit', type: 'text', required: true, placeholder: 'Account Number' },
      { name: 'bankIfsc', label: 'Bank Branch IFSC Code', type: 'text', required: true, placeholder: 'e.g. HDFC0001234' },
      { name: 'mobile', label: 'Mobile Number (linked to Aadhaar & UAN)', type: 'text', required: true, placeholder: '10-digit mobile' },
      { name: 'withdrawalReason', label: 'Reason for Withdrawal / Advance (if Form 31)', type: 'text', placeholder: 'e.g. Medical illness, Home renovation, Higher education', gridSpan: 2 },
    ],
    documents: [
      {
        id: 'doc-uan-aadhaar-front',
        name: 'Member Aadhaar Card — Front Side',
        type: 'aadhaar-front',
        description: 'Aadhaar front showing clear name, DOB and photo.',
        isMandatory: true,
      },
      {
        id: 'doc-uan-aadhaar-back',
        name: 'Member Aadhaar Card — Back Side',
        type: 'aadhaar-back',
        description: 'Aadhaar back showing current address.',
        isMandatory: true,
      },
      {
        id: 'doc-uan-pan',
        name: 'Member PAN Card',
        type: 'pan-card',
        description: 'Clear photograph of PAN card for tax-free PF processing.',
        isMandatory: true,
      },
      {
        id: 'doc-uan-bank-cheque',
        name: 'Bank Passbook / Cancelled Cheque (with Name Printed)',
        type: 'bank-cheque',
        description: 'Cheque or passbook first page showing member name, account number and IFSC code clearly.',
        isMandatory: true,
      },
    ],
  },

  // 7. ESI DETAILS UPDATE
  esi: {
    id: 'esi',
    slug: 'esi',
    title: 'ESI Healthcare Details & Family Update',
    tagline: 'Add family dependants, change local dispensary, and demographic correction in ESIC Pehchan database',
    prefix: 'ESI',
    accentColor: '#059669',
    fields: [
      {
        name: 'esiUpdateCategory',
        label: 'ESI Update Category',
        type: 'select',
        required: true,
        options: [
          { value: 'add-family', label: 'Add Family Dependants (Spouse, Children, Parents)' },
          { value: 'change-dispensary', label: 'Change Local Network Dispensary / Branch Hospital' },
          { value: 'correct-demographics', label: 'Correction in Insured Person Name / DOB' },
          { value: 'pehchan-reprint', label: 'Download Updated e-Pehchan Card' },
        ],
        gridSpan: 2,
      },
      { name: 'insuredName', label: 'Insured Person (Employee) Full Name', type: 'text', required: true, placeholder: 'e.g. Ramesh Kumar' },
      { name: 'insuranceNumber', label: '10-Digit ESI Insurance Number (IP No.)', type: 'text', required: true, placeholder: 'e.g. 52XXXXXXXX' },
      { name: 'employerName', label: 'Current Employer / Company Name', type: 'text', required: true, placeholder: 'e.g. Sri Balaji Tech Solutions Pvt Ltd' },
      { name: 'aadhaarNumber', label: 'Employee 12-Digit Aadhaar Number', type: 'text', required: true, placeholder: 'XXXX XXXX XXXX' },
      { name: 'mobile', label: 'Employee Mobile Number', type: 'text', required: true, placeholder: '10-digit mobile' },
      { name: 'preferredDispensary', label: 'Preferred Local ESI Dispensary / Hospital Area', type: 'text', placeholder: 'e.g. Sanathnagar / Nacharam' },
      { name: 'dependantDetails', label: 'Family Member Details (Name, Age, Relationship to be added)', type: 'textarea', placeholder: 'e.g. 1. Sunita Sharma (Wife, Age 28), 2. Aarav Sharma (Son, Age 3)', gridSpan: 2 },
    ],
    documents: [
      {
        id: 'doc-esi-insured-aadhaar-front',
        name: 'Employee Aadhaar Card — Front Side',
        type: 'aadhaar-front',
        description: 'Front side of insured person Aadhaar.',
        isMandatory: true,
      },
      {
        id: 'doc-esi-insured-aadhaar-back',
        name: 'Employee Aadhaar Card — Back Side',
        type: 'aadhaar-back',
        description: 'Back side of insured person Aadhaar.',
        isMandatory: true,
      },
      {
        id: 'doc-esi-family-aadhaar',
        name: 'Family Member(s) Aadhaar Card / Birth Certificate',
        type: 'family-id',
        description: 'Aadhaar cards or birth certificates of the dependants being added.',
        isMandatory: true,
      },
      {
        id: 'doc-esi-ration-card',
        name: 'Food Security Card / Ration Card (Relationship Proof)',
        type: 'ration-card',
        description: 'Ration card copy confirming family relationship.',
        isMandatory: false,
      },
      {
        id: 'doc-esi-family-photo',
        name: 'Joint Family Photograph / Member Photograph',
        type: 'photo',
        description: 'Color photo for updated e-Pehchan healthcare records.',
        isMandatory: true,
      },
    ],
  },
};
