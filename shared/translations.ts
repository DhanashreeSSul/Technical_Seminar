// ─── Comprehensive Translation System ────────────────────────────────
// Supports: English (en), Hindi (hi), Marathi (mr)
// All UI strings, chatbot responses, and content translations
// ─────────────────────────────────────────────────────────────────────

export type Lang = "en" | "hi" | "mr";

export const translations: Record<string, Record<Lang, string>> = {
    // ─── Navigation ─────────────────────────────────────────────────
    "nav.home": { en: "Home", hi: "होम", mr: "मुख्यपृष्ठ" },
    "nav.events": { en: "Events", hi: "कार्यक्रम", mr: "कार्यक्रम" },
    "nav.jobs": { en: "Jobs", hi: "नौकरियां", mr: "नोकऱ्या" },
    "nav.training": { en: "Training", hi: "प्रशिक्षण", mr: "प्रशिक्षण" },
    "nav.schemes": { en: "Schemes", hi: "योजनाएं", mr: "योजना" },
    "nav.dashboard": { en: "Dashboard", hi: "डैशबोर्ड", mr: "डॅशबोर्ड" },
    "nav.logout": { en: "Logout", hi: "लॉगआउट", mr: "बाहेर पडा" },
    "nav.getGuidance": { en: "Get Guidance", hi: "मार्गदर्शन पाएं", mr: "मार्गदर्शन मिळवा" },
    "nav.registerWomen": { en: "Register as Women", hi: "महिला रजिस्टर", mr: "महिला नोंदणी" },
    "nav.registerNgo": { en: "Register as NGO", hi: "NGO रजिस्टर", mr: "NGO नोंदणी" },

    // ─── Hero / Home ────────────────────────────────────────────────
    "home.tagline": {
        en: "Secured AI-Enabled Platform for Women Empowerment",
        hi: "महिला सशक्तिकरण के लिए सुरक्षित AI-सक्षम प्लेटफॉर्म",
        mr: "महिला सशक्तीकरणासाठी सुरक्षित AI-सक्षम प्लॅटफॉर्म",
    },
    "home.subtitle": {
        en: "Digital Literacy & Career Empowerment for Rural Women in India. Whether you want to learn a skill, find a job, or start a small business — we guide you step by step in your own language.",
        hi: "भारत में ग्रामीण महिलाओं के लिए डिजिटल साक्षरता और करियर सशक्तिकरण। चाहे आप कोई कौशल सीखना चाहें, नौकरी खोजना चाहें, या छोटा व्यवसाय शुरू करना चाहें — हम आपकी भाषा में कदम-दर-कदम मार्गदर्शन करते हैं।",
        mr: "भारतातील ग्रामीण महिलांसाठी डिजिटल साक्षरता आणि करिअर सशक्तीकरण. तुम्हाला कौशल्य शिकायचे असो, नोकरी शोधायची असो, किंवा लहान व्यवसाय सुरू करायचा असो — आम्ही तुमच्या भाषेत एक-एक पाऊल मार्गदर्शन करतो.",
    },
    "home.getStarted": { en: "Get Started Free", hi: "मुफ्त शुरू करें", mr: "विनामूल्य सुरू करा" },
    "home.discoverOpportunities": {
        en: "Discover Your Opportunities",
        hi: "अपने अवसर खोजें",
        mr: "तुमच्या संधी शोधा",
    },
    "home.discoverSubtitle": {
        en: "Select your interests to find personalized NGO courses, training programs, and government schemes",
        hi: "व्यक्तिगत NGO पाठ्यक्रम, प्रशिक्षण और सरकारी योजनाएं खोजने के लिए अपनी रुचियां चुनें",
        mr: "वैयक्तिक NGO अभ्यासक्रम, प्रशिक्षण आणि सरकारी योजना शोधण्यासाठी तुमची आवड निवडा",
    },
    "home.coreFeatures": { en: "Core Platform Features", hi: "मुख्य प्लेटफॉर्म विशेषताएं", mr: "मुख्य प्लॅटफॉर्म वैशिष्ट्ये" },
    "home.howItWorks": { en: "How It Works", hi: "यह कैसे काम करता है", mr: "हे कसे कार्य करते" },
    "home.trustTitle": { en: "Built with Trust & Safety", hi: "विश्वास और सुरक्षा पर आधारित", mr: "विश्वास आणि सुरक्षिततेवर आधारित" },
    "home.readyToStart": { en: "Ready to Start Your Journey?", hi: "अपनी यात्रा शुरू करने के लिए तैयार?", mr: "तुमचा प्रवास सुरू करायला तयार?" },
    "home.exploreCourses": { en: "Explore Courses", hi: "पाठ्यक्रम देखें", mr: "अभ्यासक्रम पहा" },
    "home.exploreSchemes": { en: "Explore Schemes", hi: "योजनाएं देखें", mr: "योजना पहा" },
    "home.browseTraining": { en: "Browse Training Courses", hi: "प्रशिक्षण पाठ्यक्रम देखें", mr: "प्रशिक्षण अभ्यासक्रम पहा" },

    // ─── Features ───────────────────────────────────────────────────
    "feature.chatbot.title": { en: "AI-Powered Chatbot", hi: "AI-संचालित चैटबॉट", mr: "AI-संचालित चॅटबॉट" },
    "feature.chatbot.desc": {
        en: "Get personalized career advice in Hindi, Marathi, English, and more. Our NLP-powered chatbot understands your needs and guides you step by step.",
        hi: "हिंदी, मराठी, अंग्रेजी और अधिक में व्यक्तिगत करियर सलाह प्राप्त करें। हमारा NLP-संचालित चैटबॉट आपकी जरूरतों को समझता है और कदम-दर-कदम मार्गदर्शन करता है।",
        mr: "हिंदी, मराठी, इंग्रजी आणि इतर भाषांमध्ये वैयक्तिक करिअर सल्ला मिळवा. आमचा NLP-संचालित चॅटबॉट तुमच्या गरजा समजतो आणि एक-एक पाऊल मार्गदर्शन करतो.",
    },
    "feature.training.title": { en: "Skill Development & Training", hi: "कौशल विकास और प्रशिक्षण", mr: "कौशल्य विकास आणि प्रशिक्षण" },
    "feature.training.desc": {
        en: "Access certified courses from government programs like Skill India, PMKVY, and trusted NGOs — many are completely free.",
        hi: "स्किल इंडिया, PMKVY और विश्वसनीय NGO जैसे सरकारी कार्यक्रमों से प्रमाणित पाठ्यक्रम प्राप्त करें — कई पूरी तरह मुफ्त हैं।",
        mr: "स्किल इंडिया, PMKVY आणि विश्वासार्ह NGO सारख्या सरकारी कार्यक्रमांमधून प्रमाणित अभ्यासक्रम मिळवा — बरेच पूर्णपणे विनामूल्य आहेत.",
    },
    "feature.jobs.title": { en: "Job & Business Matching", hi: "नौकरी और व्यवसाय मिलान", mr: "नोकरी आणि व्यवसाय जुळणी" },
    "feature.jobs.desc": {
        en: "AI-based career recommender matches your interests and skills with real jobs, internships, and micro-enterprise ideas.",
        hi: "AI-आधारित करियर रेकमेंडर आपकी रुचियों और कौशलों को वास्तविक नौकरियों, इंटर्नशिप और सूक्ष्म-उद्यम विचारों से मिलाता है।",
        mr: "AI-आधारित करिअर रेकमेंडर तुमच्या आवडी आणि कौशल्यांना वास्तविक नोकऱ्या, इंटर्नशिप आणि सूक्ष्म-उद्यम कल्पनांशी जुळवतो.",
    },
    "feature.ngo.title": { en: "NGO & Foundation Network", hi: "NGO और फाउंडेशन नेटवर्क", mr: "NGO आणि फाउंडेशन नेटवर्क" },
    "feature.hyperlocal.title": { en: "Hyperlocal Opportunities", hi: "स्थानीय अवसर", mr: "स्थानिक संधी" },
    "feature.voice.title": { en: "Voice & Multilingual Support", hi: "वॉइस और बहुभाषी समर्थन", mr: "व्हॉइस आणि बहुभाषिक समर्थन" },

    // ─── Auth ───────────────────────────────────────────────────────
    "auth.title": { en: "Welcome to She Connects Now", hi: "She Connects Now में आपका स्वागत है", mr: "She Connects Now मध्ये तुमचे स्वागत आहे" },
    "auth.loginTitle": { en: "Login / Register", hi: "लॉगिन / रजिस्टर", mr: "लॉगिन / नोंदणी" },
    "auth.phone": { en: "Phone Number", hi: "फोन नंबर", mr: "फोन नंबर" },
    "auth.phonePlaceholder": { en: "Enter your 10-digit phone number", hi: "अपना 10 अंकों का फ़ोन नंबर दर्ज करें", mr: "तुमचा 10 अंकी फोन नंबर प्रविष्ट करा" },
    "auth.sendOtp": { en: "Send OTP", hi: "OTP भेजें", mr: "OTP पाठवा" },
    "auth.verifyOtp": { en: "Verify OTP", hi: "OTP सत्यापित करें", mr: "OTP सत्यापित करा" },
    "auth.enterOtp": { en: "Enter OTP sent to your phone", hi: "अपने फ़ोन पर भेजा गया OTP दर्ज करें", mr: "तुमच्या फोनवर पाठवलेला OTP प्रविष्ट करा" },
    "auth.name": { en: "Full Name", hi: "पूरा नाम", mr: "पूर्ण नाव" },
    "auth.aadhaarNumber": { en: "Aadhaar Number (last 4 digits)", hi: "आधार नंबर (अंतिम 4 अंक)", mr: "आधार क्रमांक (शेवटचे 4 अंक)" },
    "auth.aadhaarPlaceholder": { en: "Enter last 4 digits of Aadhaar", hi: "आधार के अंतिम 4 अंक दर्ज करें", mr: "आधारचे शेवटचे 4 अंक प्रविष्ट करा" },
    "auth.consent": {
        en: "I consent to the privacy policy and agree to share my data only for career guidance purposes",
        hi: "मैं गोपनीयता नीति से सहमत हूं और केवल करियर मार्गदर्शन उद्देश्यों के लिए अपना डेटा साझा करने के लिए सहमत हूं",
        mr: "मी गोपनीयता धोरणाशी सहमत आहे आणि केवळ करिअर मार्गदर्शन हेतूंसाठी माझा डेटा सामायिक करण्यास सहमत आहे",
    },
    "auth.registerAs": { en: "Register as", hi: "के रूप में रजिस्टर करें", mr: "म्हणून नोंदणी करा" },
    "auth.women": { en: "Women", hi: "महिला", mr: "महिला" },
    "auth.ngo": { en: "NGO / Foundation", hi: "NGO / फाउंडेशन", mr: "NGO / फाउंडेशन" },
    "auth.location": { en: "Location / Village", hi: "स्थान / गांव", mr: "स्थान / गाव" },
    "auth.interests": { en: "Your Interests", hi: "आपकी रुचियां", mr: "तुमची आवड" },

    // ─── NGO Auth ───────────────────────────────────────────────────
    "ngo.orgName": { en: "Organization Name", hi: "संगठन का नाम", mr: "संस्थेचे नाव" },
    "ngo.regNumber": { en: "Registration Number (12A/80G/FCRA)", hi: "पंजीकरण संख्या (12A/80G/FCRA)", mr: "नोंदणी क्रमांक (12A/80G/FCRA)" },
    "ngo.uploadCert": { en: "Upload Verification Certificate", hi: "सत्यापन प्रमाणपत्र अपलोड करें", mr: "सत्यापन प्रमाणपत्र अपलोड करा" },
    "ngo.uploadDesc": {
        en: "Upload 12A/80G Certificate, FCRA Certificate, or Darpan Portal ID for verification",
        hi: "सत्यापन के लिए 12A/80G प्रमाणपत्र, FCRA प्रमाणपत्र, या दर्पण पोर्टल ID अपलोड करें",
        mr: "सत्यापनासाठी 12A/80G प्रमाणपत्र, FCRA प्रमाणपत्र, किंवा दर्पण पोर्टल ID अपलोड करा",
    },
    "ngo.contactPerson": { en: "Contact Person Name", hi: "संपर्क व्यक्ति का नाम", mr: "संपर्क व्यक्तीचे नाव" },
    "ngo.focusAreas": { en: "Focus Areas", hi: "कार्य क्षेत्र", mr: "कार्य क्षेत्र" },
    "ngo.verificationStatus": { en: "Verification Status", hi: "सत्यापन स्थिति", mr: "सत्यापन स्थिती" },
    "ngo.pending": { en: "Pending Verification", hi: "सत्यापन लंबित", mr: "सत्यापन प्रलंबित" },
    "ngo.verified": { en: "Verified ✓", hi: "सत्यापित ✓", mr: "सत्यापित ✓" },

    // ─── Jobs ───────────────────────────────────────────────────────
    "jobs.title": { en: "Job & Business Opportunities", hi: "नौकरी और व्यवसाय के अवसर", mr: "नोकरी आणि व्यवसाय संधी" },
    "jobs.subtitle": {
        en: "Discover jobs, freelance work, and micro-enterprise opportunities posted by NGOs, organizations, and government programs — matched to your skills and location.",
        hi: "NGO, संगठनों और सरकारी कार्यक्रमों द्वारा पोस्ट की गई नौकरियां, फ्रीलांस कार्य और सूक्ष्म-उद्यम अवसर खोजें।",
        mr: "NGO, संस्था आणि सरकारी कार्यक्रमांनी पोस्ट केलेल्या नोकऱ्या, फ्रीलांस काम आणि सूक्ष्म-उद्यम संधी शोधा.",
    },
    "jobs.search": { en: "Search jobs by title, skill, or company...", hi: "नौकरी, कौशल या कंपनी खोजें...", mr: "नोकरी, कौशल्य किंवा कंपनी शोधा..." },
    "jobs.applyNow": { en: "Apply Now", hi: "अभी आवेदन करें", mr: "आता अर्ज करा" },
    "jobs.remoteOnly": { en: "Remote Only", hi: "रिमोट ही", mr: "रिमोट फक्त" },
    "jobs.noJobs": { en: "No jobs found", hi: "कोई नौकरी नहीं मिली", mr: "नोकऱ्या सापडल्या नाहीत" },

    // ─── Training ───────────────────────────────────────────────────
    "training.title": { en: "Training & Skill Development", hi: "प्रशिक्षण और कौशल विकास", mr: "प्रशिक्षण आणि कौशल्य विकास" },
    "training.subtitle": {
        en: "Access certified training courses from government programs, NGOs, and trusted institutions — many are free.",
        hi: "सरकारी कार्यक्रमों, NGOs और विश्वसनीय संस्थानों से प्रमाणित प्रशिक्षण पाठ्यक्रम प्राप्त करें — कई मुफ्त हैं।",
        mr: "सरकारी कार्यक्रम, NGO आणि विश्वासार्ह संस्थांमधून प्रमाणित प्रशिक्षण अभ्यासक्रम मिळवा — बरेच विनामूल्य आहेत.",
    },
    "training.search": { en: "Search courses by skill, provider...", hi: "कौशल, प्रदाता द्वारा खोजें...", mr: "कौशल्य, प्रदाते शोधा..." },
    "training.enrollNow": { en: "Enroll Now", hi: "अभी नामांकन करें", mr: "आता नोंदणी करा" },
    "training.freeOnly": { en: "Free Only", hi: "केवल मुफ्त", mr: "फक्त विनामूल्य" },
    "training.duration": { en: "Duration", hi: "अवधि", mr: "कालावधी" },
    "training.language": { en: "Language", hi: "भाषा", mr: "भाषा" },
    "training.certificate": { en: "Certificate by", hi: "प्रमाणपत्र", mr: "प्रमाणपत्र" },
    "training.noCourses": { en: "No courses found", hi: "कोई पाठ्यक्रम नहीं मिला", mr: "अभ्यासक्रम सापडले नाहीत" },

    // ─── Chatbot ────────────────────────────────────────────────────
    "chat.title": { en: "AI Career Guide", hi: "AI करियर गाइड", mr: "AI करिअर मार्गदर्शक" },
    "chat.subtitle": { en: "Here to help you grow", hi: "आपकी मदद के लिए यहां", mr: "तुम्हाला मदत करण्यासाठी येथे" },
    "chat.placeholder": { en: "Type or speak your message...", hi: "अपना संदेश टाइप या बोलें...", mr: "तुमचा संदेश टाइप करा किंवा बोला..." },
    "chat.thinking": { en: "Thinking...", hi: "सोच रही हूं...", mr: "विचार करत आहे..." },
    "chat.welcome": {
        en: "Hello! I'm your AI Career Guide. I can help you find jobs, training courses, government schemes, and create a personalized career roadmap. What would you like to explore?",
        hi: "नमस्ते! मैं आपकी AI करियर गाइड हूं। मैं आपको नौकरी, प्रशिक्षण पाठ्यक्रम, सरकारी योजनाएं खोजने और एक व्यक्तिगत करियर रोडमैप बनाने में मदद कर सकती हूं। आप क्या खोजना चाहेंगी?",
        mr: "नमस्कार! मी तुमची AI करिअर मार्गदर्शक आहे. मी तुम्हाला नोकऱ्या, प्रशिक्षण अभ्यासक्रम, सरकारी योजना शोधण्यात आणि वैयक्तिक करिअर रोडमॅप तयार करण्यात मदत करू शकते. तुम्हाला काय शोधायचे आहे?",
    },
    "chat.privacyNote": {
        en: "🔒 Your conversations are private and secure · 🎙️ Tap mic to speak",
        hi: "🔒 आपकी बातचीत निजी और सुरक्षित है · 🎙️ बोलने के लिए माइक दबाएं",
        mr: "🔒 तुमची संभाषणे खाजगी आणि सुरक्षित आहेत · 🎙️ बोलण्यासाठी माइक दाबा",
    },

    // ─── Dashboard ──────────────────────────────────────────────────
    "dash.welcomeBack": { en: "Welcome back", hi: "वापस स्वागत है", mr: "पुन्हा स्वागत आहे" },
    "dash.continueJourney": { en: "Continue your journey to success", hi: "अपनी सफलता की यात्रा जारी रखें", mr: "तुमचा यशाचा प्रवास सुरू ठेवा" },
    "dash.aiGuidance": { en: "AI Guidance", hi: "AI मार्गदर्शन", mr: "AI मार्गदर्शन" },
    "dash.browseJobs": { en: "Browse Jobs", hi: "नौकरी देखें", mr: "नोकऱ्या पहा" },
    "dash.trainingCourses": { en: "Training Courses", hi: "प्रशिक्षण पाठ्यक्रम", mr: "प्रशिक्षण अभ्यासक्रम" },
    "dash.govSchemes": { en: "Government Schemes", hi: "सरकारी योजनाएं", mr: "सरकारी योजना" },

    // ─── Common ─────────────────────────────────────────────────────
    "common.loading": { en: "Loading...", hi: "लोड हो रहा है...", mr: "लोड होत आहे..." },
    "common.submit": { en: "Submit", hi: "जमा करें", mr: "सबमिट करा" },
    "common.cancel": { en: "Cancel", hi: "रद्द करें", mr: "रद्द करा" },
    "common.select": { en: "Select", hi: "चुनें", mr: "निवडा" },
    "common.selected": { en: "Selected", hi: "चयनित", mr: "निवडलेले" },
    "common.viewAll": { en: "View All", hi: "सभी देखें", mr: "सर्व पहा" },
    "common.all": { en: "All", hi: "सभी", mr: "सर्व" },
};

// Helper function to get a translation
export function t(key: string, lang: Lang): string {
    return translations[key]?.[lang] || translations[key]?.["en"] || key;
}
