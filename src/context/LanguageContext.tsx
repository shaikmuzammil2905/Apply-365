import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'te' | 'hi';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
}

export const LANGUAGE_OPTIONS: Array<{ code: Language; label: string; nativeName: string }> = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
];

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.courses': 'Vocational Courses',
    'nav.track': 'Track Application',
    'nav.contact': 'Contact Us',
    'nav.login': 'Sign In',
    'nav.register': 'Register',
    'nav.dashboard': 'Citizen Portal',
    'nav.admin': 'Admin Panel',
    'nav.logout': 'Sign Out',
    'nav.selectLanguage': 'Select Language',

    // Hero & Home
    'hero.badge': 'Government & Business Services Facilitation Portal',
    'hero.titlePart1': 'Fast, Secure & Verified',
    'hero.titlePart2': 'Documentation Services',
    'hero.description': 'Doorstep and online statutory documentation facilitation for Aadhaar, PAN Card, Voter ID, MSME, Labour License, UAN/PF, ESI and Vocational Courses.',
    'hero.exploreServices': 'Explore Services',
    'hero.trackStatus': 'Track Your Application',

    // Trust & Features
    'trust.authorized': 'Verified Facilitation Partner',
    'trust.authorizedDesc': 'Statutory guidelines compliant',
    'trust.fast': 'Fast Track Processing',
    'trust.fastDesc': 'Zero delays with priority queue',
    'trust.secure': '100% Data Confidentiality',
    'trust.secureDesc': 'Bank-grade 256-bit encryption',

    // Services
    'services.title': 'Explore Our Core Services',
    'services.subtitle': 'Professional, hassle-free and verified assistance for all essential government documents and business registrations.',
    'services.applyNow': 'Apply Now',
    'services.viewDetails': 'View Details',
    'services.fee': 'Processing Fee',
    'services.timeline': 'Standard Timeline',
    'services.dedicatedPortal': 'Dedicated Service Portal',

    // Application Form
    'app.step1': 'Service Selection',
    'app.step2': 'Applicant Information',
    'app.step3': 'Upload Documents',
    'app.step4': 'Review Application',
    'app.step5': 'Payment & Submission',

    'app.fullName': 'Full Name (as per official records)',
    'app.fullNamePlaceholder': 'Enter your official full name',
    'app.mobile': 'Mobile Number (for SMS / WhatsApp updates)',
    'app.mobilePlaceholder': '10-digit mobile number',
    'app.email': 'Email Address (for receipt & soft copy)',
    'app.emailPlaceholder': 'yourname@gmail.com',
    'app.address': 'Current Residential / Business Address',
    'app.doorNo': 'Door No / House No',
    'app.street': 'Street / Locality',
    'app.landmark': 'Landmark',
    'app.city': 'City / Town',
    'app.district': 'District',
    'app.state': 'State',
    'app.pincode': 'PIN Code',
    'app.serviceType': 'Service Type / Specific Request',
    'app.urgency': 'Processing Priority',
    'app.remarks': 'Additional Remarks / Instructions',
    'app.continueToDocs': 'Continue to Document Upload',
    'app.back': 'Back',

    // Documents
    'docs.title': 'Required Supporting Documents',
    'docs.subtitle': 'Please upload clear photos or scanned copies (PDF, JPG, PNG). Ensure all text and dates are legible.',
    'docs.upload': 'Upload Document',
    'docs.replace': 'Replace File',
    'docs.remove': 'Remove',
    'docs.mandatory': 'Mandatory',
    'docs.optional': 'Optional',
    'docs.uploaded': 'Uploaded & Verified',
    'docs.pending': 'Pending Upload',
    'docs.preview': 'Preview',
    'docs.reviewAndProceed': 'Review Application Before Submission',

    // Review Step
    'review.title': 'Review Your Application',
    'review.subtitle': 'Please verify all entered details and uploaded documents carefully before proceeding to payment.',
    'review.personalDetails': 'Personal & Contact Details',
    'review.documentsAttached': 'Attached Supporting Proofs',
    'review.edit': 'Edit',
    'review.proceedToPayment': 'Proceed to Service Fee Payment (₹50)',

    // Payment Step (Payment-Last)
    'pay.title': 'Complete Your Application',
    'pay.serviceFeeTitle': 'Apply-365 Service Processing Fee',
    'pay.feeAmount': '₹50',
    'pay.disclaimer': 'This is a nominal Apply-365 platform processing and facilitation fee, not a government statutory tax.',
    'pay.summary': 'Payment Summary',
    'pay.service': 'Service',
    'pay.verification': 'Document Verification & Legal Review',
    'pay.included': 'Included (₹0)',
    'pay.smsUpdates': 'SMS & WhatsApp Updates',
    'pay.total': 'Total Amount Payable',
    'pay.button': 'Pay ₹50 & Complete Application',
    'pay.secureNotice': 'Secured by Razorpay • UPI, Cards, Net Banking & Wallets Accepted',
    'pay.pendingNotice': 'Your application is securely saved. Please complete the ₹50 fee to submit for officer review.',

    // Success Step
    'success.title': 'Your Application Has Been Successfully Submitted!',
    'success.desc': 'Our documentation team has received your application and documents.',
    'success.trackingNo': 'Application Tracking Number',
    'success.copy': 'Copy',
    'success.copied': 'Copied!',
    'success.status': 'Application Status',
    'success.initialStatus': 'Application Received',
    'success.paymentStatus': 'Payment Completed',
    'success.downloadReceipt': 'Download Payment Receipt (PDF)',
    'success.downloadSoftCopy': 'Download Application Soft Copy (PDF)',
    'success.applyAnother': 'Apply for Another Service',
    'success.goToDashboard': 'Go to Citizen Dashboard',

    // Dashboard
    'dash.title': 'Citizen Services Dashboard',
    'dash.welcome': 'Welcome back',
    'dash.myApplications': 'My Applications',
    'dash.invoices': 'Invoices & Receipts',
    'dash.notifications': 'Notifications',
    'dash.status': 'Status',
    'dash.completePayment': 'Complete Your Payment – ₹50',
    'dash.paymentSuccessful': 'Payment Successful – Application Submitted',
    'dash.viewTimeline': 'View Full Timeline',

    // Footer
    'footer.about': 'Apply365 is India’s trusted assisted filing portal for statutory citizen documents and corporate compliance registrations.',
    'footer.quickLinks': 'Quick Links',
    'footer.services': 'Core Services',
    'footer.contact': 'Support & Help Desk',
    'footer.disclaimer': 'Disclaimer: Apply365 is a private facilitation consultancy providing documentation assistance services to citizens and businesses.',
    'footer.rights': 'All rights reserved.'
  },

  te: {
    // Nav
    'nav.home': 'హోమ్',
    'nav.services': 'సేవలు',
    'nav.courses': 'వృత్తి విద్యా కోర్సులు',
    'nav.track': 'దరఖాస్తు స్థితిని తనిఖీ చేయండి',
    'nav.contact': 'మమ్మల్ని సంప్రదించండి',
    'nav.login': 'లాగిన్',
    'nav.register': 'నమోదు చేయండి',
    'nav.dashboard': 'పౌర పోర్టల్',
    'nav.admin': 'అడ్మిన్ ప్యానెల్',
    'nav.logout': 'లాగ్ అవుట్',
    'nav.selectLanguage': 'భాషను ఎంచుకోండి',

    // Hero & Home
    'hero.badge': 'ప్రభుత్వ మరియు వ్యాపార సేవల సహాయక పోర్టల్',
    'hero.titlePart1': 'వేగవంతమైన, సురక్షితమైన మరియు ధృవీకరించబడిన',
    'hero.titlePart2': 'డాక్యుమెంటేషన్ సేవలు',
    'hero.description': 'ఆధార్, పాన్ కార్డ్, ఓటర్ ఐడి, MSME, లేబర్ లైసెన్స్, UAN/PF, ESI మరియు వృత్తి విద్యా కోర్సుల కోసం ఆన్‌లైన్ సహాయక సేవలు.',
    'hero.exploreServices': 'సేవలను చూడండి',
    'hero.trackStatus': 'మీ దరఖాస్తును ట్రాక్ చేయండి',

    // Trust & Features
    'trust.authorized': 'ధృవీకరించబడిన సహాయక భాగస్వామి',
    'trust.authorizedDesc': 'చట్టబద్ధమైన నిబంధనలకు అనుగుణంగా',
    'trust.fast': 'వేగవంతమైన ప్రాసెసింగ్',
    'trust.fastDesc': 'ప్రాధాన్యత క్యూతో ఆలస్యం లేకుండా',
    'trust.secure': '100% డేటా గోప్యత',
    'trust.secureDesc': 'బ్యాంక్-గ్రేడ్ 256-బిట్ ఎన్క్రిప్షన్',

    // Services
    'services.title': 'మా ముఖ్యమైన సేవలు',
    'services.subtitle': 'అన్ని ముఖ్యమైన ప్రభుత్వ పత్రాలు మరియు వ్యాపార నమోదుల కోసం నమ్మకమైన, సులభమైన మరియు ధృవీకరించబడిన సహాయం.',
    'services.applyNow': 'ఇప్పుడే దరఖాస్తు చేయండి',
    'services.viewDetails': 'వివరాలు చూడండి',
    'services.fee': 'ప్రాసెసింగ్ రుసుము',
    'services.timeline': 'సాధారణ సమయం',
    'services.dedicatedPortal': 'ప్రత్యేక సేవా పోర్టల్',

    // Application Form
    'app.step1': 'సేవ ఎంపిక',
    'app.step2': 'దరఖాస్తుదారు సమాచారం',
    'app.step3': 'పత్రాల అప్‌లోడ్',
    'app.step4': 'దరఖాస్తు సమీక్ష',
    'app.step5': 'చెల్లింపు & సమర్పణ',

    'app.fullName': 'పూర్తి పేరు (అధికారిక రికార్డుల ప్రకారం)',
    'app.fullNamePlaceholder': 'మీ పూర్తి పేరును నమోదు చేయండి',
    'app.mobile': 'మొబైల్ నంబర్ (SMS / WhatsApp అప్‌డేట్‌ల కోసం)',
    'app.mobilePlaceholder': '10 అంకెల మొబైల్ నంబర్',
    'app.email': 'ఈమెయిల్ చిరునామా (రసీదు & సాఫ్ట్ కాపీ కోసం)',
    'app.emailPlaceholder': 'yourname@gmail.com',
    'app.address': 'ప్రస్తుత నివాస / వ్యాపార చిరునామా',
    'app.doorNo': 'ఇంటి నంబర్',
    'app.street': 'వీధి / ప్రాంతం',
    'app.landmark': 'ల్యాండ్‌మార్క్',
    'app.city': 'నగరం / పట్టణం',
    'app.district': 'జిల్లా',
    'app.state': 'రాష్ట్రం',
    'app.pincode': 'పిన్ కోడ్',
    'app.serviceType': 'సేవ రకం / నిర్దిష్ట అభ్యర్థన',
    'app.urgency': 'ప్రాసెసింగ్ ప్రాధాన్యత',
    'app.remarks': 'అదనపు సూచనలు / వ్యాఖ్యలు',
    'app.continueToDocs': 'పత్రాల అప్‌లోడ్‌కు కొనసాగించండి',
    'app.back': 'వెనుకకు',

    // Documents
    'docs.title': 'అవసరమైన ధృవీకరణ పత్రాలు',
    'docs.subtitle': 'దయచేసి స్పష్టమైన ఫోటోలు లేదా స్కాన్ చేసిన కాపీలను (PDF, JPG, PNG) అప్‌లోడ్ చేయండి. అన్ని వివరాలు చదవగలిగేలా ఉండాలి.',
    'docs.upload': 'పత్రం అప్‌లోడ్ చేయండి',
    'docs.replace': 'ఫైల్ మార్చండి',
    'docs.remove': 'తొలగించండి',
    'docs.mandatory': 'తప్పనిసరి',
    'docs.optional': 'ఐచ్ఛికం',
    'docs.uploaded': 'అప్‌లోడ్ చేయబడింది',
    'docs.pending': 'అప్‌లోడ్ బాకీ ఉంది',
    'docs.preview': 'ప్రివ్యూ',
    'docs.reviewAndProceed': 'సమర్పించే ముందు దరఖాస్తును సమీక్షించండి',

    // Review Step
    'review.title': 'మీ దరఖాస్తు వివరాలను సమీక్షించండి',
    'review.subtitle': 'చెల్లింపుకు కొనసాగే ముందు దయచేసి అన్ని వివరాలు మరియు అప్‌లోడ్ చేసిన పత్రాలను జాగ్రత్తగా తనిఖీ చేయండి.',
    'review.personalDetails': 'వ్యక్తిగత & సంప్రదింపు వివరాలు',
    'review.documentsAttached': 'జతచేయబడిన పత్రాలు',
    'review.edit': 'సవరించండి',
    'review.proceedToPayment': 'సేవా రుసుము చెల్లింపుకు కొనసాగించండి (₹50)',

    // Payment Step
    'pay.title': 'మీ దరఖాస్తును పూర్తి చేయండి',
    'pay.serviceFeeTitle': 'Apply-365 సేవా ప్రాసెసింగ్ రుసుము',
    'pay.feeAmount': '₹50',
    'pay.disclaimer': 'ఇది Apply-365 ప్లాట్‌ఫామ్ సహాయక ప్రాసెసింగ్ ఛార్జ్ మాత్రమే, ప్రభుత్వ పన్ను కాదు.',
    'pay.summary': 'చెల్లింపు సారాంశం',
    'pay.service': 'ఎంచుకున్న సేవ',
    'pay.verification': 'పత్రాల ధృవీకరణ మరియు పరిశీలన',
    'pay.included': 'ఉచితం (₹0)',
    'pay.smsUpdates': 'SMS & WhatsApp అప్‌డేట్‌లు',
    'pay.total': 'మొత్తం చెల్లించవలసిన మొత్తం',
    'pay.button': '₹50 చెల్లించి దరఖాస్తును పూర్తి చేయండి',
    'pay.secureNotice': 'Razorpay ద్వారా సురక్షితం • UPI, కార్డ్‌లు, నెట్ బ్యాంకింగ్ ఆమోదించబడతాయి',
    'pay.pendingNotice': 'మీ దరఖాస్తు సురక్షితంగా సేవ్ చేయబడింది. అధికారుల సమీక్ష కోసం ₹50 రుసుమును పూర్తి చేయండి.',

    // Success Step
    'success.title': 'మీ దరఖాస్తు విజయవంతంగా సమర్పించబడింది!',
    'success.desc': 'మా డాక్యుమెంటేషన్ బృందం మీ దరఖాస్తును మరియు పత్రాలను స్వీకరించింది.',
    'success.trackingNo': 'దరఖాస్తు ట్రాకింగ్ నంబర్',
    'success.copy': 'కాపీ చేయండి',
    'success.copied': 'కాపీ చేయబడింది!',
    'success.status': 'దరఖాస్తు స్థితి',
    'success.initialStatus': 'దరఖాస్తు స్వీకరించబడింది',
    'success.paymentStatus': 'చెల్లింపు పూర్తయింది',
    'success.downloadReceipt': 'చెల్లింపు రసీదును డౌన్‌లోడ్ చేయండి (PDF)',
    'success.downloadSoftCopy': 'దరఖాస్తు సాఫ్ట్ కాపీని డౌన్‌లోడ్ చేయండి (PDF)',
    'success.applyAnother': 'మరొక సేవ కోసం దరఖాస్తు చేయండి',
    'success.goToDashboard': 'పౌర డాష్‌బోర్డ్‌కు వెళ్లండి',

    // Dashboard
    'dash.title': 'పౌర సేవల డాష్‌బోర్డ్',
    'dash.welcome': 'స్వాగతం',
    'dash.myApplications': 'నా దరఖాస్తులు',
    'dash.invoices': 'ఇన్‌వాయిస్‌లు & రసీదులు',
    'dash.notifications': 'నోటిఫికేషన్‌లు',
    'dash.status': 'స్థితి',
    'dash.completePayment': 'మీ చెల్లింపును పూర్తి చేయండి – ₹50',
    'dash.paymentSuccessful': 'చెల్లింపు విజయవంతమైంది – దరఖాస్తు సమర్పించబడింది',
    'dash.viewTimeline': 'పూర్తి టైమ్‌లైన్ చూడండి',

    // Footer
    'footer.about': 'Apply365 అనేది పౌరుల చట్టబద్ధమైన పత్రాలు మరియు వ్యాపార నమోదుల కోసం భారతదేశపు విశ్వసనీయ సహాయక పోర్టల్.',
    'footer.quickLinks': 'ముఖ్యమైన లింకులు',
    'footer.services': 'ప్రధాన సేవలు',
    'footer.contact': 'సహాయ కేంద్రం',
    'footer.disclaimer': 'గమనిక: Apply365 అనేది పౌరులు మరియు వ్యాపారాలకు డాక్యుమెంటేషన్ సహాయాన్ని అందించే ఒక ప్రైవేట్ కన్సల్టెన్సీ పోర్టల్.',
    'footer.rights': 'సర్వహక్కులు ప్రత్యేకించబడ్డాయి.'
  },

  hi: {
    // Nav
    'nav.home': 'होम',
    'nav.services': 'सेवाएं',
    'nav.courses': 'व्यावसायिक पाठ्यक्रम',
    'nav.track': 'आवेदन ट्रैक करें',
    'nav.contact': 'संपर्क करें',
    'nav.login': 'लॉग इन करें',
    'nav.register': 'पंजीकरण करें',
    'nav.dashboard': 'नागरिक पोर्टल',
    'nav.admin': 'एडमिन पैनल',
    'nav.logout': 'लॉग आउट',
    'nav.selectLanguage': 'भाषा चुनें',

    // Hero & Home
    'hero.badge': 'सरकारी एवं व्यावसायिक दस्तावेज़ीकरण सुविधा पोर्टल',
    'hero.titlePart1': 'तेज़, सुरक्षित और सत्यापित',
    'hero.titlePart2': 'दस्तावेज़ीकरण सेवाएं',
    'hero.description': 'आधार, पैन कार्ड, वोटर आईडी, एमएसएमई, लेबर लाइसेंस, यूएएन/पीएफ, ईएसआई और व्यावसायिक पाठ्यक्रमों के लिए ऑनलाइन और डोरस्टेप सहायता।',
    'hero.exploreServices': 'सेवाएं देखें',
    'hero.trackStatus': 'अपना आवेदन ट्रैक करें',

    // Trust & Features
    'trust.authorized': 'सत्यापित सुविधा भागीदार',
    'trust.authorizedDesc': 'कानूनी दिशानिर्देशों के अनुरूप',
    'trust.fast': 'त्वरित प्रोसेसिंग',
    'trust.fastDesc': 'प्राथमिकता कतार के साथ बिना किसी देरी के',
    'trust.secure': '100% डेटा गोपनीयता',
    'trust.secureDesc': 'बैंक-ग्रेड 256-बिट एन्क्रिप्शन',

    // Services
    'services.title': 'हमारी प्रमुख सेवाएं',
    'services.subtitle': 'सभी आवश्यक सरकारी दस्तावेजों और व्यावसायिक पंजीकरणों के लिए विश्वसनीय, परेशानी मुक्त और सत्यापित सहायता।',
    'services.applyNow': 'अभी आवेदन करें',
    'services.viewDetails': 'विवरण देखें',
    'services.fee': 'प्रोसेसिंग शुल्क',
    'services.timeline': 'मानक समय सीमा',
    'services.dedicatedPortal': 'समर्पित सेवा पोर्टल',

    // Application Form
    'app.step1': 'सेवा चयन',
    'app.step2': 'आवेदक जानकारी',
    'app.step3': 'दस्तावेज़ अपलोड',
    'app.step4': 'आवेदन समीक्षा',
    'app.step5': 'भुगतान एवं अंतिम जमा',

    'app.fullName': 'पूरा नाम (आधिकारिक रिकॉर्ड के अनुसार)',
    'app.fullNamePlaceholder': 'अपना आधिकारिक पूरा नाम दर्ज करें',
    'app.mobile': 'मोबाइल नंबर (SMS / WhatsApp अपडेट के लिए)',
    'app.mobilePlaceholder': '10 अंकों का मोबाइल नंबर',
    'app.email': 'ईमेल पता (रसीद और सॉफ्ट कॉपी के लिए)',
    'app.emailPlaceholder': 'yourname@gmail.com',
    'app.address': 'वर्तमान आवासीय / व्यावसायिक पता',
    'app.doorNo': 'मकान नंबर / फ्लैट नंबर',
    'app.street': 'सड़क / क्षेत्र',
    'app.landmark': 'लैंडमार्क',
    'app.city': 'शहर / कस्बा',
    'app.district': 'ज़िला',
    'app.state': 'राज्य',
    'app.pincode': 'पिन कोड',
    'app.serviceType': 'सेवा का प्रकार / विशिष्ट अनुरोध',
    'app.urgency': 'प्रोसेसिंग प्राथमिकता',
    'app.remarks': 'अतिरिक्त निर्देश / टिप्पणी',
    'app.continueToDocs': 'दस्तावेज़ अपलोड के लिए आगे बढ़ें',
    'app.back': 'पीछे जाएं',

    // Documents
    'docs.title': 'आवश्यक सहायक दस्तावेज़',
    'docs.subtitle': 'कृपया स्पष्ट तस्वीरें या स्कैन की गई प्रतियां (PDF, JPG, PNG) अपलोड करें। सुनिश्चित करें कि सभी विवरण पढ़ने योग्य हों।',
    'docs.upload': 'दस्तावेज़ अपलोड करें',
    'docs.replace': 'फ़ाइल बदलें',
    'docs.remove': 'हटाएं',
    'docs.mandatory': 'अनिवार्य',
    'docs.optional': 'वैकल्पिक',
    'docs.uploaded': 'सफलतापूर्वक अपलोड किया गया',
    'docs.pending': 'अपलोड लंबित',
    'docs.preview': 'पूर्वावलोकन',
    'docs.reviewAndProceed': 'जमा करने से पहले आवेदन की समीक्षा करें',

    // Review Step
    'review.title': 'अपने आवेदन विवरण की समीक्षा करें',
    'review.subtitle': 'भुगतान से पहले कृपया दर्ज की गई सभी जानकारी और संलग्न दस्तावेज़ों की सावधानीपूर्वक जांच करें।',
    'review.personalDetails': 'व्यक्तिगत एवं संपर्क विवरण',
    'review.documentsAttached': 'संलग्न सहायक दस्तावेज़',
    'review.edit': 'संशोधित करें',
    'review.proceedToPayment': 'सेवा शुल्क भुगतान के लिए आगे बढ़ें (₹50)',

    // Payment Step
    'pay.title': 'अपना आवेदन पूरा करें',
    'pay.serviceFeeTitle': 'Apply-365 सेवा प्रोसेसिंग शुल्क',
    'pay.feeAmount': '₹50',
    'pay.disclaimer': 'यह Apply-365 प्लेटफ़ॉर्म का सुविधा एवं प्रोसेसिंग शुल्क है, कोई सरकारी टैक्स नहीं।',
    'pay.summary': 'भुगतान सारांश',
    'pay.service': 'चयनित सेवा',
    'pay.verification': 'दस्तावेज़ सत्यापन एवं कानूनी समीक्षा',
    'pay.included': 'शामिल है (₹0)',
    'pay.smsUpdates': 'एसएमएस और व्हाट्सएप अपडेट',
    'pay.total': 'कुल देय राशि',
    'pay.button': '₹50 का भुगतान करें और आवेदन पूरा करें',
    'pay.secureNotice': 'Razorpay द्वारा सुरक्षित • UPI, कार्ड, नेट बैंकिंग और वॉलेट स्वीकार्य',
    'pay.pendingNotice': 'आपका आवेदन सुरक्षित रूप से सहेज लिया गया है। समीक्षा हेतु भेजने के लिए ₹50 का भुगतान पूरा करें।',

    // Success Step
    'success.title': 'आपका आवेदन सफलतापूर्वक जमा हो गया है!',
    'success.desc': 'हमारी दस्तावेज़ीकरण टीम को आपका आवेदन और दस्तावेज़ प्राप्त हो गए हैं।',
    'success.trackingNo': 'आवेदन ट्रैकिंग नंबर',
    'success.copy': 'कॉपी करें',
    'success.copied': 'कॉपी हो गया!',
    'success.status': 'आवेदन की स्थिति',
    'success.initialStatus': 'आवेदन प्राप्त हुआ',
    'success.paymentStatus': 'भुगतान पूर्ण',
    'success.downloadReceipt': 'भुगतान रसीद डाउनलोड करें (PDF)',
    'success.downloadSoftCopy': 'आवेदन सॉफ्ट कॉपी डाउनलोड करें (PDF)',
    'success.applyAnother': 'अन्य सेवा के लिए आवेदन करें',
    'success.goToDashboard': 'नागरिक डैशबोर्ड पर जाएं',

    // Dashboard
    'dash.title': 'नागरिक सेवा डैशबोर्ड',
    'dash.welcome': 'स्वागत है',
    'dash.myApplications': 'मेरे आवेदन',
    'dash.invoices': 'चालान एवं रसीदें',
    'dash.notifications': 'सूचनाएं',
    'dash.status': 'स्थिति',
    'dash.completePayment': 'अपना भुगतान पूरा करें – ₹50',
    'dash.paymentSuccessful': 'भुगतान सफल – आवेदन जमा हुआ',
    'dash.viewTimeline': 'पूरी समयरेखा देखें',

    // Footer
    'footer.about': 'Apply365 भारत का विश्वसनीय नागरिक दस्तावेज़ और कॉर्पोरेट अनुपालन पंजीकरण सहायता पोर्टल है।',
    'footer.quickLinks': 'त्वरित लिंक',
    'footer.services': 'प्रमुख सेवाएं',
    'footer.contact': 'सहायता केंद्र',
    'footer.disclaimer': 'अस्वीकरण: Apply365 एक निजी सुविधा परामर्श पोर्टल है जो नागरिकों और व्यवसायों को दस्तावेज़ीकरण सहायता प्रदान करता है।',
    'footer.rights': 'सर्वाधिकार सुरक्षित।'
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string, defaultText?: string) => defaultText || key,
});

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('apply365_language');
      if (saved === 'te' || saved === 'hi' || saved === 'en') {
        return saved;
      }
    } catch {}
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('apply365_language', lang);
    } catch {}
    // Broadcast event for components that listen to language change
    window.dispatchEvent(new CustomEvent('apply365_language_change', { detail: lang }));
  };

  const t = (key: string, defaultText?: string): string => {
    const dict = translations[language];
    if (dict && dict[key]) {
      return dict[key];
    }
    // Fallback to English
    const enDict = translations.en;
    if (enDict && enDict[key]) {
      return enDict[key];
    }
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  return useContext(LanguageContext);
};

