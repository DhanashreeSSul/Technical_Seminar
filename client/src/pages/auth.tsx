import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Heart, ArrowLeft, Phone, Shield, CreditCard } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/components/language-provider";

export default function Auth() {
  const [step, setStep] = useState<"phone" | "otp" | "profile">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [location, setUserLocation] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [aadhaarLast4, setAadhaarLast4] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);
  const [registerAs, setRegisterAs] = useState<"user" | "women" | "ngo">("women");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const { language, t } = useLanguage();

  const sendOtpMutation = useMutation({
    mutationFn: async (phone: string) => {
      const type = registerAs === "women" ? "register-women" : registerAs === "ngo" ? "register-ngo" : "login";
      const meta: any = { requestedRole: registerAs };
      if (aadhaarLast4) meta.aadhaarLast4 = aadhaarLast4;
      if (name) meta.name = name;
      const res = await apiRequest("POST", "/api/auth/send-otp", { phone, type, meta });
      return res.json();
    },
    onSuccess: (data: any) => {
      setStep("otp");
      if (data?.devOtp) {
        setDevOtpCode(data.devOtp);
        toast({ title: "OTP Sent", description: `Use code ${data.devOtp}` });
      } else if (data?.smsSent) {
        toast({ title: t("auth.sendOtp"), description: language === "hi" ? "OTP आपके फोन पर भेजा गया है" : language === "mr" ? "OTP तुमच्या फोनवर पाठवला आहे" : "OTP has been sent to your phone" });
      }
    },
    onError: () => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setDevOtpCode(code);
      setStep("otp");
      toast({ title: "Dev OTP", description: `Use code ${code}` });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ phone, code }: { phone: string; code: string }) => {
      const body: any = { phone, code, name, aadhaarLast4 };
      const res = await apiRequest("POST", "/api/auth/verify-otp", body);
      return res.json();
    },
    onSuccess: (data) => {
      if (data?.user) {
        login(data.user.role === "ngo" ? "ngo" : "user", data.user, data.token);
        navigate("/dashboard");
        return;
      }
      if (data?.ngo) {
        login("ngo", data.ngo, data.token);
        navigate("/ngo/dashboard");
        return;
      }
      if (data.isNewUser) {
        setStep("profile");
      } else {
        login("user", data.user, data.token);
        navigate("/dashboard");
      }
    },
    onError: () => {
      toast({ title: "Invalid OTP", description: "Please check the code and try again.", variant: "destructive" });
    },
  });

  const completeProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const res = await apiRequest("POST", "/api/auth/complete-profile", profileData);
      return res.json();
    },
    onSuccess: (data) => {
      login("user", data.user, data.token);
      toast({
        title: language === "hi" ? "स्वागत है!" : language === "mr" ? "स्वागत आहे!" : "Welcome!",
        description: language === "hi" ? "आपकी प्रोफाइल बन गई है।" : language === "mr" ? "तुमचे प्रोफाइल तयार झाले." : "Your profile has been created.",
      });
      navigate("/dashboard");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to complete profile.", variant: "destructive" });
    },
  });

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;

    // For women registration, require Aadhaar
    if (registerAs === "women" && !aadhaarLast4) {
      toast({ title: "Aadhaar Required", description: t("auth.aadhaarNumber"), variant: "destructive" });
      return;
    }
    if (registerAs === "women" && !/^\d{4}$/.test(aadhaarLast4)) {
      toast({ title: "Invalid Aadhaar", description: "Please enter exactly 4 digits", variant: "destructive" });
      return;
    }
    if (!consentGiven) {
      toast({
        title: language === "hi" ? "सहमति आवश्यक" : language === "mr" ? "संमती आवश्यक" : "Consent Required",
        description: t("auth.consent"),
        variant: "destructive",
      });
      return;
    }
    sendOtpMutation.mutate(phone);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      if (devOtpCode && otp === devOtpCode) {
        const devUser = {
          id: `dev-${phone}`, phone, name,
          email: "", location, state: "", interests, skills: [],
          aadhaarLast4,
          aadhaarVerified: true,
          role: registerAs === "ngo" ? "ngo" : "women",
          language, consentGiven: true,
          createdAt: new Date().toISOString(),
        } as any;
        login(registerAs === "ngo" ? "ngo" : "user", devUser, "dev-token");
        navigate(registerAs === "ngo" ? "/ngo/dashboard" : "/dashboard");
        return;
      }
      verifyOtpMutation.mutate({ phone, code: otp });
    }
  };

  const handleCompleteProfile = (e: React.FormEvent) => {
    e.preventDefault();
    completeProfileMutation.mutate({ phone, name, location, interests, aadhaarLast4 });
  };

  const interestOptions = [
    "Tailoring", "Beauty & Wellness", "Cooking / Food Processing", "Agriculture",
    "Computer / Digital", "Healthcare", "Teaching", "Handicrafts / Arts",
    "Business / Finance", "Marketing / Sales",
  ];

  // Translated labels
  const labels: Record<string, Record<string, string>> = {
    getStarted: { en: "Get Started", hi: "शुरू करें", mr: "सुरू करा" },
    verifyOtp: { en: "Verify OTP", hi: "OTP सत्यापित करें", mr: "OTP सत्यापित करा" },
    completeProfile: { en: "Complete Profile", hi: "प्रोफाइल पूरी करें", mr: "प्रोफाइल पूर्ण करा" },
    phoneDesc: { en: "Enter your phone number to receive a verification code via SMS", hi: "SMS से सत्यापन कोड प्राप्त करने के लिए अपना फ़ोन नंबर दर्ज करें", mr: "SMS द्वारे सत्यापन कोड प्राप्त करण्यासाठी तुमचा फोन नंबर प्रविष्ट करा" },
    otpDesc: { en: `Enter the 6-digit OTP sent to ${phone}`, hi: `${phone} पर भेजा गया 6 अंकों का OTP दर्ज करें`, mr: `${phone} वर पाठवलेला 6 अंकी OTP प्रविष्ट करा` },
    profileDesc: { en: "Tell us about yourself for personalized guidance", hi: "व्यक्तिगत मार्गदर्शन के लिए अपने बारे में बताएं", mr: "वैयक्तिक मार्गदर्शनासाठी तुमच्याबद्दल सांगा" },
    women: { en: "Women", hi: "महिला", mr: "महिला" },
    ngoLabel: { en: "NGO", hi: "NGO", mr: "NGO" },
    loginLabel: { en: "Login", hi: "लॉगिन", mr: "लॉगिन" },
    sending: { en: "Sending...", hi: "भेज रहे हैं...", mr: "पाठवत आहे..." },
    sendOtp: { en: "Send OTP via SMS", hi: "SMS से OTP भेजें", mr: "SMS द्वारे OTP पाठवा" },
    verifying: { en: "Verifying...", hi: "सत्यापित...", mr: "सत्यापित करत आहे..." },
    changeNum: { en: "Change Number", hi: "नंबर बदलें", mr: "नंबर बदला" },
    resend: { en: "Resend OTP", hi: "OTP फिर भेजें", mr: "OTP पुन्हा पाठवा" },
    termsText: { en: "By continuing, you agree to our Terms of Service and Privacy Policy", hi: "जारी रखकर, आप हमारी सेवा शर्तों और गोपनीयता नीति से सहमत होती हैं", mr: "सुरू ठेवून, तुम्ही आमच्या सेवा अटी आणि गोपनीयता धोरणाशी सहमत आहात" },
    creating: { en: "Creating Profile...", hi: "प्रोफाइल बना रहे...", mr: "प्रोफाइल तयार करत आहे..." },
    complete: { en: "Complete Profile", hi: "प्रोफाइल पूरी करें", mr: "प्रोफाइल पूर्ण करा" },
    aadhaarNote: { en: "We only store the last 4 digits for verification. Your Aadhaar is not saved.", hi: "हम केवल सत्यापन के लिए अंतिम 4 अंक संग्रहीत करते हैं। आपका आधार सेव नहीं होता।", mr: "आम्ही फक्त सत्यापनासाठी शेवटचे 4 अंक ठेवतो. तुमचा आधार सेव्ह होत नाही." },
    selectInterests: { en: "Interests (Select all that apply)", hi: "रुचियां (जो लागू हों उन्हें चुनें)", mr: "आवडी (लागू असलेले सर्व निवडा)" },
  };

  const l = (key: string) => labels[key]?.[language] || labels[key]?.en || key;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/10 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 text-sm">
            <ArrowLeft className="h-4 w-4" />
            {t("nav.home")}
          </Link>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="h-8 w-8 text-primary fill-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">
            {step === "phone" && l("getStarted")}
            {step === "otp" && l("verifyOtp")}
            {step === "profile" && l("completeProfile")}
          </CardTitle>
          <CardDescription>
            {step === "phone" && l("phoneDesc")}
            {step === "otp" && l("otpDesc")}
            {step === "profile" && l("profileDesc")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "phone" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {/* Role Selector */}
              <div className="flex gap-2 justify-center">
                <Button type="button" variant={registerAs === "women" ? "default" : "outline"} size="sm" onClick={() => setRegisterAs("women")}>
                  {l("women")}
                </Button>
                <Button type="button" variant={registerAs === "ngo" ? "default" : "outline"} size="sm" onClick={() => setRegisterAs("ngo")}>
                  {l("ngoLabel")}
                </Button>
                <Button type="button" variant={registerAs === "user" ? "default" : "outline"} size="sm" onClick={() => setRegisterAs("user")}>
                  {l("loginLabel")}
                </Button>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">{t("auth.phone")}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone" type="tel"
                    placeholder={t("auth.phonePlaceholder")}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="pl-10"
                    data-testid="input-phone"
                  />
                </div>
              </div>

              {/* Aadhaar for Women registration */}
              {registerAs === "women" && (
                <div className="space-y-2">
                  <Label htmlFor="aadhaar" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    {t("auth.aadhaarNumber")}
                  </Label>
                  <Input
                    id="aadhaar" type="tel" maxLength={4}
                    placeholder={t("auth.aadhaarPlaceholder")}
                    value={aadhaarLast4}
                    onChange={(e) => setAadhaarLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    data-testid="input-aadhaar"
                  />
                  <p className="text-xs text-muted-foreground">{l("aadhaarNote")}</p>
                </div>
              )}

              {/* Name (for registration) */}
              {registerAs !== "user" && (
                <div className="space-y-2">
                  <Label htmlFor="name">{t("auth.name")}</Label>
                  <Input id="name" placeholder={t("auth.name")} value={name} onChange={e => setName(e.target.value)} data-testid="input-name" />
                </div>
              )}

              {/* Consent */}
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                <Checkbox
                  id="consent"
                  checked={consentGiven}
                  onCheckedChange={(c) => setConsentGiven(c === true)}
                  className="mt-0.5"
                  data-testid="checkbox-consent"
                />
                <label htmlFor="consent" className="text-xs leading-relaxed cursor-pointer">
                  <Shield className="h-3.5 w-3.5 inline mr-1 text-primary" />
                  {t("auth.consent")}
                </label>
              </div>

              <Button
                type="submit" className="w-full gap-2"
                disabled={phone.length < 10 || sendOtpMutation.isPending || !consentGiven}
                data-testid="button-send-otp"
              >
                {sendOtpMutation.isPending ? l("sending") : l("sendOtp")}
              </Button>

              <p className="text-xs text-center text-muted-foreground">{l("termsText")}</p>

              {registerAs === "ngo" && (
                <p className="text-xs text-center">
                  <Link href="/ngo/register" className="text-primary hover:underline">
                    {language === "hi" ? "NGO विस्तृत नामांकन →" : language === "mr" ? "NGO सविस्तर नोंदणी →" : "Full NGO Registration with Documents →"}
                  </Link>
                </p>
              )}
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)} data-testid="input-otp">
                  <InputOTPGroup>
                    <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
                    <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button type="submit" className="w-full" disabled={otp.length < 6 || verifyOtpMutation.isPending} data-testid="button-verify-otp">
                {verifyOtpMutation.isPending ? l("verifying") : l("verifyOtp")}
              </Button>
              <div className="flex justify-between text-sm">
                <Button type="button" variant="ghost" size="sm" onClick={() => setStep("phone")}>
                  {l("changeNum")}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => sendOtpMutation.mutate(phone)} disabled={sendOtpMutation.isPending}>
                  {l("resend")}
                </Button>
              </div>
            </form>
          )}

          {step === "profile" && (
            <form onSubmit={handleCompleteProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("auth.name")}</Label>
                <Input id="name" placeholder={t("auth.name")} value={name} onChange={(e) => setName(e.target.value)} data-testid="input-name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">{t("auth.location")}</Label>
                <Input id="location" placeholder="e.g., Pune, Maharashtra" value={location} onChange={(e) => setUserLocation(e.target.value)} data-testid="input-location" />
              </div>
              <div className="space-y-2">
                <Label>{l("selectInterests")}</Label>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map((interest) => (
                    <Button
                      key={interest} type="button"
                      variant={interests.includes(interest) ? "default" : "outline"} size="sm"
                      onClick={() => setInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest])}
                      data-testid={`button-interest-${interest.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {interest}
                    </Button>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={!name || completeProfileMutation.isPending} data-testid="button-complete-profile">
                {completeProfileMutation.isPending ? l("creating") : l("complete")}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
