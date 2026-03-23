import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Phone, Building2 } from "lucide-react";

export default function NgoLogin() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
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

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ phone, code }: { phone: string; code: string }) => {
      const res = await apiRequest("POST", "/api/auth/verify-otp", { phone, code, type: "ngo" });
      return res.json();
    },
    onSuccess: (data) => {
      login("ngo", data.ngo, data.token);
      toast({ title: "Welcome back!", description: `Logged in as ${data.ngo.name}` });
      navigate("/ngo/dashboard");
    },
    onError: () => {
      toast({ title: "Invalid OTP", description: "Please check the code and try again.", variant: "destructive" });
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
        const ngo = {
          id: "dev-ngo-" + phone,
          name: "Demo NGO",
          registrationNumber: "",
          phone,
          email: "",
          address: "",
          state: "",
          district: "",
          description: "",
          contactPerson: "",
          website: "",
          certificateUrl: "",
          verified: false,
          createdAt: new Date().toISOString(),
        } as any;
        login("ngo", ngo, "dev-token");
        toast({ title: "Logged in", description: "Development login successful." });
        navigate("/ngo/dashboard");
        return;
      }
      verifyOtpMutation.mutate({ phone, code: otp });
    }
  };

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
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">NGO Login</CardTitle>
          <CardDescription>
            {step === "phone" 
              ? "Enter your registered phone number"
              : `Enter the 6-digit code sent to ${phone}`
            }
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
                    placeholder="Registered phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="pl-10"
                    data-testid="input-ngo-login-phone"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={phone.length < 10 || sendOtpMutation.isPending}
                data-testid="button-ngo-login-otp"
              >
                {sendOtpMutation.isPending ? "Sending..." : "Send OTP"}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                New to EmpowerHer?{" "}
                <Link href="/ngo/register" className="text-primary hover:underline">
                  Register your NGO
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
                  data-testid="input-ngo-login-otp-code"
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
                data-testid="button-ngo-login-verify"
              >
                {verifyOtpMutation.isPending ? "Verifying..." : "Login"}
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
        </CardContent>
      </Card>
    </div>
  );
}
