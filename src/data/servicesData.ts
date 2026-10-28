import { ServiceDetail } from '../types/services';

export const servicesData: ServiceDetail[] = [
  {
    id: 'aadhaar',
    slug: 'aadhaar',
    title: 'Aadhaar Card',
    shortDescription: 'New assistance and address update guidance.',
    fullDescription: 'Get expert guidance and hands-on assistance for Aadhaar address updates and new enrolment navigation under official UIDAI frameworks.',
    accentColor: '#35A936',
    badge: 'Fast & Secure',
    iconName: 'Fingerprint',
    documents: [
      { name: 'Voter ID', description: 'Valid Voter Identity Card with current residential address.' },
      { name: 'Electricity Bill', description: 'Recent electricity utility bill (not older than 3 months) in applicant or family head name.' },
      { name: 'Passport', description: 'Valid Indian Passport with current residential details.' }
    ],
    officialDisclaimer: 'Acceptable proof depends on current UIDAI requirements and the specific address-update method chosen (online or designated Seva Kendra).',
    benefits: [
      'Pre-verification of address proof documents before submission',
      'Step-by-step guidance on self-service UIDAI update portal',
      'Minimizes rejection rates caused by document mismatches',
      'Appointment scheduling support at official Aadhaar Seva Kendras'
    ],
    processSteps: [
      { title: 'Document Verification', description: 'Our documentation team reviews your address proof against UIDAI standards.' },
      { title: 'Form Preparation', description: 'Accurate entry of address details following official phonetic and postal standards.' },
      { title: 'Submission Assistance', description: 'Assisting your submission through official UIDAI channels or scheduling Seva Kendra slot.' },
      { title: 'Acknowledgment & Tracking', description: 'You receive your official Update Request Number (URN) to track status.' }
    ],
    faqs: [
      {
        question: 'Can I update my address without going to an Aadhaar center?',
        answer: 'Yes, if your active mobile number is linked to your Aadhaar card for OTP verification, address updates can be processed online through UIDAI\'s MyAadhaar portal using valid address proof.'
      },
      {
        question: 'How long does an Aadhaar address update usually take?',
        answer: 'UIDAI typically processes online address update requests within 5 to 15 working days following successful document verification.'
      },
      {
        question: 'Do you ever ask for my Aadhaar OTP or biometric data?',
        answer: 'Never. Apply365 strictly adheres to privacy safety protocols. We never request your OTP, biometric access, or account passwords. You authenticate directly with government portals.'
      }
    ]
  },
  {
    id: 'pan-card',
    slug: 'pan-card',
    title: 'PAN Card',
    shortDescription: 'New PAN card application and correction assistance.',
    fullDescription: 'Seamless support for new PAN Card issuance and corrections in name, date of birth, photo, or father\'s name through authorized NSDL / UTIITSL routes.',
    accentColor: '#104A96',
    badge: 'Essential Document',
    iconName: 'CreditCard',
    documents: [
      { name: 'Aadhaar Card', description: 'Mandatory proof of identity, address, and date of birth.' },
      { name: 'Voter ID or SSC Memo', description: 'Secondary supporting identification or date of birth proof.' },
      { name: 'Photograph', description: 'Two recent passport-size color photographs with white background.' },
      { name: 'Signature', description: 'Clear signature in black ink on clean white paper.' },
      { name: 'Existing PAN Card (for correction only)', description: 'Copy of existing PAN card or allotment letter when requesting data changes.', isOptional: true }
    ],
    officialDisclaimer: 'Document requirements distinguish between new PAN applications and correction applications. All data is matched strictly with your Aadhaar base.',
    benefits: [
      'Zero errors in form filling (Form 49A for new, CSF for corrections)',
      'Digital signature and photo dimension resizing according to NSDL specs',
      'Both e-PAN and physical PVC card delivery guidance',
      'Assistance with Aadhaar-PAN linking issues'
    ],
    processSteps: [
      { title: 'Application Type Selection', description: 'Choose between New PAN (Indian Citizen) or PAN Correction/Reprint.' },
      { title: 'Document & Photo Preparation', description: 'Optimization of photo and signature according to strict NSDL specifications.' },
      { title: 'Filing & Fee Guidance', description: 'Submitting through the official NSDL/UTIITSL platform with official government receipt.' },
      { title: 'Delivery', description: 'e-PAN sent to your email and physical card delivered by India Post to your address.' }
    ],
    faqs: [
      {
        question: 'What is the difference between a new PAN and a PAN correction?',
        answer: 'A new PAN application issues a brand-new 10-digit Permanent Account Number. A PAN correction keeps your existing PAN number while updating details like spelling, father\'s name, or photo.'
      },
      {
        question: 'Can a minor apply for a PAN card?',
        answer: 'Yes, minors can apply through their parent or legal guardian who acts as the Representative Assessee.'
      }
    ]
  },
  {
    id: 'voter-id',
    slug: 'voter-id',
    title: 'Voter ID',
    shortDescription: 'Voter ID application and related documentation assistance.',
    fullDescription: 'Assistance for new voter registration (Form 6), constituency shifting (Form 8), and digital EPIC card download through Election Commission portals.',
    accentColor: '#2563EB',
    badge: 'Civic Rights',
    iconName: 'Vote',
    documents: [
      { name: 'Aadhaar Card', description: 'Primary identity and age/address verification document.' },
      { name: 'Photograph', description: 'Recent passport-size color photograph with clear frontal view.' }
    ],
    officialDisclaimer: 'Additional eligibility, age, residence, or supporting documents may be required under current Election Commission rules depending on the constituency.',
    benefits: [
      'Accurate assembly constituency and polling booth mapping',
      'Help submitting Form 6 (New Voter) or Form 8 (Correction / Address Shift)',
      'Digital e-EPIC download assistance directly to your phone',
      'BLO (Booth Level Officer) verification guidance'
    ],
    processSteps: [
      { title: 'Eligibility Check', description: 'Confirm Indian citizenship and completion of 18 years of age.' },
      { title: 'Constituency Mapping', description: 'Identify your correct assembly constituency and polling station area.' },
      { title: 'Form 6 / 8 Filing', description: 'Assisting digital submission via the Election Commission Voter Service Portal.' },
      { title: 'e-EPIC Download', description: 'Once approved by the Electoral Registration Officer, download your digital voter ID.' }
    ],
    faqs: [
      {
        question: 'Who is eligible to apply for a new Voter ID?',
        answer: 'Any Indian citizen who has attained 18 years of age on the qualifying date of the year is eligible to enroll.'
      },
      {
        question: 'How do I download my digital Voter Card (e-EPIC)?',
        answer: 'Once your Form 6 application is approved by the ERO, you can download the PDF e-EPIC from voters.eci.gov.in using your EPIC number and OTP.'
      }
    ]
  },
  {
    id: 'msme',
    slug: 'msme',
    title: 'MSME Registration',
    shortDescription: 'MSME/Udyam registration assistance for eligible businesses.',
    fullDescription: 'Empowering micro, small, and medium enterprises with government Udyam Registration certification for business loans, subsidies, and tender benefits.',
    accentColor: '#FF8500',
    badge: 'Business Growth',
    iconName: 'Building2',
    documents: [
      { name: 'Aadhaar Card', description: 'Proprietor/Partner/Director Aadhaar linked with mobile number for OTP.' },
      { name: 'PAN Card', description: 'Individual PAN for proprietorship; Business entity PAN for partnership/LLP/Pvt Ltd.' },
      { name: 'Bank Details', description: 'Active bank account number and IFSC code of the business entity.' },
      { name: 'Business Name', description: 'Official trade or firm name under which operations are conducted.' },
      { name: 'Business Address', description: 'Complete physical address of plant/unit and registered corporate office.' },
      { name: 'Number of Employees', description: 'Total count of male, female, and other staff members employed.' },
      { name: 'Business Budget', description: 'Net investment in plant & machinery/equipment and turnover bracket.' }
    ],
    officialDisclaimer: 'Registration eligibility and required information depend on current official Udyam requirements set by the Ministry of Micro, Small & Medium Enterprises.',
    benefits: [
      'Official lifetime-valid government Udyam certificate with QR code',
      'Priority sector lending eligibility and collateral-free bank loan benefits',
      'Protection against delayed commercial payments under MSMED Act',
      'Special concessions on electricity bills, ISO certifications, and patent filings'
    ],
    processSteps: [
      { title: 'NIC Code Identification', description: 'Classifying your business operations under the correct 5-digit National Industry Classification codes.' },
      { title: 'Investment & Turnover Verification', description: 'Accurate bracket categorization to guarantee Micro, Small, or Medium classification.' },
      { title: 'Portal Application', description: 'Guided application submission through the official Ministry of MSME Udyam portal.' },
      { title: 'Certificate Delivery', description: 'Issuance of official Udyam Registration Certificate with verification QR code.' }
    ],
    faqs: [
      {
        question: 'Is Udyam registration free from the government?',
        answer: 'Yes, the official Ministry of MSME portal does not charge a government fee. Apply365 provides professional advisory, documentation assistance, and verification guidance.'
      },
      {
        question: 'Can a trader or retail shop apply for MSME?',
        answer: 'Yes, retail and wholesale trade businesses are eligible to register as MSMEs on the Udyam portal for Priority Sector Lending benefits.'
      }
    ]
  },
  {
    id: 'labour-license',
    slug: 'labour-license',
    title: 'Labour License',
    shortDescription: 'Labour license documentation and application assistance.',
    fullDescription: 'Comprehensive assistance for Andhra Pradesh and Telangana Shops & Commercial Establishments Act registration and Labour Department compliance.',
    accentColor: '#D97706',
    badge: 'Legal Compliance',
    iconName: 'FileCheck2',
    documents: [
      { name: 'Aadhaar Card', description: 'Identity proof of proprietor, managing partner, or authorized signatory.' },
      { name: 'Rental Deed or Sale Deed', description: 'Registered rental agreement, lease agreement, or property ownership document.' },
      { name: 'Owner\'s Passport-Size Photograph', description: 'Recent color photograph of business owner / managing partner.' },
      { name: 'Business Name Board in Telugu', description: 'Clear photo of the establishment\'s exterior signboard displaying the trade name in Telugu script alongside English.' }
    ],
    officialDisclaimer: 'Display this checklist prominently. Licensing requirements and fee slabs may vary by business type, employee count, and applicable state municipal/labour regulations.',
    benefits: [
      'Mandatory legal compliance for opening commercial current bank accounts',
      'Avoidance of local municipal and Labour Department inspection penalties',
      'Smooth commercial operations for retail outlets, offices, and warehouses',
      'Renewable digital registration certificate'
    ],
    processSteps: [
      { title: 'Premises & Signboard Review', description: 'Ensuring your signboard photo meets local language regulations and premises deed is valid.' },
      { title: 'Form Drafting', description: 'Filing details under the state Shops & Establishments portal.' },
      { title: 'Department Fee Payment', description: 'Assisting statutory state treasury challan payment based on employee slab.' },
      { title: 'Certificate Issuance', description: 'Receiving the signed Registration Certificate from the Labour Department.' }
    ],
    faqs: [
      {
        question: 'Why is the Telugu name board photo mandatory?',
        answer: 'Under the Shops & Establishments Act in Andhra Pradesh and Telangana, state rules require the commercial name board to be prominently displayed in the regional language (Telugu) alongside English.'
      },
      {
        question: 'How long is the Labour / Shop Establishment registration valid?',
        answer: 'Depending on the state and selected tenure, licenses are issued for 1 to 5 years and can be renewed periodically.'
      }
    ]
  },
  {
    id: 'uan-pf',
    slug: 'uan-pf',
    title: 'UAN / PF Services',
    shortDescription: 'UAN-related and provident fund documentation assistance.',
    fullDescription: 'Expert assistance for Universal Account Number (UAN) activation, KYC linking, PF transfer between employers, and claim filing guidance through EPFO.',
    accentColor: '#0284C7',
    badge: 'Employee Benefits',
    iconName: 'Landmark',
    documents: [
      { name: 'Aadhaar Card', description: 'Must have active mobile linked for EPFO OTP verification.' },
      { name: 'PAN Card', description: 'Required for tax-exempt PF withdrawals and EPFO KYC compliance.' },
      { name: 'Bank Details', description: 'Bank passbook copy or cancelled cheque with applicant\'s name and IFSC clearly visible.' }
    ],
    officialDisclaimer: 'Provide a clear explanation of the specific UAN/PF service you want to request. Final approval rests with the Employees\' Provident Fund Organisation (EPFO).',
    benefits: [
      'Universal Account Number (UAN) generation or activation',
      'Seamless KYC verification (Aadhaar, PAN, Bank IFSC linking)',
      'Assistance filing Form 19 (Final PF), Form 10C (Pension), or Form 31 (Advance)',
      'Resolving name or Date of Birth discrepancies in PF records'
    ],
    processSteps: [
      { title: 'Service Assessment', description: 'Determine whether you require UAN activation, KYC seeding, or claim guidance.' },
      { title: 'KYC Document Validation', description: 'Checking bank passbook and PAN clarity against EPFO database specifications.' },
      { title: 'EPFO Unified Member Portal Guidance', description: 'Filing your online claim or KYC update request on unifiedportal-mem.epfindia.gov.in.' },
      { title: 'Tracking Claim Status', description: 'Monitoring settlement status until funds are credited to your verified bank account.' }
    ],
    faqs: [
      {
        question: 'Can I withdraw my PF while still working?',
        answer: 'You can apply for a partial advance under Form 31 for specific reasons such as medical emergencies, house construction, or marriage.'
      },
      {
        question: 'Why was my online PF claim rejected previously?',
        answer: 'Common reasons include unclear bank cheque/passbook image, name mismatch between Aadhaar and bank account, or unapproved KYC by the employer. We help you fix these before refiling.'
      }
    ]
  },
  {
    id: 'esi',
    slug: 'esi',
    title: 'ESI Details Update',
    shortDescription: 'ESI details update assistance and required-document guidance.',
    fullDescription: 'Dedicated support for Employees\' State Insurance (ESIC) insured persons to update personal details, add family dependants, and correct dispensary information.',
    accentColor: '#059669',
    badge: 'Healthcare Support',
    iconName: 'HeartHandshake',
    documents: [
      { name: 'Aadhaar Card', description: 'Aadhaar of the insured person and family members being added.' },
      { name: 'FSC (Ration Card)', description: 'Food Security Card / Ration Card confirming family member relationship.' }
    ],
    officialDisclaimer: 'Clarify that exact documents depend on the particular ESI update requested (e.g. adding dependants, name change, or branch dispensary alteration).',
    benefits: [
      'Hassle-free addition of spouse, children, or parents as healthcare dependants',
      'Access to cashless medical treatments across network ESIC hospitals',
      'Correction of demographic records in the ESIC Pehchan database',
      'Guidance on dispensary transfers for convenient local treatment'
    ],
    processSteps: [
      { title: 'Update Requirement Review', description: 'Identify the exact change needed (family addition, dispensary shift, or bio data).' },
      { title: 'Family Relation Verification', description: 'Confirming ration card or birth certificate proofs against ESIC norms.' },
      { title: 'Portal / Employer Request Guidance', description: 'Guiding online submission via ESIC Member Portal or employer coordination.' },
      { title: 'Updated Pehchan Card', description: 'Verification of updated e-Pehchan card reflecting all enrolled family dependants.' }
    ],
    faqs: [
      {
        question: 'Who can be added as dependants under my ESI policy?',
        answer: 'Spouse, dependent children up to 21 years of age (or unmarried dependent daughters), and dependent parents whose total monthly income does not exceed statutory limits.'
      },
      {
        question: 'How do I obtain my physical Pehchan card?',
        answer: 'Your employer or the ESIC portal provides an e-Pehchan card containing your insurance number, which can be printed and laminated for hospital visits.'
      }
    ]
  }
];

export const getServiceBySlug = (slug: string): ServiceDetail | undefined => {
  return servicesData.find(service => service.slug === slug || service.id === slug);
};
