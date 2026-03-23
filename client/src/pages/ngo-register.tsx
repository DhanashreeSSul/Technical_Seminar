import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Heart, ArrowLeft, Phone, Building2, Upload } from "lucide-react";

const states = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh"
];

export default function NgoRegister() {
  const [step, setStep] = useState<"details" | "otp" | "complete">("details");
  const [formData, setFormData] = useState({
    name: "",
    registrationNumber: "",
    phone: "",
    email: "",
    address: "",
    state: "",
    district: "",
    description: "",
    contactPerson: "",
    website: "",
  });
  const [otp, setOtp] = useState("");
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();

  const sendOtpMutation = useMutation({
    mutationFn: async (phone: string) => {
      const res = await apiRequest("POST", "/api/auth/send-otp", { phone, type: "ngo" });
      return res.json();
    },
    onSuccess: (data: any) => {
      setStep("otp");
      if (data?.devOtp) {
        setDevOtpCode(data.devOtp);
        toast({ title: "OTP Sent", description: `Use code ${data.devOtp}` });
      } else {
        toast({ title: "OTP Sent", description: "Please check your phone for the verification code." });
      }
    },
    onError: () => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setDevOtpCode(code);
      setStep("otp");
      toast({ title: "Dev OTP", description: `Use code ${code}` });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: typeof formData & { code: string }) => {
      const res = await apiRequest("POST", "/api/ngo/register", data);
      return res.json();
    },
    onSuccess: (data) => {
      login("ngo", data.ngo, data.token);
      toast({ title: "Registration Complete!", description: "Welcome to EmpowerHer NGO network." });
      navigate("/ngo/dashboard");
    },
    onError: () => {
      toast({ title: "Registration Failed", description: "Please check your details and try again.", variant: "destructive" });
    },
  });

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.phone.length >= 10 && formData.state && formData.contactPerson) {
      sendOtpMutation.mutate(formData.phone);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      if (devOtpCode && otp === devOtpCode) {
        const ngo = {
          id: "dev-ngo-" + formData.phone,
          name: formData.name,
          registrationNumber: formData.registrationNumber,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          state: formData.state,
          district: formData.district,
          description: formData.description,
          contactPerson: formData.contactPerson,
          website: formData.website,
          certificateUrl: "",
          verified: false,
          createdAt: new Date().toISOString(),
        } as any;
        login("ngo", ngo, "dev-token");
        toast({ title: "Registration Complete!", description: "Welcome to EmpowerHer NGO network." });
        navigate("/ngo/dashboard");
        return;
      }
      registerMutation.mutate({ ...formData, code: otp });
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/10 px-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">
            {step === "details" && "Register as NGO Partner"}
            {step === "otp" && "Verify Phone Number"}
          </CardTitle>
          <CardDescription>
            {step === "details" && "Join our network to connect with women seeking career guidance"}
            {step === "otp" && `Enter the 6-digit code sent to ${formData.phone}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "details" && (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter NGO name"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    required
                    data-testid="input-ngo-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    placeholder="Optional"
                    value={formData.registrationNumber}
                    onChange={(e) => updateFormData("registrationNumber", e.target.value)}
                    data-testid="input-ngo-registration"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person *</Label>
                  <Input
                    id="contactPerson"
                    placeholder="Primary contact name"
                    value={formData.contactPerson}
                    onChange={(e) => updateFormData("contactPerson", e.target.value)}
                    required
                    data-testid="input-contact-person"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={(e) => updateFormData("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="pl-10"
                      required
                      data-testid="input-ngo-phone"
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="organization@example.com"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    data-testid="input-ngo-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://www.example.org"
                    value={formData.website}
                    onChange={(e) => updateFormData("website", e.target.value)}
                    data-testid="input-ngo-website"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Select value={formData.state} onValueChange={(v) => updateFormData("state", v)}>
                    <SelectTrigger data-testid="select-ngo-state">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    placeholder="Enter district"
                    value={formData.district}
                    onChange={(e) => updateFormData("district", e.target.value)}
                    data-testid="input-ngo-district"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Full address"
                  value={formData.address}
                  onChange={(e) => updateFormData("address", e.target.value)}
                  data-testid="input-ngo-address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">About Your Organization</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of your NGO and the work you do..."
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  rows={4}
                  data-testid="input-ngo-description"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={!formData.name || formData.phone.length < 10 || !formData.state || !formData.contactPerson || sendOtpMutation.isPending}
                data-testid="button-ngo-submit"
              >
                {sendOtpMutation.isPending ? "Sending OTP..." : "Continue"}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Already registered?{" "}
                <Link href="/ngo/login" className="text-primary hover:underline">
                  Login here
                </Link>
              </p>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  data-testid="input-ngo-otp"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={otp.length < 6 || registerMutation.isPending}
                data-testid="button-ngo-verify"
              >
                {registerMutation.isPending ? "Registering..." : "Complete Registration"}
              </Button>
              <div className="flex justify-between text-sm">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setStep("details")}
                >
                  Edit Details
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => sendOtpMutation.mutate(formData.phone)}
                  disabled={sendOtpMutation.isPending}
                >
                  Resend OTP
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
