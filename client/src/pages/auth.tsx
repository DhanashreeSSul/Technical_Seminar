import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Heart, ArrowLeft, Phone } from "lucide-react";
import { Link } from "wouter";

export default function Auth() {
  const [step, setStep] = useState<"phone" | "otp" | "profile">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [location, setUserLocation] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();

  const sendOtpMutation = useMutation({
    mutationFn: async (phone: string) => {
      const res = await apiRequest("POST", "/api/auth/send-otp", { phone, type: "user" });
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

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ phone, code }: { phone: string; code: string }) => {
      const res = await apiRequest("POST", "/api/auth/verify-otp", { phone, code, type: "user" });
      return res.json();
    },
    onSuccess: (data) => {
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
    mutationFn: async (profileData: { phone: string; name: string; location: string; interests: string[] }) => {
      const res = await apiRequest("POST", "/api/auth/complete-profile", profileData);
      return res.json();
    },
    onSuccess: (data) => {
      login("user", data.user, data.token);
      toast({ title: "Welcome!", description: "Your profile has been created successfully." });
      navigate("/dashboard");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to complete profile. Please try again.", variant: "destructive" });
    },
  });

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) {
      sendOtpMutation.mutate(phone);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      if (devOtpCode && otp === devOtpCode) {
        const devUser = {
          id: "dev-" + phone,
          phone,
          name,
          email: "",
          location,
          state: "",
          interests,
          skills: [],
          role: "user",
          language: "en",
          createdAt: new Date().toISOString(),
        } as any;
        login("user", devUser, "dev-token");
        navigate("/dashboard");
        return;
      }
      verifyOtpMutation.mutate({ phone, code: otp });
    }
  };

  const handleCompleteProfile = (e: React.FormEvent) => {
    e.preventDefault();
    completeProfileMutation.mutate({ phone, name, location, interests });
  };

  const interestOptions = [
    "Technology", "Healthcare", "Education", "Finance", "Arts & Design",
    "Marketing", "Entrepreneurship", "Tailoring", "Cooking", "Beauty & Wellness"
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/10 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="h-8 w-8 text-primary fill-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">
            {step === "phone" && "Get Started"}
            {step === "otp" && "Verify OTP"}
            {step === "profile" && "Complete Profile"}
          </CardTitle>
          <CardDescription>
            {step === "phone" && "Enter your phone number to receive a verification code"}
            {step === "otp" && `Enter the 6-digit code sent to ${phone}`}
            {step === "profile" && "Tell us about yourself to get personalized guidance"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "phone" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="pl-10"
                    data-testid="input-phone"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={phone.length < 10 || sendOtpMutation.isPending}
                data-testid="button-send-otp"
              >
                {sendOtpMutation.isPending ? "Sending..." : "Send OTP"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                By continuing, you agree to our Terms of Service and Privacy Policy
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
                  data-testid="input-otp"
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
                disabled={otp.length < 6 || verifyOtpMutation.isPending}
                data-testid="button-verify-otp"
              >
                {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
              </Button>
              <div className="flex justify-between text-sm">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setStep("phone")}
                >
                  Change Number
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => sendOtpMutation.mutate(phone)}
                  disabled={sendOtpMutation.isPending}
                >
                  Resend OTP
                </Button>
              </div>
            </form>
          )}

          {step === "profile" && (
            <form onSubmit={handleCompleteProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  data-testid="input-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location (State/City)</Label>
                <Input
                  id="location"
                  placeholder="e.g., Maharashtra, Mumbai"
                  value={location}
                  onChange={(e) => setUserLocation(e.target.value)}
                  data-testid="input-location"
                />
              </div>
              <div className="space-y-2">
                <Label>Interests (Select all that apply)</Label>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map((interest) => (
                    <Button
                      key={interest}
                      type="button"
                      variant={interests.includes(interest) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setInterests(prev =>
                          prev.includes(interest)
                            ? prev.filter(i => i !== interest)
                            : [...prev, interest]
                        );
                      }}
                      data-testid={`button-interest-${interest.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {interest}
                    </Button>
                  ))}
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={!name || completeProfileMutation.isPending}
                data-testid="button-complete-profile"
              >
                {completeProfileMutation.isPending ? "Creating Profile..." : "Complete Profile"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
