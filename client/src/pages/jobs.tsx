import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/components/language-provider";
import {
    Search, MapPin, Briefcase, IndianRupee, ArrowUpRight,
    GraduationCap, Building2, Clock, Home
} from "lucide-react";

const categories: Record<string, Record<string, string>> = {
    "all": { en: "All Categories", hi: "सभी श्रेणियां", mr: "सर्व श्रेणी" },
    "Digital / IT": { en: "Digital / IT", hi: "डिजिटल / IT", mr: "डिजिटल / IT" },
    "Community / Social Work": { en: "Community / Social", hi: "सामाजिक कार्य", mr: "सामाजिक कार्य" },
    "Tailoring / Handicrafts": { en: "Tailoring / Handicrafts", hi: "सिलाई / हस्तशिल्प", mr: "शिवणकाम / हस्तकला" },
    "Health / Childcare": { en: "Health / Childcare", hi: "स्वास्थ्य / बाल देखभाल", mr: "आरोग्य / बालसंगोपन" },
    "E-Commerce / Business": { en: "E-Commerce / Business", hi: "ई-कॉमर्स / व्यवसाय", mr: "ई-कॉमर्स / व्यवसाय" },
    "Agriculture": { en: "Agriculture", hi: "कृषि", mr: "शेती" },
    "Beauty / Wellness": { en: "Beauty / Wellness", hi: "सौंदर्य / वेलनेस", mr: "सौंदर्य / वेलनेस" },
};

const states: Record<string, Record<string, string>> = {
    "all": { en: "All States", hi: "सभी राज्य", mr: "सर्व राज्ये" },
    "Maharashtra": { en: "Maharashtra", hi: "महाराष्ट्र", mr: "महाराष्ट्र" },
    "Madhya Pradesh": { en: "Madhya Pradesh", hi: "मध्य प्रदेश", mr: "मध्य प्रदेश" },
    "Rajasthan": { en: "Rajasthan", hi: "राजस्थान", mr: "राजस्थान" },
    "Uttar Pradesh": { en: "Uttar Pradesh", hi: "उत्तर प्रदेश", mr: "उत्तर प्रदेश" },
    "All India": { en: "All India", hi: "पूरा भारत", mr: "संपूर्ण भारत" },
    "Karnataka": { en: "Karnataka", hi: "कर्नाटक", mr: "कर्नाटक" },
    "Gujarat": { en: "Gujarat", hi: "गुजरात", mr: "गुजरात" },
    "Bihar": { en: "Bihar", hi: "बिहार", mr: "बिहार" },
};

export default function Jobs() {
    const { language, t } = useLanguage();
    const lang = language as "en" | "hi" | "mr";
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [state, setState] = useState("all");
    const [remoteOnly, setRemoteOnly] = useState(false);

    const { data: apiJobs } = useQuery<any[]>({ queryKey: ["/api/jobs"] });

    const jobList = apiJobs || [];

    const filteredJobs = jobList.filter((job: any) => {
        const matchSearch = !search ||
            job.title?.toLowerCase().includes(search.toLowerCase()) ||
            job.company?.toLowerCase().includes(search.toLowerCase()) ||
            (job.skills || []).some((s: string) => s.toLowerCase().includes(search.toLowerCase()));
        const matchCategory = category === "all" || job.category === category;
        const matchState = state === "all" || job.state === state;
        const matchRemote = !remoteOnly || job.isRemote;
        return matchSearch && matchCategory && matchState && matchRemote;
    });

    return (
        <div className="min-h-screen bg-muted/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>
                        {t("jobs.title")}
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        {t("jobs.subtitle")}
                    </p>
                </div>

                {/* Filters */}
                <Card className="mb-8">
                    <CardContent className="p-4">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={search} onChange={e => setSearch(e.target.value)}
                                    placeholder={t("jobs.search")}
                                    className="pl-10"
                                    data-testid="input-search-jobs"
                                />
                            </div>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger data-testid="select-category">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(categories).map(([k, v]) => (
                                        <SelectItem key={k} value={k}>{v[lang] || v.en}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={state} onValueChange={setState}>
                                <SelectTrigger data-testid="select-state">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(states).map(([k, v]) => (
                                        <SelectItem key={k} value={k}>{v[lang] || v.en}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex items-center gap-2">
                                <Switch id="remote" checked={remoteOnly} onCheckedChange={setRemoteOnly} data-testid="switch-remote" />
                                <Label htmlFor="remote" className="text-sm">{t("jobs.remoteOnly")}</Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Jobs Grid */}
                {filteredJobs.length === 0 ? (
                    <div className="text-center py-16">
                        <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-lg text-muted-foreground">{t("jobs.noJobs")}</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {filteredJobs.map((job: any) => (
                            <Card key={job.id} className="hover-elevate transition-all duration-200">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <CardTitle className="text-lg">{job.title}</CardTitle>
                                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                                <Building2 className="h-4 w-4" />
                                                <span>{job.company}</span>
                                            </div>
                                        </div>
                                        <Badge variant={job.isRemote ? "default" : "secondary"} className="whitespace-nowrap flex items-center gap-1">
                                            {job.isRemote ? <><Home className="h-3 w-3" /> Remote</> : <><MapPin className="h-3 w-3" /> {job.mode}</>}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        <div className="flex items-center gap-1 text-sm">
                                            <IndianRupee className="h-3.5 w-3.5 text-green-600" />
                                            <span className="font-medium text-green-700 dark:text-green-400">{job.salary}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <MapPin className="h-3.5 w-3.5" />
                                            <span>{job.location}, {job.state}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <GraduationCap className="h-3.5 w-3.5" />
                                            <span>{job.education}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(job.skills || []).slice(0, 4).map((skill: string) => (
                                            <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                                        ))}
                                        {(job.skills || []).length > 4 && (
                                            <Badge variant="outline" className="text-xs">+{job.skills.length - 4}</Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            <span>{job.postedAt}</span>
                                        </div>
                                        <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
                                            <Button size="sm" className="gap-1.5" data-testid={`button-apply-${job.id}`}>
                                                {t("jobs.applyNow")}
                                                <ArrowUpRight className="h-3.5 w-3.5" />
                                            </Button>
                                        </a>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
