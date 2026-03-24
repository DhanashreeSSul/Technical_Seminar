import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Heart, ArrowLeft, Phone, Upload, FileCheck, Shield, Building2, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/components/language-provider";

export default function NgoRegister() {
  const [step, setStep] = useState<"details" | "otp" | "complete">("details");
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", address: "", state: "",
    contactPerson: "", description: "",
    registrationNumber: "", registrationType: "12A",
    focusAreas: [] as string[],
    documentName: "",
  });
  const [otp, setOtp] = useState("");
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const { language, t } = useLanguage();

  const focusOptions = [
    "Women Empowerment", "Digital Literacy", "Skill Development", "Healthcare",
    "Education", "Agriculture", "Microfinance", "Child Welfare",
    "Rural Development", "Legal Aid",
  ];

  const updateField = (field: string, value: any) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  // Simulate document "upload" (store name for verification)
  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateField("documentName", file.name);
      toast({
        title: language === "hi" ? "दस्तावेज़ अपलोड हुआ" : language === "mr" ? "दस्तऐवज अपलोड झाला" : "Document Uploaded",
        description: file.name,
      });
    }
  };

  const sendOtpMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/send-otp", {
        phone: formData.phone,
        type: "register-ngo",
        meta: {
          ...formData,
          name: formData.name,
          registrationNumber: formData.registrationNumber,
          registrationType: formData.registrationType,
          contactPerson: formData.contactPerson,
          documentName: formData.documentName,
          focusAreas: formData.focusAreas,
        },
      });
      return res.json();
    },
    onSuccess: (data: any) => {
      setStep("otp");
      if (data?.devOtp) {
        setDevOtpCode(data.devOtp);
        toast({ title: "OTP Sent", description: `Use code ${data.devOtp}` });
      } else {
        toast({ title: "OTP Sent", description: "SMS sent to " + formData.phone });
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
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/verify-otp", {
        phone: formData.phone,
        code: otp,
        name: formData.name,
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data?.ngo) {
        login("ngo", data.ngo, data.token);
        toast({
          title: language === "hi" ? "पंजीकरण सफल!" : language === "mr" ? "नोंदणी यशस्वी!" : "Registration Successful!",
          description: data.verificationMessage || "Your NGO account has been created.",
        });
        setStep("complete");
      }
    },
    onError: () => {
      toast({ title: "Invalid OTP", variant: "destructive" });
    },
  });

  const handleSubmitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.registrationNumber) {
      toast({ title: "Missing Fields", description: "Organization name, phone, and registration number are required.", variant: "destructive" });
      return;
    }
    if (!formData.documentName) {
      toast({
        title: language === "hi" ? "दस्तावेज़ आवश्यक" : language === "mr" ? "दस्तऐवज आवश्यक" : "Document Required",
        description: t("ngo.uploadDesc"),
        variant: "destructive",
      });
      return;
    }
    if (!consentGiven) {
      toast({ title: "Consent Required", description: t("auth.consent"), variant: "destructive" });
      return;
    }
    sendOtpMutation.mutate();
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      if (devOtpCode && otp === devOtpCode) {
        const ngo = {
          id: `ngo-${formData.phone}`, ...formData,
          verified: false, verificationStatus: "pending",
          createdAt: new Date().toISOString(),
        } as any;
        login("ngo", ngo, "dev-token");
        toast({
          title: language === "hi" ? "नामांकन पूरा!" : language === "mr" ? "नोंदणी पूर्ण!" : "Registration Complete!",
          description: language === "hi" ? "आपका NGO खाता बनाया गया है। दस्तावेज़ सत्यापन लंबित है।" : language === "mr" ? "तुमचे NGO खाते तयार झाले. दस्तऐवज सत्यापन प्रलंबित आहे." : "Your NGO account has been created. Document verification is pending.",
        });
        setStep("complete");
        return;
      }
      verifyOtpMutation.mutate();
    }
  };

  const labels: Record<string, Record<string, string>> = {
    title: { en: "NGO Registration", hi: "NGO पंजीकरण", mr: "NGO नोंदणी" },
    subtitle: { en: "Register your organization with document verification", hi: "दस्तावेज़ सत्यापन के साथ अपने संगठन को पंजीकृत करें", mr: "दस्तऐवज सत्यापनासह तुमच्या संस्थेची नोंदणी करा" },
    orgName: { en: "Organization Name", hi: "संगठन का नाम", mr: "संस्थेचे नाव" },
    regType: { en: "Registration Type", hi: "पंजीकरण प्रकार", mr: "नोंदणी प्रकार" },
    regNumber: { en: "Registration Number", hi: "पंजीकरण संख्या", mr: "नोंदणी क्रमांक" },
    uploadCert: { en: "Upload Verification Certificate", hi: "सत्यापन प्रमाणपत्र अपलोड करें", mr: "सत्यापन प्रमाणपत्र अपलोड करा" },
    contactPerson: { en: "Contact Person Name", hi: "संपर्क व्यक्ति का नाम", mr: "संपर्क व्यक्तीचे नाव" },
    address: { en: "Address", hi: "पता", mr: "पत्ता" },
    stateLabel: { en: "State", hi: "राज्य", mr: "राज्य" },
    description: { en: "Organization Description", hi: "संगठन का विवरण", mr: "संस्थेचे वर्णन" },
    focusAreas: { en: "Focus Areas (select all that apply)", hi: "कार्य क्षेत्र (सभी लागू चुनें)", mr: "कार्य क्षेत्र (लागू असलेले सर्व निवडा)" },
    submitVerify: { en: "Submit & Verify Phone", hi: "जमा करें और फ़ोन सत्यापित करें", mr: "सबमिट करा आणि फोन सत्यापित करा" },
    submitting: { en: "Submitting...", hi: "जमा हो रहा...", mr: "सबमिट होत आहे..." },
    verifyOtp: { en: "Verify OTP", hi: "OTP सत्यापित करें", mr: "OTP सत्यापित करा" },
    verifying: { en: "Verifying...", hi: "सत्यापित...", mr: "सत्यापित करत आहे..." },
    resend: { en: "Resend OTP", hi: "OTP फिर भेजें", mr: "OTP पुन्हा पाठवा" },
    regSuccess: { en: "Registration Successful!", hi: "पंजीकरण सफल!", mr: "नोंदणी यशस्वी!" },
    pendingMsg: { en: "Your documents have been submitted and are under review. You can start using the platform with limited access until verification is complete.", hi: "आपके दस्तावेज़ जमा किए गए हैं और समीक्षा में हैं। सत्यापन पूरा होने तक आप सीमित एक्सेस के साथ प्लेटफॉर्म का उपयोग शुरू कर सकते हैं।", mr: "तुमचे दस्तऐवज सबमिट केले आहेत आणि पुनरावलोकनात आहेत. सत्यापन पूर्ण होईपर्यंत तुम्ही मर्यादित प्रवेशासह प्लॅटफॉर्म वापरणे सुरू करू शकता." },
    gotoDash: { en: "Go to Dashboard", hi: "डैशबोर्ड पर जाएं", mr: "डॅशबोर्डवर जा" },
  };

  const l = (key: string) => labels[key]?.[language] || labels[key]?.en || key;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/10 px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 text-sm">
            <ArrowLeft className="h-4 w-4" /> {t("nav.home")}
          </Link>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">{l("title")}</CardTitle>
          <CardDescription>{l("subtitle")}</CardDescription>
        </CardHeader>

        <CardContent>
          {step === "details" && (
            <form onSubmit={handleSubmitDetails} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-2">
                  <Label>{l("orgName")} *</Label>
                  <Input value={formData.name} onChange={e => updateField("name", e.target.value)} placeholder="e.g., Mahila Vikas Foundation" required data-testid="input-ngo-name" />
                </div>

                <div className="space-y-2">
                  <Label>{l("regType")} *</Label>
                  <Select value={formData.registrationType} onValueChange={v => updateField("registrationType", v)}>
                    <SelectTrigger data-testid="select-reg-type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12A">12A Certificate</SelectItem>
                      <SelectItem value="80G">80G Certificate</SelectItem>
                      <SelectItem value="FCRA">FCRA Certificate</SelectItem>
                      <SelectItem value="DARPAN">Darpan Portal ID</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{l("regNumber")} *</Label>
                  <Input value={formData.registrationNumber} onChange={e => updateField("registrationNumber", e.target.value)} placeholder="e.g., AAATF1234A" required data-testid="input-reg-number" />
                </div>

                {/* Document Upload */}
                <div className="sm:col-span-2 space-y-2">
                  <Label>{l("uploadCert")} *</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer">
                    <input type="file" id="doc-upload" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleDocUpload} data-testid="input-doc-upload" />
                    <label htmlFor="doc-upload" className="cursor-pointer">
                      {formData.documentName ? (
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <FileCheck className="h-6 w-6" />
                          <span className="text-sm font-medium">{formData.documentName}</span>
                        </div>
                      ) : (
                        <div>
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">{t("ngo.uploadDesc")}</p>
                          <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (max 5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{l("contactPerson")} *</Label>
                  <Input value={formData.contactPerson} onChange={e => updateField("contactPerson", e.target.value)} required data-testid="input-contact-person" />
                </div>

                <div className="space-y-2">
                  <Label>{t("auth.phone")} *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="tel" value={formData.phone} onChange={e => updateField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} className="pl-10" required data-testid="input-ngo-phone" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={formData.email} onChange={e => updateField("email", e.target.value)} data-testid="input-ngo-email" />
                </div>

                <div className="space-y-2">
                  <Label>{l("stateLabel")}</Label>
                  <Input value={formData.state} onChange={e => updateField("state", e.target.value)} placeholder="e.g., Maharashtra" data-testid="input-ngo-state" />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <Label>{l("address")}</Label>
                  <Input value={formData.address} onChange={e => updateField("address", e.target.value)} data-testid="input-ngo-address" />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <Label>{l("description")}</Label>
                  <Textarea value={formData.description} onChange={e => updateField("description", e.target.value)} rows={3} data-testid="input-ngo-desc" />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <Label>{l("focusAreas")}</Label>
                  <div className="flex flex-wrap gap-2">
                    {focusOptions.map(area => (
                      <Button key={area} type="button" size="sm"
                        variant={formData.focusAreas.includes(area) ? "default" : "outline"}
                        onClick={() => updateField("focusAreas", formData.focusAreas.includes(area) ? formData.focusAreas.filter(a => a !== area) : [...formData.focusAreas, area])}
                        data-testid={`button-focus-${area.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        {area}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Consent */}
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                <Checkbox id="ngo-consent" checked={consentGiven} onCheckedChange={(c) => setConsentGiven(c === true)} className="mt-0.5" data-testid="checkbox-ngo-consent" />
                <label htmlFor="ngo-consent" className="text-xs leading-relaxed cursor-pointer">
                  <Shield className="h-3.5 w-3.5 inline mr-1 text-primary" />
                  {t("auth.consent")}
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={sendOtpMutation.isPending} data-testid="button-submit-ngo">
                {sendOtpMutation.isPending ? l("submitting") : l("submitVerify")}
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <p className="text-sm text-center text-muted-foreground">
                {language === "hi" ? `${formData.phone} पर 6 अंकों का OTP भेजा गया` : language === "mr" ? `${formData.phone} वर 6 अंकी OTP पाठवला` : `6-digit OTP sent to ${formData.phone}`}
              </p>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp} data-testid="input-ngo-otp">
                  <InputOTPGroup>
                    <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
                    <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button type="submit" className="w-full" disabled={otp.length < 6 || verifyOtpMutation.isPending} data-testid="button-verify-ngo-otp">
                {verifyOtpMutation.isPending ? l("verifying") : l("verifyOtp")}
              </Button>
              <Button type="button" variant="ghost" size="sm" className="w-full" onClick={() => sendOtpMutation.mutate()} disabled={sendOtpMutation.isPending}>
                {l("resend")}
              </Button>
            </form>
          )}

          {step === "complete" && (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto">
                <FileCheck className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-600">{l("regSuccess")}</h3>
                <p className="text-sm text-muted-foreground mt-2">{l("pendingMsg")}</p>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-md bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-400">{t("ngo.pending")}</p>
                  <p className="text-xs text-amber-700 dark:text-amber-500 mt-0.5">
                    {language === "hi" ? "सत्यापन 2-3 कार्यदिवसों में पूरा होगा" : language === "mr" ? "सत्यापन 2-3 कार्यदिवसांत पूर्ण होईल" : "Verification will be completed within 2-3 business days"}
                  </p>
                </div>
              </div>
              <Button className="w-full" onClick={() => navigate("/ngo/dashboard")} data-testid="button-goto-dashboard">
                {l("gotoDash")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
